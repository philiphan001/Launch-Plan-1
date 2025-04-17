import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { activeStorage } from "./index";
import { validateRequest, authMiddleware } from "../shared/middleware";
import { insertUserSchema, insertFinancialProfileSchema, insertFinancialProjectionSchema, insertCollegeCalculationSchema, insertCareerCalculationSchema, insertMilestoneSchema, insertAssumptionSchema } from "../shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { generateCareerInsights, generateCareerTimeline } from "./openai";

// Get the directory name in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes
  // Auth routes
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error, user: any, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Don't return password
        const { password, ...userWithoutPassword } = user;
        
        // Check if this is a first-time user by checking when they were created
        // Cast to include createdAt property
        const userWithTime = user as { createdAt?: string | Date };
        const isFirstTimeUser = new Date().getTime() - new Date(userWithTime.createdAt || new Date()).getTime() < 24 * 60 * 60 * 1000;
        
        return res.status(200).json({ 
          ...userWithoutPassword,
          isFirstTimeUser
        });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req: Request, res: Response) => {
    try {
      console.log("AUTH CHECK - Session:", req.session);
      console.log("AUTH CHECK - User:", req.user);
      console.log("AUTH CHECK - isAuthenticated:", req.isAuthenticated?.());
      
      if (!req.isAuthenticated() || !req.user) {
        console.log("User not authenticated in /api/auth/me");
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user;
      
      // Check if user data is valid
      if (!user || typeof user !== 'object') {
        console.error("Invalid user data in session:", user);
        return res.status(500).json({ message: "Invalid user data in session" });
      }
      
      // Add isFirstTimeUser property
      // Cast to include createdAt property
      const userWithTime = user as { createdAt?: string | Date };
      
      // Default to false if createdAt is missing
      let isFirstTimeUser = false;
      
      if (userWithTime && userWithTime.createdAt) {
        try {
          const userCreatedAt = new Date(userWithTime.createdAt).getTime();
          const now = new Date().getTime();
          isFirstTimeUser = (now - userCreatedAt) < 24 * 60 * 60 * 1000;
        } catch (err) {
          console.error("Error calculating isFirstTimeUser:", err);
          // Default to false on error
          isFirstTimeUser = false;
        }
      }
      
      // Force isFirstTimeUser to false to ensure dashboard access
      console.log("Returning user data:", { id: (user as any).id, isFirstTimeUser: false });
      return res.status(200).json({
        ...user,
        isFirstTimeUser: false
      });
    } catch (error) {
      console.error("Error in /api/auth/me endpoint:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Add the complete-onboarding endpoint
  app.post("/api/users/complete-onboarding", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    console.log("User completing onboarding:", req.user);
    // We're just returning success here since we're already forcing isFirstTimeUser to false
    return res.status(200).json({ success: true, message: "Onboarding completed" });
  });
  
  // User routes with secure password hashing
  app.post("/api/users/register", validateRequest({ body: insertUserSchema }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Received registration request:", { username: req.body.username });
      
      // Check if username already exists
      const existingUser = await activeStorage.getUserByUsername(req.body.username);
      if (existingUser) {
        console.log(`Registration failed: username '${req.body.username}' already exists`);
        return res.status(400).json({ 
          message: "Username already exists. Please choose a different username."
        });
      }
      
      // Hash the password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log(`Password hashed successfully for user: ${req.body.username}`);
      
      // Create user with hashed password
      const userDataWithHashedPassword = {
        ...req.body,
        password: hashedPassword
      };
      
      // Create user in the database
      const user = await activeStorage.createUser(userDataWithHashedPassword);
      console.log(`User created successfully: ${user.username} (ID: ${user.id})`);
      
      // Automatically log the user in after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
        
        console.log(`User ${user.username} logged in automatically after registration`);
        
        // Don't return password
        const { password, ...userWithoutPassword } = user;
        
        res.status(201).json({
          ...userWithoutPassword,
          isFirstTimeUser: true
        });
      });
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Handle database-specific errors
      if (error instanceof Error) {
        // Look for specific error types
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('unique') || errorMsg.includes('duplicate') || errorMsg.includes('already exists')) {
          return res.status(400).json({ 
            message: "Username already exists. Please choose a different username.",
            details: error.message 
          });
        }
        
        if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
          return res.status(400).json({ 
            message: "Invalid user data. Please check your information and try again.",
            details: error.message 
          });
        }
      }
      
      // Return more detailed error message for other errors
      res.status(500).json({ 
        message: "Failed to create user", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/users/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await activeStorage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await activeStorage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "Failed to update user" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Financial profile routes
  app.post("/api/financial-profiles", validateRequest({ body: insertFinancialProfileSchema }), async (req: Request, res: Response) => {
    try {
      const profile = await activeStorage.createFinancialProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to create financial profile" });
    }
  });

  app.get("/api/financial-profiles/user/:userId", async (req: Request, res: Response) => {
    try {
      const profile = await activeStorage.getFinancialProfileByUserId(parseInt(req.params.userId));
      if (!profile) {
        return res.status(404).json({ message: "Financial profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial profile" });
    }
  });
  
  app.get("/api/financial-profiles/:id", async (req: Request, res: Response) => {
    try {
      const profile = await activeStorage.getFinancialProfile(parseInt(req.params.id));
      if (!profile) {
        return res.status(404).json({ message: "Financial profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial profile" });
    }
  });
  
  app.patch("/api/financial-profiles/:id", async (req: Request, res: Response) => {
    try {
      const profileId = parseInt(req.params.id);
      const profile = await activeStorage.getFinancialProfile(profileId);
      if (!profile) {
        return res.status(404).json({ message: "Financial profile not found" });
      }
      
      const updatedProfile = await activeStorage.updateFinancialProfile(profileId, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Failed to update financial profile" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to update financial profile" });
    }
  });

  // College routes
  app.get("/api/colleges", async (req: Request, res: Response) => {
    try {
      console.log("Attempting to fetch colleges from database");
      const colleges = await activeStorage.getColleges();
      console.log("Colleges fetched successfully:", colleges.length);
      
      // Debug first few colleges to understand the structure
      if (colleges.length > 0) {
        console.log(`Sample college structure:`, colleges[0]);
      }
      
      // Transform snake_case properties to camelCase for frontend compatibility
      const transformedColleges = colleges.map(college => {
        // Create transformed college object, handling both camelCase and snake_case
        const transformed = {
          id: college.id,
          name: college.name,
          location: college.location,
          state: college.state,
          type: college.type,
          tuition: college.tuition,
          roomAndBoard: college.roomAndBoard,
          acceptanceRate: college.acceptanceRate,
          rating: college.rating,
          size: college.size,
          rank: college.rank,
          feesByIncome: college.feesByIncome,
          // Handle both camelCase and snake_case possibilities
          usNewsTop150: college.usNewsTop150 !== undefined ? Number(college.usNewsTop150) : 
                      (college as any).us_news_top_150 !== undefined ? Number((college as any).us_news_top_150) : null,
          bestLiberalArtsColleges: college.bestLiberalArtsColleges !== undefined ? Number(college.bestLiberalArtsColleges) : 
                                 (college as any).best_liberal_arts_colleges !== undefined ? Number((college as any).best_liberal_arts_colleges) : null,
          // New fields from the extended college data
          degreesAwardedPredominant: (college as any).degrees_awarded_predominant,
          degreesAwardedHighest: (college as any).degrees_awarded_highest,
          admissionRateOverall: (college as any).admission_rate_overall,
          satScoresAverageOverall: (college as any).sat_scores_average_overall,
          pellGrantRate: (college as any).pell_grant_rate,
          completionRate4yr150nt: (college as any).completion_rate_4yr_150nt,
          medianDebtCompletersOverall: (college as any).median_debt_completers_overall,
          medianDebtNoncompleters: (college as any).median_debt_noncompleters,
          demographicsMedianFamilyIncome: (college as any).demographics_median_family_income,
          medianEarnings10yrsAfterEntry: (college as any).median_earnings_10yrs_after_entry
        };
        
        // Debug output for top colleges
        const usNewsRank = transformed.usNewsTop150;
        if (usNewsRank !== null && usNewsRank <= 150) {
          console.log(`Found US News Top 150 college: ${college.name} (ID: ${college.id}, Rank: ${usNewsRank})`);
        }
        
        const liberalArtsRank = transformed.bestLiberalArtsColleges;
        if (liberalArtsRank !== null && liberalArtsRank <= 300) {
          console.log(`Found Best Liberal Arts college: ${college.name} (ID: ${college.id}, Rank: ${liberalArtsRank})`);
        }
        
        return transformed;
      });
      
      res.json(transformedColleges);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      res.status(500).json({ message: "Failed to get colleges", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  // Search endpoint for colleges
  app.get("/api/colleges/search", async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.q as string;
      const educationType = req.query.educationType as string;
      
      if (!searchQuery || searchQuery.length < 2) {
        return res.json([]);
      }
      
      console.log(`Searching colleges with query: ${searchQuery}${educationType ? `, education type: ${educationType}` : ''}`);
      const colleges = await activeStorage.searchColleges(searchQuery, educationType);
      
      console.log(`Found ${colleges.length} colleges matching "${searchQuery}"${educationType ? ` with education type "${educationType}"` : ''}`);
      
      // Transform and limit results
      const transformedResults = colleges.slice(0, 10).map(college => ({
        id: college.id,
        name: college.name,
        city: college.location?.split(',')?.[0]?.trim() || '',
        state: college.state || '',
        type: college.type
      }));
      
      res.json(transformedResults);
    } catch (error) {
      console.error("Error searching colleges:", error);
      res.status(500).json({ 
        message: "Failed to search colleges", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  app.get("/api/colleges/:id", async (req: Request, res: Response) => {
    try {
      const college = await activeStorage.getCollege(parseInt(req.params.id));
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      
      // Debug the actual raw college object
      console.log(`Raw college object from database:`, college);
      
      // Transform snake_case properties to camelCase for frontend compatibility
      const transformedCollege = {
        id: college.id,
        name: college.name,
        location: college.location,
        state: college.state,
        type: college.type,
        tuition: college.tuition,
        roomAndBoard: college.roomAndBoard,
        acceptanceRate: college.acceptanceRate,
        rating: college.rating,
        size: college.size,
        rank: college.rank,
        feesByIncome: college.feesByIncome,
        // Handle both camelCase and snake_case possibilities
        usNewsTop150: college.usNewsTop150 !== undefined ? Number(college.usNewsTop150) : 
                      (college as any).us_news_top_150 !== undefined ? Number((college as any).us_news_top_150) : null,
        bestLiberalArtsColleges: college.bestLiberalArtsColleges !== undefined ? Number(college.bestLiberalArtsColleges) : 
                                (college as any).best_liberal_arts_colleges !== undefined ? Number((college as any).best_liberal_arts_colleges) : null,
        // New fields from the extended college data
        degreesAwardedPredominant: (college as any).degrees_awarded_predominant,
        degreesAwardedHighest: (college as any).degrees_awarded_highest,
        admissionRateOverall: (college as any).admission_rate_overall,
        satScoresAverageOverall: (college as any).sat_scores_average_overall,
        pellGrantRate: (college as any).pell_grant_rate,
        completionRate4yr150nt: (college as any).completion_rate_4yr_150nt,
        medianDebtCompletersOverall: (college as any).median_debt_completers_overall,
        medianDebtNoncompleters: (college as any).median_debt_noncompleters,
        demographicsMedianFamilyIncome: (college as any).demographics_median_family_income,
        medianEarnings10yrsAfterEntry: (college as any).median_earnings_10yrs_after_entry
      };
      
      res.json(transformedCollege);
    } catch (error) {
      res.status(500).json({ message: "Failed to get college" });
    }
  });

  // Career routes
  app.get("/api/careers", async (req: Request, res: Response) => {
    try {
      console.log("Attempting to fetch careers from database");
      const careers = await activeStorage.getCareers();
      console.log("Careers fetched successfully:", careers.length);
      res.json(careers);
    } catch (error) {
      console.error("Error fetching careers:", error);
      res.status(500).json({ message: "Failed to get careers", error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.get("/api/careers/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      console.log(`Searching careers with query: ${query}`);
      
      if (!query || query.length < 2) {
        console.log("Query too short, returning empty array");
        return res.json([]);
      }
      
      const careers = await activeStorage.searchCareers(query);
      console.log(`Found ${careers.length} careers matching query`);
      res.json(careers);
    } catch (error) {
      console.error("Error searching careers:", error);
      res.status(500).json({ message: "Failed to search careers", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/careers/:id", async (req: Request, res: Response) => {
    try {
      const career = await activeStorage.getCareer(parseInt(req.params.id));
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      res.json(career);
    } catch (error) {
      res.status(500).json({ message: "Failed to get career" });
    }
  });
  
  // Career insights route using OpenAI
  app.get("/api/career-insights/:id", async (req: Request, res: Response) => {
    try {
      const careerId = parseInt(req.params.id);
      if (isNaN(careerId)) {
        return res.status(400).json({ message: "Invalid career ID format" });
      }
      
      const career = await activeStorage.getCareer(careerId);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      
      // Generate insights using OpenAI
      const insights = await generateCareerInsights(career.title, career.description || undefined);
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating career insights:", error);
      res.status(500).json({ 
        message: "Failed to generate career insights", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/career-timeline/:id", async (req: Request, res: Response) => {
    try {
      const careerId = parseInt(req.params.id);
      if (isNaN(careerId)) {
        return res.status(400).json({ message: "Invalid career ID format" });
      }
      
      const career = await activeStorage.getCareer(careerId);
      if (!career) {
        return res.status(404).json({ message: "Career not found" });
      }
      
      // Generate timeline using OpenAI
      const timelineData = await generateCareerTimeline(career.title, career.description || undefined);
      
      res.json(timelineData);
    } catch (error) {
      console.error("Error generating career timeline:", error);
      res.status(500).json({ 
        message: "Failed to generate career timeline", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Favorites routes
  app.post("/api/favorites/colleges", async (req: Request, res: Response) => {
    try {
      const { userId, collegeId } = req.body;
      
      // Validate required fields
      if (userId === undefined || collegeId === undefined) {
        return res.status(400).json({ message: "Missing required fields: userId and collegeId are required" });
      }
      
      // Verify user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        // Create a demo user if not found (for development purposes)
        console.log(`User with ID ${userId} not found, creating demo user...`);
        await activeStorage.createUser({
          username: "philiphan",
          password: "password123", // This is a demo app, in production you'd use proper auth
          firstName: "Philip",
          lastName: "Han",
          email: "philip.han@example.com"
        });
      }
      
      // Check if college exists
      const college = await activeStorage.getCollege(collegeId);
      if (!college) {
        return res.status(404).json({ message: `College with ID ${collegeId} not found` });
      }
      
      // Add to favorites
      const favorite = await activeStorage.addFavoriteCollege(userId, collegeId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite college:", error);
      res.status(500).json({ message: "Failed to add favorite college", error: String(error) });
    }
  });

  app.delete("/api/favorites/colleges/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid favorite ID format" });
      }
      
      // Check if favorite exists
      const favorite = await activeStorage.getFavoriteCollege(id);
      if (!favorite) {
        return res.status(404).json({ message: `Favorite with ID ${id} not found` });
      }
      
      await activeStorage.removeFavoriteCollege(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite college:", error);
      res.status(500).json({ message: "Failed to remove favorite college", error: String(error) });
    }
  });

  app.get("/api/favorites/colleges/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      const favorites = await activeStorage.getFavoriteCollegesByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorite colleges:", error);
      res.status(500).json({ message: "Failed to get favorite colleges", error: String(error) });
    }
  });

  app.post("/api/favorites/careers", async (req: Request, res: Response) => {
    try {
      const { userId, careerId } = req.body;
      
      console.log("Adding career to favorites:", { userId, careerId });
      
      // Validate required fields
      if (userId === undefined || careerId === undefined) {
        return res.status(400).json({ message: "Missing required fields: userId and careerId are required" });
      }
      
      // Verify user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      // Check if career exists
      const career = await activeStorage.getCareer(careerId);
      if (!career) {
        console.log(`Career ID ${careerId} not found in careers table. This might be a career_paths ID which doesn't match.`);
        
        // Try to find corresponding career path
        const careerPath = await activeStorage.getCareerPath(careerId);
        if (careerPath) {
          console.log(`Found career path with title "${careerPath.career_title}". Need to find matching career.`);
          
          // Try to find a matching career by title
          const matchingCareers = await activeStorage.searchCareers(careerPath.career_title);
          if (matchingCareers && matchingCareers.length > 0) {
            const matchedCareer = matchingCareers[0];
            console.log(`Found matching career with ID ${matchedCareer.id} and title "${matchedCareer.title}"`);
            
            // Use the matched career ID from the careers table
            const favorite = await activeStorage.addFavoriteCareer(userId, matchedCareer.id);
            return res.status(201).json(favorite);
          }
        }
        
        return res.status(404).json({ message: `Career with ID ${careerId} not found` });
      }
      
      const favorite = await activeStorage.addFavoriteCareer(userId, careerId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite career:", error);
      res.status(500).json({ message: "Failed to add favorite career", error: String(error) });
    }
  });

  app.delete("/api/favorites/careers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid favorite ID format" });
      }
      
      // Check if favorite exists
      const favorite = await activeStorage.getFavoriteCareer(id);
      if (!favorite) {
        return res.status(404).json({ message: `Favorite with ID ${id} not found` });
      }
      
      await activeStorage.removeFavoriteCareer(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite career:", error);
      res.status(500).json({ message: "Failed to remove favorite career", error: String(error) });
    }
  });

  app.get("/api/favorites/careers/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      const favorites = await activeStorage.getFavoriteCareersByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorite careers:", error);
      res.status(500).json({ message: "Failed to get favorite careers", error: String(error) });
    }
  });

  // Favorite locations routes
  app.post("/api/favorites/locations", async (req: Request, res: Response) => {
    try {
      const { userId, zipCode, city, state } = req.body;
      
      // Validate required fields
      if (userId === undefined || zipCode === undefined) {
        return res.status(400).json({ message: "Missing required fields: userId and zipCode are required" });
      }
      
      // Verify user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      // Check if location exists in our cost of living data
      // We don't block if not found, as we can still store the zip code
      const locationInfo = await activeStorage.getLocationCostOfLivingByZipCode(zipCode);
      if (!locationInfo) {
        console.log(`Location with zip code ${zipCode} not found in cost of living data, adding anyway`);
      }
      
      const favorite = await activeStorage.addFavoriteLocation(userId, zipCode, city, state);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding favorite location:", error);
      res.status(500).json({ message: "Failed to add favorite location", error: String(error) });
    }
  });
  
  app.delete("/api/favorites/locations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid favorite ID format" });
      }
      
      const favorite = await activeStorage.getFavoriteLocation(id);
      if (!favorite) {
        return res.status(404).json({ message: `Favorite location with ID ${id} not found` });
      }
      
      await activeStorage.removeFavoriteLocation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing favorite location:", error);
      res.status(500).json({ message: "Failed to remove favorite location", error: String(error) });
    }
  });
  
  app.get("/api/favorites/locations/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: `User with ID ${userId} not found` });
      }
      
      const favorites = await activeStorage.getFavoriteLocationsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorite locations:", error);
      res.status(500).json({ message: "Failed to get favorite locations", error: String(error) });
    }
  });

  // Financial projections routes
  app.post("/api/financial-projections", validateRequest({ body: insertFinancialProjectionSchema }), async (req: Request, res: Response) => {
    try {
      // Ensure projection data is stored consistently
      const projectionData = req.body.projectionData;
      
      // Handle the case where projectionData might be a string
      // This shouldn't happen with our frontend fix, but this adds an extra safety layer
      const processedProjectionData = 
        typeof projectionData === 'string' 
          ? JSON.parse(projectionData) 
          : projectionData;
      
      // Create a clean request body with normalized projectionData
      const cleanedRequestBody = {
        ...req.body,
        projectionData: processedProjectionData
      };
      
      console.log("Creating financial projection with normalized data structure");
      const projection = await activeStorage.createFinancialProjection(cleanedRequestBody);
      res.status(201).json(projection);
    } catch (error) {
      console.error("Failed to create financial projection:", error);
      res.status(500).json({ 
        message: "Failed to create financial projection",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/financial-projections/:userId", async (req: Request, res: Response) => {
    try {
      const projections = await activeStorage.getFinancialProjectionsByUserId(parseInt(req.params.userId));
      
      // Process projection data for consistency before returning it
      const processedProjections = projections.map(projection => {
        if (projection.projectionData && typeof projection.projectionData === 'string') {
          try {
            // Parse string data to ensure consistent object format
            const parsedData = JSON.parse(projection.projectionData);
            return {
              ...projection,
              projectionData: parsedData
            };
          } catch (parseError) {
            console.error("Error parsing projection data for list item:", parseError);
            // Return with original format if parsing fails
            return projection;
          }
        }
        return projection;
      });
      
      res.json(processedProjections);
    } catch (error) {
      console.error("Error getting financial projections:", error);
      res.status(500).json({ 
        message: "Failed to get financial projections",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/financial-projections/detail/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        console.error("DEBUG - Invalid projection ID format:", req.params.id);
        return res.status(400).json({ message: "Invalid projection ID format" });
      }
      
      console.log("DEBUG - Fetching financial projection with ID:", id);
      const projection = await activeStorage.getFinancialProjection(id);
      if (!projection) {
        return res.status(404).json({ message: "Financial projection not found" });
      }
      
      // Ensure projectionData is correctly parsed and normalized for consistent
      // frontend handling
      if (projection.projectionData) {
        if (typeof projection.projectionData === 'string') {
          try {
            // Parse string data and normalize it
            projection.projectionData = JSON.parse(projection.projectionData);
            console.log("Parsed string projectionData for projection ID:", id);
          } catch (parseError) {
            console.error("Error parsing projection data:", parseError);
            // Keep the string value if parsing fails
          }
        }
      }
      
      res.json(projection);
    } catch (error) {
      console.error("Error getting financial projection detail:", error);
      res.status(500).json({ 
        message: "Failed to get financial projection detail",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.delete("/api/financial-projections/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid projection ID format" });
      }
      
      // Check if projection exists
      const projection = await activeStorage.getFinancialProjection(id);
      if (!projection) {
        return res.status(404).json({ message: "Financial projection not found" });
      }
      
      await activeStorage.deleteFinancialProjection(id);
      res.status(200).json({ message: "Financial projection deleted successfully" });
    } catch (error) {
      console.error("Error deleting financial projection:", error);
      res.status(500).json({ message: "Failed to delete financial projection" });
    }
  });

  // Career paths routes
  app.get("/api/career-paths", async (req: Request, res: Response) => {
    try {
      const careerPaths = await activeStorage.getAllCareerPaths();
      res.json(careerPaths);
    } catch (error) {
      console.error("Error fetching career paths:", error);
      res.status(500).json({ message: "Failed to get career paths", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/career-paths/field/:fieldOfStudy", async (req: Request, res: Response) => {
    try {
      const careerPaths = await activeStorage.getCareerPathsByField(req.params.fieldOfStudy);
      res.json(careerPaths);
    } catch (error) {
      res.status(500).json({ message: "Failed to get career paths" });
    }
  });

  app.get("/api/career-paths/:id", async (req: Request, res: Response) => {
    try {
      const careerPath = await activeStorage.getCareerPath(parseInt(req.params.id));
      if (!careerPath) {
        return res.status(404).json({ message: "Career path not found" });
      }
      res.json(careerPath);
    } catch (error) {
      res.status(500).json({ message: "Failed to get career path" });
    }
  });

  // Location cost of living routes
  app.get("/api/location-cost-of-living", async (req: Request, res: Response) => {
    try {
      const locations = await activeStorage.getAllLocationCostOfLiving();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching location cost of living data:", error);
      res.status(500).json({ message: "Failed to get location cost of living data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/location-cost-of-living/zip/:zipCode", async (req: Request, res: Response) => {
    try {
      const location = await activeStorage.getLocationCostOfLivingByZipCode(req.params.zipCode);
      if (!location) {
        return res.status(404).json({ message: "Location cost of living data not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to get location cost of living data" });
    }
  });
  
  app.get("/api/location-cost-of-living/city", async (req: Request, res: Response) => {
    try {
      const { city, state } = req.query;
      
      if (!city || !state) {
        return res.status(400).json({ message: "City and state are required parameters" });
      }
      
      const locations = await activeStorage.getLocationCostOfLivingByCityState(
        city.toString(),
        state.toString()
      );
      
      if (!locations || locations.length === 0) {
        return res.status(404).json({ message: "No locations found for the given city and state" });
      }
      
      res.json(locations);
    } catch (error) {
      console.error("Error fetching location by city/state:", error);
      res.status(500).json({ message: "Failed to get location data by city/state" });
    }
  });

  app.get("/api/location-cost-of-living/:id", async (req: Request, res: Response) => {
    try {
      const location = await activeStorage.getLocationCostOfLiving(parseInt(req.params.id));
      if (!location) {
        return res.status(404).json({ message: "Location cost of living data not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to get location cost of living data" });
    }
  });

  // Zip code income routes
  app.get("/api/zip-code-income", async (req: Request, res: Response) => {
    try {
      const incomes = await activeStorage.getAllZipCodeIncomes();
      res.json(incomes);
    } catch (error) {
      console.error("Error fetching zip code income data:", error);
      res.status(500).json({ message: "Failed to get zip code income data", error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/zip-code-income/zip/:zipCode", async (req: Request, res: Response) => {
    try {
      const income = await activeStorage.getZipCodeIncomeByZipCode(req.params.zipCode);
      if (!income) {
        return res.status(404).json({ message: "Zip code income data not found" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Failed to get zip code income data" });
    }
  });

  app.get("/api/zip-code-income/:id", async (req: Request, res: Response) => {
    try {
      const income = await activeStorage.getZipCodeIncome(parseInt(req.params.id));
      if (!income) {
        return res.status(404).json({ message: "Zip code income data not found" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Failed to get zip code income data" });
    }
  });

  // Calculate future savings for a specific year (simple version)
  app.post("/api/calculate/future-savings-simple", async (req: Request, res: Response) => {
    try {
      const { userId, year, currentSavings, growthRate = 0.03 } = req.body;
      
      if (!userId || typeof year !== 'number' || typeof currentSavings !== 'number') {
        return res.status(400).json({ message: "Invalid input parameters" });
      }
      
      // Use financial profile data if currentSavings is not provided
      let savings = currentSavings;
      if (!savings && userId) {
        const profile = await activeStorage.getFinancialProfileByUserId(parseInt(userId.toString()));
        if (profile && profile.savingsAmount) {
          savings = profile.savingsAmount;
        } else {
          savings = 0;
        }
      }
      
      // Simple future value calculation: FV = PV * (1 + r)^n
      // Where FV = future value, PV = present value (savings), r = growth rate, n = years
      const futureSavings = savings * Math.pow(1 + growthRate, year);
      
      res.json({
        currentSavings: savings,
        futureSavings,
        year,
        growthRate
      });
    } catch (error) {
      console.error("Error calculating future savings:", error);
      res.status(500).json({ message: "Failed to calculate future savings" });
    }
  });

  // Python financial calculator route
  app.post("/api/calculate/financial-projection", async (req: Request, res: Response) => {
    try {
      const inputData = req.body;
      let updatedInputData = { ...inputData };
      
      // Check if zip code is provided and costOfLivingFactor is not
      // This centralizes location adjustment in the backend
      if (inputData.zipCode && !inputData.costOfLivingFactor) {
        try {
          // Fetch the location data based on zip code
          const locationData = await activeStorage.getLocationCostOfLivingByZipCode(inputData.zipCode);
          
          if (locationData) {
            // Add location data for the Python calculator to use
            updatedInputData.locationData = locationData;
            // We still provide the factor as a fallback but the Python calculator
            // will prioritize using the full location data when available
            updatedInputData.costOfLivingFactor = locationData.income_adjustment_factor;
            console.log(`Location data found for zip ${inputData.zipCode}, adjustment factor: ${locationData.income_adjustment_factor}`);
          } else {
            console.log(`No location data found for zip ${inputData.zipCode}, using default factor 1.0`);
            // If no location data, use the default factor
            updatedInputData.costOfLivingFactor = 1.0;
          }
        } catch (locationError) {
          console.error("Error fetching location data:", locationError);
          // If there's an error, continue with the existing data
          // This ensures that calculations don't fail if location data is unavailable
        }
      }
      
      // Fetch all careers data to pass to the Python calculator for post-graduation income calculation
      try {
        const careersData = await activeStorage.getCareers();
        if (careersData && careersData.length > 0) {
          // Optimize by only sending essential career fields to reduce payload size
          updatedInputData.careersData = careersData.map((career: any) => ({
            id: career.id,
            title: career.title,
            median_salary: career.salary || 0,  // Use salary as median_salary
            entry_salary: career.salaryPct25 || 0, // Use salaryPct25 as entry_salary
            experienced_salary: career.salaryPct75 || 0 // Use salaryPct75 as experienced_salary
          }));
          console.log(`Added ${careersData.length} careers to calculator input (optimized)`);
        }
      } catch (careersError) {
        console.error("Error fetching careers data:", careersError);
        // Continue without careers data if there's an error
      }
      
      // Use path.resolve and the current directory for ESM compatibility
      const pythonScriptPath = path.resolve("server/python/calculator.py");
      
      // Check if the Python script exists
      if (!fs.existsSync(pythonScriptPath)) {
        return res.status(500).json({ message: "Financial calculator script not found", path: pythonScriptPath });
      }
      
      // Log the inputs for debugging
      console.log("Running financial calculation with input:", JSON.stringify(updatedInputData).substring(0, 200) + "...");
      
      // Debug milestone data - especially workStatus values
      if (updatedInputData.milestones && updatedInputData.milestones.length > 0) {
        // Log milestone workStatus details to server console
        console.log("MILESTONE DEBUG (in routes.ts):", 
          updatedInputData.milestones.map((milestone: any) => ({
            type: milestone.type,
            year: milestone.year,
            workStatus: milestone.workStatus,
            workStatusType: typeof milestone.workStatus
          }))
        );
        
        // Console log is sufficient for debugging, skip file logging
        // We removed file logging because of the require error in ESM context
      }
      
      // Direct Python execution without temporary files
      const pythonProcess = spawn("python3", [pythonScriptPath], {
        env: { ...process.env },
      });
      
      let resultData = "";
      let errorData = "";
      
      // Send updated input data to Python process stdin
      pythonProcess.stdin.write(JSON.stringify(updatedInputData));
      pythonProcess.stdin.end();
      
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.error("Python stderr:", data.toString());
      });
      
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script exited with code", code);
          console.error("Error:", errorData);
          return res.status(500).json({ message: "Financial calculation failed", error: errorData });
        }
        
        try {
          // Skip logging full output to avoid console clutter
          const parsedData = JSON.parse(resultData);
          // Add location factor used to the response for transparency
          if (updatedInputData.costOfLivingFactor) {
            parsedData.locationFactor = updatedInputData.costOfLivingFactor;
          }
          return res.json(parsedData);
        } catch (error) {
          console.error("Failed to parse Python output:", error);
          return res.status(500).json({ message: "Failed to parse calculation results", error: errorData });
        }
      });
      
    } catch (error) {
      console.error("Exception in financial calculation:", error);
      return res.status(500).json({ message: "Financial calculation failed", error: String(error) });
    }
  });
  
  // Calculate future savings for milestone planning
  app.post("/api/calculate/future-savings", async (req: Request, res: Response) => {
    try {
      const { userId, targetYear } = req.body;
      
      if (!userId || !targetYear) {
        return res.status(400).json({ message: "Missing required parameters: userId and targetYear" });
      }
      
      // Get user's financial profile
      const profile = await activeStorage.getFinancialProfileByUserId(userId);
      
      // If no profile exists, use default values instead of returning an error
      // This makes the API more resilient by providing reasonable fallback values
      const currentSavings = profile?.savingsAmount || 0;
      const currentIncome = profile?.householdIncome || 50000; // Default reasonable income
      
      // Get user data to determine age
      const user = await activeStorage.getUser(userId);
      if (!user || !user.birthYear) {
        return res.status(404).json({ message: "User not found or missing birth year" });
      }
      
      // Calculate current age and years to project
      const currentYear = new Date().getFullYear();
      const startAge = currentYear - user.birthYear;
      const yearsToProject = targetYear - currentYear;
      
      if (yearsToProject < 0) {
        return res.status(400).json({ message: "Target year must be in the future" });
      }
      
      // Prepare input data for the financial calculator
      const inputData: any = {
        startAge,
        yearsToProject: yearsToProject + 1, // Add 1 to include the target year
        pathType: "baseline",
        assets: [
          {
            type: "investment",
            name: "Savings",
            initialValue: currentSavings,
            growthRate: 0.03 // Default growth rate of 3%
          }
        ],
        liabilities: [],
        incomes: [
          {
            type: "salary",
            name: "Primary Income",
            amount: currentIncome,
            growthRate: 0.03 // Default growth rate of 3%
          }
        ],
        expenses: {
          housing: 1500 * 12, // Estimated monthly * 12
          food: 500 * 12,
          transportation: 400 * 12,
          healthcare: 300 * 12,
          other: 800 * 12
        }
      };
      
      // Get career calculations to update income
      const careerCalcs = await activeStorage.getCareerCalculationsByUserId(userId);
      if (careerCalcs && careerCalcs.length > 0) {
        // Use the first included career calculation's projected salary
        const includedCareer = careerCalcs.find(calc => calc.includedInProjection);
        if (includedCareer && includedCareer.career) {
          inputData.incomes[0].amount = includedCareer.projectedSalary || inputData.incomes[0].amount;
        }
      }
      
      // Use path.resolve and the current directory for ESM compatibility
      const pythonScriptPath = path.resolve("server/python/calculator.py");
      
      // Check if the Python script exists
      if (!fs.existsSync(pythonScriptPath)) {
        return res.status(500).json({ message: "Financial calculator script not found", path: pythonScriptPath });
      }
      
      // Fetch all careers data to pass to the Python calculator for post-graduation income calculation
      try {
        const careersData = await activeStorage.getCareers();
        if (careersData && careersData.length > 0) {
          // Optimize by only sending essential career fields to reduce payload size
          inputData.careersData = careersData.map((career: any) => ({
            id: career.id,
            title: career.title,
            median_salary: career.salary || 0,  // Use salary as median_salary
            entry_salary: career.salaryPct25 || 0, // Use salaryPct25 as entry_salary
            experienced_salary: career.salaryPct75 || 0 // Use salaryPct75 as experienced_salary
          }));
          console.log(`Added ${careersData.length} careers to future savings calculation input (optimized)`);
        }
      } catch (careersError) {
        console.error("Error fetching careers data for future savings:", careersError);
        // Continue without careers data if there's an error
      }
      
      // Log the inputs for debugging
      console.log("Calculating future savings with input:", JSON.stringify(inputData).substring(0, 200) + "...");
      
      // Direct Python execution without temporary files
      const pythonProcess = spawn("python3", [pythonScriptPath], {
        env: { ...process.env },
      });
      
      let resultData = "";
      let errorData = "";
      
      // Send input data to Python process stdin
      pythonProcess.stdin.write(JSON.stringify(inputData));
      pythonProcess.stdin.end();
      
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
        console.error("Python stderr:", data.toString());
      });
      
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script exited with code", code);
          console.error("Error:", errorData);
          return res.status(500).json({ message: "Future savings calculation failed", error: errorData });
        }
        
        try {
          // Parse the full results
          const parsedData = JSON.parse(resultData);
          
          // Extract the savings amount for the target year
          const targetYearIndex = yearsToProject;
          const futureSavings = parsedData.netWorth ? parsedData.netWorth[targetYearIndex] : 0;
          
          // Return just the future savings amount and full projection data
          return res.json({ 
            currentSavings: currentSavings,
            futureSavings,
            targetYear,
            yearsAway: yearsToProject,
            fullProjection: parsedData // Include the full projection data in case the client needs it
          });
        } catch (error) {
          console.error("Failed to parse Python output:", error);
          return res.status(500).json({ message: "Failed to parse calculation results", error: errorData });
        }
      });
      
    } catch (error) {
      console.error("Exception in future savings calculation:", error);
      return res.status(500).json({ message: "Future savings calculation failed", error: String(error) });
    }
  });

  // College calculations routes
  app.post("/api/college-calculations", async (req: Request, res: Response) => {
    try {
      // Log the exact data received to identify the null field
      console.log("College calculation request body:", JSON.stringify(req.body));
      
      // Sanitize input data - ensure all required string fields have default values
      // AND convert decimal values to integers
      const sanitizedData = {
        ...req.body,
        // Fix string fields
        zip: req.body.zip || '00000',
        notes: req.body.notes || '',
        // Fix numeric fields
        familyContribution: req.body.familyContribution ? Math.round(Number(req.body.familyContribution)) : 0,
        workStudy: req.body.workStudy ? Math.round(Number(req.body.workStudy)) : 0,
        // Round all decimal values to integers for database compatibility
        netPrice: Math.round(Number(req.body.netPrice)),
        studentLoanAmount: Math.round(Number(req.body.studentLoanAmount)),
        financialAid: Math.round(Number(req.body.financialAid)),
        totalCost: Math.round(Number(req.body.totalCost)),
        tuitionUsed: Math.round(Number(req.body.tuitionUsed)),
        roomAndBoardUsed: Math.round(Number(req.body.roomAndBoardUsed))
      };
      
      // If this calculation is being included in projections, ensure any existing included calculations are deselected
      if (sanitizedData.includedInProjection === true && sanitizedData.userId) {
        console.log(`New college calculation being included in projections for user ${sanitizedData.userId}`);
        
        // First, get all college calculations to find the currently selected one
        const existingCalculations = await activeStorage.getCollegeCalculationsByUserId(sanitizedData.userId);
        
        // Find the currently selected calculation
        const currentlySelected = existingCalculations.find(calc => calc.includedInProjection === true);
        
        // If there's a currently selected calculation, deselect it first
        if (currentlySelected) {
          console.log(`Deselecting previously included college calculation with ID ${currentlySelected.id}`);
          await activeStorage.updateCollegeCalculation(currentlySelected.id, {
            includedInProjection: false
          });
        }
      }
      
      // Log the sanitized data
      console.log("Sanitized college calculation data:", JSON.stringify(sanitizedData));
      
      // Create the calculation with sanitized data
      const calculation = await activeStorage.createCollegeCalculation(sanitizedData);
      res.status(201).json(calculation);
    } catch (error) {
      // Log detailed error
      console.error("Error creating college calculation:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message);
      }
      res.status(500).json({ message: "Failed to create college calculation", error: String(error) });
    }
  });

  app.get("/api/college-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      const calculation = await activeStorage.getCollegeCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: `College calculation with ID ${id} not found` });
      }
      
      res.json(calculation);
    } catch (error) {
      console.error("Error getting college calculation:", error);
      res.status(500).json({ message: "Failed to get college calculation", error: String(error) });
    }
  });

  app.get("/api/college-calculations/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const calculations = await activeStorage.getCollegeCalculationsByUserId(userId);
      res.json(calculations);
    } catch (error) {
      console.error("Error getting college calculations by user:", error);
      res.status(500).json({ message: "Failed to get college calculations", error: String(error) });
    }
  });

  app.get("/api/college-calculations/user/:userId/college/:collegeId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const collegeId = parseInt(req.params.collegeId);
      
      if (isNaN(userId) || isNaN(collegeId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const calculations = await activeStorage.getCollegeCalculationsByUserAndCollege(userId, collegeId);
      res.json(calculations);
    } catch (error) {
      console.error("Error getting college calculations by user and college:", error);
      res.status(500).json({ message: "Failed to get college calculations", error: String(error) });
    }
  });

  app.put("/api/college-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      // Check if calculation exists
      const calculation = await activeStorage.getCollegeCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: `College calculation with ID ${id} not found` });
      }
      
      const updatedCalculation = await activeStorage.updateCollegeCalculation(id, req.body);
      res.json(updatedCalculation);
    } catch (error) {
      console.error("Error updating college calculation:", error);
      res.status(500).json({ message: "Failed to update college calculation", error: String(error) });
    }
  });

  app.delete("/api/college-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      // Check if calculation exists
      const calculation = await activeStorage.getCollegeCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: `College calculation with ID ${id} not found` });
      }
      
      await activeStorage.deleteCollegeCalculation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting college calculation:", error);
      res.status(500).json({ message: "Failed to delete college calculation", error: String(error) });
    }
  });
  
  app.post("/api/college-calculations/:id/toggle-projection", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.body.userId);
      
      if (isNaN(id) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const calculation = await activeStorage.toggleProjectionInclusion(id, userId);
      if (!calculation) {
        return res.status(404).json({ message: `College calculation with ID ${id} not found or does not belong to the user` });
      }
      
      res.json(calculation);
    } catch (error) {
      console.error("Error toggling projection inclusion:", error);
      res.status(500).json({ message: "Failed to toggle projection inclusion", error: String(error) });
    }
  });
  
  // New endpoint specifically for excluding college calculations from projections
  app.post("/api/college-calculations/:id/exclude-from-projection", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.body.userId);
      
      if (isNaN(id) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get the calculation first to validate ownership
      const calculation = await activeStorage.getCollegeCalculation(id);
      if (!calculation || calculation.userId !== userId) {
        return res.status(404).json({ message: `College calculation with ID ${id} not found or does not belong to the user` });
      }
      
      // Only update if it's currently included
      if (calculation.includedInProjection) {
        const updated = await activeStorage.updateCollegeCalculation(id, { includedInProjection: false });
        console.log(`Successfully excluded college calculation ${id} from projection for user ${userId}`);
        return res.json(updated);
      }
      
      // Already excluded, just return the current state
      return res.json(calculation);
    } catch (error) {
      console.error("Error excluding college calculation from projection:", error);
      res.status(500).json({ message: "Failed to exclude college calculation from projection", error: String(error) });
    }
  });
  
  // Career calculations routes
  app.post("/api/career-calculations", validateRequest({ body: insertCareerCalculationSchema }), async (req: Request, res: Response) => {
    try {
      // If this calculation is being included in projections, ensure any existing included calculations are deselected
      if (req.body.includedInProjection === true && req.body.userId) {
        console.log(`New career calculation being included in projections for user ${req.body.userId}`);
        
        // First, get all career calculations to find the currently selected one
        const response = await activeStorage.getCareerCalculationsByUserId(req.body.userId);
        
        // Find the currently selected calculation
        const currentlySelected = response.find(calc => calc.includedInProjection);
        
        // If there's a currently selected calculation, deselect it first
        if (currentlySelected) {
          console.log(`Deselecting previously included career calculation with ID ${currentlySelected.id}`);
          await activeStorage.updateCareerCalculation(currentlySelected.id, {
            includedInProjection: false
          });
        }
      }
      
      const calculation = await activeStorage.createCareerCalculation(req.body);
      res.status(201).json(calculation);
    } catch (error) {
      console.error("Error creating career calculation:", error);
      res.status(500).json({ message: "Failed to create career calculation", error: String(error) });
    }
  });
  
  app.get("/api/career-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      const calculation = await activeStorage.getCareerCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: "Career calculation not found" });
      }
      
      res.json(calculation);
    } catch (error) {
      console.error("Error getting career calculation:", error);
      res.status(500).json({ message: "Failed to get career calculation", error: String(error) });
    }
  });
  
  app.get("/api/career-calculations/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const calculations = await activeStorage.getCareerCalculationsByUserId(userId);
      res.json(calculations);
    } catch (error) {
      console.error("Error getting career calculations by user:", error);
      res.status(500).json({ message: "Failed to get career calculations", error: String(error) });
    }
  });
  
  app.get("/api/career-calculations/user/:userId/career/:careerId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const careerId = parseInt(req.params.careerId);
      if (isNaN(userId) || isNaN(careerId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const calculations = await activeStorage.getCareerCalculationsByUserAndCareer(userId, careerId);
      res.json(calculations);
    } catch (error) {
      console.error("Error getting career calculations by user and career:", error);
      res.status(500).json({ message: "Failed to get career calculations", error: String(error) });
    }
  });
  
  app.put("/api/career-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      const calculation = await activeStorage.getCareerCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: "Career calculation not found" });
      }
      
      const updatedCalculation = await activeStorage.updateCareerCalculation(id, req.body);
      res.json(updatedCalculation);
    } catch (error) {
      console.error("Error updating career calculation:", error);
      res.status(500).json({ message: "Failed to update career calculation", error: String(error) });
    }
  });
  
  app.delete("/api/career-calculations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid calculation ID format" });
      }
      
      const calculation = await activeStorage.getCareerCalculation(id);
      if (!calculation) {
        return res.status(404).json({ message: "Career calculation not found" });
      }
      
      await activeStorage.deleteCareerCalculation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting career calculation:", error);
      res.status(500).json({ message: "Failed to delete career calculation", error: String(error) });
    }
  });
  
  app.post("/api/career-calculations/:id/toggle-projection", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = parseInt(req.body.userId);
      
      if (isNaN(id) || isNaN(userId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const calculation = await activeStorage.toggleCareerProjectionInclusion(id, userId);
      if (!calculation) {
        return res.status(404).json({ message: `Career calculation with ID ${id} not found or does not belong to the user` });
      }
      
      res.json(calculation);
    } catch (error) {
      console.error("Error toggling career projection inclusion:", error);
      res.status(500).json({ message: "Failed to toggle career projection inclusion", error: String(error) });
    }
  });

  // Milestones routes
  app.post("/api/milestones", validateRequest({ body: insertMilestoneSchema }), async (req: Request, res: Response) => {
    try {
      console.log("Creating milestone:", req.body);
      const milestone = await activeStorage.createMilestone(req.body);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone", error: String(error) });
    }
  });

  app.get("/api/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID format" });
      }
      
      const milestone = await activeStorage.getMilestone(id);
      if (!milestone) {
        return res.status(404).json({ message: `Milestone with ID ${id} not found` });
      }
      
      res.json(milestone);
    } catch (error) {
      console.error("Error getting milestone:", error);
      res.status(500).json({ message: "Failed to get milestone", error: String(error) });
    }
  });

  app.get("/api/milestones/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const milestones = await activeStorage.getMilestonesByUserId(userId);
      res.json(milestones);
    } catch (error) {
      console.error("Error getting milestones for user:", error);
      res.status(500).json({ message: "Failed to get milestones", error: String(error) });
    }
  });

  app.patch("/api/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID format" });
      }
      
      const milestone = await activeStorage.getMilestone(id);
      if (!milestone) {
        return res.status(404).json({ message: `Milestone with ID ${id} not found` });
      }
      
      const updatedMilestone = await activeStorage.updateMilestone(id, req.body);
      if (!updatedMilestone) {
        return res.status(404).json({ message: "Failed to update milestone" });
      }
      
      res.json(updatedMilestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone", error: String(error) });
    }
  });

  app.delete("/api/milestones/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid milestone ID format" });
      }
      
      const milestone = await activeStorage.getMilestone(id);
      if (!milestone) {
        return res.status(404).json({ message: `Milestone with ID ${id} not found` });
      }
      
      await activeStorage.deleteMilestone(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone", error: String(error) });
    }
  });
  
  // Delete all milestones for a user (for clean slate auto-generation)
  app.delete("/api/milestones/user/:userId/all", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Get all milestones for the user
      const milestones = await activeStorage.getMilestonesByUserId(userId);
      
      // Delete each milestone
      for (const milestone of milestones) {
        await activeStorage.deleteMilestone(milestone.id);
      }
      
      res.status(200).json({ 
        message: `Successfully deleted all ${milestones.length} milestones for user ${userId}` 
      });
    } catch (error) {
      console.error("Failed to delete all milestones:", error);
      res.status(500).json({ message: "Failed to delete all milestones", error: String(error) });
    }
  });

  // Assumption routes
  app.get("/api/assumptions/:id", async (req: Request, res: Response) => {
    try {
      const assumption = await activeStorage.getAssumption(parseInt(req.params.id));
      if (!assumption) {
        return res.status(404).json({ message: "Assumption not found" });
      }
      res.json(assumption);
    } catch (error) {
      console.error("Error fetching assumption:", error);
      res.status(500).json({ message: "Failed to get assumption", error: String(error) });
    }
  });

  app.get("/api/assumptions/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const assumptions = await activeStorage.getAssumptionsByUserId(userId);
      res.json(assumptions);
    } catch (error) {
      console.error("Error fetching user assumptions:", error);
      res.status(500).json({ message: "Failed to get user assumptions", error: String(error) });
    }
  });

  app.get("/api/assumptions/category/:userId/:category", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const category = req.params.category;
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      const assumptions = await activeStorage.getAssumptionsByCategory(userId, category);
      res.json(assumptions);
    } catch (error) {
      console.error(`Error fetching assumptions by category:`, error);
      res.status(500).json({ message: "Failed to get assumptions by category", error: String(error) });
    }
  });

  app.post("/api/assumptions", validateRequest({ body: insertAssumptionSchema }), async (req: Request, res: Response) => {
    try {
      const assumption = await activeStorage.createAssumption(req.body);
      res.status(201).json(assumption);
    } catch (error) {
      console.error("Error creating assumption:", error);
      res.status(500).json({ message: "Failed to create assumption", error: String(error) });
    }
  });

  app.patch("/api/assumptions/:id", async (req: Request, res: Response) => {
    try {
      const assumptionId = parseInt(req.params.id);
      const assumption = await activeStorage.getAssumption(assumptionId);
      if (!assumption) {
        return res.status(404).json({ message: "Assumption not found" });
      }
      
      const updatedAssumption = await activeStorage.updateAssumption(assumptionId, req.body);
      if (!updatedAssumption) {
        return res.status(404).json({ message: "Failed to update assumption" });
      }
      
      res.json(updatedAssumption);
    } catch (error) {
      console.error("Error updating assumption:", error);
      res.status(500).json({ message: "Failed to update assumption", error: String(error) });
    }
  });

  app.delete("/api/assumptions/:id", async (req: Request, res: Response) => {
    try {
      const assumptionId = parseInt(req.params.id);
      const assumption = await activeStorage.getAssumption(assumptionId);
      if (!assumption) {
        return res.status(404).json({ message: "Assumption not found" });
      }
      
      await activeStorage.deleteAssumption(assumptionId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assumption:", error);
      res.status(500).json({ message: "Failed to delete assumption", error: String(error) });
    }
  });

  app.post("/api/assumptions/initialize/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
      
      // Check if user exists
      const user = await activeStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Initialize default assumptions for user
      const assumptions = await activeStorage.initializeDefaultAssumptions(userId);
      res.status(201).json(assumptions);
    } catch (error) {
      console.error("Error initializing default assumptions:", error);
      res.status(500).json({ message: "Failed to initialize default assumptions", error: String(error) });
    }
  });

  return httpServer;
}
