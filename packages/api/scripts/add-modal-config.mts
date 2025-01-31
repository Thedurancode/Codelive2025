import { db } from '../db/index.mjs';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding Modal configuration columns...');
  
  try {
    // Add modal_token column
    await db.run(sql`ALTER TABLE config ADD COLUMN modal_token TEXT;`);
    console.log('Added modal_token column');

    // Add modal_project_id column
    await db.run(sql`ALTER TABLE config ADD COLUMN modal_project_id TEXT;`);
    console.log('Added modal_project_id column');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error); 