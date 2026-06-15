const db = require('./db');

async function migrate() {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM anlaesse`);
    const colNames = columns.map(c => c.Field);
    
    if (!colNames.includes('cat_beerpong_info')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN cat_beerpong_info TEXT`);
      console.log('Added cat_beerpong_info column to anlaesse');
    } else {
      console.log('cat_beerpong_info already exists');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
