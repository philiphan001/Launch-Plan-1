const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const postgres = require('postgres');

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function importColleges() {
  console.log('Starting college import...');
  
  // Clear existing colleges table
  await sql`DELETE FROM colleges`;
  console.log('Cleared existing colleges data');

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/Updated_Most-Recent-Cohorts-Institution.csv');
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
    
    console.log(`Parsed ${records.length} college records from CSV`);
    
    let insertCount = 0;
    
    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      // Process and transform each record in the batch
      const collegeData = batch.map(record => {
        // Parse numeric values and handle null/undefined values
        const tuition = parseInt(record['tuition.in_state']) || 0;
        const roomAndBoard = 15000; // Default value as it's not clearly specified in CSV
        const acceptanceRate = parseFloat(record['admission_rate.overall']) * 100 || null;
        const rating = parseFloat(record['sat_scores.average.overall']) / 1600 * 5 || null; // Normalized to 5-point scale
        
        // Create fees by income object
        const feesByIncome = {
          '0-30000': parseInt(record['net_price.public.by_income_level.0-30000']) || parseInt(record['net_price.private.by_income_level.0-30000']) || 0,
          '30001-48000': parseInt(record['net_price.public.by_income_level.30001-48000']) || parseInt(record['net_price.private.by_income_level.30001-48000']) || 0,
          '48001-75000': parseInt(record['net_price.public.by_income_level.48001-75000']) || parseInt(record['net_price.private.by_income_level.48001-75000']) || 0,
          '75001-110000': parseInt(record['net_price.public.by_income_level.75001-110000']) || parseInt(record['net_price.private.by_income_level.75001-110000']) || 0,
          '110001+': parseInt(record['net_price.public.by_income_level.110001-plus']) || parseInt(record['net_price.private.by_income_level.110001-plus']) || 0,
        };
        
        // Determine size based on enrollment
        let size = 'medium';
        const enrollment = parseInt(record['enrollment']) || 0;
        if (enrollment > 15000) size = 'large';
        if (enrollment < 5000) size = 'small';
        
        // Determine type based on ownership
        let type = 'Private';
        if (record['ownership'] === '1') type = 'Public';
        if (record['degrees_awarded.highest'] === '4') type += ' Research';
        
        return {
          name: record['name'],
          location: `${record['city']}, ${record['state']}`,
          state: record['state'],
          type: type,
          tuition: tuition,
          room_and_board: roomAndBoard,
          acceptance_rate: acceptanceRate,
          rating: rating,
          size: size,
          rank: i + 1, // Simple ranking based on position in file
          fees_by_income: feesByIncome
        };
      });
      
      // Insert the batch into the database
      try {
        await sql`INSERT INTO colleges ${sql(collegeData)}`;
        insertCount += collegeData.length;
        console.log(`Inserted ${insertCount} colleges so far...`);
      } catch (error) {
        console.error('Error inserting colleges:', error);
      }
    }
    
    console.log(`College import completed successfully. Total records: ${insertCount}`);
    // Close the database connection
    await sql.end();
  });
}

// Execute the import function
importColleges().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});