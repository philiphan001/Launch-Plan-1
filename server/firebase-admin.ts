// Firebase Admin SDK initialization
import admin from "firebase-admin";
import { initializeFirebaseAdmin } from "./middleware/firebase-auth";

// Initialize Firebase Admin SDK on module import
try {
  initializeFirebaseAdmin();
  console.log("Firebase Admin SDK initialized from firebase-admin module");
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK from module:", error);
}

// Export the admin object for use in other modules
export { admin };
