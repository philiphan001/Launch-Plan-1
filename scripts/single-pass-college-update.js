// Simplified single-pass CSV import script
// Imports all college data in one operation without unnecessary checkpoints

const { db } = require('../server/db');
const { colleges } = require('../shared/schema');
const { eq } = require('drizzle-orm');
const fs = require('fs');
const { parse } = require('csv-parse/sync');

// Configuration
const CSV_FILE = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
const BATCH_SIZE = 500; // Larger batch size for efficiency, but not too large to avoid memory issues

async function singlePassCollegeUpdate() {
  console.log('Starting complete college data import...');
  let connection;
  
  try {
    // Read and parse CSV
    console.log(`Reading CSV data from ${CSV_FILE}...`);
    const fileContent = fs.readFileSync(CSV_FILE, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    console.log(`Processed ${records.length} records from CSV file`);
    
    // Fetch all colleges in one query
    const allColleges = await db.select().from(colleges);
    console.log(`Found ${allColleges.length} colleges in database`);
    
    // Create lookup maps for faster matching
    const collegeNameStateMap = new Map();
    const collegeNameOnlyMap = new Map();
    
    allColleges.forEach(college => {
      // Name + state map
      const nameStateKey = `${college.name.toLowerCase()}|${college.state?.toLowerCase() || ''}`;
      collegeNameStateMap.set(nameStateKey, college);
      
      // Name-only map (use with caution - may have duplicates)
      const nameKey = college.name.toLowerCase();
      if (!collegeNameOnlyMap.has(nameKey)) {
        collegeNameOnlyMap.set(nameKey, college);
      }
    });
    
    // Process in larger batches for efficiency
    let updated = 0;
    let errors = 0;
    const total = allColleges.length;
    const batches = Math.ceil(total / BATCH_SIZE);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, total);
      const batchColleges = allColleges.slice(start, end);
      
      console.log(`Processing batch ${batchIndex + 1}/${batches} (colleges ${start + 1}-${end})...`);
      
      for (const college of batchColleges) {
        try {
          // Try to find a matching record in the CSV
          let match = null;
          let matchType = null;
          
          // First attempt: try to match by name + state (more reliable)
          const nameStateKey = `${college.name.toLowerCase()}|${college.state?.toLowerCase() || ''}`;
          for (const record of records) {
            const csvName = record.INSTNM?.toLowerCase() || '';
            const csvState = record.STABBR?.toLowerCase() || '';
            const csvKey = `${csvName}|${csvState}`;
            
            if (csvKey === nameStateKey) {
              match = record;
              matchType = 'name+state';
              break;
            }
          }
          
          // Second attempt: try name-only match if name+state failed
          if (!match) {
            const nameKey = college.name.toLowerCase();
            for (const record of records) {
              const csvName = record.INSTNM?.toLowerCase() || '';
              
              if (csvName === nameKey) {
                match = record;
                matchType = 'name-only';
                break;
              }
            }
          }
          
          // If we found a match, update the college
          if (match) {
            // Extract data from CSV record
            const federal_id = match.UNITID;
            const degrees_awarded_predominant = parseInt(match.PREDDEG, 10) || null;
            
            // Update the college record
            await db.update(colleges)
              .set({
                federal_id,
                degrees_awarded_predominant
              })
              .where(eq(colleges.id, college.id));
            
            updated++;
            
            // Log progress only occasionally to avoid console spam
            if (updated % 100 === 0 || updated === total) {
              console.log(`Updated ${updated}/${total} colleges...`);
            }
          }
        } catch (error) {
          console.error(`Error updating college ID ${college.id} (${college.name}):`, error);
          errors++;
        }
      }
    }
    
    console.log('\nImport completed!');
    console.log(`Total colleges in database: ${total}`);
    console.log(`Successfully updated: ${updated} colleges`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Error during import process:', error);
  }
}

// Run the import
singlePassCollegeUpdate();