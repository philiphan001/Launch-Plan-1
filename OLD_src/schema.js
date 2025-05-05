import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// Session table schema
export const sessions = pgTable('session', {
  sid: text('sid').primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull()
});

// Export the schema
export const schema = {
  sessions
}; 