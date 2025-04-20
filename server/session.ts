import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a modified connection string with SSL parameters
const dbUrl = new URL(process.env.DATABASE_URL!);
dbUrl.searchParams.set('sslmode', 'verify-full');
dbUrl.searchParams.set('sslrootcert', path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem'));

const PgSession = connectPgSimple(session);

export const sessionStore = new PgSession({
  conString: dbUrl.toString(),
  tableName: 'session',
  createTableIfMissing: true,
  ttl: 24 * 60 * 60, // 24 hours
  pruneSessionInterval: 60 * 60 // 1 hour
});

export const sessionConfig = {
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' as const
  }
}; 