const db = require('../db');
const clean = (str) => { 
  if (!str) return ''; 
  let s = str.split('Dresssponsor')[0].split('Weitere Juniorenteams')[0].replace(/&amp;/g, '&').replace(/\r\n/g, ' ').replace(/>/g, '').replace(/"/g, '').trim(); 
  if(s.startsWith('s: ')) s = s.substring(3); 
  if(s.startsWith('szeit: ')) s = s.substring(7); 
  return s.trim(); 
}; 
const teams = db.prepare('SELECT slug, trainer, times, location FROM teams WHERE type=\'junioren\'').all(); 
for(const t of teams) { 
  const tr = clean(t.trainer); 
  const ti = clean(t.times); 
  const loc = clean(t.location); 
  db.prepare('UPDATE teams SET trainer=?, times=?, location=? WHERE slug=?').run(tr, ti, loc, t.slug); 
} 
console.log('Cleaned up data');
