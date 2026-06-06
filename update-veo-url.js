const db = require('./db');
(async () => {
  const url = 'https://app.veo.co/clubs/fc-zell/teams/1-mannschaft-fc-zell/recordings/';
  await db.query(`UPDATE pages SET body = ? WHERE slug = 'veo-url'`, [url]);
  console.log("Updated veo-url to: " + url);
  process.exit(0);
})();
