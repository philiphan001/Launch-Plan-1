import express from "express";
import admin from "firebase-admin";
import { db } from "./db-config";
import { users } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { initializeFirebaseAdmin } from "./middleware/firebase-auth";

/**
 * Initializes Firebase Admin SDK and checks database connection.
 */
export async function setupAuthAndDatabase(): Promise<void> {
  // Initialize Firebase Admin SDK
  try {
    initializeFirebaseAdmin();
    console.log("✅ Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    throw new Error(
      "Firebase Admin SDK initialization failed. Check credentials."
    );
  }

  // Test database connection
  try {
    const result = await db.execute(sql`SELECT 1 as connected`);
    if (result[0]?.connected === 1) {
      console.log("✅ Successfully connected to AWS RDS database!");
    } else {
      console.error("❌ Database connection test failed - unexpected result");
      throw new Error("Database connection test failed.");
    }
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    throw new Error(
      "Database connection failed. Please check your AWS RDS configuration."
    );
  }

  console.log("Firebase Admin SDK and database connection check complete");
}

// Helper function to find a user by Firebase UID
export async function getUserByFirebaseUid(firebaseUid: string) {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("Error finding user by Firebase UID:", error);
    return null;
  }
}
