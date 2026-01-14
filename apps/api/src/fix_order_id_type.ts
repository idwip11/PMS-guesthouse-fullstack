
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    // Drop old foreign key constraint
    console.log('Dropping old constraint...');
    await db.execute(sql`ALTER TABLE loyalty_members DROP CONSTRAINT IF EXISTS loyalty_members_guest_id_guests_id_fk`);
    
    // Drop guest_id column if exists
    console.log('Dropping guest_id column...');
    await db.execute(sql`ALTER TABLE loyalty_members DROP COLUMN IF EXISTS guest_id`);
    
    // Add order_id column if not exists or alter type
    console.log('Ensuring order_id is text type...');
    await db.execute(sql`ALTER TABLE loyalty_members ALTER COLUMN order_id TYPE text USING order_id::text`);
    
    console.log('Migration complete!');
  } catch (e: any) {
    console.log('Error:', e.message);
  }
  
  process.exit(0);
}
main();
