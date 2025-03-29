// Script to update colleges with US News Top 150 and Best Liberal Arts Colleges data
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Import directly from TypeScript files using tsx
import { colleges } from '../shared/schema.ts';

// Set up the database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function updateCollegeRankings() {
  console.log('Starting update of college rankings...');
  
  // Read the CSV file
  const csvFilePath = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse the CSV data
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Loaded ${records.length} records from CSV file`);
  
  // Fetch all colleges from our database
  const existingColleges = await db.select().from(colleges);
  console.log(`Found ${existingColleges.length} colleges in database`);
  
  // Create a map of college names to their database IDs for faster lookup
  const collegeNameToId = new Map();
  
  // We'll store both the original name and a simplified version for better matching
  existingColleges.forEach(college => {
    // Store the original name for exact matches
    collegeNameToId.set(college.name.toLowerCase(), college.id);
    
    // Also store a simplified version for better matching
    const simplifiedName = college.name
      .toLowerCase()
      .replace(/university|college|institute of technology/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    collegeNameToId.set(simplifiedName, college.id);
  });
  
  let updateCount = 0;
  let skipCount = 0;
  
  // Process each record from the CSV
  for (const record of records) {
    // Skip records with missing data
    if (!record.name) {
      skipCount++;
      continue;
    }
    
    // Try exact match first (case insensitive)
    const csvExactName = record.name.toLowerCase();
    
    // Then try simplified match
    const csvSimplifiedName = record.name
      .toLowerCase()
      .replace(/university|college|institute of technology/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Try to find this college in our database (try exact match first, then simplified)
    const collegeId = collegeNameToId.get(csvExactName) || collegeNameToId.get(csvSimplifiedName);
    
    if (collegeId) {
      // Parse the ranking fields - make sure to convert to numbers, or null if invalid
      const usNewsTop150 = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : null;
      const bestLiberalArtsColleges = record['best liberal arts colleges'] ? 
        parseInt(record['best liberal arts colleges'], 10) : null;
      
      // Update the college in the database with new data
      await db.update(colleges)
        .set({
          usNewsTop150,
          bestLiberalArtsColleges
        })
        .where(eq(colleges.id, collegeId));
      
      updateCount++;
      
      // Log progress occasionally
      if (updateCount % 100 === 0) {
        console.log(`Updated ${updateCount} colleges so far...`);
      }
    } else {
      skipCount++;
    }
  }
  
  console.log('College rankings update completed:');
  console.log(`- Updated: ${updateCount} colleges`);
  console.log(`- Skipped: ${skipCount} records`);
}

updateCollegeRankings()
  .catch(error => {
    console.error('Error updating college rankings:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('College rankings update process finished');
    process.exit(0);
  });