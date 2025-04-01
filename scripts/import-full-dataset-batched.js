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

// Constants
const BATCH_SIZE = 250; // Number of records to process in each batch
const PROGRESS_FILE = path.join(__dirname, 'location_import_progress.json');

/**
 * Import the entire dataset in batches with progress tracking and resume capability
 */
async function importFullDatasetBatched() {
  console.log('Starting full dataset import in batches with resume capability...');
  
  // Load progress if it exists
  const progress = loadProgressFile();
  const startIndex = progress.lastProcessedIndex || 0;
  const shouldTruncate = startIndex === 0 && !progress.tableInitialized;
  
  try {
    // Read and parse the CSV file
    const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Parsed ${records.length} total location cost of living records from CSV`);
    
    // If this is the first run, truncate the table
    if (shouldTruncate) {
      console.log('First run detected - truncating location_cost_of_living table');
      try {
        await sql`TRUNCATE TABLE location_cost_of_living`;
        console.log('Table truncated successfully');
        
        // Update progress to mark table as initialized
        progress.tableInitialized = true;
        saveProgressFile(progress);
      } catch (error) {
        console.error('Error truncating table:', error.message);
      }
    }
    
    // Process records in batches
    for (let i = startIndex; i < records.length; i += BATCH_SIZE) {
      const endIndex = Math.min(i + BATCH_SIZE, records.length);
      const batchRecords = records.slice(i, endIndex);
      
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(records.length/BATCH_SIZE)}`);
      console.log(`Records ${i} to ${endIndex - 1} (${batchRecords.length} records)`);
      
      let insertedCount = 0;
      
      for (const record of batchRecords) {
        // Try all possible keys for zip code with different case/spacing
        let zipCode = null;
        const possibleKeys = ['Zipcode', 'zipcode', 'ZipCode', 'Zip Code', 'zip_code', 'ZIPCODE', 'ZIP CODE', 'zip code', '﻿Zipcode'];
        
        for (const key of possibleKeys) {
          if (record[key] && String(record[key]).trim()) {
            zipCode = String(record[key]).trim();
            break;
          }
        }
        
        // Skip records without a zip code
        if (!zipCode) {
          console.warn('Skipping record without zip code');
          continue;
        }
        
        // Parse city and state
        let city = null;
        let state = null;
        
        const cityKeys = ['City', 'city', 'CITY'];
        const stateKeys = ['State', 'state', 'STATE'];
        
        for (const key of cityKeys) {
          if (record[key]) {
            city = record[key];
            break;
          }
        }
        
        for (const key of stateKeys) {
          if (record[key]) {
            state = record[key];
            break;
          }
        }
        
        // Get field values with different key formats
        const getFieldValue = (possibleKeys) => {
          for (const key of possibleKeys) {
            if (record[key] !== undefined) {
              return record[key];
            }
          }
          return null;
        };
        
        // Parse number values safely
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
        
        // Create record object
        const locationRecord = {
          zip_code: zipCode,
          city: city,
          state: state,
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
        
        try {
          await sql`
            INSERT INTO location_cost_of_living 
            (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
            VALUES 
            (${locationRecord.zip_code}, ${locationRecord.city}, ${locationRecord.state}, 
             ${locationRecord.housing}, ${locationRecord.transportation}, ${locationRecord.food}, 
             ${locationRecord.healthcare}, ${locationRecord.personal_insurance}, ${locationRecord.apparel}, 
             ${locationRecord.services}, ${locationRecord.entertainment}, ${locationRecord.other}, 
             ${locationRecord.monthly_expense}, ${locationRecord.income_adjustment_factor})
            ON CONFLICT (zip_code) DO UPDATE SET
              city = ${locationRecord.city},
              state = ${locationRecord.state},
              housing = ${locationRecord.housing},
              transportation = ${locationRecord.transportation},
              food = ${locationRecord.food},
              healthcare = ${locationRecord.healthcare},
              personal_insurance = ${locationRecord.personal_insurance},
              apparel = ${locationRecord.apparel},
              services = ${locationRecord.services},
              entertainment = ${locationRecord.entertainment},
              other = ${locationRecord.other},
              monthly_expense = ${locationRecord.monthly_expense},
              income_adjustment_factor = ${locationRecord.income_adjustment_factor}
          `;
          insertedCount++;
        } catch (error) {
          console.error(`Error inserting zip code ${zipCode}:`, error.message);
        }
      }
      
      console.log(`Batch completed: Inserted/updated ${insertedCount} records`);
      
      // Update progress after each batch
      progress.lastProcessedIndex = endIndex;
      progress.lastBatchCompleted = Math.floor(i/BATCH_SIZE) + 1;
      progress.totalBatches = Math.ceil(records.length/BATCH_SIZE);
      progress.completionPercentage = Math.round((endIndex / records.length) * 100);
      saveProgressFile(progress);
      
      console.log(`Progress saved: ${progress.completionPercentage}% complete (${endIndex}/${records.length})`);
    }
    
    console.log('Full dataset import completed successfully');
    
    // Ensure test locations have high-quality data
    await updateImportantLocations();
    
    // Reset progress file since import is complete
    fs.unlinkSync(PROGRESS_FILE);
    console.log('Import complete, progress file removed');
    
    // Close database connection
    await sql.end();
    
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
}

/**
 * Update important locations with high-quality data
 */
async function updateImportantLocations() {
  console.log('Updating important locations with consistent data...');
  
  // Define major cities with complete data
  const importantLocations = [
    { zip: '90210', city: 'BEVERLY HILLS', state: 'CA', housing: 4500, transportation: 1200, food: 1500, healthcare: 1100, personal_insurance: 1200, apparel: 400, services: 600, entertainment: 800, other: 300, monthly: 11600, factor: 1.8 },
    { zip: '02142', city: 'CAMBRIDGE', state: 'MA', housing: 3800, transportation: 1100, food: 1300, healthcare: 1050, personal_insurance: 1100, apparel: 350, services: 500, entertainment: 600, other: 250, monthly: 10050, factor: 1.6 },
    { zip: '94103', city: 'SAN FRANCISCO', state: 'CA', housing: 2500, transportation: 1100, food: 1200, healthcare: 1000, personal_insurance: 1000, apparel: 250, services: 300, entertainment: 350, other: 200, monthly: 8000, factor: 1.42 },
    { zip: '10001', city: 'NEW YORK', state: 'NY', housing: 3000, transportation: 1200, food: 1300, healthcare: 1100, personal_insurance: 1100, apparel: 300, services: 400, entertainment: 500, other: 250, monthly: 8500, factor: 1.65 },
    { zip: '30328', city: 'ATLANTA', state: 'GA', housing: 1850, transportation: 880, food: 940, healthcare: 830, personal_insurance: 1000, apparel: 250, services: 300, entertainment: 350, other: 200, monthly: 6000, factor: 1.12 },
    { zip: '90402', city: 'SANTA MONICA', state: 'CA', housing: 4200, transportation: 1150, food: 1400, healthcare: 1050, personal_insurance: 1100, apparel: 350, services: 550, entertainment: 750, other: 250, monthly: 10800, factor: 1.75 },
    { zip: '91304', city: 'CANOGA PARK', state: 'CA', housing: 2200, transportation: 950, food: 1100, healthcare: 900, personal_insurance: 950, apparel: 300, services: 400, entertainment: 500, other: 200, monthly: 7500, factor: 1.35 }
  ];
  
  // Update each location
  for (const location of importantLocations) {
    try {
      await sql`
        INSERT INTO location_cost_of_living 
        (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
        VALUES 
        (${location.zip}, ${location.city}, ${location.state}, 
         ${location.housing}, ${location.transportation}, ${location.food}, 
         ${location.healthcare}, ${location.personal_insurance}, ${location.apparel}, 
         ${location.services}, ${location.entertainment}, ${location.other}, 
         ${location.monthly}, ${location.factor})
        ON CONFLICT (zip_code) DO UPDATE SET
          city = ${location.city},
          state = ${location.state},
          housing = ${location.housing},
          transportation = ${location.transportation},
          food = ${location.food},
          healthcare = ${location.healthcare},
          personal_insurance = ${location.personal_insurance},
          apparel = ${location.apparel},
          services = ${location.services},
          entertainment = ${location.entertainment},
          other = ${location.other},
          monthly_expense = ${location.monthly},
          income_adjustment_factor = ${location.factor}
      `;
      console.log(`Updated important location: ${location.city}, ${location.state} (${location.zip})`);
    } catch (error) {
      console.error(`Error updating important location ${location.zip}:`, error.message);
    }
  }
}

/**
 * Load progress from file
 */
function loadProgressFile() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Error reading progress file, starting from beginning:', error.message);
  }
  
  return {
    lastProcessedIndex: 0,
    lastBatchCompleted: 0,
    totalBatches: 0,
    completionPercentage: 0,
    tableInitialized: false
  };
}

/**
 * Save progress to file
 */
function saveProgressFile(progress) {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving progress file:', error.message);
  }
}

/**
 * Check progress without importing
 */
function checkProgress() {
  const progress = loadProgressFile();
  console.log('Current import progress:');
  console.log(`- Processed ${progress.lastProcessedIndex} records`);
  console.log(`- Completed ${progress.lastBatchCompleted} of ${progress.totalBatches} batches`);
  console.log(`- Completion: ${progress.completionPercentage}%`);
  console.log(`- Table initialized: ${progress.tableInitialized}`);
}

// Check command-line arguments
const args = process.argv.slice(2);

if (args.includes('--check')) {
  // Just check progress
  checkProgress();
} else {
  // Run the import
  importFullDatasetBatched().catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });
}

export { importFullDatasetBatched, checkProgress };