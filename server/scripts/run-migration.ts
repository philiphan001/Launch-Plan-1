import { executeSQLFile } from '../db';

async function runMigration() {
  try {
    await executeSQLFile('create_pathway_responses.sql');
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 