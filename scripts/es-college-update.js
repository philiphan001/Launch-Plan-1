// Import the required modules
import fs from 'fs';
import { parse } from 'csv-parse';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

// Main function
async function updateColleges() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Get all colleges from the database for ID lookup
    const { rows: colleges } = await client.query('SELECT id, name FROM colleges');
    console.log(`Found ${colleges.length} colleges in database`);

    // Create a map for quick ID lookup
    const collegeMap = new Map();
    for (const college of colleges) {
      collegeMap.set(college.id, college);
    }

    // Read and parse the CSV file
    const csvPath = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
    const records = [];

    // Create parser
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        delimiter: ',',
      })
    );

    // Process each record
    for await (const record of parser) {
      if (record.id) {
        records.push(record);
      }
    }
    
    console.log(`Processed ${records.length} records from CSV file`);

    // Sample record
    if (records.length > 0) {
      console.log('Sample CSV record:', JSON.stringify(records[0].id), records[0].name);
    }

    // Counter for matches and updates
    let matchCount = 0;
    let updateCount = 0;
    const updatedCollegeIds = new Set();

    // Process records and update matching colleges
    for (const record of records) {
      const csvId = parseInt(record.id);
      
      if (isNaN(csvId)) {
        continue;
      }
      
      // Find matching college in our database by ID
      const college = collegeMap.get(csvId);
      
      if (college) {
        matchCount++;
        
        // Skip if we've already updated this college
        if (updatedCollegeIds.has(college.id)) {
          console.log(`Skipping duplicate match for ${record.name} (ID: ${college.id})`);
          continue;
        }
        
        // Add to our set of updated college IDs
        updatedCollegeIds.add(college.id);
        
        try {
          // Extract the column values we want
          const degreePredominant = record["degrees_awarded.predominant"] ? 
            parseInt(record["degrees_awarded.predominant"]) : null;
            
          const degreeHighest = record["degrees_awarded.highest"] ? 
            parseInt(record["degrees_awarded.highest"]) : null;
            
          const admissionRate = record["admission_rate.overall"] ? 
            parseFloat(record["admission_rate.overall"]) : null;
            
          const satAverage = record["sat_scores.average.overall"] ? 
            parseInt(record["sat_scores.average.overall"]) : null;
            
          const pellGrantRate = record["pell_grant_rate"] ? 
            parseFloat(record["pell_grant_rate"]) : null;
            
          const completionRate4yr = record["completion_rate_4yr_150nt"] ? 
            parseFloat(record["completion_rate_4yr_150nt"]) : null;
            
          const medianDebtCompleters = record["median_debt.completers.overall"] ? 
            parseInt(record["median_debt.completers.overall"]) : null;
            
          const medianDebtNoncompleters = record["median_debt.noncompleters"] ? 
            parseInt(record["median_debt.noncompleters"]) : null;
            
          const medianFamilyIncome = record["demographics.median_family_income"] ? 
            parseFloat(record["demographics.median_family_income"]) : null;
            
          const medianEarnings10yr = record["10_yrs_after_entry.median"] ? 
            parseInt(record["10_yrs_after_entry.median"]) : null;
          
          // Update the college in the database
          const updateQuery = `
            UPDATE colleges 
            SET 
              degrees_awarded_predominant = $1,
              degrees_awarded_highest = $2,
              admission_rate_overall = $3,
              sat_scores_average_overall = $4,
              pell_grant_rate = $5,
              completion_rate_4yr_150nt = $6,
              median_debt_completers_overall = $7,
              median_debt_noncompleters = $8,
              demographics_median_family_income = $9,
              median_earnings_10yrs_after_entry = $10
            WHERE 
              id = $11
          `;
          
          const values = [
            degreePredominant,
            degreeHighest,
            admissionRate,
            satAverage,
            pellGrantRate,
            completionRate4yr,
            medianDebtCompleters,
            medianDebtNoncompleters,
            medianFamilyIncome,
            medianEarnings10yr,
            college.id
          ];
          
          await client.query(updateQuery, values);
          updateCount++;
          
          if (updateCount % 100 === 0) {
            console.log(`Updated ${updateCount} colleges so far...`);
          }
        } catch (err) {
          console.error(`Error updating college ${record.name} (ID: ${csvId}):`, err);
        }
      }
    }

    // Generate a report on the degrees_awarded_predominant values
    const { rows: degreesReport } = await client.query(`
      SELECT 
        degrees_awarded_predominant,
        COUNT(*) as count
      FROM 
        colleges
      GROUP BY 
        degrees_awarded_predominant
      ORDER BY 
        degrees_awarded_predominant
    `);

    console.log("Degrees awarded predominant distribution:");
    console.table(degreesReport);
    
    console.log(`Matched ${matchCount} colleges from the CSV file`);
    console.log(`Successfully updated ${updateCount} colleges with extended data`);

    // Create indexes for better performance
    console.log("Creating indexes on new columns...");
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_degree_predominant ON colleges (degrees_awarded_predominant)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_admission_rate ON colleges (admission_rate_overall)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_sat_scores ON colleges (sat_scores_average_overall)');
      console.log("Indexes created successfully");
    } catch (err) {
      console.error("Error creating indexes:", err);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the main function
updateColleges()
  .then(() => console.log('Done'))
  .catch(err => console.error('Fatal error:', err));