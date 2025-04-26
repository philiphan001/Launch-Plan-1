import { query } from './db';

// Print all DB-related environment variables for debugging
console.log('Runtime DB Environment Variables:');
Object.keys(process.env)
  .filter((key) => key.startsWith('DB_'))
  .forEach((key) => {
    console.log(`${key}:`, process.env[key]);
  });

async function testConnection() {
  try {
    // Count the number of rows in the colleges table
    const result = await query('SELECT COUNT(*) FROM colleges');
    console.log('Number of rows in colleges table:', result.rows[0].count);
  } catch (error) {
    console.error('Database query failed:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

testConnection(); 