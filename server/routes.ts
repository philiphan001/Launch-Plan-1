import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { activeStorage } from "./index";
import { validateRequest } from "../shared/middleware";
import { insertUserSchema, insertFinancialProfileSchema, insertFinancialProjectionSchema } from "../shared/schema";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import multer from "multer";

// We'll import the function dynamically when needed
// Note: No import statement here

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure multer for CSV uploads
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dataDir = path.join(process.cwd(), 'server', 'data');
      // Ensure the directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      cb(null, dataDir);
    },
    filename: function (req, file, cb) {
      // Extract file type from originalname
      const type = file.originalname.includes('college') ? 'college_data.csv' :
                  file.originalname.includes('career') || file.originalname.includes('occupation') ? 'occupation_data.csv' :
                  file.originalname.includes('coli') ? 'coli_data.csv' : file.originalname;
      
      cb(null, type);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
      // Accept only CSV files
      if (file.mimetype.includes('csv') || file.mimetype.includes('text/plain')) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only CSV files are allowed'));
      }
    }
  });

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

  // CSV Upload routes
  app.post("/api/upload/csv", upload.array('csvFiles', 3), async (req: Request, res: Response) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      
      console.log("Files uploaded:", (req.files as Express.Multer.File[]).map(f => f.filename));
      
      // Run direct database import from uploaded files
      // This replaces the call to the external importCsvData function
      try {
        const dataDir = path.join(process.cwd(), 'server', 'data');
        
        // Process colleges
        try {
          const collegeFilePath = path.join(dataDir, 'college_data.csv');
          if (fs.existsSync(collegeFilePath)) {
            console.log('Processing college data from:', collegeFilePath);
            const collegeData = fs.readFileSync(collegeFilePath, 'utf8');
            
            // Use the csv-parse module directly
            const { parse } = await import('csv-parse/sync');
            const collegeRecords = parse(collegeData, { columns: true, skip_empty_lines: true });
            console.log(`Found ${collegeRecords.length} colleges to import`);
            
            // Import to database using activeStorage
            for (const record of collegeRecords) {
              // Parse numeric values
              const tuition = parseInt(record.tuition || '0', 10);
              const roomAndBoard = parseInt(record.room_and_board || '0', 10);
              const acceptanceRate = parseFloat(record.acceptance_rate || '0');
              const rating = parseFloat(record.rating || '0');
              const rank = parseInt(record.rank || '0', 10);
              
              // Parse fees by income (could be JSON string or object)
              let feesByIncome = {};
              try {
                feesByIncome = record.fees_by_income ? 
                  (typeof record.fees_by_income === 'string' ? 
                    JSON.parse(record.fees_by_income) : 
                    record.fees_by_income) : 
                  {};
              } catch (e) {
                console.warn(`Warning: Could not parse fees_by_income for ${record.name}`);
              }
              
              // Insert into database through the storage interface
              await activeStorage.createCollege({
                name: record.name,
                location: record.location,
                state: record.state,
                type: record.type,
                tuition: tuition,
                roomAndBoard: roomAndBoard,
                acceptanceRate: acceptanceRate,
                rating: rating,
                size: record.size,
                rank: rank,
                feesByIncome: feesByIncome
              });
            }
            console.log('College data imported successfully!');
          }
        } catch (err) {
          console.error('Error processing college data:', err);
        }
        
        // Process careers
        try {
          const careerFilePath = path.join(dataDir, 'occupation_data.csv');
          if (fs.existsSync(careerFilePath)) {
            console.log('Processing career data from:', careerFilePath);
            const careerData = fs.readFileSync(careerFilePath, 'utf8');
            
            // Use the csv-parse module directly
            const { parse } = await import('csv-parse/sync');
            const careerRecords = parse(careerData, { columns: true, skip_empty_lines: true });
            console.log(`Found ${careerRecords.length} careers to import`);
            
            // Import to database using activeStorage
            for (const record of careerRecords) {
              // Parse numeric values
              const salary = parseInt(record.salary || '0', 10);
              
              // Insert into database through the storage interface
              await activeStorage.createCareer({
                title: record.title,
                description: record.description,
                salary: salary,
                growthRate: record.growth_rate,
                education: record.education,
                category: record.category
              });
            }
            console.log('Career data imported successfully!');
          }
        } catch (err) {
          console.error('Error processing career data:', err);
        }
        
        console.log('CSV import completed successfully!');
        
      } catch (importError) {
        console.error('Error importing CSV data:', importError);
        return res.status(500).json({ 
          message: "Error processing uploaded files", 
          error: importError instanceof Error ? importError.message : String(importError) 
        });
      }
      
      res.status(200).json({ 
        message: "Files uploaded and processed successfully", 
        files: (req.files as Express.Multer.File[]).map(f => f.filename)
      });
    } catch (error) {
      console.error("Error uploading CSV files:", error);
      res.status(500).json({ 
        message: "Failed to upload and process CSV files", 
        error: error instanceof Error ? error.message : String(error) 
      });
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
