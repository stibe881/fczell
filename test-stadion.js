const db = require('./db');
(async () => {
  await db.query(`UPDATE pages SET body='<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>' WHERE slug='veo-live-embed'`);
  console.log('Updated');
  process.exit(0);
})();
