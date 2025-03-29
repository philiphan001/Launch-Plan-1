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

async function importLocationCostOfLiving() {
  console.log('Starting location cost of living import...');
  
  // Clear existing location_cost_of_living table
  await sql`DELETE FROM location_cost_of_living`;
  console.log('Cleared existing location cost of living data');

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data using synchronous parse for ES modules
  try {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Parsed ${records.length} location cost of living records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process and transform each record in the batch
      const locationData = batch.map(record => {
        // Make sure zipCode is never undefined or empty
        const zipCode = record['Zipcode'] || '';
        
        // Safely parse numerical values
        const parseIntSafe = (value) => {
          if (value && !isNaN(parseInt(value))) {
            return parseInt(value);
          }
          return null;
        };
        
        const parseFloatSafe = (value) => {
          if (value && !isNaN(parseFloat(value))) {
            return parseFloat(value);
          }
          return null;
        };
        
        return {
          zip_code: zipCode,
          city: record['City'] || null,
          state: record['State'] || null,
          housing: parseIntSafe(record['Housing']),
          transportation: parseIntSafe(record['Transportation']),
          food: parseIntSafe(record['Food']),
          healthcare: parseIntSafe(record['Healthcare']),
          personal_insurance: parseIntSafe(record['Personal Insurance']),
          apparel: parseIntSafe(record['Apparel']),
          services: parseIntSafe(record['Services']),
          entertainment: parseIntSafe(record['Entertainment']),
          other: parseIntSafe(record['Other']),
          monthly_expense: parseIntSafe(record['Monthly Expense']),
          income_adjustment_factor: parseFloatSafe(record['Income Adjustment Factor'])
        };
      });
      
      // Insert the batch into the database
      try {
        await sql`INSERT INTO location_cost_of_living ${sql(locationData)}`;
        insertCount += locationData.length;
        console.log(`Inserted ${insertCount} location cost of living records so far...`);
      } catch (error) {
        console.error('Error inserting location cost of living records:', error);
      }
    }
    
    console.log(`Location cost of living import completed successfully. Total records: ${insertCount}`);
    // Close the database connection
    await sql.end();
  } catch (err) {
    console.error('Error parsing CSV:', err);
    process.exit(1);
  }
}

// Execute the import function
importLocationCostOfLiving().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});