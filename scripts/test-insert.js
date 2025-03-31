import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function testInsert() {
  console.log('Testing location cost of living single record insert...');
  
  // Truncate the existing table to start fresh
  try {
    await sql`TRUNCATE TABLE location_cost_of_living RESTART IDENTITY`;
    console.log('Truncated existing location_cost_of_living table');
  } catch (error) {
    console.error('Error truncating table:', error);
    process.exit(1);
  }
  
  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  try {
    // Parse CSV data using synchronous parse for ES modules
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    if (records.length > 0) {
      const record = records[0];
      console.log('First record from CSV:', record);
      
      // Let's create a simple record with just the zipcode
      const testRecord = {
        zip_code: '00601', // Hardcoded first zipcode 
        city: 'ADJUNTAS',  // Hardcoded from first record
        state: 'PR',        // Hardcoded from first record
        housing: 2000,
        transportation: 600,
        food: 500,
        healthcare: 340,
        personal_insurance: 1000,
        apparel: 250,
        services: 300,
        entertainment: 350,
        other: 200,
        monthly_expense: 5540,
        income_adjustment_factor: 1.0
      };
      
      // Insert the single test record
      await sql`INSERT INTO location_cost_of_living ${sql(testRecord)}`;
      console.log('Successfully inserted test record');
      
      // Now let's try to retrieve it
      const [retrievedRecord] = await sql`SELECT * FROM location_cost_of_living WHERE zip_code = '00601'`;
      console.log('Retrieved record:', retrievedRecord);
    } else {
      console.log('No records found in CSV file');
    }
    
    // Close the database connection
    await sql.end();
    
  } catch (err) {
    console.error('Error testing insert:', err);
    process.exit(1);
  }
}

// Execute the function
testInsert().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});