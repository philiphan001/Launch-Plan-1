import { db } from './db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    // Add onboarding_completed column to users table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND column_name = 'onboarding_completed'
          ) THEN
              ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
          END IF;
      END $$;
    `);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration(); 