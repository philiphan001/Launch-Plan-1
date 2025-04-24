const { db, sessionStore } = require('../src/db/database');
const { sessions } = require('../src/schema');
const { eq } = require('drizzle-orm');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const result = await db.select().from(sessions).limit(1);
    console.log('Database connection successful!');
    console.log('Session table exists and is accessible.');
    
    // Test session store
    console.log('\nTesting session store...');
    const testSessionId = 'test-session-' + Date.now();
    const testData = { 
      test: 'data', 
      timestamp: new Date().toISOString() 
    };
    
    // Test set operation
    await new Promise((resolve, reject) => {
      sessionStore.set(testSessionId, testData, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    console.log('Session set operation successful');
    
    // Test get operation
    const retrievedData = await new Promise((resolve, reject) => {
      sessionStore.get(testSessionId, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    console.log('Session get operation successful');
    console.log('Retrieved session data:', retrievedData);
    
    // Test destroy operation
    await new Promise((resolve, reject) => {
      sessionStore.destroy(testSessionId, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
    console.log('Session destroy operation successful');
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing database connection:', error);
    process.exit(1);
  }
}

// Run the tests
testDatabaseConnection(); 