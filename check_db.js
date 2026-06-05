const db=require('./db');
db.query("SELECT body FROM anlaesse WHERE slug='archiv'").then(r => {
  console.log(r[0][0].body.substring(0, 1500));
  process.exit(0);
});
