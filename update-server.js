const fs = require('fs');

let c = fs.readFileSync('server.js','utf8');
const oldRoute = `// --- Datenschutz ---\napp.get('/datenschutz', async (req, res) => {\n  const [rows] = await db.query(\`SELECT * FROM pages WHERE slug = 'datenschutz'\`);\n  const datenschutz = rows[0];\n  res.render('datenschutz', { page: 'datenschutz', datenschutz });\n});`;

const newRoute = `// --- Datenschutz ---\napp.get('/datenschutz', async (req, res) => {\n  const [rows] = await db.query(\`SELECT * FROM pages WHERE slug = 'datenschutz'\`);\n  const datenschutz = rows[0];\n  res.render('datenschutz', { page: 'datenschutz', datenschutz });\n});\n\n// --- Impressum ---\napp.get('/impressum', async (req, res) => {\n  const [rows] = await db.query(\`SELECT * FROM pages WHERE slug = 'impressum'\`);\n  const impressum = rows[0];\n  res.render('impressum', { page: 'impressum', impressum });\n});`;

c = c.replace(oldRoute, newRoute);
fs.writeFileSync('server.js', c);
