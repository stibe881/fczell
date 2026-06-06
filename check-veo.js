const db = require('./db');
(async () => {
  const [rows] = await db.query(`SELECT * FROM pages WHERE slug = 'veo-url'`);
  console.log(rows);
  process.exit(0);
})();
