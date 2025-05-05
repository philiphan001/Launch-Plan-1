#!/usr/bin/env node

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";
import admin from "firebase-admin";

// Setup paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// ANSI color codes for better readability
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

console.log(
  `${colors.bold}${colors.cyan}=== Integration Test: Firebase & AWS RDS ===\n${colors.reset}`
);

// Test AWS RDS Connection
async function testRDSConnection() {
  console.log(`${colors.blue}Testing AWS RDS Connection...${colors.reset}`);

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // AWS RDS SSL Configuration
    const sslConfig = {
      rejectUnauthorized: true,
      ca: fs
        .readFileSync(path.join(process.cwd(), "rds-ca-2019-root.pem"))
        .toString(),
      servername: new URL(process.env.DATABASE_URL).hostname,
    };

    // Create PostgreSQL client
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: sslConfig,
      connect_timeout: 10,
      idle_timeout: 5,
      max: 1,
    });

    // Test the connection
    const result = await sql`SELECT version()`;
    console.log(
      `${colors.green}✓ AWS RDS Connection successful!${colors.reset}`
    );
    console.log(
      `${colors.green}✓ PostgreSQL version: ${result[0].version}${colors.reset}\n`
    );

    // Close connection
    await sql.end();
    return true;
  } catch (error) {
    console.error(
      `${colors.red}✗ AWS RDS Connection failed: ${error.message}${colors.reset}\n`
    );
    return false;
  }
}

// Test Firebase Authentication
async function testFirebaseAuth() {
  console.log(
    `${colors.blue}Testing Firebase Authentication...${colors.reset}`
  );

  try {
    // Check if we're already initialized
    if (admin.apps.length) {
      console.log(
        `${colors.yellow}Firebase Admin SDK already initialized${colors.reset}`
      );
    } else {
      // Check which authentication method we're using
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Using service account file
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        console.log(
          `${colors.green}✓ Firebase Admin SDK initialized using service account file${colors.reset}`
        );
      } else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        // Using individual credentials
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
        });
        console.log(
          `${colors.green}✓ Firebase Admin SDK initialized using environment variables${colors.reset}`
        );
      } else {
        throw new Error(
          "Firebase credentials not found. Please set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_* environment variables"
        );
      }
    }

    // Check if we can access Firebase Auth
    const listUsersResult = await admin.auth().listUsers(1);
    console.log(
      `${colors.green}✓ Firebase Authentication working!${colors.reset}`
    );
    console.log(
      `${colors.green}✓ User count: ${
        listUsersResult.users.length > 0
          ? listUsersResult.users.length + " (showing first user)"
          : "No users found"
      }${colors.reset}`
    );

    if (listUsersResult.users.length > 0) {
      const user = listUsersResult.users[0];
      console.log(
        `${colors.green}✓ Sample user: ${user.email || user.uid} (${
          user.displayName || "No name"
        })${colors.reset}\n`
      );
    }

    return true;
  } catch (error) {
    console.error(
      `${colors.red}✗ Firebase Authentication failed: ${error.message}${colors.reset}\n`
    );
    return false;
  }
}

// Run tests
async function runTests() {
  const rdsSuccess = await testRDSConnection();
  const firebaseSuccess = await testFirebaseAuth();

  console.log(
    `${colors.bold}${colors.cyan}=== Integration Test Results ===\n${colors.reset}`
  );
  console.log(
    `AWS RDS Connection: ${
      rdsSuccess ? colors.green + "✓ SUCCESS" : colors.red + "✗ FAILED"
    }${colors.reset}`
  );
  console.log(
    `Firebase Authentication: ${
      firebaseSuccess ? colors.green + "✓ SUCCESS" : colors.red + "✗ FAILED"
    }${colors.reset}`
  );

  if (rdsSuccess && firebaseSuccess) {
    console.log(
      `\n${colors.bold}${colors.green}All systems operational! Your application is ready to use both Firebase Authentication and AWS RDS.${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.bold}${colors.red}Some tests failed. Please check the errors above and fix the configuration.${colors.reset}`
    );
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error(
    `\n${colors.red}Error running tests: ${error.message}${colors.reset}`
  );
  process.exit(1);
});
