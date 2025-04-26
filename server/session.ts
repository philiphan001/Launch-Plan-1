import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSSLConfig } from './db';

// Load environment variables
dotenv.config();

// Construct the database URL from DB_* environment variables
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || '5432';
const dbName = process.env.DB_NAME;
const dbSSLMode = 'require';

const dbUrl = new URL(`postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`);
const sslConfig = getSSLConfig();
dbUrl.searchParams.set('sslmode', sslConfig.sslmode);
dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem'));

const PgSession = connectPgSimple(session);

export const sessionStore = new PgSession({
  conString: dbUrl.toString(),
  tableName: 'session',
  createTableIfMissing: true,
  ttl: 24 * 60 * 60, // 24 hours
  pruneSessionInterval: 60 * 60, // 1 hour
});

export const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const
  },
  name: 'connect.sid'
}; 