// Script to update only the US News Top 150 colleges
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

async function updateUsNewsColleges() {
  console.log('Starting update of US News Top 150 college rankings...');
  
  try {
    // Read the CSV file
    const csvFilePath = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse the CSV data
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Loaded ${records.length} records from CSV file`);
    
    // Filter records to only include those with US News rankings <= 150
    const usNewsRecords = records.filter(record => {
      const usNewsRank = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : 0;
      return (usNewsRank > 0 && usNewsRank <= 150);
    });
    
    console.log(`Found ${usNewsRecords.length} records with US News Top 150 rankings in CSV`);
    
    // Fetch all colleges from our database
    const existingColleges = await db.select().from(colleges);
    console.log(`Found ${existingColleges.length} colleges in database`);
    
    // Function to normalize a college name
    const normalizeName = (name) => {
      return name
        .toLowerCase()
        .replace(/university|college|institute of technology|school|of|the/gi, '')
        .replace(/[-,&'.()]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Create a map for faster lookups
    const collegeMap = new Map();
    
    // Index colleges by name for faster lookup
    existingColleges.forEach(college => {
      if (!college.name) return;
      
      const nameLower = college.name.toLowerCase();
      const nameNormalized = normalizeName(college.name);
      
      collegeMap.set(nameLower, college);
      collegeMap.set(nameNormalized, college);
      
      // Add state variations if available
      if (college.state) {
        collegeMap.set(`${nameLower}, ${college.state.toLowerCase()}`, college);
        collegeMap.set(`${nameNormalized} ${college.state.toLowerCase()}`, college);
      }
    });
    
    let updateCount = 0;
    let skipCount = 0;
    
    // Process each US News record
    for (const record of usNewsRecords) {
      if (!record.name) {
        skipCount++;
        continue;
      }
      
      // Get normalized names
      const csvNameLower = record.name.toLowerCase();
      const csvNameNormalized = normalizeName(record.name);
      
      // Try different name combinations
      const possibleNames = [
        csvNameLower,
        csvNameNormalized
      ];
      
      // Add state variations
      if (record.state) {
        possibleNames.push(`${csvNameLower}, ${record.state.toLowerCase()}`);
        possibleNames.push(`${csvNameNormalized} ${record.state.toLowerCase()}`);
      }
      
      // Try to find a match
      let matchedCollege = null;
      for (const name of possibleNames) {
        if (collegeMap.has(name)) {
          matchedCollege = collegeMap.get(name);
          break;
        }
      }
      
      // If we found a match, update it
      if (matchedCollege) {
        // Parse the ranking value
        const usNewsTop150 = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : null;
          
        // Only update if ranking is available
        if (usNewsTop150 !== null && usNewsTop150 > 0 && usNewsTop150 <= 150) {
          try {
            await sql`
              UPDATE colleges 
              SET us_news_top_150 = ${usNewsTop150}
              WHERE id = ${matchedCollege.id}
            `;
            
            updateCount++;
            
            // Log which college was updated
            console.log(`Updated US News Top 150 college: ${record.name} (ID: ${matchedCollege.id}, Rank: ${usNewsTop150})`);
          } catch (updateError) {
            console.error(`Error updating college ${matchedCollege.id}:`, updateError);
          }
        } else {
          skipCount++;
        }
      } else {
        console.log(`Could not find a match for: ${record.name}, ${record.state}`);
        skipCount++;
      }
    }
    
    console.log('\nUS News college rankings update completed:');
    console.log(`- Updated: ${updateCount} colleges`);
    console.log(`- Skipped: ${skipCount} records`);
    
    // Log the current count of colleges with US News rankings
    const usNewsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE us_news_top_150 IS NOT NULL AND us_news_top_150 > 0 AND us_news_top_150 <= 150`;
    
    console.log(`\nTotal colleges with US News Top 150 ranking: ${usNewsRanked[0].count}`);
  } catch (error) {
    console.error('Error in updateUsNewsColleges:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
}

updateUsNewsColleges()
  .catch(error => {
    console.error('Error updating US News college rankings:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('US News college rankings update process finished');
    process.exit(0);
  });