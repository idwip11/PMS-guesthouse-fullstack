import { db } from './db';
import { sql } from 'drizzle-orm';

async function addGuesthouseToExpenses() {
  console.log('Adding guesthouse column to expenses table...');
  
  try {
    // Add guesthouse column with default 0 (All Guesthouses)
    await db.execute(sql`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS guesthouse INTEGER DEFAULT 0 NOT NULL
    `);
    
    console.log('Successfully added guesthouse column to expenses table!');
    console.log('All existing records will have guesthouse = 0 (All Guesthouses)');
  } catch (error) {
    console.error('Error adding guesthouse column:', error);
  }
  
  process.exit(0);
}

addGuesthouseToExpenses();
