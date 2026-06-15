const db = require('./db');

async function check() {
  const [rows] = await db.query('SELECT * FROM anlaesse WHERE form_type = "dorfturnier" LIMIT 1');
  if (rows.length > 0) {
    console.log(rows[0]);
  } else {
    console.log("No dorfturnier found");
  }
  process.exit(0);
}
check();
