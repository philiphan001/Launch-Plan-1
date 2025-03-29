const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const postgres = require('postgres');

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function importCareerPaths() {
  console.log('Starting career paths import...');
  
  // Clear existing career_paths table
  await sql`DELETE FROM career_paths`;
  console.log('Cleared existing career paths data');

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/Top_5_Career_Paths_by_Field_of_Study.csv');
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
    
    console.log(`Parsed ${records.length} career path records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process and transform each record in the batch
      const careerPathData = batch.map(record => {
        return {
          fieldOfStudy: record['Field of Study'],
          careerTitle: record['Career'],
          optionRank: parseInt(record['Career Option #']) || null,
        };
      });
      
      // Insert the batch into the database
      try {
        await sql`INSERT INTO career_paths ${sql(careerPathData)}`;
        insertCount += careerPathData.length;
        console.log(`Inserted ${insertCount} career paths so far...`);
      } catch (error) {
        console.error('Error inserting career paths:', error);
      }
    }
    
    console.log(`Career paths import completed successfully. Total records: ${insertCount}`);
    // Close the database connection
    await sql.end();
  });
}

// Execute the import function
importCareerPaths().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});