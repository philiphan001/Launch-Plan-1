// Import the required modules
import fs from 'fs';
import { parse } from 'csv-parse';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Function to create a new PostgreSQL client
function createDbClient() {
  return new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
      servername: new URL(process.env.DATABASE_URL).hostname
    }
  });
}

// Function to normalize college names for better matching
function normalizeCollegeName(name) {
  if (!name) return '';
  
  return name.toLowerCase()
    .replace(/\buniversity\b/g, 'univ')
    .replace(/\bcollege\b/g, 'coll')
    .replace(/\binstitute\b/g, 'inst')
    .replace(/\b(of|and|&|the)\b/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper function for safe number parsing
function safeParseInt(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

function safeParseFloat(value) {
  if (!value || value === '' || value === 'null' || value === 'undefined') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Main function
async function updateCollegesBatch(startIndex = 0, batchSize = 200) {
  console.log(`Starting batch college update from index ${startIndex} with batch size ${batchSize}...`);
  
  // Create a new client for this batch
  const client = createDbClient();
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read and parse the CSV file
    const csvPath = './attached_assets/Updated_Most-Recent-Cohorts-Institution.csv';
    const records = [];

    // Create parser
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        columns: true,
        delimiter: ',',
      })
    );

    // Process each record
    for await (const record of parser) {
      if (record.name) {
        records.push(record);
      }
    }
    
    console.log(`Processed ${records.length} records from CSV file`);

    // Get a batch of colleges from the database
    const { rows: colleges } = await client.query(
      'SELECT id, name, state FROM colleges ORDER BY id LIMIT $1 OFFSET $2',
      [batchSize, startIndex]
    );
    console.log(`Found ${colleges.length} colleges in database for this batch`);
    
    if (colleges.length === 0) {
      console.log('No more colleges to process');
      return { finished: true, processedCount: 0 };
    }

    // Create maps for quick lookup by normalized name
    const collegeNameMap = new Map();
    const collegeNameStateMap = new Map(); // For more precise matching with state
    
    for (const college of colleges) {
      const normalizedName = normalizeCollegeName(college.name);
      collegeNameMap.set(normalizedName, college);
      
      // Also create name+state keys for more accurate matching
      if (college.state) {
        const nameStateKey = `${normalizedName}|${college.state.toLowerCase()}`;
        collegeNameStateMap.set(nameStateKey, college);
      }
    }

    // Counter for matches and updates
    let exactNameMatches = 0;
    let nameStateMatches = 0;
    let updateCount = 0;
    let errorCount = 0;
    const updatedCollegeIds = new Set();
    const matchedCsvIds = new Set();

    // Process records and update matching colleges in this batch
    for (const record of records) {
      if (!record.name) continue;
      
      const normalizedCsvName = normalizeCollegeName(record.name);
      const csvState = record.state ? record.state.toLowerCase() : '';
      const nameStateKey = `${normalizedCsvName}|${csvState}`;
      
      // Try to find the college - first by name+state, then by name only
      let college = null;
      let matchType = '';
      
      if (csvState && collegeNameStateMap.has(nameStateKey)) {
        college = collegeNameStateMap.get(nameStateKey);
        matchType = 'name+state';
        nameStateMatches++;
      } else if (collegeNameMap.has(normalizedCsvName)) {
        college = collegeNameMap.get(normalizedCsvName);
        matchType = 'name-only';
        exactNameMatches++;
      }
      
      if (college) {
        // Skip if we've already updated this college or matched this CSV record
        if (updatedCollegeIds.has(college.id) || matchedCsvIds.has(record.id)) {
          continue;
        }
        
        // Add to our tracking sets
        updatedCollegeIds.add(college.id);
        matchedCsvIds.add(record.id);
        
        try {
          // Safely extract the column values we want with proper error handling
          const degreePredominant = safeParseInt(record["degrees_awarded.predominant"]);
          const degreeHighest = safeParseInt(record["degrees_awarded.highest"]);
          const admissionRate = safeParseFloat(record["admission_rate.overall"]);
          const satAverage = safeParseInt(record["sat_scores.average.overall"]);
          const pellGrantRate = safeParseFloat(record["pell_grant_rate"]);
          const completionRate4yr = safeParseFloat(record["completion_rate_4yr_150nt"]);
          const medianDebtCompleters = safeParseInt(record["median_debt.completers.overall"]);
          const medianDebtNoncompleters = safeParseInt(record["median_debt.noncompleters"]);
          const medianFamilyIncome = safeParseFloat(record["demographics.median_family_income"]);
          const medianEarnings10yr = safeParseInt(record["10_yrs_after_entry.median"]);
          const federalId = safeParseInt(record.id);
          
          // Update the college in the database
          const updateQuery = `
            UPDATE colleges 
            SET 
              degrees_awarded_predominant = $1,
              degrees_awarded_highest = $2,
              admission_rate_overall = $3,
              sat_scores_average_overall = $4,
              pell_grant_rate = $5,
              completion_rate_4yr_150nt = $6,
              median_debt_completers_overall = $7,
              median_debt_noncompleters = $8,
              demographics_median_family_income = $9,
              median_earnings_10yrs_after_entry = $10,
              federal_id = $11
            WHERE 
              id = $12
          `;
          
          const values = [
            degreePredominant,
            degreeHighest,
            admissionRate,
            satAverage,
            pellGrantRate,
            completionRate4yr,
            medianDebtCompleters,
            medianDebtNoncompleters,
            medianFamilyIncome,
            medianEarnings10yr,
            federalId,
            college.id
          ];
          
          await client.query(updateQuery, values);
          updateCount++;
          
          if (updateCount % 10 === 0) {
            console.log(`Updated ${updateCount} colleges so far in this batch...`);
          }
          
          if (updateCount < 5) {
            console.log(`Updated ${college.name} (DB ID: ${college.id}) from CSV ID: ${record.id} (Match type: ${matchType})`);
          }
        } catch (err) {
          errorCount++;
          if (errorCount < 5) {
            console.error(`Error updating college ${record.name}:`, err.message);
          } else if (errorCount === 5) {
            console.error('Further error messages will be suppressed...');
          }
        }
      }
    }

    console.log(`\nBatch summary for range ${startIndex}-${startIndex + batchSize}:`);
    console.log(`- Colleges in batch: ${colleges.length}`);
    console.log(`- Name+State matches: ${nameStateMatches}`);
    console.log(`- Name-only matches: ${exactNameMatches}`);
    console.log(`- Total matches: ${nameStateMatches + exactNameMatches}`);
    console.log(`- Successfully updated: ${updateCount} colleges`);
    console.log(`- Errors: ${errorCount}`);

    return { 
      finished: colleges.length < batchSize,
      nextIndex: startIndex + batchSize,
      processedCount: updateCount
    };

  } catch (err) {
    console.error('Error:', err.message);
    return { error: err.message };
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Process multiple batches
async function processBatches(startIndex = 0, batchSize = 200, maxBatches = 5) {
  let currentIndex = startIndex;
  let batchNum = 1;
  let totalProcessed = 0;
  let finished = false;
  
  console.log(`Starting multi-batch processing from index ${startIndex}`);
  console.log(`Batch size: ${batchSize}, Maximum batches: ${maxBatches}`);
  
  while (!finished && batchNum <= maxBatches) {
    console.log(`\n========== Processing Batch #${batchNum} ==========`);
    console.log(`Range: ${currentIndex} to ${currentIndex + batchSize - 1}`);
    
    try {
      const result = await updateCollegesBatch(currentIndex, batchSize);
      
      if (result.error) {
        console.error(`Error in batch #${batchNum}:`, result.error);
        break;
      }
      
      totalProcessed += result.processedCount;
      console.log(`Batch #${batchNum} completed. Processed ${result.processedCount} colleges.`);
      
      if (result.finished) {
        finished = true;
        console.log('All colleges processed!');
      } else {
        currentIndex = result.nextIndex;
        batchNum++;
      }
    } catch (err) {
      console.error(`Fatal error in batch #${batchNum}:`, err.message);
      break;
    }
  }
  
  console.log(`\n========== Processing Summary ==========`);
  console.log(`Total batches processed: ${batchNum}`);
  console.log(`Total colleges updated: ${totalProcessed}`);
  console.log(`${finished ? 'All colleges processed!' : 'More colleges remain to be processed.'}`);
  
  if (!finished) {
    console.log(`To continue processing, run with startIndex=${currentIndex}`);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const startIndex = parseInt(args[0]) || 0;
const batchSize = parseInt(args[1]) || 200;
const maxBatches = parseInt(args[2]) || 5;

// Run the batch processor
processBatches(startIndex, batchSize, maxBatches)
  .then(() => console.log('Batch processing completed'))
  .catch(err => console.error('Fatal error:', err.message));