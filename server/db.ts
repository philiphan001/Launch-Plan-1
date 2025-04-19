import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

// Create a Postgres client with the database connection string and SSL configuration
const sqlClient = postgres(process.env.DATABASE_URL!, {
  ssl: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

// Create a Drizzle instance with the Postgres client and schema
export const db = drizzle(sqlClient, { schema });

export async function executeSQLFile(filename: string) {
  const filePath = path.join(__dirname, 'migrations', filename);
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  await db.execute(sql.raw(sqlContent));
}
