import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use environment variables for database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the PostgreSQL client
const client = postgres(connectionString);

// Create the database instance with Drizzle
export const db = drizzle(client, { schema }); 