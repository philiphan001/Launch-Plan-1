import { db, getSSLConfig } from '../db';
import { sessionStore } from '../session';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import { SessionData } from 'express-session';

// Load environment variables
dotenv.config();

async function testDatabaseConnection() {
  try {
    console.log('Testing main database connection...');
    // Try to execute a simple query
    const result = await db.execute(sql`SELECT version()`);
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    if (error instanceof Error && error.message.includes('SSL')) {
      console.error('SSL configuration error detected. Please check your certificates and SSL settings.');
    }
    return false;
  }
}

async function testSessionStore() {
  try {
    console.log('\nTesting session store connection...');
    // Try to create a test session with proper session data structure
    const testSession: SessionData = {
      cookie: {
        originalMaxAge: 3600000,
        expires: new Date(Date.now() + 3600000),
        secure: false,
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
      }
    };
    
    await new Promise((resolve, reject) => {
      sessionStore.set('test-session', testSession, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    
    console.log('✅ Session store connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Session store connection failed:', error);
    if (error instanceof Error && error.message.includes('SSL')) {
      console.error('SSL configuration error detected in session store. Please check your certificates and SSL settings.');
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting SSL connection tests...\n');
  
  const dbSuccess = await testDatabaseConnection();
  const sessionSuccess = await testSessionStore();
  
  console.log('\nTest Summary:');
  console.log('-------------');
  console.log(`Database Connection: ${dbSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Session Store: ${sessionSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!dbSuccess || !sessionSuccess) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error); 