

import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment.');
}

// Cache connections when running in edge/serverless environments to avoid cold starts.
neonConfig.fetchConnectionCache = true;

const sql = neon(connectionString);

export const db = drizzle(sql);

export * from './schema';
