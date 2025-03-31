import postgres from 'postgres';

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function updateLocationZipCodes() {
  console.log('Starting location and zip code updates...');
  
  try {
    // 1. Update users with random zip codes from our database for testing
    console.log('Updating users with sample zip codes...');
    
    // Get a list of real zip codes from our database for the SF area
    const zipCodes = await sql`
      SELECT zip_code FROM location_cost_of_living 
      WHERE zip_code = '94103' OR zip_code LIKE '941%' 
      LIMIT 10
    `;
    
    if (zipCodes.length === 0) {
      console.log('No valid zip codes found, using default "94103"');
      // Use SF as fallback
      await sql`
        UPDATE users
        SET zip_code = '94103'
        WHERE zip_code IS NULL OR zip_code = ''
      `;
    } else {
      // For simplicity in this test script, set all null zip codes to San Francisco
      await sql`
        UPDATE users
        SET zip_code = '94103'
        WHERE zip_code IS NULL OR zip_code = ''
      `;
      console.log('Updated users with San Francisco zip code (94103)');
    }
    
    // 2. Update existing career calculations to set the adjusted_for_location flag
    console.log('Updating career calculations for location adjustments...');
    
    // Find career calculations that don't have location adjustments set
    const calculations = await sql`
      SELECT cc.id, u.zip_code, c.salary
      FROM career_calculations cc
      JOIN users u ON cc.user_id = u.id
      JOIN careers c ON cc.career_id = c.id
      WHERE cc.adjusted_for_location IS NULL OR cc.adjusted_for_location = false
    `;
    
    console.log(`Found ${calculations.length} career calculations to update with location data`);
    
    // Update each calculation with location-adjusted salary
    for (const calc of calculations) {
      if (!calc.zip_code) {
        console.log(`Skipping calculation ${calc.id} - user has no zip code`);
        continue;
      }
      
      // Get cost of living data for the user's location
      const [coli] = await sql`
        SELECT * FROM location_cost_of_living
        WHERE zip_code = ${calc.zip_code}
      `;
      
      if (!coli) {
        console.log(`No cost of living data for zip code ${calc.zip_code}, skipping`);
        continue;
      }
      
      // Adjust the projected salary based on the location's income adjustment factor
      const baseSalary = calc.salary || 50000; // Default if salary is null
      const adjustmentFactor = coli.income_adjustment_factor || 1.0;
      const adjustedSalary = Math.round(baseSalary * adjustmentFactor);
      
      console.log(`Calculation ${calc.id}: Adjusting salary ${baseSalary} with factor ${adjustmentFactor} = ${adjustedSalary}`);
      
      // Update the career calculation
      await sql`
        UPDATE career_calculations
        SET 
          projected_salary = ${adjustedSalary},
          entry_level_salary = ${Math.round(adjustedSalary * 0.7)},
          adjusted_for_location = true
        WHERE id = ${calc.id}
      `;
    }
    
    console.log('Location and zip code updates completed successfully');
    
  } catch (error) {
    console.error('Error updating location data:', error);
  } finally {
    await sql.end();
  }
}

// Execute the function
updateLocationZipCodes().catch(error => {
  console.error('Update failed:', error);
  process.exit(1);
});