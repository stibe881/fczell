const db = require('./db');
(async () => {
  try {
    await db.query(`ALTER TABLE events ADD COLUMN has_livestream TINYINT(1) DEFAULT 0`);
    await db.query(`ALTER TABLE events ADD COLUMN livestream_url TEXT`);
    console.log("DB updated");
    process.exit(0);
  } catch(e) {
    // It might throw if columns already exist, which is fine
    console.error(e.message);
    process.exit(0);
  }
})();
