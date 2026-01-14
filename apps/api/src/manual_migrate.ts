
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running manual migration for marketing_campaigns...');
  try {
    await db.execute(sql`
      ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "notes" text;
    `);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

main();
