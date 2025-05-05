import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuthAndDatabase } from "./auth-integrator";
import cors from "cors";

const app = express();

// Enable CORS with credentials for Firebase Auth
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || "https://launchplan.app"
        : "http://localhost:5173",
    credentials: true,
  })
);

// Increase JSON body size limit to 50MB to handle large career datasets
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Setup Auth (Firebase) and Database connection
(async () => {
  try {
    await setupAuthAndDatabase();
    console.log("Firebase Admin SDK and AWS RDS connection setup complete");
  } catch (error) {
    console.error("Failed to setup Firebase Admin SDK and database:", error);
    process.exit(1);
  }

  // Add API request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Add error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Application error:", err);
    res.status(500).json({ error: err.message });
  });

  // Register all API routes
  await registerRoutes(app);

  // Improved comprehensive error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server error:", err);

    // Extract status code and message
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Enhanced error response with more details in development
    // but keep minimal for production to avoid exposing implementation details
    const errorResponse: Record<string, any> = {
      message,
      status,
      error: true,
    };

    // Add stack trace in development environment
    if (process.env.NODE_ENV === "development") {
      errorResponse.stack = err.stack;

      // Add additional error details if available
      if (err.code) errorResponse.code = err.code;
      if (err.type) errorResponse.type = err.type;
      if (err.path) errorResponse.path = err.path;
      if (err.details) errorResponse.details = err.details;
    }

    // Send error response
    res.status(status).json(errorResponse);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    const server = app.listen(0); // Create a dummy server or adjust setupVite
    await setupVite(app, server);
    server.close(); // Close dummy server if used
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || "3001", 10);
  const host = "0.0.0.0";

  // Start the actual server listening
  const mainServer = app.listen(PORT, host, () => {
    console.log("----------------------------------------");
    console.log("Server is running at:");
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${host}:${PORT}`);
    console.log("----------------------------------------");
  });

  // Add error handling for the server
  mainServer.on("error", (error: any) => {
    console.error("Server error:", error);
    if (error.syscall !== "listen") {
      throw error;
    }

    switch (error.code) {
      case "EACCES":
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
})();
