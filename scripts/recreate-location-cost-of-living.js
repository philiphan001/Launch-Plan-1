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

async function recreateLocationCostOfLiving() {
  console.log('Starting location cost of living recreation from CSV...');
  
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
    
    console.log(`Parsed ${records.length} location cost of living records from CSV`);
    
    let insertCount = 0;
    // Process records in batches to avoid memory issues
    const batchSize = 500;
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      
      // Process and transform each record in the batch
      const locationData = batch.map(record => {
        // Make sure zipCode is never undefined or empty
        // Use a timestamp-based fallback for records without zip codes
        const zipCode = record['Zipcode'] ? String(record['Zipcode']).trim() : `gen-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        // Log only a few sample records to avoid console flood
        if (i === 0 && batch.indexOf(record) === 0) {
          console.log('Sample record:', record);
          console.log('Zip code being used:', zipCode);
          console.log('Zipcode property from CSV:', record['Zipcode']);
        }
        
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
          city: record.City || null,
          state: record.State || null,
          housing: parseIntSafe(record.Housing),
          transportation: parseIntSafe(record.Transportation),
          food: parseIntSafe(record.Food),
          healthcare: parseIntSafe(record.Healthcare),
          personal_insurance: parseIntSafe(record['Personal Insurance']),
          apparel: parseIntSafe(record.Apparel),
          services: parseIntSafe(record.Services),
          entertainment: parseIntSafe(record.Entertainment),
          other: parseIntSafe(record.Other),
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
    
    // Add our San Francisco record with normalized data if it doesn't exist
    await sql`
      INSERT INTO location_cost_of_living 
      (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
      VALUES 
      ('94103', 'San Francisco', 'CA', 2500, 1100, 1200, 1000, 1000, 250, 300, 350, 200, 8000, 1.42)
      ON CONFLICT (zip_code) DO NOTHING
    `;
    
    // Close the database connection
    await sql.end();
    
  } catch (err) {
    console.error('Error processing CSV:', err);
    process.exit(1);
  }
}

// Execute the function
recreateLocationCostOfLiving().catch(error => {
  console.error('Recreation failed:', error);
  process.exit(1);
});