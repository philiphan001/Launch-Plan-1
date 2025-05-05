// favorites-routes.ts - Routes for handling favorites functionality
import express from "express";
import { db } from "../db-config";
import { verifyFirebaseToken } from "../middleware/firebase-auth";
import { eq, and } from "drizzle-orm";
import { checkUserAccess } from "./route-utils";
import { sql } from "drizzle-orm";

// Let's define a favorites table structure (this would normally be in your schema file)
// For now we'll use a simple structure to get favorites working
const router = express.Router();

// We'll assume these tables exist or create placeholders for them
// You should adapt these to your actual schema
const favorites = {
  colleges: {
    tableName: "favorite_colleges",
    fields: {
      id: "id",
      userId: "user_id",
      collegeId: "college_id",
      createdAt: "created_at",
    },
  },
  careers: {
    tableName: "favorite_careers",
    fields: {
      id: "id",
      userId: "user_id",
      careerId: "career_id",
      createdAt: "created_at",
    },
  },
  locations: {
    tableName: "favorite_locations",
    fields: {
      id: "id",
      userId: "user_id",
      zipCode: "zip_code",
      city: "city",
      state: "state",
      createdAt: "created_at",
    },
  },
};

// Add a college to favorites
router.post("/colleges", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, collegeId } = req.body;

    if (!userId || !collegeId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: userId and collegeId" });
    }

    console.log(
      `Attempting to add college ${collegeId} to favorites for user ${userId}`
    );

    // Create the favorite_colleges table if it doesn't exist
    try {
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS favorite_colleges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          college_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, college_id)
        )`
      );
      console.log("Ensured favorite_colleges table exists");
    } catch (tableError) {
      console.error("Error creating favorite_colleges table:", tableError);
      // Continue anyway as the table might already exist
    }

    // Check if the favorite already exists
    try {
      const existingFavorite = await db.execute(
        sql`SELECT id FROM favorite_colleges 
           WHERE user_id = ${userId} AND college_id = ${collegeId}`
      );

      if (existingFavorite.rows && existingFavorite.rows.length > 0) {
        return res
          .status(409)
          .json({ message: "College already in favorites" });
      }

      // Add to favorites
      const result = await db.execute(
        sql`INSERT INTO favorite_colleges 
           (user_id, college_id, created_at) 
           VALUES (${userId}, ${collegeId}, NOW()) RETURNING id`
      );

      // Log the insertion result for debugging
      console.log("Favorite college insertion result:", result);
      const insertedId =
        result.rows && result.rows[0] ? result.rows[0].id : null;
      console.log(`Inserted favorite with ID: ${insertedId}`);

      return res.status(201).json({
        id: insertedId,
        message: "College added to favorites",
      });
    } catch (error) {
      console.error("Error with favorites operation:", error);
      return res
        .status(500)
        .json({ message: "Failed to add college to favorites" });
    }
  } catch (error) {
    console.error("Error adding college to favorites:", error);
    return res
      .status(500)
      .json({ message: "Failed to add college to favorites" });
  }
});

// Get user's favorite colleges
router.get("/colleges/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`Fetching favorite colleges for user ${userId}`);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Create the table if it doesn't exist for fresh installs
    try {
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS favorite_colleges (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          college_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, college_id)
        )`
      );
    } catch (tableError) {
      console.error("Error creating favorite_colleges table:", tableError);
      // Continue anyway as we'll handle empty results below
    }

    // Get favorite colleges with joined college data using the correct column names
    try {
      const favoritesResult = await db.execute(
        sql`SELECT fc.id, fc.college_id as "collegeId", 
                c.name, c.state, c.type, c.tuition
             FROM favorite_colleges fc
             JOIN colleges c ON fc.college_id = c.id
             WHERE fc.user_id = ${userId}
             ORDER BY fc.created_at DESC`
      );

      // Log the raw results for debugging
      console.log("Raw favorites result:", JSON.stringify(favoritesResult));

      // Handle the response format correctly - drizzle returns the array directly
      console.log("Raw favorites - type:", typeof favoritesResult);

      // The response might be the array directly, not as a 'rows' property
      const rowsArray = Array.isArray(favoritesResult)
        ? favoritesResult
        : favoritesResult.rows || [];

      console.log("Using rows array:", JSON.stringify(rowsArray));
      console.log("Rows array length:", rowsArray.length);

      const formattedResults = rowsArray.map((row) => {
        console.log("Processing row:", row);
        return {
          id: row.id,
          collegeId: row.collegeId,
          userId: userId,
          college: {
            id: row.collegeId,
            name: row.name,
            state: row.state,
            type: row.type,
            tuition: row.tuition,
          },
        };
      });

      console.log(
        `Found ${formattedResults.length} favorites for user ${userId}`
      );
      console.log("Formatted results:", JSON.stringify(formattedResults));

      return res.json(formattedResults);
    } catch (error) {
      console.error("Database error when fetching favorites:", error);
      // If we get a relation does not exist error, just return an empty array
      if (error.message && error.message.includes("does not exist")) {
        return res.json([]);
      }
      throw error;
    }
  } catch (error) {
    // Improved error logging for debugging
    console.error("Error fetching favorite colleges:", error.stack || error);
    return res.status(500).json({
      message: "Failed to fetch favorite colleges",
      error: error.message,
    });
  }
});

// Delete a college from favorites
router.delete(
  "/colleges/:favoriteId",
  verifyFirebaseToken,
  async (req, res) => {
    try {
      const favoriteId = parseInt(req.params.favoriteId);

      if (isNaN(favoriteId)) {
        return res.status(400).json({ message: "Invalid favorite ID" });
      }

      await db.execute(
        sql`DELETE FROM favorite_colleges WHERE id = ${favoriteId}`
      );

      return res
        .status(200)
        .json({ message: "College removed from favorites" });
    } catch (error) {
      console.error("Error removing college from favorites:", error);
      return res
        .status(500)
        .json({ message: "Failed to remove college from favorites" });
    }
  }
);

// Add a career to favorites
router.post("/careers", verifyFirebaseToken, async (req, res) => {
  try {
    const { userId, careerId } = req.body;

    if (!userId || !careerId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: userId and careerId" });
    }

    // Create the favorite_careers table if it doesn't exist
    try {
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS favorite_careers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          career_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, career_id)
        )`
      );
    } catch (tableError) {
      console.error("Error creating favorite_careers table:", tableError);
      // Continue anyway as the table might already exist
    }

    // Check if the favorite already exists
    const existingFavorite = await db.execute(
      sql`SELECT id FROM favorite_careers 
         WHERE user_id = ${userId} AND career_id = ${careerId}`
    );

    if (existingFavorite.rows && existingFavorite.rows.length > 0) {
      return res.status(409).json({ message: "Career already in favorites" });
    }

    // Add to favorites
    const result = await db.execute(
      sql`INSERT INTO favorite_careers 
         (user_id, career_id, created_at) 
         VALUES (${userId}, ${careerId}, NOW()) RETURNING id`
    );

    // Log the insertion result for debugging
    console.log("Favorite career insertion result:", result);
    const insertedId = result.rows && result.rows[0] ? result.rows[0].id : null;
    console.log(`Inserted favorite career with ID: ${insertedId}`);

    return res.status(201).json({
      id: insertedId,
      message: "Career added to favorites",
    });
  } catch (error) {
    console.error("Error adding career to favorites:", error);
    return res
      .status(500)
      .json({ message: "Failed to add career to favorites" });
  }
});

// Get user's favorite careers
router.get("/careers/:userId", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`Fetching favorite careers for user ${userId}`);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Create the table if it doesn't exist for fresh installs
    try {
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS favorite_careers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          career_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, career_id)
        )`
      );
    } catch (tableError) {
      console.error("Error creating favorite_careers table:", tableError);
      // Continue anyway
    }

    // Get favorite careers with joined career data
    try {
      const favoritesResult = await db.execute(
        sql`SELECT fc.id, fc.career_id as "careerId", 
                  c.title, c.salary_median, c.growth_rate
               FROM favorite_careers fc
               JOIN careers c ON fc.career_id = c.id
               WHERE fc.user_id = ${userId}
               ORDER BY fc.created_at DESC`
      );

      // Log the raw results for debugging
      console.log(
        "Raw career favorites result:",
        JSON.stringify(favoritesResult)
      );

      // Handle the response format correctly - drizzle returns the array directly
      console.log("Raw career favorites - type:", typeof favoritesResult);

      // The response might be the array directly, not as a 'rows' property
      const rowsArray = Array.isArray(favoritesResult)
        ? favoritesResult
        : favoritesResult.rows || [];

      console.log("Using career rows array:", JSON.stringify(rowsArray));
      console.log("Career rows array length:", rowsArray.length);

      const formattedResults = rowsArray.map((row) => {
        console.log("Processing career row:", row);
        return {
          id: row.id,
          careerId: row.careerId,
          userId: userId,
          career: {
            id: row.careerId,
            title: row.title,
            median_salary: row.salary_median, // Use the column name returned by the query
            growth_rate: row.growth_rate,
          },
        };
      });

      console.log(
        `Found ${formattedResults.length} favorite careers for user ${userId}`
      );
      console.log(
        "Formatted career results:",
        JSON.stringify(formattedResults)
      );

      return res.json(formattedResults);
    } catch (error) {
      console.error("Database error when fetching favorite careers:", error);
      // If we get a relation does not exist error, just return an empty array
      if (error.message && error.message.includes("does not exist")) {
        return res.json([]);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error fetching favorite careers:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch favorite careers" });
  }
});

// Delete a career from favorites
router.delete("/careers/:favoriteId", verifyFirebaseToken, async (req, res) => {
  try {
    const favoriteId = parseInt(req.params.favoriteId);

    if (isNaN(favoriteId)) {
      return res.status(400).json({ message: "Invalid favorite ID" });
    }

    await db.execute(
      sql`DELETE FROM favorite_careers WHERE id = ${favoriteId}`
    );

    return res.status(200).json({ message: "Career removed from favorites" });
  } catch (error) {
    console.error("Error removing career from favorites:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove career from favorites" });
  }
});

export default router;
