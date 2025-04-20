import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Create a modified connection string with SSL parameters
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.set('sslmode', 'verify-full');
dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem'));

// Database connection with SSL
const sql = postgres(dbUrl.toString(), {
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
    servername: new URL(process.env.DATABASE_URL).hostname
  }
});

async function executeQuery() {
  try {
    // Read SQL from stdin
    const sqlString = fs.readFileSync(0, 'utf-8');
    
    // Execute the SQL
    const result = await sql.unsafe(sqlString);
    
    // Output the result
    console.table(result);
    
    // Close the connection
    await sql.end();
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    process.exit(1);
  }
}

executeQuery();