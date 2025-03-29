import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { activeStorage } from "./index";
import { validateRequest } from "../shared/middleware";
import { insertUserSchema, insertFinancialProfileSchema, insertFinancialProjectionSchema } from "../shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

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

  // Financial profile routes
  app.post("/api/financial-profiles", validateRequest({ body: insertFinancialProfileSchema }), async (req: Request, res: Response) => {
    try {
      const profile = await activeStorage.createFinancialProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to create financial profile" });
    }
  });

  app.get("/api/financial-profiles/:userId", async (req: Request, res: Response) => {
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

  // College routes
  app.get("/api/colleges", async (req: Request, res: Response) => {
    try {
      console.log("Attempting to fetch colleges from database");
      const colleges = await activeStorage.getColleges();
      console.log("Colleges fetched successfully:", colleges.length);
      
      // Transform snake_case properties to camelCase for frontend compatibility
      const transformedColleges = colleges.map(college => {
        // Get raw fields from the database result using any type to bypass TypeScript checks
        const rawCollege = college as any;
        
        // Create transformed college object
        const transformed = {
          ...college,
          roomAndBoard: college.roomAndBoard,
          feesByIncome: college.feesByIncome,
          // Convert the database columns to expected frontend property names
          usNewsTop150: rawCollege.us_news_top_150,
          bestLiberalArtsColleges: rawCollege.best_liberal_arts_colleges
        };
        
        // Debug output for the first few colleges with these flags set
        if (rawCollege.us_news_top_150 === 1) {
          console.log(`Found US News Top 150 college: ${college.name} (ID: ${college.id})`);
        }
        
        if (rawCollege.best_liberal_arts_colleges === 1) {
          console.log(`Found Best Liberal Arts college: ${college.name} (ID: ${college.id})`);
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
      
      // Transform snake_case properties to camelCase for frontend compatibility
      const rawCollege = college as any;
      const transformedCollege = {
        ...college,
        roomAndBoard: college.roomAndBoard,
        feesByIncome: college.feesByIncome,
        // Convert the database columns to expected frontend property names
        usNewsTop150: rawCollege.us_news_top_150,
        bestLiberalArtsColleges: rawCollege.best_liberal_arts_colleges
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
          username: "demouser",
          password: "password123", // This is a demo app, in production you'd use proper auth
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com"
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
          username: "demouser",
          password: "password123",
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com"
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
          username: "demouser",
          password: "password123", // This is a demo app, in production you'd use proper auth
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com"
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
          username: "demouser",
          password: "password123",
          firstName: "Demo",
          lastName: "User",
          email: "demo@example.com"
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

  return httpServer;
}
