const { pgTable, text, timestamp } = require('drizzle-orm/pg-core');

// Session table schema
const sessions = pgTable('session', {
  sid: text('sid').primaryKey(),
  sess: text('sess').notNull(),
  expire: timestamp('expire').notNull()
});

// Export the schema
module.exports = {
  sessions,
  schema: { sessions }
}; 