import express from "express";
import admin from "firebase-admin"; // Changed from import * as admin
import { db } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../shared/schema";
import {
  firebaseAuth,
  initializeFirebaseAdmin,
} from "../middleware/firebase-auth";
import { generateToken, verifyToken, jwtAuth } from "../utils/jwt";

// Initialize Firebase Admin and get the instance
const firebaseAdmin = initializeFirebaseAdmin();

const router = express.Router();

// Route to authenticate and create a session
router.post("/session", async (req, res) => {
  try {
    console.log("📌 Session creation request received");
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("📌 No Bearer token provided in Authorization header");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];
    console.log("📌 Token received, attempting verification...");

    // First attempt to verify as a Firebase token
    try {
      // Verify the Firebase token
      console.log("📌 Verifying Firebase ID token...");
      // Use firebaseAdmin instance instead of the imported admin
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

      if (!decodedToken) {
        console.error("📌 Firebase token verification returned null");
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
      }

      console.log(`📌 Firebase token verified for UID: ${decodedToken.uid}`);

      // Find or create user in the database
      const userInfo = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        provider: decodedToken.firebase.sign_in_provider,
      };

      console.log(`📌 Looking for user with Firebase UID: ${userInfo.uid}`);
      console.log(
        "📌 DEBUG: Database connection details:",
        JSON.stringify({
          isConnected: !!db,
          usersTableExists: !!users,
          usersFirebaseUidField: !!users.firebaseUid,
        })
      );

      try {
        // Check if user exists
        console.log("📌 DEBUG: About to run database query");
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.firebaseUid, decodedToken.uid))
          .limit(1);

        console.log(
          `📌 DEBUG: Query executed, found ${existingUsers?.length || 0} users`
        );

        let user;

        if (existingUsers.length === 0) {
          // Create new user
          console.log(
            `📌 No existing user found. Creating new user for email: ${userInfo.email}`
          );
          const firstName = userInfo.displayName?.split(" ")[0] || "";
          const lastName =
            userInfo.displayName?.split(" ").slice(1).join(" ") || "";

          const [createdUser] = await db
            .insert(users)
            .values({
              firebaseUid: userInfo.uid,
              username:
                userInfo.email || `user_${userInfo.uid.substring(0, 8)}`,
              email: userInfo.email || "",
              firstName,
              lastName,
              passwordHash: "FIREBASE_AUTH_USER", // Add a placeholder for Firebase-authenticated users
              createdAt: new Date(),
              lastLoginAt: new Date(),
            })
            .returning();

          user = createdUser;
          console.log(`📌 New user created with ID: ${user.id}`);
        } else {
          // Update existing user's last login time
          user = existingUsers[0];
          console.log(`📌 Existing user found with ID: ${user.id}`);

          await db
            .update(users)
            .set({
              lastLoginAt: new Date(),
            })
            .where(eq(users.id, user.id));

          console.log(`📌 Updated user last login time`);
        }

        // Set the user in session
        if (req.session) {
          req.session.userId = user.id;
          req.session.firebaseUid = user.firebaseUid;
          console.log(`📌 User session created for user ID: ${user.id}`);
        } else {
          console.warn(
            "📌 Warning: req.session is undefined, cannot store session data"
          );
        }

        // Ensure we don't include sensitive data
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          firebaseUid: user.firebaseUid,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        };

        // Generate a JWT token as well
        const jwtToken = generateToken({
          userId: user.id,
          username: user.username,
          email: user.email,
          firebaseUid: user.firebaseUid,
        });

        console.log(`📌 Session created successfully. Returning user data.`);

        return res.status(200).json({
          success: true,
          user: safeUser,
          token: jwtToken,
        });
      } catch (dbError) {
        console.error("📌 Error querying the database:", dbError);
        return res.status(500).json({
          error: "Database error",
          message: dbError instanceof Error ? dbError.message : "Unknown error",
        });
      }
    } catch (firebaseError) {
      // If Firebase verification fails, try JWT verification instead
      console.error("📌 Firebase token verification failed:", firebaseError);
      console.log("📌 Attempting JWT verification as fallback...");

      try {
        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
          console.error("📌 JWT verification also failed");
          return res.status(401).json({
            error: "Authentication failed",
            message: "Invalid token - not recognized by Firebase or JWT",
          });
        }

        // Get user from database
        console.log(`📌 JWT verified. Looking up user ID: ${decoded.userId}`);
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (existingUsers.length === 0) {
          console.error(
            `📌 User with ID ${decoded.userId} not found in database`
          );
          return res.status(401).json({
            error: "Authentication failed",
            message: "User not found",
          });
        }

        const user = existingUsers[0];
        console.log(`📌 User found: ${user.username}`);

        // Update last login time
        await db
          .update(users)
          .set({
            lastLoginAt: new Date(),
          })
          .where(eq(users.id, user.id));

        // Set the user in session
        if (req.session) {
          req.session.userId = user.id;
          if (user.firebaseUid) {
            req.session.firebaseUid = user.firebaseUid;
          }
          console.log(`📌 Session created for user ID: ${user.id}`);
        } else {
          console.warn(
            "📌 Warning: req.session is undefined, cannot store session data"
          );
        }

        // Ensure we don't include sensitive data
        const safeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          firebaseUid: user.firebaseUid,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        };

        // Generate a fresh JWT token
        const jwtToken = generateToken({
          userId: user.id,
          username: user.username,
          email: user.email,
          firebaseUid: user.firebaseUid,
        });

        console.log(`📌 Session created successfully via JWT fallback`);

        return res.status(200).json({
          success: true,
          user: safeUser,
          token: jwtToken,
        });
      } catch (jwtError) {
        console.error("📌 JWT verification also failed:", jwtError);
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid token - not recognized by Firebase or JWT",
          details:
            jwtError instanceof Error ? jwtError.message : "Unknown error",
        });
      }
    }
  } catch (error) {
    console.error("📌 Session creation error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// POST route for traditional username/password login with JWT
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Missing credentials",
        message: "Username and password are required",
      });
    }

    // Find user by username
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsers.length === 0) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid username or password",
      });
    }

    const user = existingUsers[0];

    // Check password (assuming you have bcrypt or similar for password checking)
    const isValidPassword = await verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Authentication failed",
        message: "Invalid username or password",
      });
    }

    // Update last login time
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Set the user in session
    if (req.session) {
      req.session.userId = user.id;
      if (user.firebaseUid) {
        req.session.firebaseUid = user.firebaseUid;
      }
    }

    // Ensure we don't include sensitive data
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      firebaseUid: user.firebaseUid,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    // Generate a JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      firebaseUid: user.firebaseUid,
    });

    return res.status(200).json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get current authenticated user
router.get("/me", (req, res) => {
  // Try session-based authentication first
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return res.status(200).json(req.user);
  }

  // If session auth fails, try JWT from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const token = authHeader.split("Bearer ")[1];
  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Return user info from token
  return res.status(200).json({
    id: decoded.userId,
    username: decoded.username,
    email: decoded.email,
    firebaseUid: decoded.firebaseUid,
  });
});

// Logout
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  } else {
    return res.status(200).json({ message: "No active session" });
  }
});

// Get user profile (protected route example)
router.get("/profile", firebaseAuth, (req, res) => {
  return res.status(200).json({
    user: req.user,
    firebaseUser: req.firebaseUser,
  });
});

// Helper function to verify password
async function verifyPassword(user: any, password: string): Promise<boolean> {
  try {
    // If using bcrypt
    if (user.passwordHash) {
      const bcrypt = await import("bcrypt");
      return await bcrypt.compare(password, user.passwordHash);
    }

    // Legacy: Direct comparison (not recommended)
    return user.password === password;
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

export default router;
