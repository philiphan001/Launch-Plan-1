#!/usr/bin/env node

// Using require instead of import for better compatibility
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');

async function importCsvData() {
  console.log('Importing CSV data into PostgreSQL...');
  
  // Get the database connection and schema
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const sql = postgres(DATABASE_URL);
  
  // Load the schema dynamically
  const { colleges, careers } = require('../shared/schema');
  
  // Create the drizzle instance
  const db = drizzle(sql, { schema: { colleges, careers } });
  
  const dataDir = path.join(process.cwd(), 'server', 'data');
  
  try {
    // Check for colleges CSV
    try {
      const collegeData = await fs.readFile(path.join(dataDir, 'college_data.csv'), 'utf8');
      const collegeRecords = parse(collegeData, { columns: true, skip_empty_lines: true });
      console.log(`Found ${collegeRecords.length} colleges to import`);
      
      // Process and insert colleges
      for (const record of collegeRecords) {
        // Parse numeric values
        const tuition = parseInt(record.tuition || '0', 10);
        const roomAndBoard = parseInt(record.room_and_board || '0', 10);
        const acceptanceRate = parseFloat(record.acceptance_rate || '0');
        const rating = parseFloat(record.rating || '0');
        const rank = parseInt(record.rank || '0', 10);
        
        // Parse fees by income (could be JSON string or object)
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
        await db.insert(colleges).values({
          name: record.name,
          location: record.location,
          state: record.state,
          type: record.type,
          tuition: tuition,
          roomAndBoard: roomAndBoard,
          acceptanceRate: acceptanceRate,
          rating: rating,
          size: record.size,
          rank: rank,
          feesByIncome: feesByIncome
        }).onConflictDoUpdate({
          target: colleges.name,
          set: {
            location: record.location,
            state: record.state,
            type: record.type,
            tuition: tuition,
            roomAndBoard: roomAndBoard,
            acceptanceRate: acceptanceRate,
            rating: rating,
            size: record.size,
            rank: rank,
            feesByIncome: feesByIncome
          }
        });
      }
      
      console.log('College data imported successfully!');
    } catch (err) {
      console.log('No college CSV file found or error reading it:', err.message);
    }
    
    // Check for careers CSV
    try {
      const careerData = await fs.readFile(path.join(dataDir, 'occupation_data.csv'), 'utf8');
      const careerRecords = parse(careerData, { columns: true, skip_empty_lines: true });
      console.log(`Found ${careerRecords.length} careers to import`);
      
      // Process and insert careers
      for (const record of careerRecords) {
        // Parse numeric values
        const salary = parseInt(record.salary || '0', 10);
        
        // Insert into database
        await db.insert(careers).values({
          title: record.title,
          description: record.description,
          salary: salary,
          growthRate: record.growth_rate,
          education: record.education,
          category: record.category
        }).onConflictDoUpdate({
          target: careers.title,
          set: {
            description: record.description,
            salary: salary,
            growthRate: record.growth_rate,
            education: record.education,
            category: record.category
          }
        });
      }
      
      console.log('Career data imported successfully!');
    } catch (err) {
      console.log('No career CSV file found or error reading it:', err.message);
    }
    
    console.log('CSV import completed!');
    
  } catch (error) {
    console.error('Error importing CSV data:', error);
    process.exit(1);
  }
}

// For direct execution
if (require.main === module) {
  importCsvData().catch(console.error);
}

// For importing in other files
module.exports = { importCsvData };
