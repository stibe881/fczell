const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'lguh.your-database.de',
    user: process.env.DB_USER || 'fczell',
    password: process.env.DB_PASSWORD || '!LeliBist.1561!',
    database: process.env.DB_NAME || 'fczell',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
  });

  try {
    // Add column if it doesn't exist
    await db.query(`ALTER TABLE anlaesse ADD COLUMN year INT`);
    console.log('Added year column.');
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') {
      console.error(e);
      process.exit(1);
    }
  }

  // Fetch all anlaesse
  const [rows] = await db.query(`SELECT id, title FROM anlaesse`);
  for (const row of rows) {
    const match = row.title.match(/(20\d{2}|19\d{2})/);
    if (match) {
      const year = parseInt(match[1]);
      await db.query(`UPDATE anlaesse SET year = ? WHERE id = ?`, [year, row.id]);
      console.log(`Updated anlass ${row.id} with year ${year}`);
    }
  }
  
  console.log('Migration complete.');
  process.exit(0);
}

migrate();
