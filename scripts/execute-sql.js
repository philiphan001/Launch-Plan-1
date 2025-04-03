import postgres from 'postgres';
import fs from 'fs';

// Database connection
const sql = postgres(process.env.DATABASE_URL);

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