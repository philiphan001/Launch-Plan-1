import postgres from 'postgres';

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

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
  
  let insertedCount = 0;
  let updatedCount = 0;
  
  for (const city of majorCities) {
    try {
      // Check if city exists
      const existingCities = await sql`
        SELECT id FROM location_cost_of_living WHERE zip_code = ${city.zip}
      `;
      
      if (existingCities.length > 0) {
        // Update existing record
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
        console.log(`Updated ${city.city}, ${city.state} (${city.zip})`);
      } else {
        // Insert new record
        await sql`
          INSERT INTO location_cost_of_living 
          (zip_code, city, state, housing, transportation, food, healthcare, personal_insurance, 
           apparel, services, entertainment, other, monthly_expense, income_adjustment_factor)
          VALUES (
            ${city.zip}, 
            ${city.city}, 
            ${city.state}, 
            ${city.housing}, 
            ${city.transportation}, 
            ${city.food}, 
            ${city.healthcare}, 
            ${city.personal_insurance}, 
            ${city.apparel}, 
            ${city.services}, 
            ${city.entertainment}, 
            ${city.other}, 
            ${city.monthly}, 
            ${city.factor}
          )
        `;
        insertedCount++;
        console.log(`Inserted ${city.city}, ${city.state} (${city.zip})`);
      }
    } catch (error) {
      console.error(`Error processing ${city.city}, ${city.state} (${city.zip}):`, error.message);
    }
  }
  
  console.log(`Updated ${updatedCount} major city records and inserted ${insertedCount} new major city records`);
  
  // Clean up
  await sql.end();
}

// Execute the main function
updateMajorCityData().catch(error => {
  console.error('Major city update failed:', error);
  process.exit(1);
});