const db = require('./db');

async function migrate() {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM anlaesse`);
    const colNames = columns.map(c => c.Field);
    
    let added = false;
    if (!colNames.includes('cat_a_b_info')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN cat_a_b_info TEXT`);
      added = true;
    }
    if (!colNames.includes('cat_z_info')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN cat_z_info TEXT`);
      added = true;
    }
    if (!colNames.includes('cat_c_info')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN cat_c_info TEXT`);
      added = true;
    }
    if (added) {
      console.log('Added category info columns to anlaesse');
    } else {
      console.log('Category info columns already exist');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
