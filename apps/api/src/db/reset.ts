import { sql } from 'drizzle-orm';
import { db, client } from './index';

async function reset() {
  console.log('🗑️  Clearing database...');
  try {
    await db.execute(sql`DROP SCHEMA public CASCADE;`);
    await db.execute(sql`CREATE SCHEMA public;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO postgres;`);
    await db.execute(sql`GRANT ALL ON SCHEMA public TO public;`);
    console.log('✅ Database fully wiped successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await client.end();
  }
}

reset();
