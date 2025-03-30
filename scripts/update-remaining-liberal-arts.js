// Script to update the remaining Best Liberal Arts Colleges that haven't been updated yet
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

async function updateRemainingLiberalArtsColleges() {
  console.log('Starting update of remaining Best Liberal Arts college rankings...');
  
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
    
    // Filter records to only include those with Liberal Arts rankings <= 300
    const liberalArtsRecords = records.filter(record => {
      const liberalArtsRank = record['best liberal arts colleges'] ? parseInt(record['best liberal arts colleges'], 10) : 0;
      return (liberalArtsRank > 0 && liberalArtsRank <= 300);
    });
    
    console.log(`Found ${liberalArtsRecords.length} records with Best Liberal Arts rankings in CSV`);
    
    // Get the current count before the update
    const beforeCount = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`;
    console.log(`Current colleges with Best Liberal Arts ranking: ${beforeCount[0].count}`);
    
    // Fetch all colleges from our database that already have Liberal Arts rankings
    const existingRankedColleges = await db.select().from(colleges)
      .where(`best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`);
    
    console.log(`Found ${existingRankedColleges.length} colleges already ranked in database`);
    
    // Create a set of college names that already have rankings
    const rankedCollegeNames = new Set();
    existingRankedColleges.forEach(college => {
      if (college.name) {
        rankedCollegeNames.add(college.name.toLowerCase());
      }
    });
    
    // Filter to just the records that need to be updated (not already ranked)
    const remainingRecords = liberalArtsRecords.filter(record => {
      if (!record.name) return false;
      return !rankedCollegeNames.has(record.name.toLowerCase());
    });
    
    console.log(`Found ${remainingRecords.length} Liberal Arts colleges still needing to be ranked`);
    
    // Fetch all colleges from our database
    const allColleges = await db.select().from(colleges);
    console.log(`Found ${allColleges.length} total colleges in database`);
    
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
    allColleges.forEach(college => {
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
    
    // Process each remaining Liberal Arts record
    for (const record of remainingRecords) {
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
        const bestLiberalArtsColleges = record['best liberal arts colleges'] ? 
          parseInt(record['best liberal arts colleges'], 10) : null;
          
        // Only update if ranking is available and college is not already ranked
        if (bestLiberalArtsColleges !== null && bestLiberalArtsColleges > 0 && bestLiberalArtsColleges <= 300 && 
            (!matchedCollege.bestLiberalArtsColleges || matchedCollege.bestLiberalArtsColleges <= 0)) {
          try {
            await sql`
              UPDATE colleges 
              SET best_liberal_arts_colleges = ${bestLiberalArtsColleges}
              WHERE id = ${matchedCollege.id}
            `;
            
            updateCount++;
            
            // Log which college was updated
            console.log(`Updated Best Liberal Arts college: ${record.name} (ID: ${matchedCollege.id}, Rank: ${bestLiberalArtsColleges})`);
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
    
    console.log('\nRemaining Best Liberal Arts college rankings update completed:');
    console.log(`- Updated: ${updateCount} colleges`);
    console.log(`- Skipped: ${skipCount} records`);
    
    // Log the current count of colleges with Liberal Arts rankings
    const afterCount = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`;
    
    console.log(`\nTotal colleges with Best Liberal Arts ranking: ${afterCount[0].count}`);
    console.log(`Added ${afterCount[0].count - beforeCount[0].count} new rankings in this run.`);
  } catch (error) {
    console.error('Error in updateRemainingLiberalArtsColleges:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
}

updateRemainingLiberalArtsColleges()
  .catch(error => {
    console.error('Error updating remaining Best Liberal Arts college rankings:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Remaining Best Liberal Arts college rankings update process finished');
    process.exit(0);
  });