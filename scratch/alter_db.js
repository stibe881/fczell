const db = require('../db');
try {
  db.prepare(`ALTER TABLE advertisers ADD COLUMN logo TEXT`).run();
  console.log("Added logo column to advertisers.");
} catch (e) {
  console.log("Column likely already exists or error: ", e.message);
}
