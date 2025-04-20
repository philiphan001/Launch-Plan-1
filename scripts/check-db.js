import postgres from 'postgres';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS RDS SSL Configuration
const sslConfig = {
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
  servername: new URL(process.env.DATABASE_URL).hostname
};

// Create a Postgres client
const sql = postgres(process.env.DATABASE_URL, {
  ssl: sslConfig,
  connect_timeout: 30,
  idle_timeout: 60,
  max: 10
});

async function checkDatabase() {
  try {
    // Get a sample of careers
    const careers = await sql`
      SELECT id, title, alias5 
      FROM careers 
      LIMIT 5
    `;
    
    console.log('\nSample careers from database:');
    careers.forEach(career => {
      console.log(`ID: ${career.id}`);
      console.log(`Title: "${career.title}"`);
      console.log(`Alias 5: "${career.alias5}"`);
      console.log('---');
    });

    // Read first few lines of CSV
    const csvPath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').slice(0, 6);
    
    console.log('\nFirst 5 lines of CSV:');
    lines.forEach(line => console.log(line));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkDatabase().catch(console.error); 