import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a Postgres client with the database connection string
const sql = postgres(process.env.DATABASE_URL!);

// Create a Drizzle instance with the Postgres client and schema
export const db = drizzle(sql, { schema });
