import fs from 'fs';
import { parse } from 'csv-parse/sync';
import postgres from 'postgres';

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

// Define sample major city zip codes to update with cost of living data
const MAJOR_CITIES = [
  { zip: '94103', city: 'SAN FRANCISCO', state: 'CA', housing: 2500, transportation: 1100, food: 1200, healthcare: 1000, monthly: 8000, factor: 1.42 },
  { zip: '10001', city: 'NEW YORK', state: 'NY', housing: 3000, transportation: 1200, food: 1300, healthcare: 1100, monthly: 8500, factor: 1.65 },
  { zip: '90001', city: 'LOS ANGELES', state: 'CA', housing: 2300, transportation: 1000, food: 1100, healthcare: 950, monthly: 7200, factor: 1.32 },
  { zip: '60601', city: 'CHICAGO', state: 'IL', housing: 2100, transportation: 900, food: 1000, healthcare: 900, monthly: 6800, factor: 1.28 },
  { zip: '77001', city: 'HOUSTON', state: 'TX', housing: 1800, transportation: 950, food: 950, healthcare: 850, monthly: 6200, factor: 1.18 },
  { zip: '98101', city: 'SEATTLE', state: 'WA', housing: 2200, transportation: 1000, food: 1100, healthcare: 950, monthly: 7100, factor: 1.30 },
  { zip: '80202', city: 'DENVER', state: 'CO', housing: 2000, transportation: 900, food: 1000, healthcare: 900, monthly: 6700, factor: 1.24 },
  { zip: '33101', city: 'MIAMI', state: 'FL', housing: 2200, transportation: 950, food: 1050, healthcare: 900, monthly: 6900, factor: 1.25 },
  { zip: '30308', city: 'ATLANTA', state: 'GA', housing: 1900, transportation: 900, food: 950, healthcare: 850, monthly: 6100, factor: 1.15 },
  { zip: '30328', city: 'ATLANTA', state: 'GA', housing: 1850, transportation: 880, food: 940, healthcare: 830, monthly: 6000, factor: 1.12 },
  { zip: '43201', city: 'COLUMBUS', state: 'OH', housing: 1700, transportation: 850, food: 900, healthcare: 800, monthly: 5800, factor: 1.05 },
  { zip: '85001', city: 'PHOENIX', state: 'AZ', housing: 1750, transportation: 900, food: 900, healthcare: 800, monthly: 5850, factor: 1.08 },
  { zip: '19101', city: 'PHILADELPHIA', state: 'PA', housing: 1800, transportation: 900, food: 950, healthcare: 850, monthly: 5900, factor: 1.10 },
  { zip: '75201', city: 'DALLAS', state: 'TX', housing: 1850, transportation: 950, food: 900, healthcare: 850, monthly: 5950, factor: 1.12 },
  { zip: '20001', city: 'WASHINGTON', state: 'DC', housing: 2400, transportation: 1050, food: 1100, healthcare: 950, monthly: 7200, factor: 1.35 },
  { zip: '02101', city: 'BOSTON', state: 'MA', housing: 2300, transportation: 1000, food: 1100, healthcare: 900, monthly: 7000, factor: 1.30 }
];

async function testLocationImport() {
  console.log('Starting test location import...');
  
  try {
    // First, check if the table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'location_cost_of_living'
      );
    `;
    
    const tableExists = tableCheck[0]?.exists || false;
    
    if (!tableExists) {
      console.log('Creating location_cost_of_living table...');
      
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS location_cost_of_living (
          id SERIAL PRIMARY KEY,
          zip_code TEXT NOT NULL UNIQUE,
          city TEXT,
          state TEXT,
          housing INTEGER,
          transportation INTEGER,
          food INTEGER,
          healthcare INTEGER,
          personal_insurance INTEGER,
          apparel INTEGER,
          services INTEGER,
          entertainment INTEGER,
          other INTEGER,
          monthly_expense INTEGER,
          income_adjustment_factor REAL DEFAULT 1.0,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `;
      console.log('Table created successfully');
    } else {
      console.log('Table location_cost_of_living already exists');
      
      // Truncate the table to remove existing data
      await sql`TRUNCATE TABLE location_cost_of_living RESTART IDENTITY CASCADE`;
      console.log('Truncated existing location_cost_of_living table');
    }
    
    let insertCount = 0;
    
    // Insert major city records
    for (const city of MAJOR_CITIES) {
      try {
        await sql`
          INSERT INTO location_cost_of_living 
          (zip_code, city, state, housing, transportation, food, healthcare, monthly_expense, income_adjustment_factor)
          VALUES 
          (${city.zip}, ${city.city}, ${city.state}, ${city.housing}, ${city.transportation}, ${city.food}, ${city.healthcare}, ${city.monthly}, ${city.factor})
          ON CONFLICT (zip_code) DO UPDATE SET
            housing = ${city.housing},
            transportation = ${city.transportation},
            food = ${city.food},
            healthcare = ${city.healthcare},
            monthly_expense = ${city.monthly},
            income_adjustment_factor = ${city.factor}
        `;
        insertCount++;
        console.log(`Inserted data for ${city.city}, ${city.state} (${city.zip})`);
      } catch (error) {
        console.error(`Error inserting ${city.city}: ${error.message}`);
      }
    }
    
    console.log(`Test location import completed successfully. Total cities: ${insertCount}`);
    
    // Close the database connection
    await sql.end();
    
  } catch (error) {
    console.error('Error in test location import:', error);
    process.exit(1);
  }
}

// Execute the function
testLocationImport().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});