import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getSSLConfig } from './db';

// Load environment variables
dotenv.config();

// Create a modified connection string with SSL parameters
const dbUrl = new URL(process.env.DATABASE_URL!);
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
  errorCallback: (err: Error) => {
    console.error('Session store error:', err);
    if (err.message.includes('SSL')) {
      console.error('SSL configuration error in session store. Please check your certificates and SSL settings.');
    }
  }
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