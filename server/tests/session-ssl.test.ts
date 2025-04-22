import { sessionStore } from '../session';
import dotenv from 'dotenv';
import { SessionData } from 'express-session';

// Load environment variables
dotenv.config();

async function testSessionSSL() {
  try {
    console.log('Testing Session Store SSL Connection...\n');
    
    // Create a test session
    const testSession: SessionData = {
      cookie: {
        originalMaxAge: 3600000,
        expires: new Date(Date.now() + 3600000),
        secure: true, // Set to true to test SSL
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
      }
    };

    // Test setting a session
    console.log('Attempting to set a test session...');
    await new Promise((resolve, reject) => {
      sessionStore.set('test-session-ssl', testSession, (err) => {
        if (err) {
          console.error('❌ Failed to set session:', err);
          reject(err);
        } else {
          console.log('✅ Successfully set test session');
          resolve(true);
        }
      });
    });

    // Test getting the session
    console.log('\nAttempting to get the test session...');
    await new Promise((resolve, reject) => {
      sessionStore.get('test-session-ssl', (err, session) => {
        if (err) {
          console.error('❌ Failed to get session:', err);
          reject(err);
        } else if (!session) {
          console.error('❌ Session not found');
          reject(new Error('Session not found'));
        } else {
          console.log('✅ Successfully retrieved test session');
          resolve(true);
        }
      });
    });

    // Test destroying the session
    console.log('\nAttempting to destroy the test session...');
    await new Promise((resolve, reject) => {
      sessionStore.destroy('test-session-ssl', (err) => {
        if (err) {
          console.error('❌ Failed to destroy session:', err);
          reject(err);
        } else {
          console.log('✅ Successfully destroyed test session');
          resolve(true);
        }
      });
    });

    console.log('\n✅ All session store SSL tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Session store SSL test failed:', error);
    if (error instanceof Error && error.message.includes('SSL')) {
      console.error('\nSSL Configuration Error Details:');
      console.error('1. Check if the SSL certificate is properly loaded');
      console.error('2. Verify the SSL mode in the connection string');
      console.error('3. Ensure the RDS instance is configured to require SSL');
    }
    process.exit(1);
  }
}

// Run the test
testSessionSSL().catch(console.error); 