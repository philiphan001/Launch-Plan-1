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

// Function to normalize college names for better matching
function normalizeCollegeName(name) {
  if (!name) return '';
  
  return name.toLowerCase()
    .replace(/\buniversity\b/g, 'univ')
    .replace(/\bcollege\b/g, 'coll')
    .replace(/\binstitute\b/g, 'inst')
    .replace(/\b(of|and|&|the)\b/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function for safe number parsing
function safeParseInt(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

function safeParseFloat(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Main function
async function updateColleges() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Get all colleges from the database
    const { rows: colleges } = await client.query('SELECT id, name, state FROM colleges');
    console.log(`Found ${colleges.length} colleges in database`);

    // Create maps for quick lookup by normalized name
    const collegeNameMap = new Map();
    const collegeNameStateMap = new Map(); // For more precise matching with state
    
    for (const college of colleges) {
      const normalizedName = normalizeCollegeName(college.name);
      collegeNameMap.set(normalizedName, college);
      
      // Also create name+state keys for more accurate matching
      if (college.state) {
        const nameStateKey = `${normalizedName}|${college.state.toLowerCase()}`;
        collegeNameStateMap.set(nameStateKey, college);
      }
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
      if (record.name) {
        records.push(record);
      }
    }
    
    console.log(`Processed ${records.length} records from CSV file`);

    // Sample record
    if (records.length > 0) {
      console.log('Sample CSV record:', records[0].id, records[0].name, records[0].state);
    }

    // Counter for matches and updates
    let exactNameMatches = 0;
    let nameStateMatches = 0;
    let updateCount = 0;
    let errorCount = 0;
    const updatedCollegeIds = new Set();
    const matchedCsvIds = new Set();

    // Process records and update matching colleges
    for (const record of records) {
      if (!record.name) continue;
      
      const normalizedCsvName = normalizeCollegeName(record.name);
      const csvState = record.state ? record.state.toLowerCase() : '';
      const nameStateKey = `${normalizedCsvName}|${csvState}`;
      
      // Try to find the college - first by name+state, then by name only
      let college = null;
      let matchType = '';
      
      if (csvState && collegeNameStateMap.has(nameStateKey)) {
        college = collegeNameStateMap.get(nameStateKey);
        matchType = 'name+state';
        nameStateMatches++;
      } else if (collegeNameMap.has(normalizedCsvName)) {
        college = collegeNameMap.get(normalizedCsvName);
        matchType = 'name-only';
        exactNameMatches++;
      }
      
      if (college) {
        // Skip if we've already updated this college or matched this CSV record
        if (updatedCollegeIds.has(college.id) || matchedCsvIds.has(record.id)) {
          continue;
        }
        
        // Add to our tracking sets
        updatedCollegeIds.add(college.id);
        matchedCsvIds.add(record.id);
        
        try {
          // Safely extract the column values we want with proper error handling
          const degreePredominant = safeParseInt(record["degrees_awarded.predominant"]);
          const degreeHighest = safeParseInt(record["degrees_awarded.highest"]);
          const admissionRate = safeParseFloat(record["admission_rate.overall"]);
          const satAverage = safeParseInt(record["sat_scores.average.overall"]);
          const pellGrantRate = safeParseFloat(record["pell_grant_rate"]);
          const completionRate4yr = safeParseFloat(record["completion_rate_4yr_150nt"]);
          const medianDebtCompleters = safeParseInt(record["median_debt.completers.overall"]);
          const medianDebtNoncompleters = safeParseInt(record["median_debt.noncompleters"]);
          const medianFamilyIncome = safeParseFloat(record["demographics.median_family_income"]);
          const medianEarnings10yr = safeParseInt(record["10_yrs_after_entry.median"]);
          const federalId = safeParseInt(record.id);
          
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
              median_earnings_10yrs_after_entry = $10,
              federal_id = $11
            WHERE 
              id = $12
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
            federalId,
            college.id
          ];
          
          await client.query(updateQuery, values);
          updateCount++;
          
          if (updateCount % 100 === 0) {
            console.log(`Updated ${updateCount} colleges so far...`);
          }
          
          if (updateCount < 5) {
            console.log(`Updated ${college.name} (DB ID: ${college.id}) from CSV ID: ${record.id} (Match type: ${matchType})`);
          }
        } catch (err) {
          errorCount++;
          if (errorCount < 10) {
            console.error(`Error updating college ${record.name}:`, err.message);
          } else if (errorCount === 10) {
            console.error('Further error messages will be suppressed...');
          }
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

    console.log("\nDegrees awarded predominant distribution:");
    console.table(degreesReport);
    
    console.log(`\nMatches by type:`);
    console.log(`- Name+State matches: ${nameStateMatches}`);
    console.log(`- Name-only matches: ${exactNameMatches}`);
    console.log(`- Total matches: ${nameStateMatches + exactNameMatches}`);
    console.log(`- Successfully updated: ${updateCount} colleges`);
    console.log(`- Errors: ${errorCount}`);

    // Create indexes for better performance
    console.log("\nCreating indexes on new columns...");
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_degree_predominant ON colleges (degrees_awarded_predominant)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_admission_rate ON colleges (admission_rate_overall)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_sat_scores ON colleges (sat_scores_average_overall)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_colleges_federal_id ON colleges (federal_id)');
      console.log("Indexes created successfully");
    } catch (err) {
      console.error("Error creating indexes:", err.message);
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the main function
updateColleges()
  .then(() => console.log('Done'))
  .catch(err => console.error('Fatal error:', err.message));