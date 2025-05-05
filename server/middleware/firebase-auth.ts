import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import { getUserByFirebaseUid } from "../auth-integrator"; // Import helper
import type { User } from "../../shared/schema"; // Import the User type

// Export the AuthenticatedUser type for use in routes
export type AuthenticatedUser = Omit<User, "passwordHash">;

// Function to initialize Firebase Admin SDK (moved from auth-integrator)
export function initializeFirebaseAdmin() {
  try {
    // Check if Firebase Admin is already initialized
    if (admin.apps && admin.apps.length > 0) {
      console.log("Firebase Admin SDK already initialized.");
      return admin;
    }

    // Create service account credentials from environment variables
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url:
        process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    };

    // Check if we have the required credentials
    if (
      !serviceAccount.project_id ||
      !serviceAccount.private_key ||
      !serviceAccount.client_email
    ) {
      console.error("Missing required Firebase service account credentials");
      throw new Error(
        "Firebase Admin SDK initialization failed: Missing required credentials"
      );
    }

    // Initialize Firebase Admin with the service account
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    console.log(
      "Firebase Admin SDK initialized successfully with service account credentials"
    );
    return admin;
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
    throw new Error("Firebase Admin SDK initialization failed.");
  }
}

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Auth Middleware: No Bearer token provided.");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    console.log("Auth Middleware: Verifying Firebase ID token...");
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(`Auth Middleware: Token verified for UID: ${decodedToken.uid}`);

    // Attach the decoded token to the request object
    req.firebaseUser = decodedToken;

    // Optionally: Fetch user profile from your database
    try {
      const localUser = await getUserByFirebaseUid(decodedToken.uid);
      if (localUser) {
        console.log(`Auth Middleware: Found local user ID: ${localUser.id}`);
        // Exclude sensitive fields like passwordHash before attaching
        const { passwordHash, ...safeUser } = localUser;
        // Assign the correctly typed user object
        req.user = safeUser;
      } else {
        console.log(
          `Auth Middleware: No local user found for UID: ${decodedToken.uid}. Only firebaseUser will be available.`
        );
        req.user = undefined; // Ensure req.user is explicitly undefined
      }
    } catch (dbError) {
      console.error("Auth Middleware: Error fetching user from DB:", dbError);
      req.user = undefined;
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error: any) {
    console.error("Auth Middleware: Error verifying Firebase ID token:", error);
    // Handle specific Firebase auth errors
    let message = "Unauthorized: Invalid token";
    if (error.code === "auth/id-token-expired") {
      message = "Unauthorized: Token expired";
    }
    return res.status(401).json({ message: message, code: error.code });
  }
};
