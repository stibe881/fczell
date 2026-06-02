const fs = require('fs');

let c = fs.readFileSync('server.js', 'utf8');

const targetStr = 'const [categories] = await db.query(`SELECT DISTINCT category FROM news WHERE category IS NOT NULL AND category != \'\' ORDER BY category ASC`);';
const replaceStr = `const [catRows] = await db.query(\`SELECT category FROM news WHERE category IS NOT NULL AND category != ''\`);
  let uniqueCats = new Set();
  catRows.forEach(r => r.category.split(',').forEach(c => c.trim() && uniqueCats.add(c.trim())));
  const categories = Array.from(uniqueCats).map(c => ({category: c})).sort((a,b) => a.category.localeCompare(b.category));`;

c = c.split(targetStr).join(replaceStr);

// Also replace POST handlers
c = c.replace(/const \{ title, excerpt, category, published_at, content \} = req\.body;/g, `const { title, excerpt, published_at, content, new_category } = req.body;
  let cats = [];
  if (req.body.category_chk) {
    if (Array.isArray(req.body.category_chk)) cats.push(...req.body.category_chk);
    else cats.push(req.body.category_chk);
  }
  if (new_category) {
    cats.push(...new_category.split(',').map(s => s.trim()).filter(Boolean));
  }
  const category = cats.join(', ');`);

fs.writeFileSync('server.js', c);
console.log('Updated server.js');
