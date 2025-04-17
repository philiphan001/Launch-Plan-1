/**
 * Sample script to import a small subset of the extended college data
 * for verification purposes
 */

import fs from "fs";
import * as csvParse from "csv-parse";
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Path to the CSV file with updated college data
const CSV_FILE_PATH = "./attached_assets/Updated_Most-Recent-Cohorts-Institution.csv";

async function importCollegeExtendedData() {
  console.log("Starting college extended data sample import...");

  // First get a sample of existing colleges from database
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT id, name FROM colleges LIMIT 10');
    console.log(`Found ${rows.length} sample colleges in database`);

    // Create a map for quick lookup by name
    const collegeMap = new Map();
    for (const college of rows) {
      collegeMap.set(college.name.toLowerCase().trim(), college);
      console.log(`College ID ${college.id}: ${college.name}`);
    }

    // Load and parse the CSV file - but only process a small number
    const records = [];
    let recordCount = 0;
    const MAX_RECORDS = 100; // Only process 100 records to keep it fast
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csvParse.parse({ columns: true, delimiter: "," }))
        .on("data", (data) => {
          // Only process records with a name and limit the total count
          if (data.name && recordCount < MAX_RECORDS) {
            records.push(data);
            recordCount++;
          }
        })
        .on("error", (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        })
        .on("end", () => {
          console.log(`Processed ${records.length} sample records from CSV file`);
          resolve();
        });
    });

    // Counter for matches
    let matchCount = 0;
    let updateCount = 0;

    // Process records and update matching colleges
    for (const record of records) {
      const institutionName = record.name && record.name.toLowerCase().trim();
      
      if (!institutionName) continue;
      
      console.log(`Looking for match for: ${institutionName}`);
      
      // Find matching college in our database
      const college = collegeMap.get(institutionName);
      
      if (college) {
        matchCount++;
        console.log(`Found match: ${college.name} (ID: ${college.id})`);
        
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
          
          console.log(`Updating college ID ${college.id} with data:`, {
            degreePredominant,
            degreeHighest,
            admissionRate,
            satAverage,
            pellGrantRate,
            completionRate4yr,
            medianDebtCompleters,
            medianDebtNoncompleters,
            medianFamilyIncome,
            medianEarnings10yr
          });
          
          // Update the college record in the database using prepared statement
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
          
          await client.query(updateQuery, [
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
          ]);
          
          updateCount++;
          console.log(`Updated college ID ${college.id} successfully`);
        } catch (error) {
          console.error(`Error updating college ${institutionName}:`, error);
        }
      }
    }

    console.log(`Matched ${matchCount} colleges from the sample`);
    console.log(`Successfully updated ${updateCount} colleges with extended data`);
    
    // Verify the updates with a query
    const { rows: updatedRows } = await client.query(`
      SELECT id, name, degrees_awarded_predominant, admission_rate_overall, sat_scores_average_overall 
      FROM colleges 
      WHERE degrees_awarded_predominant IS NOT NULL 
      LIMIT 5
    `);
    
    console.log("Sample of updated colleges:");
    for (const row of updatedRows) {
      console.log(row);
    }
    
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the function
importCollegeExtendedData()
  .then(() => {
    console.log("College extended data sample import completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("College extended data sample import failed:", error);
    process.exit(1);
  });