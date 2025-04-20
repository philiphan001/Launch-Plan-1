/**
 * Script to update the college schema with new columns from the Department of Education dataset
 * This adds detailed information about degree types, admission rates, completion rates, etc.
 */

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Create a modified connection string with SSL parameters
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.set('sslmode', 'verify-full');
dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem'));

// Create a Postgres client with SSL
const pgSql = postgres(dbUrl.toString(), {
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
    servername: new URL(process.env.DATABASE_URL).hostname
  }
});

// Create a Drizzle instance with the Postgres client
const db = drizzle(pgSql);

async function updateCollegeSchema() {
  console.log("Starting college schema update...");

  try {
    // Add the new columns to the colleges table
    await db.execute(sql`
      ALTER TABLE colleges
      ADD COLUMN IF NOT EXISTS tuition_doubled REAL,
      ADD COLUMN IF NOT EXISTS degrees_awarded_predominant INTEGER,
      ADD COLUMN IF NOT EXISTS degrees_awarded_highest INTEGER,
      ADD COLUMN IF NOT EXISTS admission_rate_overall REAL,
      ADD COLUMN IF NOT EXISTS sat_scores_average_overall INTEGER,
      ADD COLUMN IF NOT EXISTS pell_grant_rate REAL,
      ADD COLUMN IF NOT EXISTS completion_rate_4yr_150nt REAL,
      ADD COLUMN IF NOT EXISTS median_debt_completers_overall INTEGER,
      ADD COLUMN IF NOT EXISTS median_debt_noncompleters INTEGER,
      ADD COLUMN IF NOT EXISTS demographics_median_family_income REAL,
      ADD COLUMN IF NOT EXISTS median_earnings_10yrs_after_entry INTEGER;
    `);

    console.log("College schema successfully updated with new columns!");
  } catch (error) {
    console.error("Error updating college schema:", error);
    throw error;
  }
}

// Execute the function
updateCollegeSchema()
  .then(() => {
    console.log("Schema update completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Schema update failed:", error);
    process.exit(1);
  });