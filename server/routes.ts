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
      res.json(colleges);
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
      res.json(college);
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
      const favorite = await activeStorage.addFavoriteCollege(req.body.userId, req.body.collegeId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite college" });
    }
  });

  app.delete("/api/favorites/colleges/:id", async (req: Request, res: Response) => {
    try {
      await activeStorage.removeFavoriteCollege(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite college" });
    }
  });

  app.get("/api/favorites/colleges/:userId", async (req: Request, res: Response) => {
    try {
      const favorites = await activeStorage.getFavoriteCollegesByUserId(parseInt(req.params.userId));
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to get favorite colleges" });
    }
  });

  app.post("/api/favorites/careers", async (req: Request, res: Response) => {
    try {
      const favorite = await activeStorage.addFavoriteCareer(req.body.userId, req.body.careerId);
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite career" });
    }
  });

  app.delete("/api/favorites/careers/:id", async (req: Request, res: Response) => {
    try {
      await activeStorage.removeFavoriteCareer(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite career" });
    }
  });

  app.get("/api/favorites/careers/:userId", async (req: Request, res: Response) => {
    try {
      const favorites = await activeStorage.getFavoriteCareersByUserId(parseInt(req.params.userId));
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to get favorite careers" });
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
