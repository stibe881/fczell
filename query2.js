const mysql = require('mysql2/promise');
async function query() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'lguh.your-database.de',
    user: process.env.DB_USER || 'fczell',
    password: process.env.DB_PASSWORD || '!LeliBist.1561!',
    database: process.env.DB_NAME || 'fczell'
  });
  const [rows] = await db.query("SELECT id, title, is_archived FROM anlaesse WHERE slug = 'archiv'");
  console.log(rows);
  process.exit(0);
}
query();
