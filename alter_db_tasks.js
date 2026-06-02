const db = require('./db');
async function run() {
  try {
    await db.query(`ALTER TABLE news ADD COLUMN content LONGTEXT`);
    console.log('Added content to news');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('content already exists in news');
    else console.error(err);
  }
  try {
    await db.query(`ALTER TABLE teams ADD COLUMN contact_phone VARCHAR(255) DEFAULT ''`);
    await db.query(`ALTER TABLE teams ADD COLUMN contact_email VARCHAR(255) DEFAULT ''`);
    console.log('Added contact fields to teams');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') console.log('Contact fields already exist in teams');
    else console.error(err);
  }
  process.exit(0);
}
run();
