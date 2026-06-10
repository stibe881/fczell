const db = require('../db');
async function run() {
  try {
    // Add columns if they don't exist
    const [rows] = await db.query("SHOW COLUMNS FROM teams LIKE 'sponsor_logo_2'");
    if (rows.length === 0) {
      await db.query("ALTER TABLE teams ADD COLUMN sponsor_logo_2 VARCHAR(255) NULL");
      await db.query("ALTER TABLE teams ADD COLUMN sponsor_logo_3 VARCHAR(255) NULL");
      console.log('Columns sponsor_logo_2 and sponsor_logo_3 added successfully.');
    } else {
      console.log('Columns already exist.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
