
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running manual migration for member_id columns...');
  try {
    // Add member_id to marketing_campaigns
    await db.execute(sql`
      ALTER TABLE "marketing_campaigns" 
      ADD COLUMN IF NOT EXISTS "member_id" text;
    `);
    console.log('Added member_id to marketing_campaigns.');

    // Add member_id to reservations
    await db.execute(sql`
      ALTER TABLE "reservations" 
      ADD COLUMN IF NOT EXISTS "member_id" text;
    `);
    console.log('Added member_id to reservations.');
    
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

main();
