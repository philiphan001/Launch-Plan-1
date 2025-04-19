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
import { eq, sql } from "drizzle-orm";

// Use PostgreSQL storage if available
export const activeStorage = process.env.DATABASE_URL ? pgStorage : storage;

const app = express();
// Increase JSON body size limit to 50MB to handle large career datasets
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

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
  console.error('Application error:', err);
  res.status(500).json({ error: err.message });
});

// Add this right after creating the app instance, before setting up routes
// Create necessary tables on startup
(async () => {
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS pathway_swipe_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        session_id UUID NOT NULL,
        card_id VARCHAR(50) NOT NULL,
        card_title TEXT NOT NULL,
        card_category VARCHAR(50) NOT NULL,
        response BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_user_id 
      ON pathway_swipe_responses(user_id);

      CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_session_id 
      ON pathway_swipe_responses(session_id);
    `));
    console.log('Pathway responses table created or verified successfully');
  } catch (error) {
    console.error('Error setting up pathway responses table:', error);
  }
})();

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
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || '3001', 10);
  const host = '0.0.0.0';
  
  // Add error handling for the server
  server.on('error', (error: any) => {
    console.error('Server error:', error);
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.listen(PORT, host, () => {
    console.log('----------------------------------------');
    console.log(`Server is running at:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Network: http://${host}:${PORT}`);
    console.log('----------------------------------------');
  });
})();

// Development only - create pathway_swipe_responses table
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/init-pathway-responses', async (req, res) => {
    try {
      await db.execute(sql.raw(`
        CREATE TABLE IF NOT EXISTS pathway_swipe_responses (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id),
          session_id UUID NOT NULL,
          card_id VARCHAR(50) NOT NULL,
          card_title TEXT NOT NULL,
          card_category VARCHAR(50) NOT NULL,
          response BOOLEAN NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_user_id 
        ON pathway_swipe_responses(user_id);

        CREATE INDEX IF NOT EXISTS idx_pathway_swipe_responses_session_id 
        ON pathway_swipe_responses(session_id);
      `));
      
      res.json({ success: true, message: 'Pathway responses table created successfully' });
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ success: false, error: String(error) });
    }
  });
}
