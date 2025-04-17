// Batch College Import - Efficient batch processing of college data
// Using ES modules format
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// CSV file path
const CSV_FILE = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
const BATCH_SIZE = 100; // Process colleges in batches of 100

async function batchCollegeImport() {
  console.log('Starting batch import...');
  
  // Create PostgreSQL client
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
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
    
    // Get all colleges from the database
    console.log('Fetching all colleges from database...');
    const { rows: colleges } = await client.query('SELECT id, name FROM colleges');
    console.log(`Found ${colleges.length} colleges in database`);
    
    // Process in batches
    console.log('Processing colleges in batches...');
    const updates = [];
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
    
    // Process in batches
    let processed = 0;
    const batches = [];
    
    for (let i = 0; i < updates.length; i += BATCH_SIZE) {
      batches.push(updates.slice(i, i + BATCH_SIZE));
    }
    
    console.log(`Divided into ${batches.length} batches for processing`);
    
    // Process each batch
    for (let i = 0; i < batches.length; i++) {
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
          processed++;
        }
        
        await client.query('COMMIT');
        console.log(`Completed batch ${i+1}, total updated: ${processed}/${updates.length}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error in batch ${i+1}:`, error);
      }
    }
    
    console.log(`Import complete! Updated ${processed} colleges`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the import
batchCollegeImport();