// schema.js
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Users table that works with Firebase Authentication
export const users = pgTable('users', {
  // Use Firebase UID as the primary key
  id: varchar('id', { length: 128 }).primaryKey(),
  
  // User information from Firebase
  email: varchar('email', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  photoURL: text('photo_url'),
  
  // Additional user metadata
  createdAt: timestamp('created_at').defaultNow(),
  lastLogin: timestamp('last_login'),
  
  // Add any other user fields you need
  // role: varchar('role', { length: 50 }).default('user'),
  // isActive: boolean('is_active').default(true),
});

// Export other tables from your schema...