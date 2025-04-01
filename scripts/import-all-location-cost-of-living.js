import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for storing import progress
const PROGRESS_FILE = path.join(__dirname, '../.location_import_progress.json');

// Batch size for each run (number of records to process per batch)
const BATCH_SIZE = 1000;

// Function to load progress from file
function loadProgressFile() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, { encoding: 'utf-8' });
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading progress file:', err);
  }
  return { lastProcessedIndex: 0, totalRecords: 44238, recordsInserted: 0, recordsWithErrors: 0 };
}

// Function to run the import command for a specific range
function runImport(startIndex, batchSize, truncate = false) {
  return new Promise((resolve, reject) => {
    const truncateArg = truncate ? 'truncate' : '';
    const command = `node scripts/recreate-location-cost-of-living.js ${startIndex} ${batchSize} ${truncateArg}`;
    
    console.log(`Executing: ${command}`);
    
    const proc = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing import: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Import stderr: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
    
    // Set a timeout of 3 minutes (180000ms) for each batch
    const timeout = setTimeout(() => {
      proc.kill();
      console.log(`Batch ${startIndex} to ${startIndex + batchSize} timed out after 3 minutes.`);
      resolve(); // Still resolve to continue with next batch
    }, 180000);
    
    proc.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

// Main function to run the import in batches
async function importAllLocationCostOfLiving() {
  console.log('Starting full location cost of living import process...');
  
  // Check if this is first run (no progress file)
  const isFirstRun = !fs.existsSync(PROGRESS_FILE);
  
  // Load progress
  const progress = loadProgressFile();
  const { lastProcessedIndex, totalRecords } = progress;
  
  console.log(`Import progress: ${lastProcessedIndex} of ${totalRecords} records processed`);
  
  // Run the import batches
  let currentIndex = isFirstRun ? 0 : lastProcessedIndex;
  
  // If this is first run, truncate the table in the first batch
  if (isFirstRun) {
    console.log('First run detected - truncating table before import');
    await runImport(0, BATCH_SIZE, true);
    currentIndex = BATCH_SIZE;
  }
  
  // Process remaining batches
  while (currentIndex < totalRecords) {
    console.log(`\n-------------------------------------------`);
    console.log(`Processing batch starting at index ${currentIndex}`);
    console.log(`-------------------------------------------\n`);
    
    await runImport(currentIndex, BATCH_SIZE);
    
    // Reload progress to get the updated position
    const updatedProgress = loadProgressFile();
    currentIndex = updatedProgress.lastProcessedIndex;
    
    console.log(`\nCompleted batch. Current progress: ${currentIndex} of ${totalRecords} records processed`);
    console.log(`Total records inserted so far: ${updatedProgress.recordsInserted}`);
    console.log(`Total records with errors: ${updatedProgress.recordsWithErrors}`);
    
    // Small delay between batches to allow system to recover
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n==================================================');
  console.log('FULL IMPORT COMPLETE!');
  console.log('==================================================\n');
  
  const finalProgress = loadProgressFile();
  console.log(`Final statistics:`);
  console.log(`- Total records processed: ${finalProgress.totalRecords}`);
  console.log(`- Total records inserted: ${finalProgress.recordsInserted}`);
  console.log(`- Total records with errors: ${finalProgress.recordsWithErrors}`);
}

// Run the import process
importAllLocationCostOfLiving().catch(error => {
  console.error('Import process failed:', error);
  process.exit(1);
});