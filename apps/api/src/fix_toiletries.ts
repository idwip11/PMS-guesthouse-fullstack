// One-time script to deduct toiletries for existing reservations with today's check-in date
import { db } from './db';
import { reservations, inventoryItems } from './db/schema';
import { eq, sql } from 'drizzle-orm';

async function fixToiletriesForTodayCheckIns() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today's date: ${today}`);
    
    // Count reservations with check_in_date = today
    const todayReservations = await db.select()
      .from(reservations)
      .where(eq(reservations.checkInDate, today));
    
    const count = todayReservations.length;
    console.log(`Found ${count} reservations with check_in_date = ${today}`);
    
    if (count === 0) {
      console.log('No reservations to process.');
      process.exit(0);
    }
    
    // Get current toiletries stock
    const toiletries = await db.select()
      .from(inventoryItems)
      .where(eq(inventoryItems.category, 'Toiletries'));
    
    console.log('Current Toiletries stock:');
    toiletries.forEach(item => {
      console.log(`  - ${item.name}: ${item.currentStock}`);
    });
    
    // Deduct stock by count
    console.log(`\nDeducting ${count} from each Toiletries item...`);
    
    const result = await db.update(inventoryItems)
      .set({ currentStock: sql`current_stock - ${count}` })
      .where(eq(inventoryItems.category, 'Toiletries'))
      .returning();
    
    console.log('Updated Toiletries stock:');
    result.forEach(item => {
      console.log(`  - ${item.name}: ${item.currentStock}`);
    });
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixToiletriesForTodayCheckIns();
