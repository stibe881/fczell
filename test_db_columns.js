const db = require('./db');

async function test() {
  const [cols] = await db.query('SHOW COLUMNS FROM anlaesse');
  console.log(cols.map(c => c.Field));
  process.exit(0);
}
test();
