import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// Get current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function importCareers() {
  console.log('Starting career import...');
  
  // Clear existing careers table
  await sql`DELETE FROM careers`;
  console.log('Cleared existing careers data');

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data using Promise
  const records = await new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }, (err, records) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(records);
    });
  });
  
  console.log(`Parsed ${records.length} career records from CSV`);
  
  let insertCount = 0;
  
  // Process records in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    // Process and transform each record in the batch
    const careerData = batch.map(record => {
      // Extract salary information
      const salary = parseInt(record['A_MEDIAN']) || parseInt(record['A_MEAN']) || 0;
      
      // Determine growth rate based on position in list (just a placeholder logic)
      let growthRate = 'stable';
      const employment = parseInt(record['TOT_EMP'].replace(/,/g, '')) || 0;
      if (employment > 500000) growthRate = 'fast';
      if (employment < 50000) growthRate = 'slow';
      
      // Determine education requirement (simplified example)
      let education = "Bachelor's";
      if (record['OCC_CODE'].startsWith('11')) education = "Master's";
      if (record['OCC_CODE'].startsWith('51')) education = "High School";
      
      // Determine category based on OCC_CODE
      let category = 'Other';
      if (record['OCC_CODE'].startsWith('11')) category = 'Management';
      if (record['OCC_CODE'].startsWith('13')) category = 'Finance';
      if (record['OCC_CODE'].startsWith('15')) category = 'Technology';
      if (record['OCC_CODE'].startsWith('25')) category = 'Education';
      if (record['OCC_CODE'].startsWith('29')) category = 'Healthcare';
      
      return {
        title: record['Occupation'],
        description: `${record['Occupation']} in the ${category} field`,
        salary: salary,
        growth_rate: growthRate,
        education: education,
        category: category
      };
    });
    
    // Insert the batch into the database
    try {
      await sql`INSERT INTO careers ${sql(careerData)}`;
      insertCount += careerData.length;
      console.log(`Inserted ${insertCount} careers so far...`);
    } catch (error) {
      console.error('Error inserting careers:', error);
    }
  }
  
  console.log(`Career import completed successfully. Total records: ${insertCount}`);
  // Close the database connection
  await sql.end();
}

// Execute the import function
importCareers().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});