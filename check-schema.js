const db = require('better-sqlite3')('fczell.db');
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='advertisers'").get().sql);
