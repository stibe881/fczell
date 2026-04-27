const db = require('../db');

const tables = [
  { name: 'vorstand', columns: ['email'] },
  { name: 'pages', columns: ['body'] },
  { name: 'news', columns: ['body', 'excerpt'] },
  { name: 'events', columns: ['description'] },
  { name: 'teams', columns: ['trainer', 'coach', 'goalie', 'physio', 'extra'] }
];

let updatedCount = 0;

for (const table of tables) {
  for (const col of table.columns) {
    try {
      const rows = db.prepare(`SELECT id, ${col} FROM ${table.name} WHERE ${col} LIKE '%(at)%'`).all();
      for (const row of rows) {
        if (row[col]) {
          const newVal = row[col].replace(/\(at\)/g, '@');
          db.prepare(`UPDATE ${table.name} SET ${col} = ? WHERE id = ?`).run(newVal, row.id);
          updatedCount++;
        }
      }
    } catch (e) {
      console.log(`Error updating ${table.name}.${col}: ${e.message}`);
    }
  }
}

console.log(`Replaced (at) with @ in ${updatedCount} rows.`);
