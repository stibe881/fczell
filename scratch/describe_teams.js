const db = require('./db');
async function run() {
  const [rows] = await db.query('DESCRIBE teams');
  console.log(rows);
  process.exit();
}
run();
