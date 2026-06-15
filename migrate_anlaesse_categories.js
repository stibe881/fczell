const db = require('./db');

async function migrate() {
  try {
    const [columns] = await db.query(`SHOW COLUMNS FROM anlaesse`);
    const colNames = columns.map(c => c.Field);
    
    if (!colNames.includes('dorfturnier_categories')) {
      await db.query(`ALTER TABLE anlaesse ADD COLUMN dorfturnier_categories VARCHAR(255) DEFAULT 'A_B,Z,C' AFTER form_type`);
      console.log('Added dorfturnier_categories column to anlaesse');
    } else {
      console.log('dorfturnier_categories already exists');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
