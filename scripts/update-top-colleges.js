// Script to update only the top colleges with US News Top 150 and Best Liberal Arts Colleges data
// This is an optimized version that only processes colleges that have rankings
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

async function updateTopColleges() {
  console.log('Starting update of top college rankings...');
  
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
    
    // Filter records to only include those with rankings
    const topCollegeRecords = records.filter(record => {
      const usNewsRank = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : 0;
      const liberalArtsRank = record['best liberal arts colleges'] ? parseInt(record['best liberal arts colleges'], 10) : 0;
      
      return (usNewsRank > 0 && usNewsRank <= 150) || (liberalArtsRank > 0 && liberalArtsRank <= 300);
    });
    
    console.log(`Found ${topCollegeRecords.length} records with top rankings in CSV`);
    
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
    let usNewsUpdated = 0;
    let liberalArtsUpdated = 0;
    
    // Process each top college record
    for (const record of topCollegeRecords) {
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
        // Parse the ranking values
        const usNewsTop150 = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : null;
        const bestLiberalArtsColleges = record['best liberal arts colleges'] ? 
          parseInt(record['best liberal arts colleges'], 10) : null;
          
        // Only update if at least one ranking is available
        if (usNewsTop150 !== null || bestLiberalArtsColleges !== null) {
          try {
            await sql`
              UPDATE colleges 
              SET 
                us_news_top_150 = ${usNewsTop150}, 
                best_liberal_arts_colleges = ${bestLiberalArtsColleges}
              WHERE id = ${matchedCollege.id}
            `;
            
            updateCount++;
            
            // Log which college was updated
            if (usNewsTop150 !== null && usNewsTop150 > 0 && usNewsTop150 <= 150) {
              console.log(`Found US News Top 150 college: ${record.name} (ID: ${matchedCollege.id}, Rank: ${usNewsTop150})`);
              usNewsUpdated++;
            }
            
            if (bestLiberalArtsColleges !== null && bestLiberalArtsColleges > 0 && bestLiberalArtsColleges <= 300) {
              console.log(`Found Best Liberal Arts college: ${record.name} (ID: ${matchedCollege.id}, Rank: ${bestLiberalArtsColleges})`);
              liberalArtsUpdated++;
            }
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
    
    console.log('\nCollege rankings update completed:');
    console.log(`- Updated: ${updateCount} colleges`);
    console.log(`- US News Top 150 updated: ${usNewsUpdated}`);
    console.log(`- Best Liberal Arts updated: ${liberalArtsUpdated}`);
    console.log(`- Skipped: ${skipCount} records`);
    
    // Log the current count of colleges with rankings
    const usNewsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE us_news_top_150 IS NOT NULL AND us_news_top_150 > 0 AND us_news_top_150 <= 150`;
    const liberalArtsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`;
    
    console.log(`\nTotal colleges with US News Top 150 ranking: ${usNewsRanked[0].count}`);
    console.log(`Total colleges with Best Liberal Arts ranking: ${liberalArtsRanked[0].count}`);
  } catch (error) {
    console.error('Error in updateTopColleges:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
}

updateTopColleges()
  .catch(error => {
    console.error('Error updating top college rankings:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Top college rankings update process finished');
    process.exit(0);
  });