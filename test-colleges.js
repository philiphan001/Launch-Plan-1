import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function countColleges() {
  try {
    console.log('Connecting to database...');
    
    // AWS RDS SSL Configuration
    const sslConfig = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(process.cwd(), 'rds-ca-2019-root.pem')).toString(),
      servername: new URL(process.env.DATABASE_URL).hostname
    };

    // Create a Postgres client
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: sslConfig,
      connect_timeout: 30,
      idle_timeout: 20,
      max: 1
    });

    console.log('Querying colleges table...');
    
    // Count rows in colleges table
    const result = await sql`SELECT COUNT(*) as count FROM colleges`;
    console.log('Number of colleges:', result[0].count);
    
    // Get table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'colleges'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nTable structure:');
    columns.forEach(col => {
      console.log(`${col.column_name} (${col.data_type})`);
    });
    
    // Get a sample of colleges
    const sample = await sql`SELECT * FROM colleges LIMIT 5`;
    console.log('\nSample colleges:');
    sample.forEach(college => {
      console.log(JSON.stringify(college, null, 2));
    });
    
    // Close the connection
    await sql.end();
  } catch (error) {
    console.error('Error querying database:', error);
    process.exit(1);
  }
}

countColleges(); 