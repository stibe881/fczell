const db = require('./db');

async function fixNames() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  await db.query(`UPDATE galleries SET name = 'Dorfturnier 2024' WHERE name = 'archiv_dorfturnier_2024'`);
  await db.query(`UPDATE galleries SET name = 'Dorfturnier 2018' WHERE name = 'archiv_dorfturnier_2018'`);
  await db.query(`UPDATE galleries SET name = 'Dorfturnier 2017' WHERE name = 'archiv_dorfturnier_2017'`);
  console.log('Fixed gallery names in database');
  process.exit(0);
}

fixNames();
