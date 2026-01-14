
import { db } from './db';
import { loyaltyMembers, reservations } from './db/schema';

async function main() {
  const members = await db.select().from(loyaltyMembers);
  console.log('Loyalty Members:', members);
  
  const reservationsWithMember = await db.select({
    orderId: reservations.orderId,
    memberId: reservations.memberId,
    totalAmount: reservations.totalAmount
  }).from(reservations).where(reservations.memberId !== null);
  console.log('Reservations with Member ID:', reservationsWithMember);
  
  process.exit(0);
}
main();
