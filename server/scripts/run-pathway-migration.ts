import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

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
    
    // Add version column
    await client.unsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'pathway_responses' 
          AND column_name = 'version'
        ) THEN
          ALTER TABLE pathway_responses ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
        END IF;
      END $$;
    `);
    
    // Add deleted_at column and index
    await client.unsafe(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'pathway_responses' 
          AND column_name = 'deleted_at'
        ) THEN
          ALTER TABLE pathway_responses ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
          CREATE INDEX IF NOT EXISTS pathway_responses_deleted_at_idx ON pathway_responses(deleted_at);
        END IF;
      END $$;
    `);
    
    // Add comments
    await client.unsafe(`
      COMMENT ON TABLE pathway_responses IS 'Stores user responses to pathway questions';
      COMMENT ON COLUMN pathway_responses.response_data IS 'JSON structure containing the user''s responses';
      COMMENT ON COLUMN pathway_responses.version IS 'Schema version of the response data';
      COMMENT ON COLUMN pathway_responses.deleted_at IS 'Timestamp of soft deletion, NULL if not deleted';
    `);
    
    console.log('Migration completed successfully!');
    
    // Verify table structure
    const columns = await client.unsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pathway_responses'
    `);
    
    console.log('Table structure:', columns);

    // Close connection
    await client.end();
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration(); 