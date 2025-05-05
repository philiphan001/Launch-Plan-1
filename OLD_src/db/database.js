import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { schema } from '../schema.js';
import fs from 'fs';
import path from 'path';
import session from 'express-session';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// AWS RDS SSL Configuration
const sslConfig = {
  rejectUnauthorized: true,
  ca: fs.readFileSync(path.join(process.cwd(), 'certificates', 'rds-ca-2019-root.pem')).toString(),
  servername: new URL(process.env.DATABASE_URL).hostname
};

// Create a Postgres client with the database connection string and SSL configuration
const sqlClient = postgres(process.env.DATABASE_URL, {
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
  },
  onerror: (err) => {
    console.error('Database connection error:', err);
    if (err.message.includes('SSL')) {
      console.error('SSL configuration error. Please check your certificates and SSL settings.');
    }
  }
});

// Create a Drizzle instance with the Postgres client and schema
export const db = drizzle(sqlClient, { schema });

// Create a custom session store using our working database connection
class CustomSessionStore extends session.Store {
  constructor() {
    super();
    this.initializeTable();
  }

  async initializeTable() {
    await sqlClient`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `;
  }

  get(sid, callback) {
    sqlClient`
      SELECT sess FROM "session" WHERE sid = ${sid} AND expire > NOW()
    `.then(result => {
      callback(null, result[0]?.sess || null);
    }).catch(err => {
      callback(err);
    });
  }

  async set(sid, session) {
    try {
      const maxAge = session.cookie.maxAge;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + maxAge);
      
      const query = `
      INSERT INTO "session" (sid, sess, expire)
      VALUES ($1, $2, $3)
      ON CONFLICT (sid) DO UPDATE
      SET sess = $4, expire = $5
    `;
      
      await sqlClient.unsafe(query, [
        sid,
        JSON.stringify(session),
        expiresAt.toISOString(),
        JSON.stringify(session),
        expiresAt.toISOString()
      ]);
      
      return sid;
    } catch (error) {
      console.error('Error setting session:', error);
      throw error;
    }
  }

  destroy(sid, callback) {
    sqlClient`
      DELETE FROM "session" WHERE sid = ${sid}
    `.then(() => {
      callback(null);
    }).catch(err => {
      callback(err);
    });
  }
}

// Export the session store
export const sessionStore = new CustomSessionStore();

// Export the SQL client for direct database access if needed
export { sqlClient }; 