import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { db } from "../db-config";
import { eq } from "drizzle-orm";
import { users } from "../../shared/schema";

// Define a custom type extending Express Request for Firebase user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      firebaseUser?: admin.auth.DecodedIdToken;
    }
  }
}

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
export const firebaseAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ensure Firebase Admin SDK is initialized
    initializeFirebaseAdmin();

    // Get the token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // If no token in header, check if user is authenticated through session
      if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
      }
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify the token
    let decodedToken;
    try {
      console.log(`Attempting to verify token: ${token.substring(0, 10)}...`);
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("Token verified successfully for UID:", decodedToken.uid);
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError);
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
        details:
          verifyError instanceof Error ? verifyError.message : "Unknown error",
      });
    }

    if (!decodedToken) {
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }

    // Check if the user exists in our database
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decodedToken.uid))
      .limit(1);

    if (userRecord.length === 0) {
      // If user doesn't exist in our DB but is authenticated with Firebase,
      // create a new user record
      try {
        const firebaseUser = await admin.auth().getUser(decodedToken.uid);

        // Insert the new user into the database
        const newUser = await db
          .insert(users)
          .values({
            firebaseUid: decodedToken.uid,
            username: firebaseUser.email || `user_${decodedToken.uid}`,
            email: firebaseUser.email || "",
            emailVerified: firebaseUser.emailVerified,
            firstName: firebaseUser.displayName?.split(" ")[0] || "",
            lastName:
              firebaseUser.displayName?.split(" ").slice(1).join(" ") || "",
            authProvider: firebaseUser.providerData[0]?.providerId || "unknown",
            createdAt: new Date(),
            lastLoginAt: new Date(),
          })
          .returning();

        // Attach both Firebase and DB user info to the request
        req.firebaseUser = decodedToken;
        req.user = newUser[0];
      } catch (error) {
        console.error("Error creating new user:", error);
        return res.status(500).json({ error: "Failed to create user account" });
      }
    } else {
      // Update the last login time
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.firebaseUid, decodedToken.uid));

      // Attach both Firebase and DB user info to the request
      req.firebaseUser = decodedToken;
      req.user = userRecord[0];
    }

    return next();
  } catch (error) {
    console.error("Firebase auth middleware error:", error);
    return res.status(401).json({
      error: "Authentication failed",
      message:
        error instanceof Error
          ? error.message
          : "Unknown error during authentication",
    });
  }
};

/**
 * Helper function to initialize Firebase Admin SDK if not already initialized
 */
export const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized - Using admin.apps.length check
    if (admin.apps && admin.apps.length > 0) {
      console.log("Firebase Admin SDK already initialized");
      firebaseInitialized = true;
      return admin;
    }

    console.log("Initializing Firebase Admin SDK...");

    // Log environment variables (hide sensitive parts)
    console.log("Firebase environment variables present:");
    console.log(`- FIREBASE_TYPE: ${process.env.FIREBASE_TYPE ? "Yes" : "No"}`);
    console.log(
      `- FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? "Yes" : "No"}`
    );
    console.log(
      `- FIREBASE_PRIVATE_KEY_ID: ${process.env.FIREBASE_PRIVATE_KEY_ID ? "Yes" : "No"}`
    );
    console.log(
      `- FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? "Yes (length: " + process.env.FIREBASE_PRIVATE_KEY.length + ")" : "No"}`
    );
    console.log(
      `- FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? "Yes" : "No"}`
    );

    // Fix for the private key format - ensuring proper newlines
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

    // Check if we need to fix the private key format
    if (privateKey.includes("\\n")) {
      console.log(
        "Fixing private key format - replacing \\n with actual newlines"
      );
      privateKey = privateKey.replace(/\\n/g, "\n");
    }

    // Check for duplicate END tags and fix if needed
    if (
      privateKey.indexOf("-----END PRIVATE KEY-----") !==
      privateKey.lastIndexOf("-----END PRIVATE KEY-----")
    ) {
      console.log("Detected duplicate END PRIVATE KEY tags, fixing...");
      privateKey = privateKey.substring(
        0,
        privateKey.indexOf("-----END PRIVATE KEY-----") + 24
      );
    }

    console.log(
      `Private key looks like: ${privateKey.substring(0, 15)}...${privateKey.substring(privateKey.length - 15)}`
    );

    // Create service account object with environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri:
        process.env.FIREBASE_AUTH_URI ||
        "https://accounts.google.com/o/oauth2/auth",
      token_uri:
        process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
        "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
      universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com",
    };

    // Alternative initialization using project ID and credential JSON directly
    try {
      // Initialize Firebase Admin SDK with proper credential
      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount
        ),
      });

      console.log(
        "Firebase Admin SDK initialized successfully with credential.cert()"
      );
      firebaseInitialized = true;
    } catch (certError) {
      console.error("Failed to initialize with credential.cert():", certError);
      console.log("Attempting alternative initialization...");

      // Try using application default credentials as a fallback
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log("Firebase Admin SDK initialized with projectId only");
      firebaseInitialized = true;
    }

    return admin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
};
