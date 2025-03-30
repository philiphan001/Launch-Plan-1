// Script to identify and update the remaining missing Liberal Arts Colleges
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Import directly from TypeScript files using tsx
import { colleges } from '../shared/schema.ts';

// Set up the database connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);
const db = drizzle(sql);

async function finalizeLiberalArtsRankings() {
  console.log('Starting to finalize Best Liberal Arts college rankings...');
  
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
    
    // Get the current count of colleges with Liberal Arts rankings
    const currentRanked = await sql`
      SELECT COUNT(*) FROM colleges 
      WHERE best_liberal_arts_colleges IS NOT NULL 
      AND best_liberal_arts_colleges > 0 
      AND best_liberal_arts_colleges <= 300
    `;
    console.log(`Current colleges with Best Liberal Arts ranking: ${currentRanked[0].count}`);
    
    // Get the missing count
    const missingCount = liberalArtsRecords.length - currentRanked[0].count;
    console.log(`Still missing ${missingCount} Liberal Arts colleges`);
    
    // Get colleges that already have rankings
    const rankedColleges = await db.select().from(colleges)
      .where(`best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`);
    
    // Create a set of ranked college names (in lowercase for comparison)
    const rankedCollegeNames = new Set();
    rankedColleges.forEach(college => {
      if (college.name) {
        rankedCollegeNames.add(college.name.toLowerCase());
      }
    });
    
    // Find the missing Liberal Arts colleges
    const missingColleges = liberalArtsRecords.filter(record => {
      if (!record.name) return false;
      return !rankedCollegeNames.has(record.name.toLowerCase());
    });
    
    console.log(`Found ${missingColleges.length} missing Liberal Arts colleges in CSV`);
    
    // Log missing colleges
    console.log("Missing Liberal Arts colleges:");
    missingColleges.forEach(college => {
      console.log(`- ${college.name}, Rank: ${college['best liberal arts colleges']}, State: ${college.state || 'Unknown'}`);
    });
    
    // Get all colleges from our database
    const allColleges = await db.select().from(colleges);
    console.log(`Found ${allColleges.length} total colleges in database`);
    
    // Super aggressive name matching functions
    const cleanName = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .replace(/university|college|institute|school|of|at|the|campus|main|-|,|\.|'|&|\(|\)|\s/g, '')
        .trim();
    };
    
    const extractMainPart = (name) => {
      if (!name) return '';
      // Extract just the main part of the name (first 1-2 words)
      const words = name.toLowerCase().split(/\s+/);
      return words.slice(0, Math.min(2, words.length)).join('');
    };
    
    // Create maps for faster lookups with different name variations
    const collegeMapClean = new Map();
    const collegeMapMain = new Map();
    const collegeMapByState = new Map();
    
    // Index colleges by various name formats
    allColleges.forEach(college => {
      if (!college.name) return;
      
      const nameLower = college.name.toLowerCase();
      const nameClean = cleanName(college.name);
      const nameMain = extractMainPart(college.name);
      
      collegeMapClean.set(nameClean, college);
      collegeMapMain.set(nameMain, college);
      
      // Group by state for more targeted matching
      if (college.state) {
        const stateKey = college.state.toLowerCase();
        if (!collegeMapByState.has(stateKey)) {
          collegeMapByState.set(stateKey, []);
        }
        collegeMapByState.get(stateKey).push(college);
      }
    });
    
    let updateCount = 0;
    let skipCount = 0;
    
    // Process each missing college with more aggressive matching
    for (const record of missingColleges) {
      if (!record.name) {
        skipCount++;
        continue;
      }
      
      const csvNameLower = record.name.toLowerCase();
      const csvNameClean = cleanName(record.name);
      const csvNameMain = extractMainPart(record.name);
      
      // Try multiple matching strategies
      let matchedCollege = null;
      
      // 1. Try exact clean name match
      if (collegeMapClean.has(csvNameClean)) {
        matchedCollege = collegeMapClean.get(csvNameClean);
      } 
      // 2. Try main name part match
      else if (collegeMapMain.has(csvNameMain)) {
        matchedCollege = collegeMapMain.get(csvNameMain);
      }
      // 3. If state is available, try to find best match within state
      else if (record.state && collegeMapByState.has(record.state.toLowerCase())) {
        const collegesInState = collegeMapByState.get(record.state.toLowerCase());
        
        // Find best string similarity match within the state
        let bestMatch = null;
        let bestSimilarity = 0;
        
        for (const stateCollege of collegesInState) {
          // Skip if already ranked
          if (stateCollege.best_liberal_arts_colleges > 0) continue;
          
          const similarity = stringSimilarity(csvNameLower, stateCollege.name.toLowerCase());
          if (similarity > bestSimilarity && similarity > 0.5) { // Threshold of 0.5 similarity
            bestSimilarity = similarity;
            bestMatch = stateCollege;
          }
        }
        
        if (bestMatch) {
          matchedCollege = bestMatch;
          console.log(`Similarity match for ${record.name} => ${bestMatch.name} (${bestSimilarity.toFixed(2)})`);
        }
      }
      
      // If we found a match, update it
      if (matchedCollege) {
        // Parse the ranking value
        const bestLiberalArtsColleges = record['best liberal arts colleges'] ? 
          parseInt(record['best liberal arts colleges'], 10) : null;
          
        // Only update if ranking is available and college is not already ranked
        if (bestLiberalArtsColleges !== null && bestLiberalArtsColleges > 0 && bestLiberalArtsColleges <= 300 && 
            (!matchedCollege.best_liberal_arts_colleges || matchedCollege.best_liberal_arts_colleges <= 0)) {
          try {
            await sql`
              UPDATE colleges 
              SET best_liberal_arts_colleges = ${bestLiberalArtsColleges}
              WHERE id = ${matchedCollege.id}
            `;
            
            updateCount++;
            
            // Log which college was updated
            console.log(`Updated Best Liberal Arts college: ${record.name} => ${matchedCollege.name} (ID: ${matchedCollege.id}, Rank: ${bestLiberalArtsColleges})`);
          } catch (updateError) {
            console.error(`Error updating college ${matchedCollege.id}:`, updateError);
          }
        } else {
          skipCount++;
        }
      } else {
        console.log(`Could not find any match for: ${record.name}, ${record.state}`);
        skipCount++;
      }
    }
    
    console.log('\nFinal Best Liberal Arts college rankings update completed:');
    console.log(`- Updated: ${updateCount} additional colleges`);
    console.log(`- Skipped: ${skipCount} records`);
    
    // Log the current count of colleges with Liberal Arts rankings
    const finalCount = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0 AND best_liberal_arts_colleges <= 300`;
    
    console.log(`\nTotal colleges with Best Liberal Arts ranking: ${finalCount[0].count}`);
    console.log(`Total found vs CSV total: ${finalCount[0].count} / ${liberalArtsRecords.length}`);
  } catch (error) {
    console.error('Error in finalizeLiberalArtsRankings:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
}

// Simple string similarity function (Levenshtein distance-based)
function stringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  
  const track = Array(s2.length + 1).fill(null).map(() => 
    Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength > 0 ? 1 - distance / maxLength : 1;
}

finalizeLiberalArtsRankings()
  .catch(error => {
    console.error('Error finalizing Best Liberal Arts college rankings:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Best Liberal Arts college rankings finalization process finished');
    process.exit(0);
  });