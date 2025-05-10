import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { pgStorage } from "./pg-storage";
import { validateRequest } from "../shared/middleware";
import {
  verifyFirebaseToken,
  type AuthenticatedUser,
} from "./middleware/firebase-auth";
import {
  insertUserSchema,
  insertFinancialProfileSchema,
  insertFinancialProjectionSchema,
  insertCollegeCalculationSchema,
  insertCareerCalculationSchema,
  insertMilestoneSchema,
  insertAssumptionSchema,
  type College,
} from "../shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateCareerInsights, generateCareerTimeline } from "./openai";
import authRoutes from "./routes/auth-routes";
import favoritesRoutes from "./routes/favorites-routes";
import careerRoutes from "./routes/career-routes";
import { sessionConfig } from "./session";
import milestonesRoutes from "./routes/milestones-routes";
import { db, sqlClient } from "./db";

// Get the directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function for authorization check
const checkUserAccess = (req: Request, res: Response, next: NextFunction) => {
  const requestedUserId = parseInt(req.params.userId || req.params.id, 10);
  const authenticatedUser = req.user as AuthenticatedUser | undefined;
  const authenticatedUserId = authenticatedUser?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (isNaN(requestedUserId)) {
    return res
      .status(400)
      .json({ message: "Invalid user ID format in URL parameter" });
  }

  if (authenticatedUserId !== requestedUserId) {
    console.warn(
      `Authorization Failed: User ${authenticatedUserId} attempted to access resource for user ${requestedUserId}`
    );
    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource",
    });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes

  // Mount the auth routes
  app.use("/api/auth", authRoutes);

  // Mount the favorites routes
  app.use("/api/favorites", favoritesRoutes);

  // Mount the career routes
  app.use("/api/career", careerRoutes);

  // Mount the milestones routes
  app.use("/api/milestones", milestonesRoutes);

  // Zip code income routes
  app.get(
    "/api/zip-code-income/zip/:zip",
    async (req: Request, res: Response) => {
      try {
        const zipCode = req.params.zip;
        if (!zipCode || zipCode.length < 5) {
          return res.status(400).json({ message: "Invalid zip code format" });
        }

        const incomeData = await pgStorage.getZipCodeIncomeByZipCode(zipCode);

        if (!incomeData) {
          return res
            .status(404)
            .json({ message: "Income data not found for this zip code" });
        }

        res.json(incomeData);
      } catch (error) {
        console.error("Error fetching zip code income data:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch zip code income data" });
      }
    }
  );

  // User routes
  app.post(
    "/api/users/complete-onboarding",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }

        const updatedUser = await pgStorage.updateUser(userId, {
          onboardingCompleted: true,
        });

        if (!updatedUser) {
          throw new Error("Failed to update user");
        }

        const { passwordHash, ...userWithoutPassword } = updatedUser;

        console.log("User completed onboarding:", userWithoutPassword);
        return res.status(200).json({
          success: true,
          message: "Onboarding completed",
          user: userWithoutPassword,
        });
      } catch (error) {
        console.error("Error completing onboarding:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to complete onboarding",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  app.post(
    "/api/users/register",
    validateRequest({ body: insertUserSchema }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const existingUserByUsername = await pgStorage.getUserByUsername(
          req.body.username
        );
        if (existingUserByUsername) {
          console.log(
            `Registration failed: username '${req.body.username}' already exists`
          );
          return res.status(400).json({
            message:
              "Username already exists. Please choose a different username.",
          });
        }

        if (req.body.firebaseUid) {
          const existingUserByUid = await pgStorage.getUserByFirebaseUid(
            req.body.firebaseUid
          );
          if (existingUserByUid) {
            console.log(
              `Registration failed: Firebase UID already linked to user ${existingUserByUid.id}`
            );
            return res.status(409).json({
              message: "Firebase account already linked to an existing user.",
            });
          }
        } else {
          return res
            .status(400)
            .json({ message: "Firebase UID is required for registration." });
        }

        const userData = {
          ...req.body,
          password: undefined,
          passwordHash: undefined,
          onboardingCompleted: false,
        };

        if (!userData.firebaseUid) {
          return res.status(400).json({
            message:
              "Internal error: Firebase UID missing before user creation.",
          });
        }

        const user = await pgStorage.createUser(userData);
        console.log(
          `User created successfully: ${user.username} (ID: ${user.id}) linked to Firebase UID: ${user.firebaseUid}`
        );

        const { passwordHash: _, ...userWithoutPassword } = user;
        res.status(201).json({
          ...userWithoutPassword,
          isFirstTimeUser: true,
        });
      } catch (error) {
        console.error("Error creating user:", error);

        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();

          if (
            errorMsg.includes("unique") ||
            errorMsg.includes("duplicate") ||
            errorMsg.includes("already exists")
          ) {
            return res.status(400).json({
              message:
                "Username or Firebase account already exists. Please check your details.",
              details: error.message,
            });
          }

          if (errorMsg.includes("validation") || errorMsg.includes("invalid")) {
            return res.status(400).json({
              message:
                "Invalid user data. Please check your information and try again.",
              details: error.message,
            });
          }
        }

        res.status(500).json({
          message: "Failed to create user",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  app.get(
    "/api/users/:id",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        if (req.user) {
          const authenticatedUser = req.user as AuthenticatedUser;
          return res.json(authenticatedUser);
        }

        const user = await pgStorage.getUser(parseInt(req.params.id));
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ message: "Failed to get user" });
      }
    }
  );

  app.patch(
    "/api/users/:id",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.id);

        const { password, passwordHash, ...updateData } = req.body;
        if (Object.keys(updateData).length === 0) {
          return res
            .status(400)
            .json({ message: "No valid fields provided for update." });
        }

        const updatedUser = await pgStorage.updateUser(userId, updateData);
        if (!updatedUser) {
          return res
            .status(404)
            .json({ message: "Failed to update user or user not found" });
        }

        const { passwordHash: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  );

  // Financial profile routes
  app.post(
    "/api/financial-profiles",
    verifyFirebaseToken,
    validateRequest({ body: insertFinancialProfileSchema }),
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (req.body.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: Cannot create profile for another user.",
          });
        }

        const profile = await pgStorage.createFinancialProfile(req.body);
        res.status(201).json(profile);
      } catch (error) {
        res.status(500).json({ message: "Failed to create financial profile" });
      }
    }
  );

  app.get(
    "/api/financial-profiles/user/:userId",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        const profile = await pgStorage.getFinancialProfileByUserId(
          parseInt(req.params.userId)
        );
        if (!profile) {
          return res
            .status(404)
            .json({ message: "Financial profile not found for this user" });
        }
        res.json(profile);
      } catch (error) {
        res.status(500).json({ message: "Failed to get financial profile" });
      }
    }
  );

  app.get(
    "/api/financial-profiles/:id",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const profileId = parseInt(req.params.id);
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (isNaN(profileId))
          return res.status(400).json({ message: "Invalid profile ID" });
        if (!userId)
          return res.status(401).json({ message: "Not authenticated" });

        const profile = await pgStorage.getFinancialProfile(profileId);
        if (!profile) {
          return res
            .status(404)
            .json({ message: "Financial profile not found" });
        }
        if (profile.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: You do not own this financial profile",
          });
        }
        res.json(profile);
      } catch (error) {
        res.status(500).json({ message: "Failed to get financial profile" });
      }
    }
  );

  app.patch(
    "/api/financial-profiles/:id",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const profileId = parseInt(req.params.id);
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (isNaN(profileId))
          return res.status(400).json({ message: "Invalid profile ID" });
        if (!userId)
          return res.status(401).json({ message: "Not authenticated" });

        const profile = await pgStorage.getFinancialProfile(profileId);
        if (!profile) {
          return res
            .status(404)
            .json({ message: "Financial profile not found" });
        }
        if (profile.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: You do not own this financial profile",
          });
        }

        const { userId: bodyUserId, ...updateData } = req.body;

        const updatedProfile = await pgStorage.updateFinancialProfile(
          profileId,
          updateData
        );
        if (!updatedProfile) {
          return res
            .status(404)
            .json({ message: "Failed to update financial profile" });
        }

        res.json(updatedProfile);
      } catch (error) {
        res.status(500).json({ message: "Failed to update financial profile" });
      }
    }
  );

  // Financial projections route
  app.get(
    "/api/financial-projections/:userId",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        const projections = await pgStorage.getFinancialProjectionsByUserId(userId);
        if (!projections || projections.length === 0) {
          return res.status(404).json({ message: "No projections found for this user" });
        }
        res.json(projections);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch financial projections" });
      }
    }
  );

  // College routes
  app.get("/api/colleges", async (req: Request, res: Response) => {
    try {
      const colleges = await pgStorage.getColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Failed to get colleges" });
    }
  });

  app.get("/api/colleges/search", async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.q as string;
      const educationType = req.query.educationType as string;

      if (!searchQuery || searchQuery.length < 2) {
        return res.json([]);
      }

      const colleges = await pgStorage.searchColleges(
        searchQuery,
        educationType
      );
      const transformedResults = colleges
        .slice(0, 10)
        .map((college: College) => ({
          id: college.id,
          name: college.name,
          city: college.location?.split(",")?.[0]?.trim() || "",
          state: college.state || "",
          type: college.type,
        }));

      res.json(transformedResults);
    } catch (error) {
      res.status(500).json({ message: "Failed to search colleges" });
    }
  });

  app.get("/api/colleges/:id", async (req: Request, res: Response) => {
    try {
      const college = await pgStorage.getCollege(parseInt(req.params.id));
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      res.json(college);
    } catch (error) {
      res.status(500).json({ message: "Failed to get college" });
    }
  });

  // College calculation routes
  app.get(
    "/api/college-calculations/user/:userId",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
        }

        const calculations =
          await pgStorage.getCollegeCalculationsByUserId(userId);
        res.json(calculations);
      } catch (error) {
        console.error("Error fetching college calculations:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch college calculations" });
      }
    }
  );

  // Add POST endpoint for saving college calculations
  app.post(
    "/api/college-calculations",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (req.body.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: Cannot create calculation for another user.",
          });
        }

        // Optionally validate req.body here

        const calculation = await pgStorage.createCollegeCalculation(req.body);
        res.status(201).json(calculation);
      } catch (error) {
        res.status(500).json({ message: "Failed to create college calculation" });
      }
    }
  );

  // Toggle college calculation projection inclusion
  app.post(
    "/api/college-calculations/:calculationId/toggle-projection",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;
        const calculationId = parseInt(req.params.calculationId, 10);

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (req.body.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: Cannot modify calculation for another user.",
          });
        }

        // Use the toggleProjectionInclusion method
        const updated = await pgStorage.toggleProjectionInclusion(calculationId, userId);
        if (!updated) {
          return res.status(404).json({ message: "Calculation not found or not owned by user" });
        }
        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ message: "Failed to toggle college projection" });
      }
    }
  );

  // Career routes
  app.get("/api/careers", async (req: Request, res: Response) => {
    try {
      const careers = await pgStorage.getCareers();
      res.json(careers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get careers" });
    }
  });

  app.get("/api/careers/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;

      if (!query || query.length < 2) {
        return res.json([]);
      }

      const careers = await pgStorage.searchCareers(query);
      res.json(careers);
    } catch (error) {
      res.status(500).json({ message: "Failed to search careers" });
    }
  });

  app.get("/api/careers/:id", async (req: Request, res: Response) => {
    try {
      const career = await pgStorage.getCareer(parseInt(req.params.id));
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      res.json(career);
    } catch (error) {
      res.status(500).json({ message: "Failed to get career" });
    }
  });

  app.get("/api/career-insights/:id", async (req: Request, res: Response) => {
    try {
      const careerId = parseInt(req.params.id);
      if (isNaN(careerId)) {
        return res.status(400).json({ message: "Invalid career ID format" });
      }

      const career = await pgStorage.getCareer(careerId);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }

      const insights = await generateCareerInsights(
        career.title,
        career.description || undefined
      );

      res.json(insights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate career insights" });
    }
  });

  app.get("/api/career-timeline/:id", async (req: Request, res: Response) => {
    try {
      const careerId = parseInt(req.params.id);
      if (isNaN(careerId)) {
        return res.status(400).json({ message: "Invalid career ID format" });
      }

      const career = await pgStorage.getCareer(careerId);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }

      const timelineData = await generateCareerTimeline(
        career.title,
        career.description || undefined
      );

      res.json(timelineData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate career timeline" });
    }
  });

  // Career calculation routes
  app.get(
    "/api/career-calculations/user/:userId",
    verifyFirebaseToken,
    checkUserAccess,
    async (req: Request, res: Response) => {
      try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
          return res.status(400).json({ message: "Invalid user ID format" });
        }

        const calculations =
          await pgStorage.getCareerCalculationsByUserId(userId);
        res.json(calculations);
      } catch (error) {
        console.error("Error fetching career calculations:", error);
        res
          .status(500)
          .json({ message: "Failed to fetch career calculations" });
      }
    }
  );

  // Career calculation creation route
  app.post(
    "/api/career-calculations",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (req.body.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: Cannot create calculation for another user.",
          });
        }

        // Optionally validate req.body here

        const calculation = await pgStorage.createCareerCalculation(req.body);
        res.status(201).json(calculation);
      } catch (error) {
        res.status(500).json({ message: "Failed to create career calculation" });
      }
    }
  );

  // Toggle career calculation projection inclusion
  app.post(
    "/api/career-calculations/:calculationId/toggle-projection",
    verifyFirebaseToken,
    async (req: Request, res: Response) => {
      try {
        const authenticatedUser = req.user as AuthenticatedUser | undefined;
        const userId = authenticatedUser?.id;
        const calculationId = parseInt(req.params.calculationId, 10);

        if (!userId) {
          return res.status(401).json({ message: "Not authenticated" });
        }
        if (req.body.userId !== userId) {
          return res.status(403).json({
            message: "Forbidden: Cannot modify calculation for another user.",
          });
        }

        // Use the toggleCareerProjectionInclusion method
        const updated = await pgStorage.toggleCareerProjectionInclusion(calculationId, userId);
        if (!updated) {
          return res.status(404).json({ message: "Calculation not found or not owned by user" });
        }
        res.status(200).json(updated);
      } catch (error) {
        res.status(500).json({ message: "Failed to toggle career projection" });
      }
    }
  );

  // Career paths endpoint
  app.get("/api/career-paths", async (req, res) => {
    try {
      const { fieldOfStudy } = req.query;
      let paths;
      if (fieldOfStudy) {
        paths = await pgStorage.getCareerPathsByField(fieldOfStudy as string);
      } else {
        paths = await pgStorage.getAllCareerPaths();
      }
      res.json(paths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get career paths" });
    }
  });

  // Location cost of living by zip code
  app.get("/api/location-cost-of-living/zip/:zip", async (req, res) => {
    try {
      const zip = req.params.zip;
      const data = await pgStorage.getLocationCostOfLivingByZipCode(zip);
      if (!data) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to get location data" });
    }
  });

  // Location cost of living by city and state
  app.get("/api/location-cost-of-living/city", async (req, res) => {
    try {
      const { city, state } = req.query;
      if (!city || !state) {
        return res.status(400).json({ message: "City and state are required" });
      }
      const data = await pgStorage.getLocationCostOfLivingByCityState(city as string, state as string);
      if (!data || data.length === 0) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to get location data" });
    }
  });

  // Fetch random questions for a game
  app.get('/api/questions', async (req: Request, res: Response) => {
    try {
      const { game, limit = 10 } = req.query;
      if (!game || typeof game !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid game parameter' });
      }
      // Look up the game by name
      const gameResult = await sqlClient`SELECT id FROM games WHERE name = ${game}`;
      if (!gameResult || gameResult.length === 0) {
        return res.status(404).json({ error: 'Game not found' });
      }
      const game_id = gameResult[0].id;
      // Fetch random questions for the game
      const questionsResult = await sqlClient`
        SELECT q.id, q.title, q.description, q.emoji, c.name as category, s.name as subcategory
        FROM questions q
        LEFT JOIN categories c ON q.category_id = c.id
        LEFT JOIN subcategories s ON q.subcategory_id = s.id
        WHERE q.game_id = ${game_id} AND q.is_active = true
        ORDER BY RANDOM() LIMIT ${limit}
      `;
      return res.json(questionsResult);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
  });

  // Record a user response
  app.post('/api/responses', async (req: Request, res: Response) => {
    try {
      const { session_id, question_id, response_value, response_time_ms, device_info } = req.body;
      if (!session_id || !question_id || typeof response_value === 'undefined') {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      // Ensure session exists in sessions table
      await sqlClient`
        INSERT INTO sessions (id)
        VALUES (${session_id})
        ON CONFLICT (id) DO NOTHING
      `;
      // Now insert the response
      await sqlClient`
        INSERT INTO responses (session_id, question_id, response_value, response_time_ms, device_info)
        VALUES (${session_id}, ${question_id}, ${response_value}, ${response_time_ms ?? null}, ${device_info})
      `;
      return res.json({ status: 'ok' });
    } catch (error) {
      console.error('Error recording response:', error);
      return res.status(500).json({ error: 'Failed to record response' });
    }
  });

  // Analyze responses and build LLM prompt
  app.post('/api/llm/analyze', async (req: Request, res: Response) => {
    try {
      const { session_id, analysis_type } = req.body;
      if (!session_id) {
        return res.status(400).json({ error: 'session_id is required' });
      }
      // Fetch all responses for the session, join with questions, games, and categories
      const responses = await sqlClient`
        SELECT r.response_value, r.question_id, q.title AS question_title, q.description AS question_description, g.name AS game_name, c.name AS category
        FROM responses r
        JOIN questions q ON r.question_id = q.id
        JOIN games g ON q.game_id = g.id
        LEFT JOIN categories c ON q.category_id = c.id
        WHERE r.session_id = ${session_id}
        ORDER BY g.name, q.id
      `;
      // Group responses by game
      const grouped = responses.reduce((acc, r) => {
        if (!acc[r.game_name]) acc[r.game_name] = [];
        acc[r.game_name].push(r);
        return acc;
      }, {} as Record<string, any[]>);
      // Build prompt string
      let prompt = '';
      for (const [game, answers] of Object.entries(grouped)) {
        prompt += `Game: ${game}\n`;
        for (const r of answers) {
          prompt += `Q: [${r.category}] ${r.question_title} - ${r.question_description}\nA: ${r.response_value}\n`;
        }
        prompt += '\n';
      }
      // (Optional) Call LLM API here in the future
      res.json({ prompt });
    } catch (error) {
      console.error('Error generating LLM prompt:', error);
      res.status(500).json({ error: 'Failed to generate LLM prompt' });
    }
  });

  return httpServer;
}
