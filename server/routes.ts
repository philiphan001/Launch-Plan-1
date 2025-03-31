import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { activeStorage } from "./index";
import { validateRequest } from "../shared/middleware";
import { insertUserSchema, insertFinancialProfileSchema, insertFinancialProjectionSchema, insertCollegeCalculationSchema, insertCareerCalculationSchema } from "../shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { generateCareerInsights, generateCareerTimeline } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // API routes
  // User routes
  app.post("/api/users/register", validateRequest({ body: insertUserSchema }), async (req: Request, res: Response) => {
    try {
      const user = await activeStorage.createUser(req.body);
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
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
                                 (college as any).best_liberal_arts_colleges !== undefined ? Number((college as any).best_liberal_arts_colleges) : null
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
                                (college as any).best_liberal_arts_colleges !== undefined ? Number((college as any).best_liberal_arts_colleges) : null
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
      
      // For development purposes, check if user exists and create a demo user if needed
      const user = await activeStorage.getUser(userId);
      if (!user) {
        console.log(`User with ID ${userId} not found for favorites lookup, creating demo user...`);
        await activeStorage.createUser({
          username: "philiphan",
          password: "password123",
          firstName: "Philip",
          lastName: "Han",
          email: "philip.han@example.com"
        });
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
      
      // Validate required fields
      if (userId === undefined || careerId === undefined) {
        return res.status(400).json({ message: "Missing required fields: userId and careerId are required" });
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
      
      // Check if career exists
      const career = await activeStorage.getCareer(careerId);
      if (!career) {
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
      
      // For development purposes, check if user exists and create a demo user if needed
      const user = await activeStorage.getUser(userId);
      if (!user) {
        console.log(`User with ID ${userId} not found for favorites lookup, creating demo user...`);
        await activeStorage.createUser({
          username: "philiphan",
          password: "password123",
          firstName: "Philip",
          lastName: "Han",
          email: "philip.han@example.com"
        });
      }
      
      const favorites = await activeStorage.getFavoriteCareersByUserId(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error getting favorite careers:", error);
      res.status(500).json({ message: "Failed to get favorite careers", error: String(error) });
    }
  });

  // Financial projections routes
  app.post("/api/financial-projections", validateRequest({ body: insertFinancialProjectionSchema }), async (req: Request, res: Response) => {
    try {
      const projection = await activeStorage.createFinancialProjection(req.body);
      res.status(201).json(projection);
    } catch (error) {
      res.status(500).json({ message: "Failed to create financial projection" });
    }
  });

  app.get("/api/financial-projections/:userId", async (req: Request, res: Response) => {
    try {
      const projections = await activeStorage.getFinancialProjectionsByUserId(parseInt(req.params.userId));
      res.json(projections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get financial projections" });
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

  // Python financial calculator route
  app.post("/api/calculate/financial-projection", async (req: Request, res: Response) => {
    try {
      const inputData = req.body;
      const pythonScriptPath = path.join(__dirname, "python", "calculator.py");
      
      // Check if the Python script exists
      if (!fs.existsSync(pythonScriptPath)) {
        return res.status(500).json({ message: "Financial calculator script not found" });
      }
      
      // Create a temporary file to store the input data
      const inputFile = path.join(__dirname, "temp_input.json");
      fs.writeFileSync(inputFile, JSON.stringify(inputData));
      
      // Spawn the Python process
      const pythonProcess = spawn("python3", [pythonScriptPath, inputFile]);
      
      let resultData = "";
      let errorData = "";
      
      pythonProcess.stdout.on("data", (data) => {
        resultData += data.toString();
      });
      
      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
      });
      
      pythonProcess.on("close", (code) => {
        // Remove the temporary input file
        if (fs.existsSync(inputFile)) {
          fs.unlinkSync(inputFile);
        }
        
        if (code !== 0) {
          console.error("Python script exited with code", code);
          console.error("Error:", errorData);
          return res.status(500).json({ message: "Financial calculation failed", error: errorData });
        }
        
        try {
          const parsedData = JSON.parse(resultData);
          res.json(parsedData);
        } catch (error) {
          console.error("Failed to parse Python output:", error);
          res.status(500).json({ message: "Failed to parse calculation results", error: errorData });
        }
      });
    } catch (error) {
      console.error("Exception in financial calculation:", error);
      res.status(500).json({ message: "Financial calculation failed" });
    }
  });

  // College calculations routes
  app.post("/api/college-calculations", validateRequest({ body: insertCollegeCalculationSchema }), async (req: Request, res: Response) => {
    try {
      const calculation = await activeStorage.createCollegeCalculation(req.body);
      res.status(201).json(calculation);
    } catch (error) {
      console.error("Error creating college calculation:", error);
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
  
  // Career calculations routes
  app.post("/api/career-calculations", validateRequest({ body: insertCareerCalculationSchema }), async (req: Request, res: Response) => {
    try {
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

  return httpServer;
}
