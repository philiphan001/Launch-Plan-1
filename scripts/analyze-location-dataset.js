import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path for storing import progress
const PROGRESS_FILE = path.join(__dirname, '../.location_import_progress.json');

async function analyzeDataset() {
  try {
    // Load progress file
    let progress = { lastProcessedIndex: 0 };
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, { encoding: 'utf-8' });
      progress = JSON.parse(data);
    }
    
    console.log('Current progress:', progress);
    
    // Read the CSV file
    const csvFilePath = path.join(__dirname, '../attached_assets/COLI by Location.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    
    // Parse the CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    const totalRecords = records.length;
    console.log(`Total records in CSV: ${totalRecords}`);
    
    // Sample records from different parts of the file
    const samplePoints = [
      0, 
      1000, 
      5000, 
      10000, 
      progress.lastProcessedIndex, 
      progress.lastProcessedIndex + 100,
      Math.floor(totalRecords / 2),
      totalRecords - 1000,
      totalRecords - 1
    ];
    
    // Get unique zip codes
    const zipCodes = new Set();
    let missingZipCodes = 0;
    
    records.forEach(record => {
      // Check for zip code in various formats
      const possibleZipKeys = [
        'Zipcode', 'zipcode', 'ZipCode', 'ZIPCODE', 'Zip Code', 'zip_code', 
        'ZIP CODE', 'zip code', '﻿Zipcode', 'ZIP', 'zip'
      ];
      
      let zipCode = null;
      for (const key of possibleZipKeys) {
        if (record[key] && String(record[key]).trim()) {
          zipCode = String(record[key]).trim();
          break;
        }
      }
      
      // If still no zip code, try first column
      if (!zipCode) {
        const firstKey = Object.keys(record)[0];
        if (firstKey && record[firstKey] && /^\d{5}(-\d{4})?$/.test(String(record[firstKey]).trim())) {
          zipCode = String(record[firstKey]).trim();
        }
      }
      
      if (zipCode) {
        zipCodes.add(zipCode);
      } else {
        missingZipCodes++;
      }
    });
    
    console.log(`\nZip Code Analysis:`);
    console.log(`Total unique zip codes: ${zipCodes.size}`);
    console.log(`Records missing zip codes: ${missingZipCodes}`);
    console.log(`Duplicate zip codes: ${totalRecords - zipCodes.size - missingZipCodes}`);
    
    console.log('\nSample Records:');
    samplePoints.forEach(index => {
      if (index >= 0 && index < totalRecords) {
        const record = records[index];
        console.log(`\nRecord at index ${index}:`);
        console.log('Keys:', Object.keys(record));
        console.log('First 3 values:', Object.values(record).slice(0, 3));
        
        // Check for zip code
        const possibleZipKeys = [
          'Zipcode', 'zipcode', 'ZipCode', 'ZIPCODE', 'Zip Code', 'zip_code', 
          'ZIP CODE', 'zip code', '﻿Zipcode', 'ZIP', 'zip'
        ];
        
        let zipCode = null;
        for (const key of possibleZipKeys) {
          if (record[key] && String(record[key]).trim()) {
            zipCode = String(record[key]).trim();
            console.log(`Found zip code '${zipCode}' in field '${key}'`);
            break;
          }
        }
        
        if (!zipCode) {
          const firstKey = Object.keys(record)[0];
          if (firstKey && record[firstKey] && /^\d{5}(-\d{4})?$/.test(String(record[firstKey]).trim())) {
            zipCode = String(record[firstKey]).trim();
            console.log(`Found zip code '${zipCode}' in first field '${firstKey}'`);
          } else {
            console.log('NO ZIP CODE FOUND in this record');
          }
        }
      }
    });
  } catch (error) {
    console.error('Error during analysis:', error);
  }
}

analyzeDataset().catch(console.error);