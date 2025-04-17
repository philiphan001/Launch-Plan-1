// Resumable Batch Import - Can be run multiple times, picking up where it left off
// Using ES modules format
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const CSV_FILE = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
const BATCH_SIZE = 100;
const PROGRESS_FILE = './college_import_progress.json';

async function resumableBatchImport() {
  console.log('Starting resumable batch import...');
  
  // Create PostgreSQL client
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Load progress if available
    let startBatch = 0;
    let processedTotal = 0;
    if (fs.existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      startBatch = progress.nextBatch || 0;
      processedTotal = progress.processedTotal || 0;
      console.log(`Resuming from batch ${startBatch}, already processed ${processedTotal} colleges`);
    }
    
    // Load and parse CSV file
    console.log('Loading CSV file...');
    const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    console.log(`Loaded ${records.length} records from CSV`);
    
    // Create lookup map by name
    const csvMap = new Map();
    records.forEach(record => {
      csvMap.set(record.name.toLowerCase(), record);
    });
    
    // Get all colleges from the database if we're starting fresh
    let updates = [];
    if (startBatch === 0) {
      console.log('Fetching all colleges from database...');
      const { rows: colleges } = await client.query('SELECT id, name FROM colleges');
      console.log(`Found ${colleges.length} colleges in database`);
      
      // Process in batches
      console.log('Finding matches between database and CSV...');
      let matched = 0;
      
      // Find matches
      for (const college of colleges) {
        const record = csvMap.get(college.name.toLowerCase());
        if (record) {
          updates.push({
            id: college.id,
            federal_id: record.id,
            degrees_awarded_predominant: parseInt(record['degrees_awarded.predominant'], 10) || null
          });
          matched++;
        }
      }
      
      console.log(`Found ${matched} matches to update`);
      
      // Save matches to file for future resumption
      fs.writeFileSync('college_matches.json', JSON.stringify(updates));
      console.log('Saved matches to college_matches.json for future runs');
    } else {
      // Load matches from file
      console.log('Loading matches from previous run...');
      updates = JSON.parse(fs.readFileSync('college_matches.json', 'utf8'));
      console.log(`Loaded ${updates.length} matches from file`);
    }
    
    // Process in batches
    const batches = [];
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      batches.push(updates.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Divided into ${batches.length} batches for processing`);
    console.log(`Will start at batch ${startBatch}`);
    
    // Process each batch
    for (let i = startBatch; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processing batch ${i+1}/${batches.length} (${batch.length} colleges)...`);
      
      // Start transaction for this batch
      await client.query('BEGIN');
      
      try {
        for (const update of batch) {
          await client.query(
            'UPDATE colleges SET federal_id = $1, degrees_awarded_predominant = $2 WHERE id = $3',
            [update.federal_id, update.degrees_awarded_predominant, update.id]
          );
          processedTotal++;
        }
        
        await client.query('COMMIT');
        console.log(`Completed batch ${i+1}, total updated: ${processedTotal}/${updates.length}`);
        
        // Save progress
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ 
          nextBatch: i + 1, 
          processedTotal,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error in batch ${i+1}:`, error);
        // Save progress including the error
        fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ 
          nextBatch: i,  // Don't advance batch counter on error
          processedTotal,
          error: error.message,
          timestamp: new Date().toISOString()
        }));
        throw error; // Stop processing on error
      }
    }
    
    console.log(`Import complete! Updated ${processedTotal} colleges`);
    // Reset progress file for future runs
    if (processedTotal >= updates.length) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ 
        completed: true,
        processedTotal,
        timestamp: new Date().toISOString()
      }));
    }
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the import
resumableBatchImport();