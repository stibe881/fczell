const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
    secret: process.env.SESSION_SECRET || 'fczell-change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8, httpOnly: true, sameSite: 'lax' }
  })
);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mdToHtml(text) {
  if (!text) return '';
  const blocks = String(text).split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split('\n');
    if (lines.every(l => /^[-*]\s+/.test(l))) {
      return '<ul>' + lines.map(l =>
        '<li>' + inline(l.replace(/^[-*]\s+/, '')) + '</li>'
      ).join('') + '</ul>';
    }
    return '<p>' + inline(block).replace(/\n/g, '<br>') + '</p>';
  }).join('\n');
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

app.locals.mdToHtml = mdToHtml;
app.locals.escapeHtml = escapeHtml;

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.path = req.path;
  res.locals.globalSponsors = db.prepare(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`).all();
  delete req.session.flash;
  next();
});

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { type: 'error', msg: 'Bitte zuerst einloggen.' };
    return res.redirect('/login');
  }
  next();
}


// ---------- PUBLIC ROUTES ----------
app.get('/', (req, res) => {
  const news = db.prepare(
    `SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT 6`
  ).all();
  const events = db.prepare(
    `SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 5`
  ).all();
  const hero = db.prepare(`SELECT * FROM pages WHERE slug = 'hero'`).get();
  const sponsorenListe = db.prepare(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`).all();
  res.render('index', { page: 'home', news, events, hero, sponsorenListe });
});

app.get('/news', (req, res) => {
  const news = db.prepare(
    `SELECT * FROM news ORDER BY published_at DESC, id DESC`
  ).all();
  res.render('news', { page: 'news', news });
});

app.get('/news/:id', (req, res) => {
  const item = db.prepare(`SELECT * FROM news WHERE id = ?`).get(req.params.id);
  if (!item) return res.status(404).render('404', { page: '404' });
  res.render('news-single', { page: 'news', item });
});

app.get('/verein', (req, res) => {
  const intro = db.prepare(`SELECT * FROM pages WHERE slug = 'verein-intro'`).get();
  const penaltyclub = db.prepare(`SELECT * FROM pages WHERE slug = 'penaltyclub'`).get();
  const jobs = db.prepare(`SELECT * FROM pages WHERE slug = 'jobs'`).get();
  
  const vorstand = db.prepare(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`).all();
  const sponsorenListe = db.prepare(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`).all();
  const bandenwerber = db.prepare(`SELECT * FROM advertisers ORDER BY sort_order ASC, name ASC`).all();

  res.render('verein', {
    page: 'verein',
    intro,
    penaltyclub,
    jobs,
    vorstand,
    sponsorenListe,
    bandenwerber
  });
});

app.get('/clubhaus', (req, res) => {
  const clubhaus = db.prepare(`SELECT * FROM pages WHERE slug = 'clubhaus'`).get();
  res.render('clubhaus', {
    page: 'clubhaus',
    clubhaus
  });
});

app.get('/aktive', (req, res) => {
  const aktiveTeams = db.prepare(`SELECT * FROM teams WHERE type = 'aktive' ORDER BY sort_order ASC, id ASC`).all();
  res.render('aktive', { page: 'aktive', teams: aktiveTeams });
});

app.get('/junioren', (req, res) => {
  const juniorTeams = db.prepare(`SELECT * FROM teams WHERE type = 'junioren' ORDER BY sort_order ASC, id ASC`).all();
  res.render('junioren', { page: 'junioren', teams: juniorTeams });
});

app.get('/events', (req, res) => {
  const events = db.prepare(
    `SELECT * FROM events ORDER BY event_date ASC`
  ).all();
  res.render('events', { page: 'events', events });
});

app.get('/kontakt', (req, res) => {
  const vorstand = db.prepare(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`).all();
  res.render('kontakt', { page: 'kontakt', vorstand });
});

// ---------- AUTH ----------
app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  res.render('login', { page: 'login' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    req.session.flash = { type: 'error', msg: 'Ungültige Zugangsdaten.' };
    return res.redirect('/login');
  }
  req.session.user = { id: user.id, username: user.username, displayName: user.display_name };
  res.redirect('/admin');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ---------- ADMIN ----------
app.get('/admin', requireAuth, (req, res) => {
  const newsCount = db.prepare(`SELECT COUNT(*) AS c FROM news`).get().c;
  const eventsCount = db.prepare(`SELECT COUNT(*) AS c FROM events`).get().c;
  const pagesCount = db.prepare(`SELECT COUNT(*) AS c FROM pages`).get().c;
  const vorstandCount = db.prepare(`SELECT COUNT(*) AS c FROM vorstand`).get().c;
  const sponsorsCount = db.prepare(`SELECT COUNT(*) AS c FROM sponsors`).get().c;
  const advertisersCount = db.prepare(`SELECT COUNT(*) AS c FROM advertisers`).get().c;
  const teamsCount = db.prepare(`SELECT COUNT(*) AS c FROM teams`).get().c;

  const upcomingEvents = db.prepare(
    `SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 5`
  ).all();
  const recentNews = db.prepare(
    `SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT 5`
  ).all();
  
  res.render('admin/dashboard', {
    page: 'admin',
    newsCount,
    eventsCount,
    pagesCount,
    vorstandCount,
    sponsorsCount,
    advertisersCount,
    teamsCount,
    upcomingEvents,
    recentNews
  });
});

// --- News CRUD ---
app.get('/admin/news', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM news ORDER BY published_at DESC, id DESC`).all();
  res.render('admin/news-list', { page: 'admin', items });
});

app.get('/admin/news/new', requireAuth, (req, res) => {
  res.render('admin/news-form', { page: 'admin', item: null });
});

app.post('/admin/news/new', requireAuth, (req, res) => {
  const { title, excerpt, body, category, published_at } = req.body;
  db.prepare(
    `INSERT INTO news (title, excerpt, body, category, published_at) VALUES (?, ?, ?, ?, ?)`
  ).run(title, excerpt || '', body, category || 'Allgemein', published_at || new Date().toISOString().slice(0, 10));
  req.session.flash = { type: 'success', msg: 'News gespeichert.' };
  res.redirect('/admin/news');
});

app.get('/admin/news/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM news WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/news');
  res.render('admin/news-form', { page: 'admin', item });
});

app.post('/admin/news/:id/edit', requireAuth, (req, res) => {
  const { title, excerpt, body, category, published_at } = req.body;
  db.prepare(
    `UPDATE news SET title=?, excerpt=?, body=?, category=?, published_at=?, updated_at=datetime('now') WHERE id=?`
  ).run(title, excerpt || '', body, category || 'Allgemein', published_at, req.params.id);
  req.session.flash = { type: 'success', msg: 'News aktualisiert.' };
  res.redirect('/admin/news');
});

app.post('/admin/news/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM news WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'News gelöscht.' };
  res.redirect('/admin/news');
});

// --- Events CRUD ---
app.get('/admin/events', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM events ORDER BY event_date ASC`).all();
  res.render('admin/events-list', { page: 'admin', items });
});

app.get('/admin/events/new', requireAuth, (req, res) => {
  res.render('admin/events-form', { page: 'admin', item: null });
});

app.post('/admin/events/new', requireAuth, (req, res) => {
  const { title, event_date, event_time, location, description } = req.body;
  db.prepare(
    `INSERT INTO events (title, event_date, event_time, location, description) VALUES (?, ?, ?, ?, ?)`
  ).run(title, event_date, event_time || '', location || '', description || '');
  req.session.flash = { type: 'success', msg: 'Termin gespeichert.' };
  res.redirect('/admin/events');
});

app.get('/admin/events/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM events WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/events');
  res.render('admin/events-form', { page: 'admin', item });
});

app.post('/admin/events/:id/edit', requireAuth, (req, res) => {
  const { title, event_date, event_time, location, description } = req.body;
  db.prepare(
    `UPDATE events SET title=?, event_date=?, event_time=?, location=?, description=?, updated_at=datetime('now') WHERE id=?`
  ).run(title, event_date, event_time || '', location || '', description || '', req.params.id);
  req.session.flash = { type: 'success', msg: 'Termin aktualisiert.' };
  res.redirect('/admin/events');
});

app.post('/admin/events/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM events WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'Termin gelöscht.' };
  res.redirect('/admin/events');
});

// --- Pages (text blocks) ---
app.get('/admin/pages', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM pages ORDER BY slug ASC`).all();
  res.render('admin/pages-list', { page: 'admin', items });
});

app.get('/admin/pages/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM pages WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/pages');
  res.render('admin/pages-form', { page: 'admin', item });
});

app.post('/admin/pages/:id/edit', requireAuth, (req, res) => {
  const { title, body } = req.body;
  db.prepare(
    `UPDATE pages SET title=?, body=?, updated_at=datetime('now') WHERE id=?`
  ).run(title, body, req.params.id);
  req.session.flash = { type: 'success', msg: 'Inhalt aktualisiert.' };
  res.redirect('/admin/pages');
});

// --- Account / password change ---
app.get('/admin/account', requireAuth, (req, res) => {
  res.render('admin/account', { page: 'admin' });
});

app.post('/admin/account', requireAuth, (req, res) => {
  const { current_password, new_password, new_password_confirm } = req.body;
  const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.session.user.id);
  if (!bcrypt.compareSync(current_password || '', user.password_hash)) {
    req.session.flash = { type: 'error', msg: 'Aktuelles Passwort ist falsch.' };
    return res.redirect('/admin/account');
  }
  if (!new_password || new_password.length < 8) {
    req.session.flash = { type: 'error', msg: 'Neues Passwort muss mindestens 8 Zeichen haben.' };
    return res.redirect('/admin/account');
  }
  if (new_password !== new_password_confirm) {
    req.session.flash = { type: 'error', msg: 'Die neuen Passwörter stimmen nicht überein.' };
    return res.redirect('/admin/account');
  }
  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hash, user.id);
  req.session.flash = { type: 'success', msg: 'Passwort wurde aktualisiert.' };
  res.redirect('/admin/account');
});

// --- Vorstand CRUD ---
app.get('/admin/vorstand', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`).all();
  res.render('admin/vorstand-list', { page: 'admin', items });
});

app.get('/admin/vorstand/new', requireAuth, (req, res) => {
  res.render('admin/vorstand-form', { page: 'admin', item: null });
});

app.post('/admin/vorstand/new', requireAuth, (req, res) => {
  const { name, role, address, phone, email, sort_order } = req.body;
  db.prepare(`INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(name, role||'', address||'', phone||'', email||'', sort_order||0);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied hinzugefügt.' };
  res.redirect('/admin/vorstand');
});

app.get('/admin/vorstand/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM vorstand WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/vorstand');
  res.render('admin/vorstand-form', { page: 'admin', item });
});

app.post('/admin/vorstand/:id/edit', requireAuth, (req, res) => {
  const { name, role, address, phone, email, sort_order } = req.body;
  db.prepare(`UPDATE vorstand SET name=?, role=?, address=?, phone=?, email=?, sort_order=? WHERE id=?`).run(name, role||'', address||'', phone||'', email||'', sort_order||0, req.params.id);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied aktualisiert.' };
  res.redirect('/admin/vorstand');
});

app.post('/admin/vorstand/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM vorstand WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied gelöscht.' };
  res.redirect('/admin/vorstand');
});

// --- Sponsors CRUD ---
app.get('/admin/sponsors', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`).all();
  res.render('admin/sponsors-list', { page: 'admin', items });
});

app.get('/admin/sponsors/new', requireAuth, (req, res) => {
  res.render('admin/sponsors-form', { page: 'admin', item: null });
});

app.post('/admin/sponsors/new', requireAuth, (req, res) => {
  const { name, category, logo, link, sort_order } = req.body;
  db.prepare(`INSERT INTO sponsors (name, category, logo, link, sort_order) VALUES (?, ?, ?, ?, ?)`).run(name, category||'', logo||'', link||'', sort_order||0);
  req.session.flash = { type: 'success', msg: 'Sponsor hinzugefügt.' };
  res.redirect('/admin/sponsors');
});

app.get('/admin/sponsors/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM sponsors WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/sponsors');
  res.render('admin/sponsors-form', { page: 'admin', item });
});

app.post('/admin/sponsors/:id/edit', requireAuth, (req, res) => {
  const { name, category, logo, link, sort_order } = req.body;
  db.prepare(`UPDATE sponsors SET name=?, category=?, logo=?, link=?, sort_order=? WHERE id=?`).run(name, category||'', logo||'', link||'', sort_order||0, req.params.id);
  req.session.flash = { type: 'success', msg: 'Sponsor aktualisiert.' };
  res.redirect('/admin/sponsors');
});

app.post('/admin/sponsors/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM sponsors WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'Sponsor gelöscht.' };
  res.redirect('/admin/sponsors');
});

// --- Advertisers CRUD ---
app.get('/admin/advertisers', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM advertisers ORDER BY sort_order ASC, name ASC`).all();
  res.render('admin/advertisers-list', { page: 'admin', items });
});

app.get('/admin/advertisers/new', requireAuth, (req, res) => {
  res.render('admin/advertisers-form', { page: 'admin', item: null });
});

app.post('/admin/advertisers/new', requireAuth, (req, res) => {
  const { name, link, location, sort_order } = req.body;
  db.prepare(`INSERT INTO advertisers (name, link, location, sort_order) VALUES (?, ?, ?, ?)`).run(name, link||'', location||'', sort_order||0);
  req.session.flash = { type: 'success', msg: 'Bandenwerber hinzugefügt.' };
  res.redirect('/admin/advertisers');
});

app.get('/admin/advertisers/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM advertisers WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/advertisers');
  res.render('admin/advertisers-form', { page: 'admin', item });
});

app.post('/admin/advertisers/:id/edit', requireAuth, (req, res) => {
  const { name, link, location, sort_order } = req.body;
  db.prepare(`UPDATE advertisers SET name=?, link=?, location=?, sort_order=? WHERE id=?`).run(name, link||'', location||'', sort_order||0, req.params.id);
  req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };
  res.redirect('/admin/advertisers');
});

app.post('/admin/advertisers/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM advertisers WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gelöscht.' };
  res.redirect('/admin/advertisers');
});

// --- Teams CRUD ---
app.get('/admin/teams', requireAuth, (req, res) => {
  const items = db.prepare(`SELECT * FROM teams ORDER BY type ASC, sort_order ASC, id ASC`).all();
  res.render('admin/teams-list', { page: 'admin', items });
});

app.get('/admin/teams/new', requireAuth, (req, res) => {
  res.render('admin/teams-form', { page: 'admin', item: null });
});

app.post('/admin/teams/new', requireAuth, (req, res) => {
  const { slug, type, name, league, extra, trainer, coach, goalie, physio, times, location, sort_order } = req.body;
  try {
    db.prepare(`INSERT INTO teams (slug, type, name, league, extra, trainer, coach, goalie, physio, times, location, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(slug||'', type||'aktive', name, league||'', extra||'', trainer||'', coach||'', goalie||'', physio||'', times||'', location||'', sort_order||0);
    req.session.flash = { type: 'success', msg: 'Team hinzugefügt.' };
  } catch (e) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Speichern (Slug bereits vorhanden?).' };
  }
  res.redirect('/admin/teams');
});

app.get('/admin/teams/:id/edit', requireAuth, (req, res) => {
  const item = db.prepare(`SELECT * FROM teams WHERE id = ?`).get(req.params.id);
  if (!item) return res.redirect('/admin/teams');
  res.render('admin/teams-form', { page: 'admin', item });
});

app.post('/admin/teams/:id/edit', requireAuth, (req, res) => {
  const { slug, type, name, league, extra, trainer, coach, goalie, physio, times, location, sort_order } = req.body;
  try {
    db.prepare(`UPDATE teams SET slug=?, type=?, name=?, league=?, extra=?, trainer=?, coach=?, goalie=?, physio=?, times=?, location=?, sort_order=? WHERE id=?`).run(slug||'', type||'aktive', name, league||'', extra||'', trainer||'', coach||'', goalie||'', physio||'', times||'', location||'', sort_order||0, req.params.id);
    req.session.flash = { type: 'success', msg: 'Team aktualisiert.' };
  } catch (e) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Aktualisieren (Slug bereits vorhanden?).' };
  }
  res.redirect('/admin/teams');
});

app.post('/admin/teams/:id/delete', requireAuth, (req, res) => {
  db.prepare(`DELETE FROM teams WHERE id = ?`).run(req.params.id);
  req.session.flash = { type: 'success', msg: 'Team gelöscht.' };
  res.redirect('/admin/teams');
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { page: '404' });
});

app.listen(PORT, () => {
  console.log(`FC Zell Webseite läuft auf http://localhost:${PORT}`);
});
