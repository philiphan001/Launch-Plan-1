import { db } from '../db';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function listTables() {
  try {
    console.log('Querying database tables...\n');
    
    // Query to list all tables in the public schema
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('Found tables:');
    console.log('-------------');
    if (result.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      result.forEach((row: any) => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Get database name and user
    const dbInfo = await db.execute(sql`
      SELECT current_database() as db_name, current_user as user;
    `);
    
    console.log('\nDatabase Information:');
    console.log('--------------------');
    console.log(`Database: ${dbInfo[0].db_name}`);
    console.log(`User: ${dbInfo[0].user}`);
    
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

// Run the query
listTables().catch(console.error); 