import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { pgStorage } from "./pg-storage";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

// Use PostgreSQL storage if available
export const activeStorage = process.env.DATABASE_URL ? pgStorage : storage;

const app = express();
// Increase JSON body size limit to 50MB to handle large career datasets
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Configure session
const oneDay = 1000 * 60 * 60 * 24;
if (process.env.DATABASE_URL) {
  // Use PostgreSQL for session storage in production
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneDay
    }
  }));
} else {
  // Use memory store for development
  app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay }
  }));
}

// Configure Passport with secure password comparison
passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    // Find user in database
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = result[0];
    
    if (!user) {
      console.log(`Authentication failed: username '${username}' not found`);
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    
    // Check if we need to use bcrypt or direct comparison
    let isPasswordValid = false;
    
    // First try bcrypt compare if the password looks hashed
    if (user.password.startsWith('$2')) {
      // Password appears to be a bcrypt hash
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.error('bcrypt comparison error:', bcryptError);
        // Fall back to direct comparison if bcrypt fails
        isPasswordValid = user.password === password;
      }
    } else {
      // Direct comparison for plain text passwords
      // This is a fallback and should be upgraded to bcrypt
      isPasswordValid = user.password === password;
      console.log('WARNING: User has plaintext password, should upgrade to bcrypt');
    }
    
    if (!isPasswordValid) {
      console.log(`Authentication failed: incorrect password for '${username}'`);
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    
    console.log(`Authentication successful for user: ${username}`);
    return done(null, user);
  } catch (error) {
    console.error('Authentication error:', error);
    return done(error);
  }
}));

// Serialize user to the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const user = result[0];
    
    if (user) {
      // Don't expose password
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error);
  }
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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

(async () => {
  const server = await registerRoutes(app);

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
      error: true
    };
    
    // Add stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
      
      // Add additional error details if available
      if (err.code) errorResponse.code = err.code;
      if (err.type) errorResponse.type = err.type;
      if (err.path) errorResponse.path = err.path;
      if (err.details) errorResponse.details = err.details;
    }
    
    // Send error response
    res.status(status).json(errorResponse);
    
    // Don't throw the error again as it's already been handled
    // and would crash the server
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
