import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema.js"; // Make sure .js extension is used for ESM
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Get the directory path for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use DATABASE_URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// AWS RDS SSL Configuration
const sslConfig = {
  rejectUnauthorized: true,
  ca: fs
    .readFileSync(path.join(path.dirname(__dirname), "rds-ca-2019-root.pem"))
    .toString(),
  servername: new URL(databaseUrl).hostname,
};

console.log("Initializing database connection with SSL:", !!sslConfig);

// Create a query logger to help debug SQL issues
const logSqlQuery = (sql) => {
  console.log("\n=== SQL Query ===");
  console.log(sql);
  console.log("=== End Query ===\n");

  // Also log to a file for easier review
  const logDir = path.join(path.dirname(__dirname), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.appendFileSync(
    path.join(logDir, `sql-queries-${timestamp.split("T")[0]}.log`),
    `${timestamp} - ${sql}\n\n`
  );
};

// Create a Postgres client with the database connection string and SSL configuration
const sqlClient = postgres(databaseUrl, {
  ssl: sslConfig,
  connect_timeout: 30,
  idle_timeout: 60,
  max: 10,
  max_lifetime: 60 * 30,
  debug: (connection, query, params, types) => {
    logSqlQuery(`${query}\nParams: ${JSON.stringify(params)}`);
    if (process.env.NODE_ENV === "development") {
      console.log(connection, query, params, types);
    }
  },
  connection: {
    application_name: "fp-react-app",
  },
  onnotice: (notice) => {
    console.log("Database notice:", notice);
  },
  onparameter: (parameterStatus) => {
    console.log("Database parameter status:", parameterStatus);
  },
  prepare: true,
  types: {
    date: {
      to: 1184,
      from: [1082, 1083, 1114, 1184],
      serialize: (date) => date,
      parse: (date) => date,
    },
  },
});

// Create a Drizzle instance with the Postgres client and schema
// Enable logging and ensure proper query formatting
export const db = drizzle(sqlClient, {
  schema,
  logger: {
    logQuery(query, params) {
      // Additional logging for Drizzle ORM
      console.log("Drizzle Query:", query, params);
    },
  },
});

// Export the SSL configuration
export const getSSLConfig = () => ({
  ...sslConfig,
  sslmode: "verify-full",
});

export async function executeSQLFile(filename) {
  const filePath = path.join(
    path.dirname(__dirname),
    "server",
    "migrations",
    filename
  );
  const sqlContent = fs.readFileSync(filePath, "utf8");
  await db.execute(sql.raw(sqlContent));
}
