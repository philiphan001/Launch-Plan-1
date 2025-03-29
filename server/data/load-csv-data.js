#!/usr/bin/env node

/**
 * This script loads CSV data into the PostgreSQL database.
 * It's meant to be run once to set up the initial data.
 * 
 * Usage: DATABASE_URL=postgres://... node server/data/load-csv-data.js
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { parse } from 'csv-parse/sync';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadCsvData() {
  console.log('Loading CSV data into PostgreSQL database...');
  
  // Get the database connection string
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Create database connection
  const sql = postgres(DATABASE_URL);
  
  // Path to the data directory
  const dataDir = path.join(__dirname);
  
  try {
    // Load college data if available
    try {
      const collegeFilePath = path.join(dataDir, 'college_data.csv');
      console.log('Checking for college data at:', collegeFilePath);
      
      const collegeData = await fs.readFile(collegeFilePath, 'utf8');
      const collegeRecords = parse(collegeData, { columns: true, skip_empty_lines: true });
      console.log(`Found ${collegeRecords.length} colleges to import`);
      
      // Clear existing data (optional)
      await sql`TRUNCATE TABLE colleges CASCADE`;
      
      // Insert colleges
      for (const record of collegeRecords) {
        // Parse numeric values
        const tuition = parseInt(record.tuition || '0', 10);
        const roomAndBoard = parseInt(record.room_and_board || '0', 10);
        const acceptanceRate = parseFloat(record.acceptance_rate || '0');
        const rating = parseFloat(record.rating || '0');
        const rank = parseInt(record.rank || '0', 10);
        
        // Parse fees by income
        let feesByIncome = {};
        try {
          feesByIncome = record.fees_by_income ? 
            (typeof record.fees_by_income === 'string' ? 
              JSON.parse(record.fees_by_income) : 
              record.fees_by_income) : 
            {};
        } catch (e) {
          console.warn(`Warning: Could not parse fees_by_income for ${record.name}`);
        }
        
        // Insert into database
        await sql`
          INSERT INTO colleges (
            name, location, state, type, tuition, 
            "roomAndBoard", "acceptanceRate", rating, size, rank, "feesByIncome"
          ) VALUES (
            ${record.name}, ${record.location}, ${record.state}, ${record.type}, ${tuition},
            ${roomAndBoard}, ${acceptanceRate}, ${rating}, ${record.size}, ${rank}, ${JSON.stringify(feesByIncome)}
          )
          ON CONFLICT (name) DO UPDATE SET
            location = ${record.location},
            state = ${record.state},
            type = ${record.type},
            tuition = ${tuition},
            "roomAndBoard" = ${roomAndBoard},
            "acceptanceRate" = ${acceptanceRate},
            rating = ${rating},
            size = ${record.size},
            rank = ${rank},
            "feesByIncome" = ${JSON.stringify(feesByIncome)}
        `;
      }
      
      console.log('College data imported successfully!');
    } catch (err) {
      console.error('Error loading college data:', err);
    }
    
    // Load career/occupation data if available
    try {
      const careerFilePath = path.join(dataDir, 'occupation_data.csv');
      console.log('Checking for career data at:', careerFilePath);
      
      const careerData = await fs.readFile(careerFilePath, 'utf8');
      const careerRecords = parse(careerData, { columns: true, skip_empty_lines: true });
      console.log(`Found ${careerRecords.length} careers to import`);
      
      // Clear existing data (optional)
      await sql`TRUNCATE TABLE careers CASCADE`;
      
      // Insert careers
      for (const record of careerRecords) {
        // Parse numeric values
        const salary = parseInt(record.salary || '0', 10);
        
        // Insert into database
        await sql`
          INSERT INTO careers (
            title, description, salary, "growthRate", education, category
          ) VALUES (
            ${record.title}, ${record.description}, ${salary}, 
            ${record.growth_rate}, ${record.education}, ${record.category}
          )
          ON CONFLICT (title) DO UPDATE SET
            description = ${record.description},
            salary = ${salary},
            "growthRate" = ${record.growth_rate},
            education = ${record.education},
            category = ${record.category}
        `;
      }
      
      console.log('Career data imported successfully!');
    } catch (err) {
      console.error('Error loading career data:', err);
    }
    
    // Load zip code/COLI data if available
    try {
      const coliFilePath = path.join(dataDir, 'coli_data.csv');
      console.log('Checking for cost of living index data at:', coliFilePath);
      
      if (await fs.access(coliFilePath).then(() => true).catch(() => false)) {
        const coliData = await fs.readFile(coliFilePath, 'utf8');
        const coliRecords = parse(coliData, { columns: true, skip_empty_lines: true });
        console.log(`Found ${coliRecords.length} COLI records to import`);
        
        // Check if table exists, if not create it
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'cost_of_living_index'
          )
        `;
        
        if (!tableExists[0].exists) {
          console.log('Creating cost_of_living_index table...');
          await sql`
            CREATE TABLE cost_of_living_index (
              id SERIAL PRIMARY KEY,
              zip_code TEXT NOT NULL UNIQUE,
              city TEXT,
              state TEXT,
              overall_index NUMERIC,
              grocery_index NUMERIC,
              housing_index NUMERIC,
              utilities_index NUMERIC,
              transportation_index NUMERIC,
              healthcare_index NUMERIC,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `;
        } else {
          // Clear existing data
          await sql`TRUNCATE TABLE cost_of_living_index`;
        }
        
        // Insert COLI data
        for (const record of coliRecords) {
          await sql`
            INSERT INTO cost_of_living_index (
              zip_code, city, state, overall_index, grocery_index,
              housing_index, utilities_index, transportation_index, healthcare_index
            ) VALUES (
              ${record.zip_code}, ${record.city}, ${record.state}, 
              ${parseFloat(record.overall_index || '100')},
              ${parseFloat(record.grocery_index || '100')},
              ${parseFloat(record.housing_index || '100')},
              ${parseFloat(record.utilities_index || '100')},
              ${parseFloat(record.transportation_index || '100')},
              ${parseFloat(record.healthcare_index || '100')}
            )
            ON CONFLICT (zip_code) DO UPDATE SET
              city = ${record.city},
              state = ${record.state},
              overall_index = ${parseFloat(record.overall_index || '100')},
              grocery_index = ${parseFloat(record.grocery_index || '100')},
              housing_index = ${parseFloat(record.housing_index || '100')},
              utilities_index = ${parseFloat(record.utilities_index || '100')},
              transportation_index = ${parseFloat(record.transportation_index || '100')},
              healthcare_index = ${parseFloat(record.healthcare_index || '100')}
          `;
        }
        
        console.log('COLI data imported successfully!');
      } else {
        console.log('No COLI data file found.');
      }
    } catch (err) {
      console.error('Error loading COLI data:', err);
    }
    
    console.log('CSV data import completed!');
    
  } catch (error) {
    console.error('Error in CSV data import process:', error);
  } finally {
    // Close the connection
    await sql.end();
  }
}

// Run the script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loadCsvData()
    .then(() => {
      console.log('Import script completed successfully.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Import script failed:', err);
      process.exit(1);
    });
}

export { loadCsvData };