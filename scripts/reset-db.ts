import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  console.log('Dropping all tables...');

  // Drop all tables in the correct order (respecting foreign keys)
  await db.execute(sql`DROP TABLE IF EXISTS "ticket_history" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "tickets" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "projects" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "jira_tokens" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "verification" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "account" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE`);

  console.log('All tables dropped successfully!');
  console.log('Run "bun run db:push" to recreate the schema.');
  process.exit(0);
}

resetDatabase().catch((error) => {
  console.error('Error resetting database:', error);
  process.exit(1);
});
