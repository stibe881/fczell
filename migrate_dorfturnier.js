const db = require('./db');

async function migrate() {
  try {
    // Add columns if they don't exist
    const [columns] = await db.query(`SHOW COLUMNS FROM registrations_dorfturnier`);
    const colNames = columns.map(c => c.Field);
    
    if (!colNames.includes('anlass_id')) {
      await db.query(`ALTER TABLE registrations_dorfturnier ADD COLUMN anlass_id INT AFTER id`);
      console.log('Added anlass_id column');
      
      // Update existing rows to have anlass_id if there's an existing dorfturnier
      const [anlaesse] = await db.query(`SELECT id FROM anlaesse WHERE form_type = 'dorfturnier' ORDER BY id DESC LIMIT 1`);
      if (anlaesse.length > 0) {
        await db.query(`UPDATE registrations_dorfturnier SET anlass_id = ? WHERE anlass_id IS NULL`, [anlaesse[0].id]);
        console.log(`Assigned existing registrations to anlass_id ${anlaesse[0].id}`);
      }
    } else {
      console.log('anlass_id column already exists');
    }
    
    if (!colNames.includes('category')) {
      await db.query(`ALTER TABLE registrations_dorfturnier ADD COLUMN category VARCHAR(255) AFTER anlass_id`);
      console.log('Added category column');
      
      // Set a default for existing registrations
      await db.query(`UPDATE registrations_dorfturnier SET category = 'Unbekannt' WHERE category IS NULL`);
      console.log('Set default category for existing rows');
    } else {
      console.log('category column already exists');
    }
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
