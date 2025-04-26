import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // AWS RDS SSL Configuration
    const sslConfig = {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(process.cwd(), 'rds-ca-2019-root.pem')).toString(),
      servername: new URL(process.env.DATABASE_URL).hostname
    };

    console.log('SSL Configuration:', {
      rejectUnauthorized: sslConfig.rejectUnauthorized,
      servername: sslConfig.servername,
      caFileExists: !!sslConfig.ca
    });

    // Create a Postgres client with increased timeout
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: sslConfig,
      connect_timeout: 30, // Increased to 30 seconds
      idle_timeout: 20,
      max: 1,
      debug: console.log, // Add debug logging
      onnotice: m => console.log('Database notice:', m),
      onparameter: p => console.log('Database parameter:', p)
    });

    console.log('Attempting to connect...');
    
    // Test the connection
    const result = await sql`SELECT version()`;
    console.log('Connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Close the connection
    await sql.end();
  } catch (error) {
    console.error('Error connecting to database:', error);
    if (error.code === 'CONNECT_TIMEOUT') {
      console.error('Connection timed out. Please check:');
      console.error('1. AWS RDS security group allows connections from your IP');
      console.error('2. Database instance is running and accessible');
      console.error('3. VPC and subnet configurations are correct');
    }
    process.exit(1);
  }
}

testConnection(); 