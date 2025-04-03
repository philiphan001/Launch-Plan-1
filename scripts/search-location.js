import postgres from 'postgres';

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

/**
 * Display location information in a formatted way
 */
function displayLocation(location) {
  console.log(`\nLocation Information for ${location.city}, ${location.state} (${location.zip_code}):`);
  console.log('-'.repeat(60));
  console.log(`Monthly Expenses: $${location.monthly_expense}`);
  console.log(`Income Adjustment Factor: ${location.income_adjustment_factor}`);
  console.log('\nExpense Breakdown:');
  console.log(`  Housing: $${location.housing} (${Math.round(location.housing / location.monthly_expense * 100)}%)`);
  console.log(`  Transportation: $${location.transportation} (${Math.round(location.transportation / location.monthly_expense * 100)}%)`);
  console.log(`  Food: $${location.food} (${Math.round(location.food / location.monthly_expense * 100)}%)`);
  console.log(`  Healthcare: $${location.healthcare} (${Math.round(location.healthcare / location.monthly_expense * 100)}%)`);
  console.log(`  Personal Insurance: $${location.personal_insurance} (${Math.round(location.personal_insurance / location.monthly_expense * 100)}%)`);
  console.log(`  Apparel: $${location.apparel} (${Math.round(location.apparel / location.monthly_expense * 100)}%)`);
  console.log(`  Services: $${location.services} (${Math.round(location.services / location.monthly_expense * 100)}%)`);
  console.log(`  Entertainment: $${location.entertainment} (${Math.round(location.entertainment / location.monthly_expense * 100)}%)`);
  console.log(`  Other: $${location.other} (${Math.round(location.other / location.monthly_expense * 100)}%)`);
}

async function searchLocation() {
  try {
    const args = process.argv.slice(2);
    
    // Check if args are provided
    if (args.length === 0) {
      console.error('Please provide search criteria');
      console.log('Usage:');
      console.log('  Search by zip code: node scripts/search-location.js 90210');
      console.log('  Search by city/state: node scripts/search-location.js -c "San Francisco" -s CA');
      process.exit(1);
    }
    
    let locations = [];
    
    // Determine search type
    if (args[0] === '-c' || args[0] === '--city') {
      // Search by city and optionally state
      const cityIndex = args.indexOf('-c') !== -1 ? args.indexOf('-c') : args.indexOf('--city');
      const stateIndex = args.indexOf('-s') !== -1 ? args.indexOf('-s') : args.indexOf('--state');
      
      if (cityIndex === -1 || cityIndex + 1 >= args.length) {
        console.error('City name is required for city search');
        process.exit(1);
      }
      
      const city = args[cityIndex + 1].toUpperCase();
      let state = null;
      
      if (stateIndex !== -1 && stateIndex + 1 < args.length) {
        state = args[stateIndex + 1].toUpperCase();
      }
      
      console.log(`Searching for ${city}${state ? ', ' + state : ''}...`);
      
      if (state) {
        locations = await sql`
          SELECT * FROM location_cost_of_living 
          WHERE UPPER(city) = ${city} AND UPPER(state) = ${state}
          ORDER BY zip_code
        `;
      } else {
        locations = await sql`
          SELECT * FROM location_cost_of_living 
          WHERE UPPER(city) = ${city}
          ORDER BY zip_code
        `;
      }
    } else {
      // Search by zip code
      const zipCode = args[0];
      
      console.log(`Searching for zip code ${zipCode}...`);
      
      locations = await sql`
        SELECT * FROM location_cost_of_living 
        WHERE zip_code = ${zipCode}
      `;
    }
    
    if (locations.length === 0) {
      console.log(`No locations found matching your search criteria`);
    } else if (locations.length === 1) {
      displayLocation(locations[0]);
    } else {
      console.log(`\nFound ${locations.length} locations matching your search criteria:`);
      console.log('-'.repeat(60));
      
      for (const location of locations) {
        console.log(`${location.city}, ${location.state} (${location.zip_code}) - $${location.monthly_expense}/mo`);
      }
      
      console.log('\nFor detailed information, search by specific zip code');
    }
    
    // Clean up
    await sql.end();
  } catch (error) {
    console.error('Error searching for location:', error.message);
    process.exit(1);
  }
}

// Execute the main function
searchLocation().catch(error => {
  console.error('Search failed:', error);
  process.exit(1);
});