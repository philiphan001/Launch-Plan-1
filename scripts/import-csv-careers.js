import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// Get current file path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL);

async function importCareers() {
  console.log('Starting career import...');
  
  // Instead of deleting all careers, we'll fetch existing ones to update them
  const existingCareers = await sql`SELECT id, title FROM careers`;
  console.log(`Found ${existingCareers.length} existing careers`);

  // Read and parse the CSV file
  const csvFilePath = path.join(__dirname, '../attached_assets/BLS Occupations Income.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
  
  // Parse CSV data using Promise
  const records = await new Promise((resolve, reject) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true
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
  
  // Process records in batches to avoid memory issues
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    // Process and transform each record in the batch
    const careerData = batch.map(record => {
      // Extract salary information and handle comma-separated numbers
      let salary = 0;
      let salaryPct10 = null;
      let salaryPct25 = null;
      let salaryMedian = null;
      let salaryPct75 = null;
      let salaryPct90 = null;
      
      try {
        // Parse all the income percentile fields
        // 10th percentile
        if (record['A_PCT10'] && record['A_PCT10'] !== '#') {
          const cleanPct10 = record['A_PCT10'].replace(/,/g, '');
          const parsedPct10 = parseInt(cleanPct10);
          if (!isNaN(parsedPct10)) {
            salaryPct10 = parsedPct10;
          }
        }
        
        // 25th percentile
        if (record['A_PCT25'] && record['A_PCT25'] !== '#') {
          const cleanPct25 = record['A_PCT25'].replace(/,/g, '');
          const parsedPct25 = parseInt(cleanPct25);
          if (!isNaN(parsedPct25)) {
            salaryPct25 = parsedPct25;
          }
        }
        
        // Median (50th percentile)
        if (record['A_MEDIAN'] && record['A_MEDIAN'] !== '#') {
          const cleanMedian = record['A_MEDIAN'].replace(/,/g, '');
          const parsedMedian = parseInt(cleanMedian);
          if (!isNaN(parsedMedian)) {
            salaryMedian = parsedMedian;
            salary = parsedMedian; // Keep existing salary field for backward compatibility
          }
        }
        
        // 75th percentile
        if (record['A_PCT75'] && record['A_PCT75'] !== '#') {
          const cleanPct75 = record['A_PCT75'].replace(/,/g, '');
          const parsedPct75 = parseInt(cleanPct75);
          if (!isNaN(parsedPct75)) {
            salaryPct75 = parsedPct75;
          }
        }
        
        // 90th percentile
        if (record['A_PCT90'] && record['A_PCT90'] !== '#') {
          const cleanPct90 = record['A_PCT90'].replace(/,/g, '');
          const parsedPct90 = parseInt(cleanPct90);
          if (!isNaN(parsedPct90)) {
            salaryPct90 = parsedPct90;
          }
        }
        
        // If median is not available or invalid, try mean salary
        if (salary === 0 && record['A_MEAN'] && record['A_MEAN'] !== '#') {
          const cleanMean = record['A_MEAN'].replace(/,/g, '');
          const parsedMean = parseInt(cleanMean);
          if (!isNaN(parsedMean)) {
            salary = parsedMean;
          }
        }
        
        // If both are unavailable or invalid, fallback to monthly income
        if (salary === 0 && record['Monthly Income'] && record['Monthly Income'] !== '#') {
          const monthlyClean = record['Monthly Income'].replace(/,/g, '');
          const parsedMonthly = parseInt(monthlyClean);
          if (!isNaN(parsedMonthly)) {
            salary = parsedMonthly * 12; // Convert monthly to annual
          }
        }
      } catch (error) {
        console.warn(`Could not parse salary for ${record['Occupation']}:`, error);
      }
      
      // Determine growth rate based on position in list (just a placeholder logic)
      let growthRate = 'stable';
      const employment = parseInt(record['TOT_EMP'].replace(/,/g, '')) || 0;
      if (employment > 500000) growthRate = 'fast';
      if (employment < 50000) growthRate = 'slow';
      
      // Determine education requirement (simplified example)
      let education = "Bachelor's";
      if (record['OCC_CODE'].startsWith('11')) education = "Master's";
      if (record['OCC_CODE'].startsWith('51')) education = "High School";
      
      // Determine category based on OCC_CODE
      let category = 'Other';
      if (record['OCC_CODE'].startsWith('11')) category = 'Management';
      if (record['OCC_CODE'].startsWith('13')) category = 'Finance';
      if (record['OCC_CODE'].startsWith('15')) category = 'Technology';
      if (record['OCC_CODE'].startsWith('25')) category = 'Education';
      if (record['OCC_CODE'].startsWith('29')) category = 'Healthcare';
      
      return {
        title: record['Occupation'],
        description: `${record['Occupation']} in the ${category} field`,
        salary: salary,
        growth_rate: growthRate,
        education: education,
        category: category,
        alias1: record['Alias 1'] || null,
        alias2: record['Alias 2'] || null,
        alias3: record['Alias 3'] || null,
        alias4: record['Alias 4'] || null,
        alias5: record['Alias 5'] || null,
        salary_pct_10: salaryPct10,
        salary_pct_25: salaryPct25,
        salary_median: salaryMedian,
        salary_pct_75: salaryPct75,
        salary_pct_90: salaryPct90
      };
    });
    
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
          console.log(`Updated career: ${careerItem.title}`);
        } else {
          // Insert new career
          await sql`
            INSERT INTO careers (
              title, description, salary, growth_rate, education, category,
              alias1, alias2, alias3, alias4, alias5,
              salary_pct_10, salary_pct_25, salary_median, salary_pct_75, salary_pct_90
            ) VALUES (
              ${careerItem.title}, ${careerItem.description}, ${careerItem.salary}, 
              ${careerItem.growth_rate}, ${careerItem.education}, ${careerItem.category},
              ${careerItem.alias1}, ${careerItem.alias2}, ${careerItem.alias3}, 
              ${careerItem.alias4}, ${careerItem.alias5},
              ${careerItem.salary_pct_10}, ${careerItem.salary_pct_25}, ${careerItem.salary_median}, 
              ${careerItem.salary_pct_75}, ${careerItem.salary_pct_90}
            )
          `;
          insertCount++;
          if (insertCount % 10 === 0) {
            console.log(`Processed ${insertCount} careers so far...`);
          }
        }
      } catch (error) {
        console.error(`Error processing career ${careerItem.title}:`, error);
      }
    }
  }
  
  console.log(`Career import completed successfully. Total records: ${insertCount}`);
  // Close the database connection
  await sql.end();
}

// Execute the import function
importCareers().catch(error => {
  console.error('Import failed:', error);
  process.exit(1);
});