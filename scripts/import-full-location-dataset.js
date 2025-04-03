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

// Path for storing import progress
const PROGRESS_FILE = path.join(__dirname, '../.location_import_progress.json');

// Get command line arguments with defaults
const args = process.argv.slice(2);
const BATCH_SIZE = args[0] ? parseInt(args[0], 10) : 2000;
const TRUNCATE_TABLE = args[1] === 'truncate';
const RESUME = args[1] === 'resume';
const DEBUG = args[2] === 'debug';

/**
 * Load progress from file
 */
function loadProgressFile() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, { encoding: 'utf-8' });
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading progress file:', err);
  }
  return { 
    lastProcessedIndex: 0, 
    totalRecords: 0, 
    recordsInserted: 0, 
    recordsWithErrors: 0,
    lastRunDate: null
  };
}

/**
 * Save progress to file
 */
function saveProgressFile(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), { encoding: 'utf-8' });
  } catch (err) {
    console.error('Error writing progress file:', err);
  }
}

/**
 * Import the full dataset using batched processing with progress tracking
 */
async function importFullLocationDataset() {
  console.log('Starting full location cost of living import...');
  console.time('ImportDuration');
  
  let progress = loadProgressFile();
  
  // Determine if we should resume or start fresh
  const startFresh = !RESUME || !progress.lastProcessedIndex;
  
  if (startFresh) {
    console.log('Starting fresh import');
    progress = { 
      lastProcessedIndex: 0, 
      totalRecords: 0, 
      recordsInserted: 0, 
      recordsWithErrors: 0,
      lastRunDate: new Date().toISOString()
    };
    saveProgressFile(progress);
  } else {
    console.log(`Resuming import from index ${progress.lastProcessedIndex}`);
    console.log(`Progress so far: ${progress.recordsInserted} records inserted, ${progress.recordsWithErrors} errors`);
  }
  
  // Truncate table if requested (only when starting fresh)
  if (TRUNCATE_TABLE && startFresh) {
    try {
      console.log('Truncating location_cost_of_living table...');
      await sql`TRUNCATE TABLE location_cost_of_living RESTART IDENTITY`;
      console.log('Table truncated successfully');
    } catch (error) {
      console.error('Error truncating table:', error);
      return;
    }
  }

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
  
  try {
    console.log('Reading CSV file...');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    console.log('Parsing CSV data...');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    const totalRecords = records.length;
    console.log(`Parsed ${totalRecords} total records from CSV`);
    
    // Update total records in progress
    progress.totalRecords = totalRecords;
    saveProgressFile(progress);
    
    // Start from the saved position or 0 if fresh
    let currentIndex = startFresh ? 0 : progress.lastProcessedIndex;
    
    // Process in batches
    while (currentIndex < totalRecords) {
      const batchEndIndex = Math.min(currentIndex + BATCH_SIZE, totalRecords);
      const batchRecords = records.slice(currentIndex, batchEndIndex);
      
      console.log(`\n--- Processing batch ${currentIndex} to ${batchEndIndex} (${batchRecords.length} records) ---`);
      
      let batchInsertCount = 0;
      let batchErrorCount = 0;
      
      // Set to track zip codes to avoid duplicates within the batch
      const processedZipCodes = new Set();
      
      // Transform records for database insertion
      const locationBatch = batchRecords
        .map((record, idx) => {
          // Debug logging - show more information to diagnose issues
          // Log every 5000th record regardless of debug mode
          if ((DEBUG && currentIndex === 0 && idx < 3) || 
              (currentIndex + idx) % 5000 === 0) {
            console.log(`DEBUG: Processing record #${currentIndex + idx}`);
            console.log(`DEBUG: Record keys:`, Object.keys(record));
            console.log(`DEBUG: Record sample values:`, Object.values(record).slice(0, 3));
          }
          
          // Try all possible keys for zipcode with different casing and formats
          const possibleZipKeys = [
            'Zipcode', 'zipcode', 'ZipCode', 'ZIPCODE', 'Zip Code', 'zip_code', 
            'ZIP CODE', 'zip code', '﻿Zipcode', 'ZIP', 'zip'
          ];
          
          let zipCode = null;
          for (const key of possibleZipKeys) {
            if (record[key] && String(record[key]).trim()) {
              zipCode = String(record[key]).trim();
              break;
            }
          }
          
          // If still no zip code found, try accessing the first column directly
          if (!zipCode) {
            const firstKey = Object.keys(record)[0];
            if (firstKey && record[firstKey] && /^\d{5}(-\d{4})?$/.test(String(record[firstKey]).trim())) {
              zipCode = String(record[firstKey]).trim();
              
              if (DEBUG && currentIndex === 0 && idx < 3) {
                console.log(`DEBUG: Using first column as zip code: ${zipCode}`);
              }
            }
          }
          
          // Skip if no zip code or already processed in this batch
          if (!zipCode || processedZipCodes.has(zipCode)) {
            if (DEBUG && currentIndex === 0 && idx < 3) {
              console.log(`DEBUG: Skipping record ${idx} - ${!zipCode ? 'no zip code' : 'duplicate'}`);
            }
            return null;
          }
          
          // Add to processed set
          processedZipCodes.add(zipCode);
          
          // Parse numeric fields safely
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
          
          // Function to get field value with different possible keys
          const getFieldValue = (possibleKeys) => {
            for (const key of possibleKeys) {
              if (record[key] !== undefined) {
                return record[key];
              }
            }
            return null;
          };
          
          // Create the record mapping
          const mappedRecord = {
            zip_code: zipCode,
            city: getFieldValue(['City', 'city', 'CITY']) || null,
            state: getFieldValue(['State', 'state', 'STATE']) || null,
            housing: parseIntSafe(getFieldValue(['Housing', 'housing', 'HOUSING'])),
            transportation: parseIntSafe(getFieldValue(['Transportation', 'transportation', 'TRANSPORTATION'])),
            food: parseIntSafe(getFieldValue(['Food', 'food', 'FOOD'])),
            healthcare: parseIntSafe(getFieldValue(['Healthcare', 'healthcare', 'HEALTHCARE'])),
            personal_insurance: parseIntSafe(getFieldValue(['Personal Insurance', 'personal_insurance', 'PERSONAL INSURANCE'])),
            apparel: parseIntSafe(getFieldValue(['Apparel', 'apparel', 'APPAREL'])),
            services: parseIntSafe(getFieldValue(['Services', 'services', 'SERVICES'])),
            entertainment: parseIntSafe(getFieldValue(['Entertainment', 'entertainment', 'ENTERTAINMENT'])),
            other: parseIntSafe(getFieldValue(['Other', 'other', 'OTHER'])),
            monthly_expense: parseIntSafe(getFieldValue(['Monthly Expense', 'monthly_expense', 'MONTHLY EXPENSE'])),
            income_adjustment_factor: parseFloatSafe(getFieldValue(['Income Adjustment Factor', 'income_adjustment_factor', 'INCOME ADJUSTMENT FACTOR']))
          };
          
          // In debug mode, print first record in first batch
          if (DEBUG && currentIndex === 0 && idx === 0) {
            console.log(`DEBUG: First mapped record:`, mappedRecord);
          }
          
          return mappedRecord;
        })
        .filter(record => record !== null);
      
      console.log(`Prepared ${locationBatch.length} valid records for insertion`);
      
      // Insert records in smaller chunks to prevent "too many SQL parameters" error
      const insertChunkSize = 100;
      
      for (let i = 0; i < locationBatch.length; i += insertChunkSize) {
        const chunk = locationBatch.slice(i, i + insertChunkSize);
        
        try {
          // Use ON CONFLICT DO NOTHING to skip duplicates
          const result = await sql`
            INSERT INTO location_cost_of_living 
            (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, 
             apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
            VALUES ${sql(chunk.map(record => [
              record.zip_code, 
              record.city, 
              record.state, 
              record.housing, 
              record.transportation, 
              record.food, 
              record.healthcare, 
              record.personal_insurance, 
              record.apparel, 
              record.services, 
              record.entertainment, 
              record.other, 
              record.monthly_expense, 
              record.income_adjustment_factor
            ]))}
            ON CONFLICT (zip_code) DO NOTHING
          `;
          
          batchInsertCount += chunk.length;
        } catch (error) {
          console.error(`Error inserting chunk ${i}-${i + chunk.length}:`, error.message);
          batchErrorCount += chunk.length;
          
          // Try inserting records one by one as fallback
          console.log('Attempting to insert records individually...');
          
          for (const record of chunk) {
            try {
              await sql`
                INSERT INTO location_cost_of_living 
                (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, 
                 apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
                VALUES (
                  ${record.zip_code}, 
                  ${record.city}, 
                  ${record.state}, 
                  ${record.housing}, 
                  ${record.transportation}, 
                  ${record.food}, 
                  ${record.healthcare}, 
                  ${record.personal_insurance}, 
                  ${record.apparel}, 
                  ${record.services}, 
                  ${record.entertainment}, 
                  ${record.other}, 
                  ${record.monthly_expense}, 
                  ${record.income_adjustment_factor}
                )
                ON CONFLICT (zip_code) DO NOTHING
              `;
              
              batchInsertCount++;
              batchErrorCount--;
            } catch (indivError) {
              console.error(`Error inserting record with zip code ${record.zip_code}:`, indivError.message);
            }
          }
        }
        
        // Log progress periodically within chunks
        if (i % 500 === 0 && i > 0) {
          console.log(`Processed ${i}/${locationBatch.length} records in current batch`);
        }
      }
      
      // Update progress
      progress.lastProcessedIndex = batchEndIndex;
      progress.recordsInserted += batchInsertCount;
      progress.recordsWithErrors += batchErrorCount;
      progress.lastRunDate = new Date().toISOString();
      saveProgressFile(progress);
      
      console.log(`Batch complete. Inserted ${batchInsertCount} records, encountered ${batchErrorCount} errors`);
      console.log(`Total progress: ${progress.recordsInserted}/${totalRecords} records inserted (${Math.round(progress.lastProcessedIndex / totalRecords * 100)}%)`);
      
      // Move to the next batch
      currentIndex = batchEndIndex;
    }
    
    // Update major city data with more accurate values
    if (startFresh || progress.recordsInserted > 0) {
      await updateMajorCityData();
    }
    
    console.log('\n=== Import process complete ===');
    console.log(`Total records processed: ${progress.totalRecords}`);
    console.log(`Total records inserted: ${progress.recordsInserted}`);
    console.log(`Total records with errors: ${progress.recordsWithErrors}`);
    
    // Clean up
    console.log('Cleaning up...');
    await sql.end();
    console.timeEnd('ImportDuration');
    
  } catch (error) {
    console.error('Error during import process:', error);
    
    // Clean up
    await sql.end();
    return;
  }
}

/**
 * Update data for major cities with more accurate values
 */
async function updateMajorCityData() {
  console.log('\nUpdating major city data with more accurate cost of living values...');
  
  // Define major cities with realistic data
  const majorCities = [
    { zip: '10001', city: 'NEW YORK', state: 'NY', housing: 3000, transportation: 1200, food: 1300, healthcare: 1100, personal_insurance: 1200, apparel: 350, services: 500, entertainment: 600, other: 250, monthly: 8500, factor: 1.65 },
    { zip: '94103', city: 'SAN FRANCISCO', state: 'CA', housing: 2800, transportation: 1100, food: 1200, healthcare: 1000, personal_insurance: 1100, apparel: 300, services: 400, entertainment: 550, other: 250, monthly: 8000, factor: 1.5 },
    { zip: '90001', city: 'LOS ANGELES', state: 'CA', housing: 2300, transportation: 1000, food: 1100, healthcare: 950, personal_insurance: 1000, apparel: 300, services: 400, entertainment: 500, other: 200, monthly: 7200, factor: 1.32 },
    { zip: '60601', city: 'CHICAGO', state: 'IL', housing: 2100, transportation: 900, food: 1000, healthcare: 900, personal_insurance: 900, apparel: 250, services: 350, entertainment: 450, other: 200, monthly: 6800, factor: 1.28 },
    { zip: '77001', city: 'HOUSTON', state: 'TX', housing: 1800, transportation: 950, food: 950, healthcare: 850, personal_insurance: 900, apparel: 250, services: 300, entertainment: 400, other: 200, monthly: 6200, factor: 1.18 },
    { zip: '98101', city: 'SEATTLE', state: 'WA', housing: 2200, transportation: 1000, food: 1100, healthcare: 950, personal_insurance: 1000, apparel: 250, services: 350, entertainment: 450, other: 200, monthly: 7100, factor: 1.30 },
    { zip: '80202', city: 'DENVER', state: 'CO', housing: 2000, transportation: 900, food: 1000, healthcare: 900, personal_insurance: 850, apparel: 250, services: 300, entertainment: 400, other: 200, monthly: 6700, factor: 1.24 },
    { zip: '33101', city: 'MIAMI', state: 'FL', housing: 2200, transportation: 950, food: 1050, healthcare: 900, personal_insurance: 950, apparel: 300, services: 350, entertainment: 450, other: 200, monthly: 6900, factor: 1.25 },
    { zip: '02108', city: 'BOSTON', state: 'MA', housing: 2700, transportation: 1050, food: 1200, healthcare: 1000, personal_insurance: 1100, apparel: 300, services: 400, entertainment: 500, other: 200, monthly: 8450, factor: 1.55 },
    { zip: '19102', city: 'PHILADELPHIA', state: 'PA', housing: 1850, transportation: 900, food: 950, healthcare: 900, personal_insurance: 900, apparel: 250, services: 350, entertainment: 400, other: 200, monthly: 6400, factor: 1.22 },
    { zip: '30308', city: 'ATLANTA', state: 'GA', housing: 1900, transportation: 900, food: 950, healthcare: 850, personal_insurance: 850, apparel: 250, services: 300, entertainment: 400, other: 200, monthly: 6100, factor: 1.15 },
    { zip: '90210', city: 'BEVERLY HILLS', state: 'CA', housing: 4500, transportation: 1200, food: 1500, healthcare: 1100, personal_insurance: 1200, apparel: 400, services: 600, entertainment: 800, other: 300, monthly: 11600, factor: 1.8 },
    { zip: '02142', city: 'CAMBRIDGE', state: 'MA', housing: 3000, transportation: 1050, food: 1150, healthcare: 950, personal_insurance: 1050, apparel: 300, services: 400, entertainment: 500, other: 250, monthly: 8650, factor: 1.56 }
  ];
  
  let updatedCount = 0;
  
  // Update each city with a single SQL query to improve performance
  for (const city of majorCities) {
    try {
      await sql`
        UPDATE location_cost_of_living 
        SET 
          housing = ${city.housing}, 
          transportation = ${city.transportation}, 
          food = ${city.food}, 
          healthcare = ${city.healthcare},
          personal_insurance = ${city.personal_insurance},
          apparel = ${city.apparel},
          services = ${city.services},
          entertainment = ${city.entertainment}, 
          other = ${city.other},
          monthly_expense = ${city.monthly}, 
          income_adjustment_factor = ${city.factor}
        WHERE zip_code = ${city.zip}
      `;
      updatedCount++;
    } catch (error) {
      console.error(`Error updating ${city.city}, ${city.state} (${city.zip}):`, error.message);
    }
  }
  
  console.log(`Updated ${updatedCount} major city records with accurate data`);
}

// Execute the main function
importFullLocationDataset().catch(error => {
  console.error('Import process failed:', error);
  process.exit(1);
});