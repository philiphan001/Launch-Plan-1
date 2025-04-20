import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the CSV file
const csvFilePath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

// Split into lines
const lines = fileContent.split('\n');

// Get headers
const headers = lines[0].split(',').map(h => h.trim());
const occupationIndex = headers.findIndex(h => h === 'Occupation');
const alias5Index = headers.findIndex(h => h === 'Alias 5');

console.log('Headers:', headers);
console.log('Occupation index:', occupationIndex);
console.log('Alias 5 index:', alias5Index);

// Function to extract fields from a line
function extractFields(line) {
  const fields = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add the last field
  fields.push(currentField.trim());
  
  return fields;
}

// Process records
console.log('\nProcessing records:');
let count = 0;
let currentRecord = null;

for (let i = 1; i < lines.length && count < 20; i++) {
  const line = lines[i];
  const fields = extractFields(line);
  
  console.log(`\nLine ${i}:`);
  console.log('Raw line:', line);
  console.log('Fields:', fields);
  
  // If this line starts with "U.S.", it's a new record
  if (line.startsWith('U.S.')) {
    // Process previous record if it exists
    if (currentRecord) {
      console.log('Completed record:', currentRecord);
      if (currentRecord.alias5 && currentRecord.alias5.trim()) {
        console.log('Found record with Alias 5!');
        count++;
      }
    }
    
    // Start new record
    currentRecord = {
      title: fields[occupationIndex],
      alias5: fields[alias5Index]
    };
    console.log('Started new record:', currentRecord);
  } else if (currentRecord) {
    // This is a continuation line - append to the current record
    if (fields[occupationIndex]) {
      currentRecord.title = (currentRecord.title || '') + ' ' + fields[occupationIndex];
    }
    if (fields[alias5Index]) {
      currentRecord.alias5 = (currentRecord.alias5 || '') + ' ' + fields[alias5Index];
    }
    console.log('Updated record:', currentRecord);
  }
}

// Check the last record
if (currentRecord) {
  console.log('\nFinal record:', currentRecord);
  if (currentRecord.alias5 && currentRecord.alias5.trim() && count < 20) {
    console.log('Found record with Alias 5!');
  }
} 