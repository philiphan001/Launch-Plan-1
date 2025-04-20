import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Read migration file
const migrationPath = path.join(process.cwd(), 'migrations', '0003_add_pathway_responses.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Starting pathway responses migration...');
  
  try {
    // Create database connection
    const client = postgres(process.env.DATABASE_URL, {
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
      },
    });
    
    const db = drizzle(client);

    // Execute migration
    console.log('Executing migration...');
    await client.unsafe(migrationSQL);
    
    console.log('Migration completed successfully!');
    
    // Verify table creation
    const tables = await client.unsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pathway_responses'
    `);
    
    if (tables.length > 0) {
      console.log('Table verification successful: pathway_responses exists');
    } else {
      console.error('Error: Table verification failed - pathway_responses not found');
      process.exit(1);
    }

    // Close connection
    await client.end();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 