const db = require('./db');

async function run() {
  try {
    const title = "Freundschaft. Leidenschaft. FC Zell.";
    const body = "Wir verbinden sportliche Ambition mit konsequenter Juniorenförderung und einem aktiven und geselligen Vereinsleben.";
    
    // Check if hero exists
    const [rows] = await db.query(`SELECT * FROM pages WHERE slug = 'hero'`);
    if (rows.length > 0) {
      await db.query(`UPDATE pages SET title = ?, body = ? WHERE slug = 'hero'`, [title, body]);
      console.log('Hero updated in DB');
    } else {
      await db.query(`INSERT INTO pages (slug, title, body) VALUES ('hero', ?, ?)`, [title, body]);
      console.log('Hero inserted into DB');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

run();
