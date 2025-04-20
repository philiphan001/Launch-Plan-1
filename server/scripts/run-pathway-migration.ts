import { db } from '../db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Running pathway responses migration...');
    const filePath = path.join(process.cwd(), 'migrations', '0001_add_pathway_responses.sql');
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    await db.execute(sql.raw(sqlContent));
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration(); 