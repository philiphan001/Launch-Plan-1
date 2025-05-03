import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSSLConfig } from './db';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const dbUrl = new URL(process.env.DATABASE_URL);
const sslConfig = getSSLConfig();
dbUrl.searchParams.set('sslmode', sslConfig.sslmode);
dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'rds-ca-2019-root.pem'));

const PgSession = connectPgSimple(session);

export const sessionStore = new PgSession({
  conString: dbUrl.toString(),
  tableName: 'session',
  createTableIfMissing: false,
  ttl: 24 * 60 * 60, // 24 hours
  pruneSessionInterval: 60 * 60, // 1 hour
});

export const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,  // Changed to false to prevent empty sessions
  cookie: {
    secure: false,  // Set to false for local dev to ensure cookies work over HTTP
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const
  },
  name: 'connect.sid'
};