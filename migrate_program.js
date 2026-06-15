const db = require('./db');

async function migrate() {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM anlaesse`);
    const colNames = columns.map(c => c.Field);
    
    let added = false;
    if (!colNames.includes('program_friday')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN program_friday TEXT`);
      added = true;
    }
    if (!colNames.includes('program_saturday')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN program_saturday TEXT`);
      added = true;
    }
    if (!colNames.includes('program_sunday')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN program_sunday TEXT`);
      added = true;
    }
    if (added) {
      console.log('Added program columns to anlaesse');
    } else {
      console.log('Program columns already exist');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
