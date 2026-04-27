const db = require('../db');
console.log(db.prepare('SELECT id, name, logo FROM sponsors').all());
