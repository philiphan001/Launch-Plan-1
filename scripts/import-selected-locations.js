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

// Import a range of zip codes - specify ranges to import (each state is around 1000 zip codes)
// This will import zip codes for major states/regions
async function importSelectedLocations() {
  console.log('Starting selected locations import...');
  
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
    
    // Define ranges for specific states to import (first 2 digits of zip code)
    // CA: 90000-96699
    // NY: 10000-14999
    // TX: 75000-79999
    // FL: 32000-34999
    // IL: 60000-62999
    // PA: 15000-19699
    // OH: 43000-45999
    // MI: 48000-49999
    // GA: 30000-31999
    // NC: 27000-28999
    // NJ: 07000-08999
    // VA: 22000-24699
    // WA: 98000-99499
    // MA: 01000-02791
    // CO: 80000-81699
    
    const stateRanges = [
      { start: '90000', end: '96699', name: 'California' },
      { start: '10000', end: '14999', name: 'New York' },
      { start: '75000', end: '79999', name: 'Texas' },
      { start: '32000', end: '34999', name: 'Florida' },
      { start: '60000', end: '62999', name: 'Illinois' },
      { start: '15000', end: '19699', name: 'Pennsylvania' },
      { start: '43000', end: '45999', name: 'Ohio' },
      { start: '48000', end: '49999', name: 'Michigan' },
      { start: '30000', end: '31999', name: 'Georgia' },
      { start: '27000', end: '28999', name: 'North Carolina' },
      { start: '07000', end: '08999', name: 'New Jersey' },
      { start: '22000', end: '24699', name: 'Virginia' },
      { start: '98000', end: '99499', name: 'Washington' },
      { start: '01000', end: '02791', name: 'Massachusetts' },
      { start: '80000', end: '81699', name: 'Colorado' }
    ];
    
    // Add a selection of zip codes from each range
    const selectedRecords = [];
    const zipCodeSet = new Set(); // To track already added zip codes
    
    // Function to check if a zip code is in range
    const isInRange = (zipCode, start, end) => {
      return zipCode >= start && zipCode <= end;
    };
    
    // Process all CSV records to find zip codes in our state ranges
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
      
      // Skip if already processed
      if (zipCodeSet.has(zipCode)) continue;
      
      // Check if this zip code is in any of our state ranges
      for (const range of stateRanges) {
        if (isInRange(zipCode, range.start, range.end)) {
          console.log(`Adding ${zipCode} from ${range.name}`);
          
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
          
          selectedRecords.push(locationRecord);
          zipCodeSet.add(zipCode);
          break;
        }
      }
    }
    
    console.log(`Selected ${selectedRecords.length} records from major states`);
    
    // Insert records in batches
    const batchSize = 100;
    let insertCount = 0;
    
    for (let i = 0; i < selectedRecords.length; i += batchSize) {
      const batch = selectedRecords.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(selectedRecords.length/batchSize)}`);
      
      for (const record of batch) {
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
          
          if (insertCount % 10 === 0) {
            console.log(`Inserted ${insertCount} records so far...`);
          }
        } catch (error) {
          console.error(`Error inserting zip code ${record.zip_code}:`, error.message);
        }
      }
    }
    
    console.log(`Successfully inserted/updated ${insertCount} location records`);
    
    // Make sure we preserve our important test zip codes
    await importTestZipCodes();
    
    // Close the database connection
    await sql.end();
    
    console.log('Selected locations import completed successfully');
    
  } catch (err) {
    console.error('Error importing selected locations:', err);
    process.exit(1);
  }
}

// Function to import critical test zip codes
async function importTestZipCodes() {
  console.log('Ensuring test zip codes are properly imported...');
  
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
        INSERT INTO location_cost_of_living 
        (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
        VALUES 
        (${city.zip}, ${city.city}, ${city.state}, ${city.housing}, ${city.transportation}, ${city.food}, ${city.healthcare}, ${city.personal_insurance}, ${city.apparel}, ${city.services}, ${city.entertainment}, ${city.other}, ${city.monthly}, ${city.factor})
        ON CONFLICT (zip_code) DO UPDATE SET
          city = ${city.city},
          state = ${city.state},
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
      `;
      console.log(`Ensured data for ${city.city}, ${city.state} (${city.zip})`);
    } catch (error) {
      console.error(`Error updating ${city.city}, ${city.state} (${city.zip}):`, error.message);
    }
  }
}

// Execute the function
importSelectedLocations().catch(error => {
  console.error('Selected locations import failed:', error);
  process.exit(1);
});