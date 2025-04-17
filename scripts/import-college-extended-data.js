/**
 * Script to import extended college data from the Department of Education dataset
 * This adds detailed information about degree types, admission rates, completion rates, etc.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, sql } from "drizzle-orm";
import fs from "fs";
import * as csvParse from "csv-parse";
import dotenv from 'dotenv';

dotenv.config();

// Create a Postgres client with the database connection string
const pgSql = postgres(process.env.DATABASE_URL);

// Create a Drizzle instance with the Postgres client
const db = drizzle(pgSql);

// Define the colleges table
const colleges = { name: "colleges" };

// Path to the CSV file with updated college data
const CSV_FILE_PATH = "./attached_assets/Updated_Most-Recent-Cohorts-Institution.csv";

async function importCollegeExtendedData() {
  console.log("Starting college extended data import...");

  // First get all existing colleges from database
  const existingColleges = await db.select().from(colleges);
  console.log(`Found ${existingColleges.length} existing colleges in database`);

  // Create a map for quick lookup by name
  const collegeMap = new Map();
  for (const college of existingColleges) {
    collegeMap.set(college.name.toLowerCase().trim(), college);
  }

  // Load and parse the CSV file
  const records = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csvParse.parse({ columns: true, delimiter: "," }))
      .on("data", (data) => {
        // Only process records with a name
        if (data.name) {
          records.push(data);
        }
      })
      .on("error", (error) => {
        console.error("Error parsing CSV:", error);
        reject(error);
      })
      .on("end", () => {
        console.log(`Processed ${records.length} records from CSV file`);
        resolve();
      });
  });

  console.log("Sample record:", records.length > 0 ? JSON.stringify(records[0], null, 2) : "No records found");

  // Counter for matches
  let matchCount = 0;
  let updateCount = 0;

  // Process records and update matching colleges
  for (const record of records) {
    const institutionName = record.name && record.name.toLowerCase().trim();
    
    if (!institutionName) continue;
    
    // Find matching college in our database
    const college = collegeMap.get(institutionName);
    
    if (college) {
      matchCount++;
      
      try {
        // Extract the column values we want
        const updatedCollege = {
          degreePredominant: record["degrees_awarded.predominant"] ? 
            parseInt(record["degrees_awarded.predominant"]) : null,
          degreeHighest: record["degrees_awarded.highest"] ? 
            parseInt(record["degrees_awarded.highest"]) : null,
          admissionRate: record["admission_rate.overall"] ? 
            parseFloat(record["admission_rate.overall"]) : null,
          satAverage: record["sat_scores.average.overall"] ? 
            parseInt(record["sat_scores.average.overall"]) : null,
          pellGrantRate: record["pell_grant_rate"] ? 
            parseFloat(record["pell_grant_rate"]) : null,
          completionRate4yr: record["completion_rate_4yr_150nt"] ? 
            parseFloat(record["completion_rate_4yr_150nt"]) : null,
          medianDebtCompleters: record["median_debt.completers.overall"] ? 
            parseInt(record["median_debt.completers.overall"]) : null,
          medianDebtNoncompleters: record["median_debt.noncompleters"] ? 
            parseInt(record["median_debt.noncompleters"]) : null,
          medianFamilyIncome: record["demographics.median_family_income"] ? 
            parseFloat(record["demographics.median_family_income"]) : null,
          medianEarnings10yr: record["10_yrs_after_entry.median"] ? 
            parseInt(record["10_yrs_after_entry.median"]) : null
        };
        
        // Update the college record in the database using raw SQL
        await db.execute(sql`
          UPDATE colleges 
          SET 
            degrees_awarded_predominant = ${updatedCollege.degreePredominant},
            degrees_awarded_highest = ${updatedCollege.degreeHighest},
            admission_rate_overall = ${updatedCollege.admissionRate},
            sat_scores_average_overall = ${updatedCollege.satAverage},
            pell_grant_rate = ${updatedCollege.pellGrantRate},
            completion_rate_4yr_150nt = ${updatedCollege.completionRate4yr},
            median_debt_completers_overall = ${updatedCollege.medianDebtCompleters},
            median_debt_noncompleters = ${updatedCollege.medianDebtNoncompleters},
            demographics_median_family_income = ${updatedCollege.medianFamilyIncome},
            median_earnings_10yrs_after_entry = ${updatedCollege.medianEarnings10yr}
          WHERE 
            id = ${college.id}
        `);
          
        updateCount++;
        
        if (updateCount % 100 === 0) {
          console.log(`Updated ${updateCount} colleges so far...`);
        }
      } catch (error) {
        console.error(`Error updating college ${institutionName}:`, error);
      }
    }
  }

  console.log(`Matched ${matchCount} colleges from the CSV file`);
  console.log(`Successfully updated ${updateCount} colleges with extended data`);
}

// Execute the function
importCollegeExtendedData()
  .then(() => {
    console.log("College extended data import completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("College extended data import failed:", error);
    process.exit(1);
  });