import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

async function createTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create the table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS favorite_locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        zip_code TEXT NOT NULL,
        city TEXT,
        state TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTableQuery);
    console.log('favorite_locations table created or already exists');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

createTable();