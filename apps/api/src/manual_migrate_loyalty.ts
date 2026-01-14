
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running manual migration for loyalty_members...');
  try {
    // 1. Create table if not exists
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "loyalty_members" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "guest_id" uuid NOT NULL REFERENCES "guests"("id"),
        "member_id" text UNIQUE NOT NULL,
        "tier" text DEFAULT 'Member',
        "points_balance" integer DEFAULT 0,
        "joined_at" timestamp DEFAULT now() NOT NULL,
        "last_activity" timestamp DEFAULT now()
      );
    `);
    console.log('Ensured loyalty_members table exists.');

    // 2. Add columns if they don't exist (idempotent checks)
    // member_id
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_members' AND column_name='member_id') THEN 
          ALTER TABLE "loyalty_members" ADD COLUMN "member_id" text UNIQUE; 
        END IF; 
      END $$;
    `);
    console.log('Checked/Added member_id column.');

    // tier
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_members' AND column_name='tier') THEN 
          ALTER TABLE "loyalty_members" ADD COLUMN "tier" text DEFAULT 'Member'; 
        END IF; 
      END $$;
    `);

    // points_balance
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_members' AND column_name='points_balance') THEN 
          ALTER TABLE "loyalty_members" ADD COLUMN "points_balance" integer DEFAULT 0; 
        END IF; 
      END $$;
    `);

    // last_activity
    await db.execute(sql`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loyalty_members' AND column_name='last_activity') THEN 
          ALTER TABLE "loyalty_members" ADD COLUMN "last_activity" timestamp DEFAULT now(); 
        END IF; 
      END $$;
    `);

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
  process.exit(0);
}

main();
