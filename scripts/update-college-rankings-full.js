// Script to update all colleges with US News Top 150 and Best Liberal Arts Colleges data
// This script processes all records in chunks to prevent timeouts
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

// Process a limited number of records in a batch to prevent timeouts
async function processRecordBatch(startIndex, batchSize, records, collegeMap) {
  const endIndex = Math.min(startIndex + batchSize, records.length);
  const batch = records.slice(startIndex, endIndex);
  
  console.log(`Processing batch from ${startIndex + 1} to ${endIndex} (out of ${records.length})...`);
  
  let updateCount = 0;
  let skipCount = 0;
  
  // Function to normalize a college name
  const normalizeName = (name) => {
    return name
      .toLowerCase()
      .replace(/university|college|institute of technology|school|of|the/gi, '')
      .replace(/[-,&'.()]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  // Collect updates to perform
  const updates = [];
  
  // Process records in this batch
  for (const record of batch) {
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
    
    // If we found a match, queue the update
    if (matchedCollege) {
      // Parse the ranking values
      const usNewsTop150 = record['US News Top 150'] ? parseInt(record['US News Top 150'], 10) : null;
      const bestLiberalArtsColleges = record['best liberal arts colleges'] ? 
        parseInt(record['best liberal arts colleges'], 10) : null;
        
      // Only update if at least one ranking is available
      if (usNewsTop150 !== null || bestLiberalArtsColleges !== null) {
        updates.push({
          collegeId: matchedCollege.id, 
          usNewsTop150, 
          bestLiberalArtsColleges
        });
      } else {
        skipCount++;
      }
    } else {
      skipCount++;
    }
  }
  
  // Process updates in smaller chunks to avoid query size limitations
  const updateChunkSize = 50;
  const updateChunks = Math.ceil(updates.length / updateChunkSize);
  
  for (let chunkIndex = 0; chunkIndex < updateChunks; chunkIndex++) {
    const startChunkIndex = chunkIndex * updateChunkSize;
    const endChunkIndex = Math.min(startChunkIndex + updateChunkSize, updates.length);
    const updateChunk = updates.slice(startChunkIndex, endChunkIndex);
    
    // Execute each update individually to reduce chances of timeout
    for (const update of updateChunk) {
      try {
        await sql`
          UPDATE colleges 
          SET 
            us_news_top_150 = ${update.usNewsTop150}, 
            best_liberal_arts_colleges = ${update.bestLiberalArtsColleges}
          WHERE id = ${update.collegeId}
        `;
        
        updateCount++;
      } catch (updateError) {
        console.error(`Error updating college ${update.collegeId}:`, updateError);
      }
    }
    
    console.log(`Chunk ${chunkIndex + 1}/${updateChunks}: Updated ${updateCount} colleges so far in this batch...`);
  }
  
  return { updateCount, skipCount };
}

async function updateCollegeRankings() {
  console.log('Starting full update of college rankings...');
  
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
    
    let totalUpdateCount = 0;
    let totalSkipCount = 0;
    
    // Process records in batches
    const batchSize = 1000;
    const totalBatches = Math.ceil(records.length / batchSize);
    
    console.log(`Will process ${records.length} records in ${totalBatches} batches of ${batchSize}...`);
    
    // Process each batch
    for (let i = 0; i < totalBatches; i++) {
      const startIndex = i * batchSize;
      
      const result = await processRecordBatch(startIndex, batchSize, records, collegeMap);
      
      totalUpdateCount += result.updateCount;
      totalSkipCount += result.skipCount;
      
      console.log(`\nProgress: Completed batch ${i + 1}/${totalBatches}`);
      console.log(`Total updated so far: ${totalUpdateCount}`);
      console.log(`Total skipped so far: ${totalSkipCount}`);
      
      // Get the current counts of colleges with rankings
      const usNewsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE us_news_top_150 IS NOT NULL AND us_news_top_150 > 0`;
      const liberalArtsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0`;
      
      console.log(`Current US News Top 150 ranking count: ${usNewsRanked[0].count}`);
      console.log(`Current Best Liberal Arts ranking count: ${liberalArtsRanked[0].count}\n`);
    }
    
    console.log('\nCollege rankings update completed:');
    console.log(`- Updated: ${totalUpdateCount} colleges`);
    console.log(`- Skipped: ${totalSkipCount} records`);
    
    // Log the final count of colleges with rankings
    const usNewsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE us_news_top_150 IS NOT NULL AND us_news_top_150 > 0`;
    const liberalArtsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0`;
    
    console.log(`\nTotal colleges with US News Top 150 ranking: ${usNewsRanked[0].count}`);
    console.log(`Total colleges with Best Liberal Arts ranking: ${liberalArtsRanked[0].count}`);
  } catch (error) {
    console.error('Error in updateCollegeRankings:', error);
    throw error;
  } finally {
    // Close the database connection
    await sql.end();
  }
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