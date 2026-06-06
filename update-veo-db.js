const db = require('./db');
(async () => {
  try {
    await db.query(`INSERT IGNORE INTO pages (slug, title, body) VALUES ('veo-live-embed', 'Aktueller Veo Livestream (Embed-Code)', '')`);
    console.log("DB updated");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
