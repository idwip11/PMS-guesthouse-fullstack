
import { db } from './db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Running migration: create_marketing_budgets_table...');

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS marketing_budgets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      budget_amount DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT now() NOT NULL,
      updated_at TIMESTAMP DEFAULT now() NOT NULL
    );
  `);

  console.log('Migration completed successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
