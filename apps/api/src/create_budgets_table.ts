import { db } from './db';
import { sql } from 'drizzle-orm';

async function createOperationalBudgetsTable() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS operational_budgets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        projected_amount NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(year, month)
      );
    `);
    console.log('✅ operational_budgets table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createOperationalBudgetsTable();
