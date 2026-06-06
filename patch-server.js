const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// 1. Re-add marked parse to jobs
if (!code.includes('const { marked }')) {
  code = "const { marked } = require('marked');\n" + code;
}

const targetJobs = "const [jobs] = await db.query(`SELECT * FROM jobs ORDER BY created_at DESC`);";
const replJobs = `const [jobs] = await db.query(\`SELECT * FROM jobs ORDER BY created_at DESC\`);
  jobs.forEach(job => {
    if (job.description) job.descriptionHtml = marked.parse(job.description);
    if (job.contact_info) job.contact_infoHtml = marked.parse(job.contact_info);
  });`;
code = code.replace(targetJobs, replJobs);

// 2. Advertisers - GET /verein
const targetBandenwerber = "const [bandenwerber] = await db.query(`SELECT * FROM advertisers ORDER BY name ASC`);";
const replBandenwerber = `const todayStr = new Date().toISOString().split('T')[0];
  const [bandenwerber] = await db.query(\`
    SELECT * FROM advertisers 
    WHERE (is_archived = 0 OR is_archived IS NULL)
    AND (active_from IS NULL OR active_from = '' OR active_from <= ?)
    AND (active_until IS NULL OR active_until = '' OR active_until >= ?)
    ORDER BY name ASC
  \`, [todayStr, todayStr]);`;
code = code.replace(targetBandenwerber, replBandenwerber);

// 3. Advertisers - GET /admin/advertisers
const targetGetAdvertisers = `// --- Advertisers CRUD ---
app.get('/admin/advertisers', requireRole('sponsoring'), async (req, res) => {
  const orderBy = req.query.order === 'newest' ? 'id DESC' : 'name ASC';
  const currentOrder = req.query.order === 'newest' ? 'newest' : 'alpha';
  const [items] = await db.query(\`SELECT * FROM advertisers ORDER BY \${orderBy}\`);
  res.render('admin/advertisers-list', { page: 'admin', items, currentOrder });
});`;
const replGetAdvertisers = `// --- Advertisers CRUD ---
app.get('/admin/advertisers', requireRole('sponsoring'), async (req, res) => {
  const [items] = await db.query(\`SELECT * FROM advertisers ORDER BY name ASC\`);
  res.render('admin/advertisers-list', { page: 'admin', items });
});`;
code = code.replace(targetGetAdvertisers, replGetAdvertisers);

// 4. Advertisers - POST new
const targetPostNew = `app.post('/admin/advertisers/new', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location } = req.body;
  let logoUrl = null;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`INSERT INTO advertisers (name, link, location, sort_order, logo) VALUES (?, ?, ?, ?, ?)\`, [
    name, link || '', location || '', 0, logoUrl
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gespeichert.' };
  res.redirect('/admin/advertisers');
});`;
const replPostNew = `app.post('/admin/advertisers/new', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, active_from, active_until, is_archived } = req.body;
  let logoUrl = null;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`INSERT INTO advertisers (name, link, location, sort_order, logo, active_from, active_until, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`, [
    name, link || '', location || '', 0, logoUrl, active_from || null, active_until || null, is_archived ? 1 : 0
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gespeichert.' };
  res.redirect('/admin/advertisers');
});`;
code = code.replace(targetPostNew, replPostNew);

// 5. Advertisers - POST edit
const targetPostEdit = `app.post('/admin/advertisers/:id/edit', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location } = req.body;
  let logoUrl = req.body.existing_logo;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`UPDATE advertisers SET name=?, link=?, location=?, logo=? WHERE id=?\`, [
    name, link || '', location || '', logoUrl, req.params.id
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };
    res.redirect('/admin/advertisers/' + req.params.id + '/edit');
});`;
const replPostEdit = `app.post('/admin/advertisers/:id/edit', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, active_from, active_until, is_archived } = req.body;
  let logoUrl = req.body.existing_logo;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(\`UPDATE advertisers SET name=?, link=?, location=?, logo=?, active_from=?, active_until=?, is_archived=? WHERE id=?\`, [
    name, link || '', location || '', logoUrl, active_from || null, active_until || null, is_archived ? 1 : 0, req.params.id
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };
  res.redirect('/admin/advertisers');
});`;
code = code.replace(targetPostEdit, replPostEdit);

fs.writeFileSync('server.js', code);
console.log('server.js patched safely!');
