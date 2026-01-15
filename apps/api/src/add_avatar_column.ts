
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    console.log('Adding avatar_url column into users table...');
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'avatar_url'
        ) THEN
          ALTER TABLE "users" ADD COLUMN "avatar_url" text;
        END IF;
      END $$;
    `);
    
    console.log('Successfully added avatar_url column to users!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

main();
