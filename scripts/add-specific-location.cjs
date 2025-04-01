const postgres = require('postgres');

/**
 * Utility script to add a specific location to the database
 * 
 * Usage: node add-specific-location.cjs <zip_code> <city> <state> <housing> <transportation> <food> <healthcare> <income_adjustment_factor>
 * Example: node add-specific-location.cjs 90210 "BEVERLY HILLS" CA 3800 800 900 500 1.5
 */
async function addSpecificLocation() {
  try {
    // Create a Postgres client with the database connection string
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const sql = postgres(databaseUrl);
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 8) {
      console.error('Usage: node add-specific-location.cjs <zip_code> <city> <state> <housing> <transportation> <food> <healthcare> <income_adjustment_factor>');
      process.exit(1);
    }
    
    const [
      zipCode,
      city,
      state,
      housing,
      transportation,
      food,
      healthcare,
      incomeAdjustmentFactor
    ] = args;
    
    // Check if this zip code already exists
    const existingRecord = await sql`
      SELECT * FROM location_cost_of_living
      WHERE zip_code = ${zipCode}
    `;
    
    if (existingRecord.length > 0) {
      console.log(`Location with zip code ${zipCode} already exists in database. Updating data...`);
      
      // Update record
      await sql`
        UPDATE location_cost_of_living
        SET 
          city = ${city},
          state = ${state},
          housing = ${parseFloat(housing)},
          transportation = ${parseFloat(transportation)},
          food = ${parseFloat(food)},
          healthcare = ${parseFloat(healthcare)},
          income_adjustment_factor = ${parseFloat(incomeAdjustmentFactor)}
        WHERE zip_code = ${zipCode}
      `;
      
      console.log(`Successfully updated location data for ${zipCode} (${city}, ${state})`);
    } else {
      // Insert new record
      await sql`
        INSERT INTO location_cost_of_living 
        (zip_code, city, state, housing, transportation, food, healthcare, income_adjustment_factor)
        VALUES (
          ${zipCode}, 
          ${city}, 
          ${state}, 
          ${parseFloat(housing)}, 
          ${parseFloat(transportation)}, 
          ${parseFloat(food)}, 
          ${parseFloat(healthcare)}, 
          ${parseFloat(incomeAdjustmentFactor)}
        )
      `;
      
      console.log(`Successfully added new location data for ${zipCode} (${city}, ${state})`);
    }
    
    // Show the current data
    console.log('\nCurrent data in database:');
    const currentData = await sql`
      SELECT * FROM location_cost_of_living
      WHERE zip_code = ${zipCode}
    `;
    
    if (currentData.length > 0) {
      const location = currentData[0];
      console.log(`Location: ${location.city}, ${location.state} (${location.zip_code})`);
      console.log(`  Housing: $${location.housing}`);
      console.log(`  Transportation: $${location.transportation}`);
      console.log(`  Food: $${location.food}`);
      console.log(`  Healthcare: $${location.healthcare}`);
      console.log(`  Income Adjustment Factor: ${location.income_adjustment_factor}`);
    }
    
    // Close the connection
    await sql.end();
    
  } catch (error) {
    console.error('Error adding location data:', error);
    process.exit(1);
  }
}

// Run the addition
addSpecificLocation().catch(error => {
  console.error('Failed to add location:', error);
  process.exit(1);
});