import express from "express";
import { db } from "../db-config";
import { users } from "../../shared/schema";
import { verifyFirebaseToken } from "../middleware/firebase-auth";
import { eq } from "drizzle-orm";

const router = express.Router();

// User registration endpoint that works with Firebase Auth
router.post("/register", verifyFirebaseToken, async (req, res) => {
  try {
    console.log("📌 /api/users/register request received");

    // Firebase user should be available from middleware
    if (!req.firebaseUser) {
      console.error("📌 No Firebase user in request");
      return res.status(401).json({ message: "Authentication required" });
    }

    const { email, displayName, username } = req.body;
    const firebaseUid = req.firebaseUser.uid;

    console.log(`📌 Registering new user with Firebase UID: ${firebaseUid}`);

    // Basic validation
    if (!email || !username) {
      return res
        .status(400)
        .json({ message: "Email and username are required" });
    }

    // Check if user already exists with this Firebase UID
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`📌 User already exists with Firebase UID: ${firebaseUid}`);
      // Return the existing user
      const { passwordHash, ...userWithoutPassword } = existingUser[0];
      return res.status(200).json(userWithoutPassword);
    }

    // Check if email is already in use
    const emailExists = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (emailExists.length > 0) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create new user
    const newUser = {
      username,
      email,
      displayName: displayName || username,
      firebaseUid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(users).values(newUser).returning();

    if (result.length > 0) {
      // Return the newly created user without password
      const { passwordHash, ...createdUser } = result[0];
      console.log(`📌 Successfully registered user with ID: ${createdUser.id}`);

      return res.status(201).json(createdUser);
    } else {
      throw new Error("Failed to create user");
    }
  } catch (error: any) {
    console.error("📌 Error in user registration:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Get user profile endpoint
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password hash before sending the user data
    const { passwordHash, ...userData } = result[0];
    res.status(200).json(userData);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: error.message,
    });
  }
});

export default router;
