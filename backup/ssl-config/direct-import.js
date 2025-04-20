// Direct Import Script - One straightforward import with minimal output
// Uses direct PostgreSQL connection for fast batch updates
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Configuration
const CSV_FILE = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';

async function directImport() {
  console.log('Starting direct import...');
  
  // Create PostgreSQL connection pool with SSL
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
      servername: new URL(process.env.DATABASE_URL).hostname
    }
  });
  
  try {
    // Load and parse CSV data
    console.log('Loading CSV file...');
    const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    console.log(`Loaded ${records.length} CSV records`);
    
    // Build lookup maps from CSV data for faster searching
    const csvMap = new Map();
    records.forEach(record => {
      const key = `${record.INSTNM?.toLowerCase() || ''}|${record.STABBR?.toLowerCase() || ''}`;
      csvMap.set(key, record);
      
      // Also add a name-only key as fallback
      const nameKey = record.INSTNM?.toLowerCase() || '';
      if (nameKey && !csvMap.has(nameKey)) {
        csvMap.set(nameKey, record);
      }
    });
    
    // Get all colleges from the database
    console.log('Fetching colleges from database...');
    const { rows: colleges } = await pool.query('SELECT id, name, state FROM colleges');
    console.log(`Found ${colleges.length} colleges in database`);
    
    // Prepare for batch update
    const updates = [];
    let matched = 0;
    
    // Match colleges with CSV data
    for (const college of colleges) {
      // Try name+state match first (more accurate)
      const nameStateKey = `${college.name.toLowerCase()}|${college.state?.toLowerCase() || ''}`;
      let csvRecord = csvMap.get(nameStateKey);
      let matchType = 'name+state';
      
      // Fallback to name-only match
      if (!csvRecord) {
        const nameKey = college.name.toLowerCase();
        csvRecord = csvMap.get(nameKey);
        matchType = 'name-only';
      }
      
      // If found a match, prepare update
      if (csvRecord) {
        updates.push({
          id: college.id,
          federal_id: csvRecord.UNITID,
          degrees_awarded_predominant: parseInt(csvRecord.PREDDEG, 10) || null
        });
        matched++;
      }
    }
    
    console.log(`Matched ${matched} colleges with CSV data`);
    
    // Perform all updates in a single transaction
    const client = await pool.connect();
    console.log('Starting database update...');
    
    try {
      await client.query('BEGIN');
      
      let updated = 0;
      for (const update of updates) {
        await client.query(
          'UPDATE colleges SET federal_id = $1, degrees_awarded_predominant = $2 WHERE id = $3',
          [update.federal_id, update.degrees_awarded_predominant, update.id]
        );
        updated++;
        
        // Show progress only occasionally
        if (updated % 500 === 0 || updated === updates.length) {
          console.log(`Updated ${updated}/${updates.length} colleges`);
        }
      }
      
      await client.query('COMMIT');
      console.log(`Successfully updated ${updated} colleges`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error during database update:', error);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close database connection
    await pool.end();
    console.log('Import process completed');
  }
}

// Run the import
directImport();