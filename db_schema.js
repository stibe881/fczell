const db = require('better-sqlite3')('fczell.db');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='news'").get().sql);

db.prepare(`
  CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      photo VARCHAR(255),
      sponsor_logo VARCHAR(255),
      sort_order INTEGER DEFAULT 0,
      contact_phone VARCHAR(255) DEFAULT '',
      contact_email VARCHAR(255) DEFAULT '',
      sfv_team_id VARCHAR(255) DEFAULT ''
    )`).run();
