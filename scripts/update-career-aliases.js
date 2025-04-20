import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS RDS SSL Configuration
const sslConfig = {
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
  servername: new URL(process.env.DATABASE_URL).hostname
};

// Create a Postgres client
const sql = postgres(process.env.DATABASE_URL, {
  ssl: sslConfig,
  connect_timeout: 30,
  idle_timeout: 60,
  max: 10
});

// Function to clean field values
function cleanField(value) {
  if (!value) return null;
  // Remove quotes, trim whitespace, normalize line breaks
  const cleaned = value.toString()
    .replace(/^"|"$/g, '')  // Remove surrounding quotes
    .replace(/\r?\n/g, ' ')  // Replace newlines with spaces
    .replace(/\s+/g, ' ')   // Normalize multiple spaces
    .trim();                // Trim whitespace
  return cleaned || null;
}

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

async function updateCareerAliases() {
  console.log('Starting career alias updates...');
  
  try {
    // Read the CSV file
    const csvFilePath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    const lines = fileContent.split('\n');
    
    // Get headers
    const headers = lines[0].split(',').map(h => h.trim());
    const occupationIndex = headers.findIndex(h => h === 'Occupation');
    const alias1Index = headers.findIndex(h => h === 'Alias 1');
    
    console.log('Headers:', headers);
    console.log('Occupation index:', occupationIndex);
    console.log('Alias 1 index:', alias1Index);
    
    // First, let's get all careers from the database for comparison
    const dbCareers = await sql`SELECT id, title, alias5 FROM careers`;
    console.log(`Found ${dbCareers.length} careers in database`);

    // Create a map of normalized titles to database IDs and current alias5
    const careerMap = new Map();
    for (const career of dbCareers) {
      const title = cleanField(career.title);
      if (title) {
        careerMap.set(title.toLowerCase(), {
          id: career.id,
          currentAlias5: career.alias5 === 'null' ? null : career.alias5,
          title: title // Keep original title for logging
        });
      }
    }
    
    // Process records
    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;
    let noChangeCount = 0;
    const notFoundCareers = new Set();
    const updatedCareers = new Map(); // Map to store title -> alias5
    
    let currentRecord = null;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const fields = extractFields(line);
      
      // If this line starts with "U.S.", it's a new record
      if (line.startsWith('U.S.')) {
        // Process previous record if it exists
        if (currentRecord) {
          const title = cleanField(currentRecord.title);
          const alias5 = cleanField(currentRecord.alias1); // Use alias1 instead of alias5
          
          if (!title) {
            skippedCount++;
          } else {
            const normalizedTitle = title.toLowerCase();
            const careerInfo = careerMap.get(normalizedTitle);
            
            if (careerInfo) {
              const currentAlias5 = careerInfo.currentAlias5 === 'null' ? null : careerInfo.currentAlias5;
              
              if (currentAlias5 !== alias5) {
                try {
                  const result = await sql`
                    UPDATE careers 
                    SET alias5 = ${alias5}
                    WHERE id = ${careerInfo.id}
                    RETURNING id, title, alias5
                  `;
                  
                  if (result.length > 0) {
                    updatedCount++;
                    updatedCareers.set(title, alias5);
                    console.log(`Updated career ${careerInfo.title}: alias5 = ${alias5}`);
                  }
                } catch (err) {
                  console.error(`Error updating career "${title}":`, err);
                }
              } else {
                noChangeCount++;
              }
            } else {
              notFoundCount++;
              notFoundCareers.add(title);
            }
          }
        }
        
        // Start new record
        currentRecord = {
          title: fields[occupationIndex],
          alias1: fields[alias1Index]
        };
      } else if (currentRecord) {
        // This is a continuation line - append to the current record
        if (fields[occupationIndex]) {
          currentRecord.title = (currentRecord.title || '') + ' ' + fields[occupationIndex];
        }
        if (fields[alias1Index]) {
          currentRecord.alias1 = (currentRecord.alias1 || '') + ' ' + fields[alias1Index];
        }
      }
    }
    
    // Process the last record
    if (currentRecord) {
      const title = cleanField(currentRecord.title);
      const alias5 = cleanField(currentRecord.alias1); // Use alias1 instead of alias5
      
      if (!title) {
        skippedCount++;
      } else {
        const normalizedTitle = title.toLowerCase();
        const careerInfo = careerMap.get(normalizedTitle);
        
        if (careerInfo) {
          const currentAlias5 = careerInfo.currentAlias5 === 'null' ? null : careerInfo.currentAlias5;
          
          if (currentAlias5 !== alias5) {
            try {
              const result = await sql`
                UPDATE careers 
                SET alias5 = ${alias5}
                WHERE id = ${careerInfo.id}
                RETURNING id, title, alias5
              `;
              
              if (result.length > 0) {
                updatedCount++;
                updatedCareers.set(title, alias5);
                console.log(`Updated career ${careerInfo.title}: alias5 = ${alias5}`);
              }
            } catch (err) {
              console.error(`Error updating career "${title}":`, err);
            }
          } else {
            noChangeCount++;
          }
        } else {
          notFoundCount++;
          notFoundCareers.add(title);
        }
      }
    }

    console.log(`\nUpdate completed:`);
    console.log(`- Updated ${updatedCount} careers`);
    console.log(`- ${noChangeCount} careers already had correct alias5`);
    console.log(`- ${notFoundCount} careers not found in database`);
    console.log(`- ${skippedCount} records skipped (missing title)`);
    
    if (updatedCount > 0) {
      console.log('\nFirst 5 careers that were updated:');
      Array.from(updatedCareers.entries()).slice(0, 5).forEach(([title, alias5]) => {
        console.log(`- "${title}" -> Alias 5: ${alias5 === null ? 'null' : `"${alias5}"`}`);
      });
    }
    
    if (notFoundCount > 0) {
      console.log('\nFirst 5 careers not found in database:');
      Array.from(notFoundCareers).slice(0, 5).forEach(title => {
        console.log(`- "${title}"`);
      });
    }
  } catch (error) {
    console.error('Update failed:', error);
  } finally {
    await sql.end();
  }
}

// Run the update
updateCareerAliases().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
}); 