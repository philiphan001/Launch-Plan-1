import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
dotenv.config();

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  // Check if DATABASE_URL environment variable is set
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  // Create a Postgres client
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  
  // Create a Drizzle instance
  const db = drizzle(sql);
  
  try {
    console.log('Applying migrations...');
    
    // The path to the migrations folder
    const migrationsFolder = resolve(__dirname, '../drizzle');
    
    // Apply migrations
    await migrate(db, { migrationsFolder });
    
    console.log('Migrations applied successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
  }
}

main();