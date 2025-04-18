import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a Postgres client with the database connection string and SSL configuration
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Create a Drizzle instance with the Postgres client and schema
export const db = drizzle(sql, { schema });
