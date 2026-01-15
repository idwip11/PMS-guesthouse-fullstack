import { db } from './db';
import { sql } from 'drizzle-orm';

async function migratePaymentDate() {
  console.log('Making payment_date column nullable...');
  
  try {
    await db.execute(sql`ALTER TABLE payments ALTER COLUMN payment_date DROP NOT NULL`);
    console.log('✅ Successfully made payment_date nullable!');
  } catch (error: any) {
    if (error.message?.includes('already NULL')) {
      console.log('ℹ️ Column is already nullable.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
  
  process.exit(0);
}

migratePaymentDate();
