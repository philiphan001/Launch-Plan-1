import { db } from '../db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import postgres from 'postgres';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
const { Client } = pg;
import { drizzle } from 'drizzle-orm/postgres-js';
import { users } from '@shared/schema';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function listDatabaseTables(client: pg.Client) {
  try {
    const result = await client.query(`
      SELECT 
        table_schema,
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name;
    `);
    
    console.log('\nDatabase Tables:');
    console.log('----------------');
    result.rows.forEach((row: { table_schema: string; table_name: string; column_count: number }) => {
      console.log(`Schema: ${row.table_schema}, Table: ${row.table_name}, Columns: ${row.column_count}`);
    });
  } catch (error) {
    console.error('Error listing tables:', error);
  }
}

async function testMainConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return false;
  }

  try {
    console.log('\nTesting main database connection...');
    const mainClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
      },
    });

    await mainClient.connect();
    const res = await mainClient.query('SELECT table_schema, table_name FROM information_schema.tables');
    console.log('\nAvailable tables:');
    res.rows.forEach((row: { table_schema: string; table_name: string }) => {
      console.log(`${row.table_schema}.${row.table_name}`);
    });

    await mainClient.end();
    console.log('\nMain database connection test successful!');
    return true;
  } catch (error) {
    console.error('Error testing main database connection:', error);
    return false;
  }
}

async function testSessionConnection(): Promise<boolean> {
  try {
    console.log('\nTesting session database connection...');
    const sessionClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
      },
    });

    await sessionClient.connect();
    const res = await sessionClient.query('SELECT table_schema, table_name FROM information_schema.tables');
    console.log('\nAvailable tables:');
    res.rows.forEach((row: { table_schema: string; table_name: string }) => {
      console.log(`${row.table_schema}.${row.table_name}`);
    });

    await sessionClient.end();
    console.log('\nSession database connection test successful!');
    return true;
  } catch (error) {
    console.error('Error testing session database connection:', error);
    return false;
  }
}

async function testConnectPgSimple() {
  try {
    console.log('\nTesting connect-pg-simple with SSL...');
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    // Create a modified connection string with SSL parameters
    const dbUrl = new URL(process.env.DATABASE_URL);
    dbUrl.searchParams.set('sslmode', 'verify-full');
    dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem'));

    const PgSession = connectPgSimple(session);
    const store = new PgSession({
      conString: dbUrl.toString(),
      tableName: 'session',
      createTableIfMissing: true
    });

    // Test session store operations
    const sessionId = 'test-session-' + Date.now();
    const testData = { 
      test: 'data', 
      timestamp: new Date().toISOString(),
      cookie: {
        originalMaxAge: 86400000, // 24 hours
        expires: new Date(Date.now() + 86400000),
        secure: true,
        httpOnly: true,
        path: '/'
      }
    };

    // Test set operation
    await new Promise((resolve, reject) => {
      store.set(sessionId, testData, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    console.log('Session set operation successful');

    // Test get operation
    const retrievedData = await new Promise((resolve, reject) => {
      store.get(sessionId, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    console.log('Session get operation successful');
    console.log('Retrieved session data:', retrievedData);

    // Test destroy operation
    await new Promise((resolve, reject) => {
      store.destroy(sessionId, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    console.log('Session destroy operation successful');

    return true;
  } catch (error) {
    console.error('connect-pg-simple test failed:', error);
    return false;
  }
}

async function listTables(client: pg.Client) {
  console.log('\nListing all tables in the database...');
  const query = `
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_schema, table_name;
  `;
  const result = await client.query(query);
  console.log('\nFound tables:');
  result.rows.forEach((row: { table_schema: string; table_name: string }) => {
    console.log(`${row.table_schema}.${row.table_name}`);
  });
}

async function runTests() {
  const mainResult = await testMainConnection();
  const sessionResult = await testSessionConnection();
  const connectPgSimpleResult = await testConnectPgSimple();

  console.log('\nTest Results:');
  console.log('Main Connection:', mainResult ? 'Success' : 'Failed');
  console.log('Session Connection:', sessionResult ? 'Success' : 'Failed');
  console.log('Connect-PG-Simple:', connectPgSimpleResult ? 'Success' : 'Failed');
}

runTests().catch(console.error); 