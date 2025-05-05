#!/usr/bin/env node

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";
import fs from "fs";

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

async function runMigration() {
  console.log(
    `${colors.bold}${colors.cyan}=== Running Firebase Auth Migration ===\n${colors.reset}`
  );

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
    console.log(`${colors.blue}Connecting to database...${colors.reset}`);
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: sslConfig,
      max: 1,
    });

    // Check if the users table exists
    console.log(
      `${colors.blue}Checking if users table exists...${colors.reset}`
    );
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;

    if (tables.length === 0) {
      throw new Error("Users table does not exist. Please create it first.");
    }

    console.log(`${colors.green}✓ Users table exists!${colors.reset}`);

    // Check if Firebase columns already exist
    console.log(
      `${colors.blue}Checking if Firebase columns already exist...${colors.reset}`
    );
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'firebase_uid'
    `;

    if (columns.length > 0) {
      console.log(
        `${colors.yellow}⚠ Firebase columns already exist. Skipping migration.${colors.reset}`
      );
    } else {
      console.log(
        `${colors.blue}Adding Firebase columns to users table...${colors.reset}`
      );

      // Add Firebase columns
      await sql`
        ALTER TABLE users
        ADD COLUMN firebase_uid VARCHAR(255) UNIQUE,
        ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'password',
        ADD COLUMN last_login_at TIMESTAMP;
      `;

      console.log(
        `${colors.green}✓ Firebase columns added successfully!${colors.reset}`
      );

      // Create index on firebase_uid
      console.log(
        `${colors.blue}Creating index on firebase_uid...${colors.reset}`
      );
      await sql`
        CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
      `;

      console.log(
        `${colors.green}✓ Index created successfully!${colors.reset}`
      );
    }

    // Close connection
    await sql.end();
    console.log(
      `\n${colors.bold}${colors.green}Firebase auth migration completed successfully!${colors.reset}`
    );
  } catch (error) {
    console.error(
      `\n${colors.bold}${colors.red}Migration failed: ${error.message}${colors.reset}`
    );
    process.exit(1);
  }
}

runMigration().catch((error) => {
  console.error(
    `${colors.red}Unexpected error: ${error.message}${colors.reset}`
  );
  process.exit(1);
});
