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

async function importZipCodeIncome() {
  console.log('Starting zip code income import...');
  
  // Check existing records to determine where to start
  const existingCount = await sql`SELECT COUNT(*) AS count FROM zip_code_income`.then(res => parseInt(res[0].count));
  console.log(`Found ${existingCount} existing zip code income records`);

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/Zip_Code_Income.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data using synchronous parse for ES modules
  try {
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Parsed ${records.length} zip code income records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 50; // Reduced batch size for better performance
    
    // Calculate starting index based on existing records
    const startIndex = existingCount;
    console.log(`Starting import from record ${startIndex}`);
    
    // Skip records that have already been imported
    if (startIndex >= records.length) {
      console.log('All records already imported. Nothing to do.');
      await sql.end();
      return;
    }
    
    // Process only records that haven't been imported yet
    for (let i = startIndex; i < records.length; i += batchSize) {
      const batch = records.slice(i, Math.min(i + batchSize, records.length));
      
      // Process and transform each record in the batch
      const incomeData = batch.map(record => {
        // Make sure zipCode is never undefined or empty
        const zipCode = record['zipcode'] || record['Zipcode'] || '';
        
        // Process mean income: remove commas and convert to number
        let meanIncome = null;
        if (record['Mean Income']) {
          const cleanedValue = record['Mean Income'].replace(/[^0-9.-]+/g, '');
          if (cleanedValue && !isNaN(parseInt(cleanedValue))) {
            meanIncome = parseInt(cleanedValue);
          }
        }
        
        // Process estimated investments and home value
        let estimatedInvestments = null;
        if (record['Estimated Investments']) {
          const cleanedValue = record['Estimated Investments'].replace(/[^0-9.-]+/g, '');
          if (cleanedValue && !isNaN(parseInt(cleanedValue))) {
            estimatedInvestments = parseInt(cleanedValue);
          }
        }
        
        let homeValue = null;
        if (record['Home_Value']) {
          const cleanedValue = record['Home_Value'].replace(/[^0-9.-]+/g, '');
          if (cleanedValue && !isNaN(parseInt(cleanedValue))) {
            homeValue = parseInt(cleanedValue);
          }
        }
        
        return {
          state: record['State'] || null,
          zip_code: zipCode,
          mean_income: meanIncome,
          estimated_investments: estimatedInvestments,
          home_value: homeValue
        };
      });
      
      // Insert the batch into the database
      try {
        await sql`INSERT INTO zip_code_income ${sql(incomeData)}`;
        insertCount += incomeData.length;
        console.log(`Inserted ${insertCount} zip code income records so far...`);
      } catch (error) {
        console.error('Error inserting zip code income records:', error);
      }
    }
    
    console.log(`Zip code income import completed successfully. Total records: ${insertCount}`);
    // Close the database connection
    await sql.end();
  } catch (err) {
    console.error('Error parsing CSV:', err);
    process.exit(1);
  }
}

// Execute the import function
importZipCodeIncome().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});