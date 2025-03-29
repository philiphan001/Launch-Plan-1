const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const postgres = require('postgres');

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function importZipCodeIncome() {
  console.log('Starting zip code income import...');
  
  // Clear existing zip_code_income table
  await sql`DELETE FROM zip_code_income`;
  console.log('Cleared existing zip code income data');

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/Zip_Code_Income.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      process.exit(1);
    }
    
    console.log(`Parsed ${records.length} zip code income records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process and transform each record in the batch
      const incomeData = batch.map(record => {
        // Process mean income: remove commas and convert to number
        let meanIncome = null;
        if (record['Mean Income']) {
          meanIncome = parseInt(record['Mean Income'].replace(/[^0-9.-]+/g, '')) || null;
        }
        
        // Process estimated investments and home value
        let estimatedInvestments = null;
        if (record['Estimated Investments']) {
          estimatedInvestments = parseInt(record['Estimated Investments'].replace(/[^0-9.-]+/g, '')) || null;
        }
        
        let homeValue = null;
        if (record['Home_Value']) {
          homeValue = parseInt(record['Home_Value'].replace(/[^0-9.-]+/g, '')) || null;
        }
        
        return {
          state: record['State'],
          zipCode: record['zipcode'] || record['Zipcode'] || '', // Handle different header names
          meanIncome: meanIncome,
          estimatedInvestments: estimatedInvestments,
          homeValue: homeValue
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
  });
}

// Execute the import function
importZipCodeIncome().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});