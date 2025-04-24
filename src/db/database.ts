const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { schema } = require('../schema');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const connectPgSimple = require('connect-pg-simple');

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
const db = drizzle(sqlClient, { schema });

// Configure session store with SSL
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'session',
  createTableIfMissing: true,
  ssl: sslConfig
});

// Export the SQL client for direct database access if needed
module.exports = { db, sessionStore, sqlClient }; 