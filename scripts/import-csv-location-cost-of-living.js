const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const postgres = require('postgres');

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
  
  // Parse CSV data
  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (err, records) => {
    if (err) {
      console.error('Error parsing CSV:', err);
      process.exit(1);
    }
    
    console.log(`Parsed ${records.length} location cost of living records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process and transform each record in the batch
      const locationData = batch.map(record => {
        return {
          zipCode: record['Zipcode'],
          city: record['City'],
          state: record['State'],
          housing: parseInt(record['Housing']) || null,
          transportation: parseInt(record['Transportation']) || null,
          food: parseInt(record['Food']) || null,
          healthcare: parseInt(record['Healthcare']) || null,
          personalInsurance: parseInt(record['Personal Insurance']) || null,
          apparel: parseInt(record['Apparel']) || null,
          services: parseInt(record['Services']) || null,
          entertainment: parseInt(record['Entertainment']) || null,
          other: parseInt(record['Other']) || null,
          monthlyExpense: parseInt(record['Monthly Expense']) || null,
          incomeAdjustmentFactor: parseFloat(record['Income Adjustment Factor']) || null
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
  });
}

// Execute the import function
importLocationCostOfLiving().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});