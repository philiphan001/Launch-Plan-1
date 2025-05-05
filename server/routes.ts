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
import session from "express-session";
import { sessionConfig } from "./session";

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

  // Import and initialize session middleware
  app.use(session(sessionConfig));

  // API routes

  // Mount the auth routes
  app.use("/api/auth", authRoutes);

  // Mount the favorites routes
  app.use("/api/favorites", favoritesRoutes);

  // Mount the career routes
  app.use("/api/career", careerRoutes);

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

  return httpServer;
}
