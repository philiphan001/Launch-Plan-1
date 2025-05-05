// Script to check the users table structure
import { db } from "./server/db.ts";
import { users } from "./shared/schema.js";

async function checkUsersTable() {
  try {
    console.log("Connecting to database...");

    // List all columns in the users table
    console.log("\nUsers table structure:");
    console.log(users);

    // Query for sample data
    console.log("\nFetching sample users...");
    const result = await db.select().from(users).limit(5);

    console.log("\nFound", result.length, "users");
    if (result.length > 0) {
      console.log("\nUser columns:", Object.keys(result[0]));

      // Check if firebaseUid column exists
      const hasFirebaseUid = result.some((user) => "firebaseUid" in user);
      console.log("\nfirebaseUid column exists:", hasFirebaseUid);

      // Display sanitized sample data
      console.log("\nSample user data (hiding sensitive info):");
      console.log(
        result.map((user) => ({
          id: user.id,
          username: user.username,
          hasEmail: !!user.email,
          hasFirebaseUid: !!user.firebaseUid,
          createdAt: user.createdAt,
        }))
      );
    }
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    process.exit(0);
  }
}

checkUsersTable();
