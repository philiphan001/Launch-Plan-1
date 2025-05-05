import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Use DATABASE_URL from environment variables or construct from individual params
const getDatabaseUrl = (): string => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error(
      "Database connection information is incomplete. Please check your environment variables."
    );
  }

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
};

const databaseUrl = getDatabaseUrl();

// AWS RDS SSL Configuration - only apply if DB_SSL is true
const getSSLConfig = () => {
  const useSSL = process.env.DB_SSL === "true";

  if (!useSSL) {
    return false;
  }

  try {
    const caFilePath = path.join(process.cwd(), "rds-ca-2019-root.pem");

    if (!fs.existsSync(caFilePath)) {
      console.warn("RDS CA certificate file not found at:", caFilePath);
      return false;
    }

    return {
      rejectUnauthorized: true,
      ca: fs.readFileSync(caFilePath).toString(),
      servername: new URL(databaseUrl).hostname,
    };
  } catch (error) {
    console.error("Error configuring SSL:", error);
    return false;
  }
};

const sslConfig = getSSLConfig();

// Create a Postgres client with the database connection string and SSL configuration
const poolConfig = {
  ssl: sslConfig,
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "30"),
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || "60"),
  max: parseInt(process.env.DB_POOL_MAX || "10"),
  min: parseInt(process.env.DB_POOL_MIN || "1"),
  debug: process.env.NODE_ENV === "development" ? console.log : undefined,
};

console.log("Initializing database connection with SSL:", !!sslConfig);

export const sqlClient = postgres(databaseUrl, poolConfig);

// Create a Drizzle instance with the Postgres client
export const db = drizzle(sqlClient, { schema });

// Test connection function to verify the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await db.execute(sql`SELECT version()`);
    console.log("Database connection successful:", result[0].version);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// For explicit SSL configuration in other parts of the application
export { sslConfig };
