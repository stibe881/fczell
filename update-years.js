const mysql = require('mysql2/promise');
async function query() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'lguh.your-database.de',
    user: process.env.DB_USER || 'fczell',
    password: process.env.DB_PASSWORD || '!LeliBist.1561!',
    database: process.env.DB_NAME || 'fczell'
  });
  await db.query("UPDATE anlaesse SET year = 2024 WHERE id = 6");
  await db.query("UPDATE anlaesse SET year = 2023 WHERE id = 7");
  await db.query("UPDATE anlaesse SET year = 2022 WHERE id = 8");
  process.exit(0);
}
query();
