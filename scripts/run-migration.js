import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = new pg.Client({
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlFile = process.argv[2];
    if (!sqlFile) {
      throw new Error('Please provide the path to the SQL file');
    }

    const sql = fs.readFileSync(path.resolve(__dirname, '..', sqlFile), 'utf8');
    
    await client.query(sql);
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration(); 