// Script to inspect users table schema and data
import { db } from "./server/db.js";
import { users } from "./shared/schema.js";

async function inspectUsersTable() {
  console.log("Inspecting users table...");

  try {
    console.log("\n--- Users Table Schema ---");
    console.log(JSON.stringify(users, null, 2));

    console.log("\n--- Sample User Records ---");
    const sampleUsers = await db.select().from(users).limit(5);
    console.log(JSON.stringify(sampleUsers, null, 2));

    console.log("\n--- Users Table Column Names ---");
    if (sampleUsers.length > 0) {
      console.log(Object.keys(sampleUsers[0]));
    } else {
      console.log("No user records found");
    }

    console.log("\n--- Total User Count ---");
    const countResult = await db.select().from(users);
    console.log(`Total users: ${countResult.length}`);
  } catch (error) {
    console.error("Error inspecting users table:", error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the inspection
inspectUsersTable();
