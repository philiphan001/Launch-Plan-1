/**
 * Improved script to import extended college data from the Department of Education dataset
 * This version uses fuzzy matching for college names to improve match rate
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

// Function to calculate string similarity (Levenshtein distance)
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

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

// Function to find the best match for a college name
function findBestMatch(name, collegeMap) {
  const normalizedName = normalizeCollegeName(name);
  if (!normalizedName) return null;
  
  // First try exact match on normalized name
  for (const [collegeName, college] of collegeMap.entries()) {
    if (normalizeCollegeName(collegeName) === normalizedName) {
      return college;
    }
  }
  
  // If no exact match, try fuzzy matching
  let bestMatch = null;
  let bestScore = Infinity;
  
  for (const [collegeName, college] of collegeMap.entries()) {
    const normalizedCollegeName = normalizeCollegeName(collegeName);
    const score = levenshteinDistance(normalizedName, normalizedCollegeName);
    
    // Normalize the score by the length of the longer string
    const normalizedScore = score / Math.max(normalizedName.length, normalizedCollegeName.length);
    
    // If the score is below a certain threshold and better than our previous best match
    if (normalizedScore < 0.3 && normalizedScore < bestScore) {
      bestMatch = college;
      bestScore = normalizedScore;
    }
  }
  
  return bestMatch;
}

async function importCollegeExtendedData() {
  console.log("Starting improved college extended data import...");

  // First get all existing colleges from database
  const existingColleges = await db.select().from(colleges);
  console.log(`Found ${existingColleges.length} existing colleges in database`);

  // Create a map for quick lookup by name
  const collegeMap = new Map();
  for (const college of existingColleges) {
    collegeMap.set(college.name, college);
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
  let fuzzyMatchCount = 0;

  // Track which colleges were updated
  const updatedCollegeIds = new Set();

  // Process records and update matching colleges
  for (const record of records) {
    const institutionName = record.name;
    
    if (!institutionName) continue;
    
    // Find matching college in our database - try both exact and fuzzy matching
    const college = findBestMatch(institutionName, collegeMap);
    
    if (college) {
      matchCount++;
      
      // Check if we've already updated this college
      if (updatedCollegeIds.has(college.id)) {
        console.log(`Skipping duplicate match for ${institutionName} (ID: ${college.id})`);
        continue;
      }
      
      // Add to our set of updated college IDs
      updatedCollegeIds.add(college.id);
      
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

  // Generate a report on the degrees_awarded_predominant values
  const degreesReport = await db.execute(sql`
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

  console.log(`Matched ${matchCount} colleges from the CSV file (${fuzzyMatchCount} via fuzzy matching)`);
  console.log(`Successfully updated ${updateCount} colleges with extended data`);

  // Create indexes to improve query performance
  console.log("Creating indexes on new columns...");
  try {
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_colleges_degree_predominant ON colleges (degrees_awarded_predominant)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_colleges_admission_rate ON colleges (admission_rate_overall)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_colleges_sat_scores ON colleges (sat_scores_average_overall)`);
    console.log("Indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
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