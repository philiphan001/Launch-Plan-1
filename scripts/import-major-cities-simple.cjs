// const { parse } = require('csv-parse/sync'); // Not using this library anymore
const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// List of major cities and their zip codes
const majorCities = [
  // Large metro areas (Top 10 US cities by population)
  { city: 'New York', state: 'NY', zipCodes: ['10001', '10002', '10003', '10016', '10017', '10018', '10019', '10022', '10023', '10024', '10025', '10128'] },
  { city: 'Los Angeles', state: 'CA', zipCodes: ['90001', '90007', '90024', '90028', '90036', '90048', '90210', '90272', '90292', '90402'] },
  { city: 'Chicago', state: 'IL', zipCodes: ['60601', '60602', '60603', '60604', '60605', '60606', '60607', '60608', '60610', '60611', '60614', '60622', '60642', '60654'] },
  { city: 'Houston', state: 'TX', zipCodes: ['77001', '77002', '77003', '77004', '77005', '77006', '77007', '77019', '77024', '77027', '77056', '77098'] },
  { city: 'Phoenix', state: 'AZ', zipCodes: ['85001', '85003', '85004', '85006', '85007', '85008', '85012', '85013', '85014', '85015', '85016', '85018', '85020', '85021'] },
  
  // Popular cities
  { city: 'Boston', state: 'MA', zipCodes: ['02108', '02109', '02110', '02111', '02113', '02114', '02115', '02116', '02118', '02119', '02120'] },
  { city: 'Washington', state: 'DC', zipCodes: ['20001', '20002', '20003', '20004', '20005', '20006', '20007', '20008', '20009', '20010'] },
  { city: 'San Francisco', state: 'CA', zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110', '94111', '94112'] },
  { city: 'Denver', state: 'CO', zipCodes: ['80202', '80203', '80204', '80205', '80206', '80207', '80209', '80210', '80211', '80212'] },
  { city: 'Austin', state: 'TX', zipCodes: ['78701', '78702', '78703', '78704', '78705', '78712', '78722', '78723', '78731', '78741'] },
  
  // Special areas
  { city: 'Santa Monica', state: 'CA', zipCodes: ['90401', '90402', '90403', '90404', '90405'] },
];

// Map to keep track of processed zip codes
const processedZipCodes = new Set();

async function importMajorCities() {
  console.log("Starting import of major cities location data...");
  
  try {
    // Create a Postgres client with the database connection string
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const sql = postgres(databaseUrl);
    
    // Read CSV data
    const csvFilePath = path.resolve('./attached_assets/COLI by Location.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Split the content into lines
    const lines = fileContent.split('\n');
    
    // Extract the header row and parse the column names
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(header => header.trim().replace(/\r/g, ''));
    console.log('CSV Headers after trimming:', headers);
    
    // Parse records manually
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      const values = line.split(',').map(value => value.trim().replace(/\r/g, ''));
      if (values.length !== headers.length) {
        console.log(`Skipping line ${i+1}: column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }
      
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j];
      }
      
      records.push(record);
    }
    
    console.log(`Manually parsed ${records.length} records from CSV`);
    
    // Show some debug info for the first few records
    for (let i = 0; i < Math.min(3, records.length); i++) {
      console.log(`Record ${i}:`, records[i]);
    }
    
    // Search for a known zip code to verify parsing
    const found10001 = records.find(r => r['Zipcode'] === '10001');
    if (found10001) {
      console.log('Found record with 10001:', found10001);
    } else {
      console.log('Could not find 10001 in any record');
    }
    
    console.log(`Parsed ${records.length} total location cost of living records from CSV`);
    
    // First, check if we should truncate
    const existingRecordsCount = await sql`SELECT COUNT(*) FROM location_cost_of_living`;
    const count = parseInt(existingRecordsCount[0]?.count || "0");
    const shouldTruncate = count < 1;
    
    if (shouldTruncate) {
      console.log('No existing records found - truncating location_cost_of_living table');
      await sql`TRUNCATE TABLE location_cost_of_living RESTART IDENTITY CASCADE`;
      console.log('Table truncated successfully');
    } else {
      console.log(`Found ${count} existing records, skipping truncate`);
    }
    
    // Get all zip codes we want to import
    const allTargetZipCodes = new Set();
    majorCities.forEach(city => {
      city.zipCodes.forEach(zip => allTargetZipCodes.add(zip));
    });
    
    console.log(`Targeting ${allTargetZipCodes.size} zip codes from major cities`);
    
    // Debug - Show a sample of the CSV records
    console.log("Sample of CSV structure:");
    console.log(records[0]);
    
    // Find records matching our target zip codes
    const importRecords = [];
    let matchCount = 0;
    let mismatchCount = 0;
    
    for (const record of records) {
      // Now we can directly access properties since we cleaned up the CSV parsing
      const zipCode = record['Zipcode'];
      
      if (records.indexOf(record) < 5) {
        // Extract city and state
        const city = record['City'];
        const state = record['State'];
        
        console.log(`Found zipCode value for record[${records.indexOf(record)}]: "${zipCode}" (${city}, ${state})`);
      }
      
      if (zipCode && allTargetZipCodes.has(zipCode) && !processedZipCodes.has(zipCode)) {
        matchCount++;
        
        // Direct access to city and state
        const city = record['City'];
        const state = record['State'];
        
        console.log(`Found match for zip code: ${zipCode} (${city}, ${state})`);
        
        try {
          // Direct access to all needed fields
          const importRecord = {
            zip_code: zipCode,
            city: city,
            state: state,
            housing: parseFloat(record['Housing']) || null,
            transportation: parseFloat(record['Transportation']) || null,
            food: parseFloat(record['Food']) || null,
            healthcare: parseFloat(record['Healthcare']) || null,
            income_adjustment_factor: parseFloat(record['Income Adjustment Factor']) || null
          };
          
          importRecords.push(importRecord);
          processedZipCodes.add(zipCode);
        } catch (error) {
          console.error(`Error processing record for zip code ${zipCode}:`, error);
        }
      } else {
        mismatchCount++;
        // Only log a few mismatches for debugging
        if (mismatchCount <= 5) {
          // Direct access to city and state
          const city = record['City'];
          const state = record['State'];
          
          console.log(`No match for zip code: ${zipCode} (${city}, ${state})`);
        }
      }
    }
    
    console.log(`Match summary: Found ${matchCount} matches and ${mismatchCount} non-matches in CSV`);
    
    // If we didn't find any matches, let's check if the allTargetZipCodes has the correct format
    if (matchCount === 0) {
      console.log("No matches found. Checking zip code formats:");
      console.log("Sample target zip codes:", Array.from(allTargetZipCodes).slice(0, 10));
      console.log("Sample CSV zip codes:", records.slice(0, 10).map(r => r.Zipcode));
    }
    
    console.log(`Found ${importRecords.length} matching records in CSV file`);
    
    // Import each record individually to avoid complex batch processing
    for (const record of importRecords) {
      try {
        await sql`
          INSERT INTO location_cost_of_living 
          (zip_code, city, state, housing, transportation, food, healthcare, income_adjustment_factor)
          VALUES (
            ${record.zip_code}, 
            ${record.city}, 
            ${record.state}, 
            ${record.housing}, 
            ${record.transportation}, 
            ${record.food}, 
            ${record.healthcare}, 
            ${record.income_adjustment_factor}
          )
          ON CONFLICT (zip_code) DO UPDATE
          SET 
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            housing = EXCLUDED.housing,
            transportation = EXCLUDED.transportation,
            food = EXCLUDED.food,
            healthcare = EXCLUDED.healthcare,
            income_adjustment_factor = EXCLUDED.income_adjustment_factor
        `;
        console.log(`Imported record for ${record.city}, ${record.state} (${record.zip_code})`);
      } catch (error) {
        console.error(`Error importing record for zip code ${record.zip_code}:`, error);
      }
    }
    
    console.log(`Import complete. Processed ${processedZipCodes.size} zip codes.`);
    
    // Check if we need to add the Santa Monica 90402 record manually (if it wasn't found in CSV)
    if (!processedZipCodes.has('90402')) {
      console.log('Adding Santa Monica 90402 data manually...');
      
      // Default values for Santa Monica 90402
      await sql`
        INSERT INTO location_cost_of_living 
        (zip_code, city, state, housing, transportation, food, healthcare, income_adjustment_factor)
        VALUES (
          '90402', 
          'Santa Monica', 
          'CA', 
          3500, 
          800, 
          800, 
          500, 
          1.4
        )
        ON CONFLICT (zip_code) DO UPDATE
        SET 
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          housing = EXCLUDED.housing,
          transportation = EXCLUDED.transportation,
          food = EXCLUDED.food,
          healthcare = EXCLUDED.healthcare,
          income_adjustment_factor = EXCLUDED.income_adjustment_factor
      `;
      
      console.log('Added Santa Monica 90402 data manually');
      processedZipCodes.add('90402');
    }
    
    // Final check
    const finalCount = await sql`SELECT COUNT(*) FROM location_cost_of_living`;
    console.log(`Final count in database: ${finalCount[0]?.count} records`);
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.error('Error importing location cost of living data:', error);
    throw error;
  }
}

// Run the import
importMajorCities().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});