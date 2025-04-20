import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a Postgres client with the database connection string and SSL configuration
const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false  // Allow self-signed certificates
  }
});

async function importCareers() {
  console.log('Starting career import...');
  
  // Instead of deleting all careers, we'll fetch existing ones to update them
  const existingCareers = await sql`SELECT id, title FROM careers`;
  console.log(`Found ${existingCareers.length} existing careers`);

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data using Promise with enhanced options
  const records = await new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_records_with_error: true,
      on_record: (record, context) => {
        // Clean up each field
        Object.keys(record).forEach(key => {
          if (typeof record[key] === 'string') {
            record[key] = record[key].trim();
            if (record[key] === '') record[key] = null;
          }
        });
        // Debug log for Alias 5
        if (record['Alias 5'] && record['Alias 5'] !== '') {
          console.log('Found Alias 5:', record['Occupation'], '=>', record['Alias 5']);
        }
        return record;
      }
    }, (err, records) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(records);
    });
  });
  
  console.log(`Parsed ${records.length} career records from CSV`);
  
  let insertCount = 0;
  let updateCount = 0;
  let errorCount = 0;
  
  // Process records in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    // Process and transform each record in the batch
    const careerData = batch.map(record => {
      try {
        // Extract salary information and handle comma-separated numbers
        let salary = 0;
        let salaryPct10 = null;
        let salaryPct25 = null;
        let salaryMedian = null;
        let salaryPct75 = null;
        let salaryPct90 = null;
        
        // Parse all the income percentile fields
        const parseSalary = (value) => {
          if (!value || value === '#') return null;
          const clean = value.replace(/[^0-9.]/g, '');
          const parsed = parseInt(clean);
          return isNaN(parsed) ? null : parsed;
        };
        
        salaryPct10 = parseSalary(record['A_PCT10']);
        salaryPct25 = parseSalary(record['A_PCT25']);
        salaryMedian = parseSalary(record['A_MEDIAN']);
        salaryPct75 = parseSalary(record['A_PCT75']);
        salaryPct90 = parseSalary(record['A_PCT90']);
        
        // Set primary salary field
        salary = salaryMedian || parseSalary(record['A_MEAN']) || (parseSalary(record['Monthly Income']) * 12) || 0;
        
        // Determine growth rate based on position in list
        let growthRate = 'stable';
        const employment = parseInt((record['TOT_EMP'] || '0').replace(/[^0-9]/g, '')) || 0;
        if (employment > 500000) growthRate = 'fast';
        if (employment < 50000) growthRate = 'slow';
        
        // Determine education requirement
        let education = "Bachelor's";
        const occCode = record['OCC_CODE'] || '';
        if (occCode.startsWith('11')) education = "Master's";
        if (occCode.startsWith('51')) education = "High School";
        
        // Determine category based on OCC_CODE
        let category = 'Other';
        if (occCode.startsWith('11')) category = 'Management';
        if (occCode.startsWith('13')) category = 'Finance';
        if (occCode.startsWith('15')) category = 'Technology';
        if (occCode.startsWith('25')) category = 'Education';
        if (occCode.startsWith('29')) category = 'Healthcare';
        
        // Clean up aliases - ensure they're strings or null
        const cleanAlias = (value) => {
          if (!value || value === '') return null;
          return value.trim();
        };
        
        return {
          title: record['Occupation'],
          description: `${record['Occupation']} in the ${category} field`,
          salary: salary,
          growth_rate: growthRate,
          education: education,
          category: category,
          alias1: cleanAlias(record['Alias 1']),
          alias2: cleanAlias(record['Alias 2']),
          alias3: cleanAlias(record['Alias 3']),
          alias4: cleanAlias(record['Alias 4']),
          alias5: cleanAlias(record['Alias 5']),
          salary_pct_10: salaryPct10,
          salary_pct_25: salaryPct25,
          salary_median: salaryMedian,
          salary_pct_75: salaryPct75,
          salary_pct_90: salaryPct90
        };
      } catch (error) {
        console.error(`Error processing record:`, record, error);
        errorCount++;
        return null;
      }
    }).filter(Boolean); // Remove any null records from errors
    
    // Process each career - update existing or insert new
    for (const careerItem of careerData) {
      try {
        // Check if this career already exists by title
        const existingCareer = existingCareers.find(c => c.title === careerItem.title);
        
        if (existingCareer) {
          // Update existing career with new data
          await sql`
            UPDATE careers SET
              description = ${careerItem.description},
              salary = ${careerItem.salary},
              growth_rate = ${careerItem.growth_rate},
              education = ${careerItem.education},
              category = ${careerItem.category},
              alias1 = ${careerItem.alias1},
              alias2 = ${careerItem.alias2},
              alias3 = ${careerItem.alias3},
              alias4 = ${careerItem.alias4},
              alias5 = ${careerItem.alias5},
              salary_pct_10 = ${careerItem.salary_pct_10},
              salary_pct_25 = ${careerItem.salary_pct_25},
              salary_median = ${careerItem.salary_median},
              salary_pct_75 = ${careerItem.salary_pct_75},
              salary_pct_90 = ${careerItem.salary_pct_90}
            WHERE id = ${existingCareer.id}
          `;
          updateCount++;
          if (updateCount % 100 === 0) {
            console.log(`Updated ${updateCount} careers...`);
          }
        } else {
          // Insert new career
          await sql`
            INSERT INTO careers (
              title, description, salary, growth_rate, education, category,
              alias1, alias2, alias3, alias4, alias5,
              salary_pct_10, salary_pct_25, salary_median, salary_pct_75, salary_pct_90
            ) VALUES (
              ${careerItem.title},
              ${careerItem.description},
              ${careerItem.salary},
              ${careerItem.growth_rate},
              ${careerItem.education},
              ${careerItem.category},
              ${careerItem.alias1},
              ${careerItem.alias2},
              ${careerItem.alias3},
              ${careerItem.alias4},
              ${careerItem.alias5},
              ${careerItem.salary_pct_10},
              ${careerItem.salary_pct_25},
              ${careerItem.salary_median},
              ${careerItem.salary_pct_75},
              ${careerItem.salary_pct_90}
            )
          `;
          insertCount++;
          if (insertCount % 100 === 0) {
            console.log(`Inserted ${insertCount} new careers...`);
          }
        }
      } catch (error) {
        console.error(`Error processing career ${careerItem.title}:`, error);
        errorCount++;
      }
    }
  }
  
  console.log('\nImport completed:');
  console.log(`- Inserted ${insertCount} new careers`);
  console.log(`- Updated ${updateCount} existing careers`);
  console.log(`- Encountered ${errorCount} errors`);
  
  await sql.end();
}

// Run the import
importCareers().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});