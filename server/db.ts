import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Construct the database URL from DB_* environment variables
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME;
const dbSSLMode = 'require';

const databaseUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?sslmode=${dbSSLMode}`;

// AWS RDS SSL Configuration
const sslConfig = {
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
  servername: dbHost
};

// Create a Postgres client with the database connection string and SSL configuration
const sqlClient = postgres(databaseUrl, {
  ssl: sslConfig,
  connect_timeout: 30, // 30 second connection timeout
  idle_timeout: 60, // 60 second idle timeout
  max: 10, // Maximum number of connections
  max_lifetime: 60 * 30, // Connection lifetime of 30 minutes
  debug: process.env.NODE_ENV === 'development' ? console.log : undefined,
  connection: {
    application_name: 'fp-react-app'
  },
  onnotice: (notice) => {
    console.log('Database notice:', notice);
  },
  onparameter: (parameterStatus) => {
    console.log('Database parameter status:', parameterStatus);
  }
});

// Create a Drizzle instance with the Postgres client and schema
export const db = drizzle(sqlClient, { schema });

// Export the SSL configuration for use in other parts of the application
export const getSSLConfig = () => ({
  ...sslConfig,
  sslmode: 'verify-full'
});

export async function executeSQLFile(filename: string) {
  const filePath = path.join(process.cwd(), 'server', 'migrations', filename);
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  await db.execute(sql.raw(sqlContent));
}
