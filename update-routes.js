const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Re-add marked parse to jobs
if (!code.includes('const { marked }')) {
  code = "const { marked } = require('marked');\n" + code;
}
code = code.replace(
  /const \[jobs\] = await db\.query\(`SELECT \* FROM jobs ORDER BY created_at DESC`\);/,
  `const [jobs] = await db.query(\`SELECT * FROM jobs ORDER BY created_at DESC\`);
  jobs.forEach(job => {
    if (job.description) job.descriptionHtml = marked.parse(job.description);
    if (job.contact_info) job.contact_infoHtml = marked.parse(job.contact_info);
  });`
);

// 2. Advertisers backend updates
code = code.replace(
  /const \[bandenwerber\] = await db\.query\(`SELECT \* FROM advertisers ORDER BY name ASC`\);/,
  `const todayStr = new Date().toISOString().split('T')[0];
  const [bandenwerber] = await db.query(\`
    SELECT * FROM advertisers 
    WHERE (is_archived = 0 OR is_archived IS NULL)
    AND (active_from IS NULL OR active_from = '' OR active_from <= ?)
    AND (active_until IS NULL OR active_until = '' OR active_until >= ?)
    ORDER BY name ASC
  \`, [todayStr, todayStr]);`
);

// Advertisers list
code = code.replace(
  /app\.get\('\/admin\/advertisers'.*?res\.render\('admin\/advertisers-list'.*?\}\);/s,
  `app.get('/admin/advertisers', requireRole('sponsoring'), async (req, res) => {
  const [items] = await db.query(\`SELECT * FROM advertisers ORDER BY name ASC\`);
  res.render('admin/advertisers-list', { page: 'admin', items });
});`
);

// Advertisers new
code = code.replace(
  /app\.post\('\/admin\/advertisers\/new'.*?res\.redirect\('\/admin\/advertisers'\);\s*\}\);/s,
  `app.post('/admin/advertisers/new', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, active_from, active_until, is_archived } = req.body;
  let logoUrl = null;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`INSERT INTO advertisers (name, link, location, sort_order, logo, active_from, active_until, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`, [
    name, link || '', location || '', 0, logoUrl, active_from || null, active_until || null, is_archived ? 1 : 0
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gespeichert.' };
  res.redirect('/admin/advertisers');
});`
);

// Advertisers edit
code = code.replace(
  /app\.post\('\/admin\/advertisers\/:id\/edit'.*?res\.redirect\('\/admin\/advertisers'.*?\}\);/s,
  `app.post('/admin/advertisers/:id/edit', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, active_from, active_until, is_archived } = req.body;
  let logoUrl = req.body.existing_logo;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`UPDATE advertisers SET name=?, link=?, location=?, logo=?, active_from=?, active_until=?, is_archived=? WHERE id=?\`, [
    name, link || '', location || '', logoUrl, active_from || null, active_until || null, is_archived ? 1 : 0, req.params.id
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };
  res.redirect('/admin/advertisers');
});`
);

fs.writeFileSync('server.js', code);
console.log('server.js updated successfully!');
