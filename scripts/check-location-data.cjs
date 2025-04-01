const postgres = require('postgres');

/**
 * Utility script to check the location data in the database
 * and verify if a given zip code exists.
 */
async function checkLocationData() {
  try {
    // Create a Postgres client with the database connection string
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const sql = postgres(databaseUrl);
    
    // Count records
    const countResult = await sql`SELECT COUNT(*) FROM location_cost_of_living`;
    const totalCount = parseInt(countResult[0]?.count || "0");
    
    console.log(`Total records in location_cost_of_living: ${totalCount}`);
    
    // Get sample records for different cities
    const sampleZipCodes = ['10001', '90402', '02108', '60601', '94102', '20001'];
    console.log(`Checking data for sample zip codes: ${sampleZipCodes.join(', ')}`);
    
    for (const zipCode of sampleZipCodes) {
      const locationData = await sql`
        SELECT * FROM location_cost_of_living
        WHERE zip_code = ${zipCode}
      `;
      
      if (locationData.length > 0) {
        const location = locationData[0];
        console.log(`Found data for ${zipCode} (${location.city}, ${location.state}):`);
        console.log(`  Housing: $${location.housing}`);
        console.log(`  Transportation: $${location.transportation}`);
        console.log(`  Food: $${location.food}`);
        console.log(`  Healthcare: $${location.healthcare}`);
        console.log(`  Income Adjustment Factor: ${location.income_adjustment_factor}`);
      } else {
        console.log(`No data found for zip code ${zipCode}`);
      }
    }
    
    // Allow checking a specific zip code from command line
    const args = process.argv.slice(2);
    if (args.length > 0) {
      const zipToCheck = args[0];
      console.log(`\nChecking data for requested zip code: ${zipToCheck}`);
      
      const requestedData = await sql`
        SELECT * FROM location_cost_of_living
        WHERE zip_code = ${zipToCheck}
      `;
      
      if (requestedData.length > 0) {
        const location = requestedData[0];
        console.log(`Found data for ${zipToCheck} (${location.city}, ${location.state}):`);
        console.log(`  Housing: $${location.housing}`);
        console.log(`  Transportation: $${location.transportation}`);
        console.log(`  Food: $${location.food}`);
        console.log(`  Healthcare: $${location.healthcare}`);
        console.log(`  Income Adjustment Factor: ${location.income_adjustment_factor}`);
      } else {
        console.log(`No data found for zip code ${zipToCheck}`);
      }
    }
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.error('Error checking location data:', error);
    process.exit(1);
  }
}

// Run the check
checkLocationData().catch(error => {
  console.error('Check failed:', error);
  process.exit(1);
});