// Simple College Import - Direct college data import with minimal verbosity
// Using ES modules format
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// CSV file path
const CSV_FILE = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';

async function simpleCollegeImport() {
  console.log('Starting simple college import...');
  
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
    
    // For each record in CSV
    console.log('Processing records...');
    let matched = 0;
    let updated = 0;
    
    for (const record of records) {
      // Check if we can find a match in the database by name
      const { rows } = await client.query(
        'SELECT id FROM colleges WHERE LOWER(name) = LOWER($1)',
        [record.name]
      );
      
      if (rows.length > 0) {
        matched++;
        const collegeId = rows[0].id;
        
        // Get degree predominant value
        const degreePredominant = record['degrees_awarded.predominant'] 
          ? parseInt(record['degrees_awarded.predominant'], 10) 
          : null;
        
        // Update college record
        await client.query(
          'UPDATE colleges SET federal_id = $1, degrees_awarded_predominant = $2 WHERE id = $3',
          [record.id, degreePredominant, collegeId]
        );
        updated++;
        
        // Simple progress indicator
        if (updated % 500 === 0 || updated === matched) {
          console.log(`Updated ${updated} colleges so far...`);
        }
      }
    }
    
    console.log(`Completed! Matched ${matched} colleges and updated ${updated} records`);
    
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the import
simpleCollegeImport();