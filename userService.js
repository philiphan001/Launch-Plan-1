// userService.js
import { db } from './db'; // Your existing Drizzle DB connection
import { eq } from 'drizzle-orm';
import { users } from './schema'; // Assuming you have a users table defined

// Sync Firebase user with your database
export const syncUserWithDatabase = async (firebaseUser) => {
  if (!firebaseUser) return null;
  
  const { uid, email, displayName, photoURL } = firebaseUser;
  
  // Check if user exists in your database
  const existingUsers = await db.select().from(users).where(eq(users.id, uid));
  const userExists = existingUsers.length > 0;
  
  if (userExists) {
    // Update existing user
    await db.update(users)
      .set({
        email,
        displayName,
        photoURL,
        lastLogin: new Date()
      })
      .where(eq(users.id, uid));
    
    return existingUsers[0];
  } else {
    // Create new user
    const newUser = await db.insert(users)
      .values({
        id: uid,
        email,
        displayName,
        photoURL,
        createdAt: new Date(),
        lastLogin: new Date()
      })
      .returning();
    
    return newUser[0];
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  if (!userId) return null;
  
  const users = await db.select().from(users).where(eq(users.id, userId));
  return users[0] || null;
};