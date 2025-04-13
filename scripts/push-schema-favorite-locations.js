import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "../shared/schema.js";
import dotenv from "dotenv";

dotenv.config();

async function pushSchema() {
  try {
    const migrationClient = postgres(process.env.DATABASE_URL || "", { max: 1 });
    const db = drizzle(migrationClient);

    // Define a manual query to create the favorite_locations table if it doesn't exist
    await migrationClient`
      CREATE TABLE IF NOT EXISTS favorite_locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        zip_code TEXT NOT NULL,
        city TEXT,
        state TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log("Schema changes pushed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error pushing schema:", error);
    process.exit(1);
  }
}

pushSchema();