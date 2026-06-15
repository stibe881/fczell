const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/admin', (req, res, next) => {
  const parts = req.path.split('/');
  res.locals.active = parts[1] || 'dashboard';
  next();
});
app.get('/admin/teams', (req, res) => {
  res.render('admin/teams-list', { items: [], user: { roles: '["admin"]' } });
});
const server = app.listen(0, () => {
  const http = require('http');
  http.get(`http://localhost:${server.address().port}/admin/teams`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const activeLinks = [...data.matchAll(/<a[^>]*class="[^"]*active[^"]*"[^>]*>(.*?)<\/a>/gi)];
      console.log('Active links:', activeLinks.map(m => m[1]));
      console.log('Data snippets:', data.match(/<a[^>]*News<\/a>/gi));
      process.exit(0);
    });
  });
});
