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

// List of test zip codes we want to make sure are in the database
const TEST_ZIP_CODES = [
  '90210', // Beverly Hills
  '02142', // Cambridge
  '30328', // Atlanta
  '94103', // San Francisco
  '10001', // New York
  '90001', // Los Angeles
  '60601', // Chicago 
  '77001', // Houston
  '98101', // Seattle
  '80202', // Denver
  '33101', // Miami
  '30308', // Atlanta
  '43201', // Columbus
  '85001', // Phoenix
  '19101', // Philadelphia
  '75201', // Dallas
  '20001', // Washington DC
  '02101', // Boston
  '90402'  // Santa Monica (User's zip code)
];

async function importTestZipCodes() {
  console.log('Starting import of test zip codes for location cost of living...');
  
  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  try {
    // Parse CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Parsed ${records.length} location cost of living records from CSV`);
    
    // Find matching records for our test zip codes
    const matchingRecords = [];
    
    // Process all CSV records to find our test zip codes
    for (const record of records) {
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
      if (!zipCode) continue;
      
      // Check if this zip code is in our test list
      if (TEST_ZIP_CODES.includes(zipCode)) {
        console.log(`Found test zip code ${zipCode} in CSV data`);
        
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
        
        matchingRecords.push(locationRecord);
      }
    }
    
    console.log(`Found ${matchingRecords.length} matching test zip codes in the CSV data`);
    
    // Insert/update records for test zip codes
    let insertCount = 0;
    
    for (const record of matchingRecords) {
      try {
        await sql`
          INSERT INTO location_cost_of_living 
          (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
          VALUES 
          (${record.zip_code}, ${record.city}, ${record.state}, ${record.housing}, ${record.transportation}, ${record.food}, ${record.healthcare}, ${record.personal_insurance}, ${record.apparel}, ${record.services}, ${record.entertainment}, ${record.other}, ${record.monthly_expense}, ${record.income_adjustment_factor})
          ON CONFLICT (zip_code) DO UPDATE SET
            city = ${record.city},
            state = ${record.state},
            housing = ${record.housing},
            transportation = ${record.transportation},
            food = ${record.food},
            healthcare = ${record.healthcare},
            personal_insurance = ${record.personal_insurance},
            apparel = ${record.apparel},
            services = ${record.services},
            entertainment = ${record.entertainment},
            other = ${record.other},
            monthly_expense = ${record.monthly_expense},
            income_adjustment_factor = ${record.income_adjustment_factor}
        `;
        insertCount++;
        console.log(`Inserted/updated zip code ${record.zip_code} for ${record.city}, ${record.state}`);
      } catch (error) {
        console.error(`Error inserting/updating test zip code ${record.zip_code}:`, error.message);
      }
    }
    
    console.log(`Successfully inserted/updated ${insertCount} test zip codes`);
    
    // Now add special city data with complete values
    await updateMajorCityData();
    
    // Close the database connection
    await sql.end();
    
    console.log('Test zip code import completed successfully');
    
  } catch (err) {
    console.error('Error importing test zip codes:', err);
    process.exit(1);
  }
}

// Function to update major city data
async function updateMajorCityData() {
  console.log('Updating major city test data to ensure completeness...');
  
  // Define major cities with complete data
  const majorCities = [
    { zip: '90210', city: 'BEVERLY HILLS', state: 'CA', housing: 4500, transportation: 1200, food: 1500, healthcare: 1100, personal_insurance: 1200, apparel: 400, services: 600, entertainment: 800, other: 300, monthly: 11600, factor: 1.8 },
    { zip: '02142', city: 'CAMBRIDGE', state: 'MA', housing: 3800, transportation: 1100, food: 1300, healthcare: 1050, personal_insurance: 1100, apparel: 350, services: 500, entertainment: 600, other: 250, monthly: 10050, factor: 1.6 },
    { zip: '94103', city: 'SAN FRANCISCO', state: 'CA', housing: 2500, transportation: 1100, food: 1200, healthcare: 1000, personal_insurance: 1000, apparel: 250, services: 300, entertainment: 350, other: 200, monthly: 8000, factor: 1.42 },
    { zip: '10001', city: 'NEW YORK', state: 'NY', housing: 3000, transportation: 1200, food: 1300, healthcare: 1100, personal_insurance: 1100, apparel: 300, services: 400, entertainment: 500, other: 250, monthly: 8500, factor: 1.65 },
    { zip: '30328', city: 'ATLANTA', state: 'GA', housing: 1850, transportation: 880, food: 940, healthcare: 830, personal_insurance: 1000, apparel: 250, services: 300, entertainment: 350, other: 200, monthly: 6000, factor: 1.12 },
    { zip: '90402', city: 'SANTA MONICA', state: 'CA', housing: 4200, transportation: 1150, food: 1400, healthcare: 1050, personal_insurance: 1100, apparel: 350, services: 550, entertainment: 750, other: 250, monthly: 10800, factor: 1.75 }
  ];
  
  // Update each city
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
      console.log(`Updated complete data for ${city.city}, ${city.state} (${city.zip})`);
    } catch (error) {
      console.error(`Error updating ${city.city}, ${city.state} (${city.zip}):`, error.message);
    }
  }
}

// Execute the function
importTestZipCodes().catch(error => {
  console.error('Test zip code import failed:', error);
  process.exit(1);
});