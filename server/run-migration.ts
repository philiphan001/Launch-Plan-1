import { db } from './db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration(sqlFile: string) {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync(path.resolve(sqlFile), 'utf8');
    
    // Execute the SQL using the existing database connection
    await db.execute(sql.raw(sqlContent));
    
    console.log(`Successfully executed migration: ${sqlFile}`);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Get the SQL file path from command line arguments
const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Please provide the path to the SQL file');
  process.exit(1);
}

runMigration(sqlFile); 