// Temporary script to query users table
import { db } from './server/db.js'; 
import { users } from './shared/schema.js';

async function queryUsers() {
  try {
    console.log('Connecting to database...');
    const result = await db.select().from(users).limit(10);
    console.log('\nUsers table columns:', Object.keys(users));
    console.log('\nFound', result.length, 'users');
    console.log('\nSample user data (hiding sensitive info):', 
      result.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email ? '***@***' : null,
        firstName: user.firstName,
        lastName: user.lastName ? '***' : null,
        hasFirebaseUid: !!user.firebaseUid,
        createdAt: user.createdAt
      }))
    );
  } catch (error) {
    console.error('Error querying database:', error);
  }
}

queryUsers();
