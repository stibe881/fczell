const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'lguh.your-database.de',
    user: process.env.DB_USER || 'fczell',
    password: process.env.DB_PASSWORD || '!LeliBist.1561!',
    database: process.env.DB_NAME || 'fczell'
  });
  
  const [photos] = await db.query("SELECT gallery_id, gallery, COUNT(*) as c FROM gallery_photos GROUP BY gallery_id, gallery");
  console.log(photos);
  
  const [galleries] = await db.query("SELECT * FROM galleries");
  console.log(galleries);
  
  process.exit(0);
}
run();
