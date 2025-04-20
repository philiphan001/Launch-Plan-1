import { defineConfig } from "drizzle-kit";
import fs from 'fs';
import path from 'path';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const sslConfig = {
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
  servername: new URL(process.env.DATABASE_URL).hostname
};

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: sslConfig,
  },
});
