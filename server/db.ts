import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

// Create a PostgreSQL connection pool with better settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://rakpa:abc123@ec2-13-51-114-32.eu-north-1.compute.amazonaws.com:5432/postgres',
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
  query_timeout: 10000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Add error handler for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Create a Drizzle ORM instance
export const db = drizzle(pool, { schema });

// Function to run migrations
export async function runMigrations() {
  console.log('Running database migrations...');
  let client;
  
  try {
    client = await pool.connect();
    console.log('Connected to database successfully');
    
    const migrationPath = path.join(__dirname, '../migrations/0000_initial.sql');
    if (!fs.existsSync(migrationPath)) {
      console.log('No migrations found, skipping...');
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Database error:', error.message);
    if (client) {
      await client.query('ROLLBACK').catch(console.error);
    }
    // Continue even if migrations fail
    console.log('Continuing with application startup...');
  } finally {
    if (client) {
      client.release();
    }
  }
}
