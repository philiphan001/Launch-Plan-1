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
    
    // Log the first record to see what fields are available
    if (records.length > 0) {
      console.log('Sample record:', {
        id: records[0].id,
        name: records[0].name,
        city: records[0].city,
        state: records[0].state,
        'US News Top 150': records[0]['US News Top 150'],
        'best liberal arts colleges': records[0]['best liberal arts colleges']
      });
    }
    
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
    
    // Process only the first 1000 records for demonstration
    const maxRecords = 1000;
    const limitedRecords = records.slice(0, maxRecords);
    
    // Process records in batches to prevent timeouts
    const batchSize = 500;
    const totalBatches = Math.ceil(limitedRecords.length / batchSize);
    
    console.log(`Processing ${limitedRecords.length} records in ${totalBatches} batches of ${batchSize}...`);
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, limitedRecords.length);
      const batch = limitedRecords.slice(startIndex, endIndex);
      
      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (records ${startIndex + 1}-${endIndex})...`);
      
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
        
        // Log progress after each chunk
        console.log(`Batch ${batchIndex + 1}/${totalBatches}, Chunk ${chunkIndex + 1}/${updateChunks}: Updated ${updateCount} colleges so far...`);
      }
    }
    
    console.log('College rankings update completed:');
    console.log(`- Updated: ${updateCount} colleges`);
    console.log(`- Skipped: ${skipCount} records`);
    
    // Log the count of colleges with rankings
    const usNewsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE us_news_top_150 IS NOT NULL AND us_news_top_150 > 0`;
    const liberalArtsRanked = await sql`SELECT COUNT(*) FROM colleges WHERE best_liberal_arts_colleges IS NOT NULL AND best_liberal_arts_colleges > 0`;
    
    console.log(`\nTotal colleges with US News Top 150 ranking: ${usNewsRanked[0].count}`);
    console.log(`Total colleges with Best Liberal Arts ranking: ${liberalArtsRanked[0].count}`);
  } catch (error) {
    console.error('Error in updateCollegeRankings:', error);
    throw error;
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