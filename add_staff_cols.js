const db = require('./db');
async function run() {
  try {
    await db.query(`ALTER TABLE team_staff ADD COLUMN phone VARCHAR(255) DEFAULT ''`);
    await db.query(`ALTER TABLE team_staff ADD COLUMN email VARCHAR(255) DEFAULT ''`);
    console.log('Columns added successfully');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist');
    } else {
      console.error(err);
    }
  }
  process.exit(0);
}
run();
