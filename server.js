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

// Static club data (Vorstand, Teams, Sponsoren) — these don't change often
const vorstand = [
  { name: 'Jörg Graber', role: 'Präsident', address: 'Grünenbodenweid 2, 6144 Zell', phone: '079 333 97 59', email: 'joerg.graber@bithawk.ch' },
  { name: 'Martin Werder', role: 'Vize-Präsident', phone: '078 600 83 36', email: 'martin@werder.lu' },
  { name: 'Patrick Albisser', role: 'Verantwortlicher Events', address: 'Hoger 9, 6130 Willisau', phone: '079 756 46 29', email: 'patrick.albisser@bluewin.ch' },
  { name: 'Heinz Beck', role: 'Infrastruktur / Platz', address: 'Luzernstrasse 8, 6144 Zell', phone: '079 343 09 40', email: 'info@buag-kuechen.ch' },
  { name: 'Simon Egli', role: 'Junioren', phone: '079 208 57 00', email: 'joli-seimen@bluewin.ch' },
  { name: 'Nicole Mehr', role: 'Finanzen', phone: '077 429 20 30', email: 'nicole_mehr@hotmail.com' },
  { name: 'Othmar Meyer', role: 'Spiko-Präsident', address: 'Neuhushof 3, 6144 Zell', phone: '079 796 61 19', email: 'othmar.meyer58@bluewin.ch' },
  { name: 'Dominic Hecht', role: 'Material', phone: '079 195 22 24', email: 'dominic-2000@gmx.ch' }
];

const aktiveTeams = [
  {
    slug: '1-mannschaft',
    name: '1. Mannschaft',
    league: '3. Liga',
    trainer: 'Lucas De Jesus',
    coach: 'Patrick de Jesus',
    goalie: 'Pascal Gerber',
    times: 'Dienstag & Donnerstag: 19.30 – 21.00 Uhr',
    location: 'Sportplatz Gass'
  },
  {
    slug: '2-mannschaft',
    name: '2. Mannschaft',
    league: '5. Liga',
    trainer: 'Daniel Schwegler',
    coach: 'Paulo Cerejo',
    goalie: 'Pascal Gerber',
    physio: 'Paul Steinmann',
    times: 'Montag 19.30 – 21.00 Uhr & Donnerstag 19.45 – 21.15 Uhr',
    location: 'Sportplatz Gass'
  },
  {
    slug: 'senioren-30',
    name: 'Senioren 30+',
    league: 'SG mit FC Willisau',
    trainer: 'Adrian Bossert',
    coach: 'Pascal Gertsch / Martin Steiner',
    times: 'Dienstag 19.30 – 21.00 Uhr',
    location: 'Schlossfeld Willisau'
  }
];

const juniorTeams = [
  { slug: 'b', name: 'B-Junioren', extra: 'SG Algro-Zell', trainer: 'Petrick Marti', times: 'Mo: Aengelehr Altbüron 19.45–21.15 / Mi: Gass 19.30–21.00' },
  { slug: 'c', name: 'C-Junioren', trainer: 'Sandro Mehr, Roderic Bucher, Flavio Peter, Lorin Bättig', times: 'Di & Do: 18.00 – 19.30 Uhr', location: 'Sportplatz Gass 2' },
  { slug: 'da', name: 'Da-Junioren', trainer: 'Jörg Graber, Fabio Bucher', times: 'Mo & Mi: 18.00 – 19.30 Uhr', location: 'Trainingsplatz Gass 1' },
  { slug: 'db', name: 'Db-Junioren', trainer: 'Roland Bucher, Lionel Bieri', times: 'Mo & Mi: 18.00 – 19.30 Uhr', location: 'Trainingsplatz Gass' },
  { slug: 'd7', name: 'D7-Junioren', trainer: 'Besnik Musaj & Nils Leuneberger', times: 'Mo & Do: 18.00 – 19.30 Uhr', location: 'Trainingsplatz Gass 1' },
  { slug: 'e', name: 'E-Junioren', trainer: 'Martin Dubach, Matthias Bürli, Janis Bangerter', times: 'Di & Do: 18.00 – 19.30 Uhr', location: 'Sportplatz Gass 2' },
  { slug: 'piccolos', name: 'Piccolos', trainer: 'Andreas Bernet, Timon Bucher, Matteo Egli, Simon Egli, Sebastian Häfliger, Roli Leuenberger, Severin Brunner, Daniel Bättig', times: 'Mittwoch 18.00 – 19.15 Uhr', location: 'Sportplatz Gass 2' }
];

const sponsorenListe = [
  { name: 'KKLH', kategorie: 'Hauptsponsor', logo: '/images/sponsoren/kklh.jpg', link: 'https://www.kklh.ch/' },
  { name: 'Valiant', kategorie: 'Co-Sponsor', logo: '/images/sponsoren/valiant.jpg', link: 'https://www.valiant.ch/' },
  { name: 'Leuenberger', kategorie: 'Juniorensponsor', logo: '/images/sponsoren/leuenberger.jpg', link: 'https://www.ldilag.ch/' },
  { name: 'Kunz Sport', kategorie: 'Ausrüster', logo: '/images/sponsoren/kunzsport.png', link: 'https://go-in.ch/kunzsport/' },
  { name: 'Swisslos', kategorie: 'Sportfonds', logo: '/images/sponsoren/swisslos.jpg', link: 'https://sport.lu.ch/' }
];

// ---------- PUBLIC ROUTES ----------
app.get('/', (req, res) => {
  const news = db.prepare(
    `SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT 6`
  ).all();
  const events = db.prepare(
    `SELECT * FROM events WHERE event_date >= date('now') ORDER BY event_date ASC LIMIT 5`
  ).all();
  const hero = db.prepare(`SELECT * FROM pages WHERE slug = 'hero'`).get();
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
  res.render('verein', {
    page: 'verein',
    intro,
    penaltyclub,
    jobs,
    vorstand,
    sponsorenListe
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
  res.render('aktive', { page: 'aktive', teams: aktiveTeams });
});

app.get('/junioren', (req, res) => {
  res.render('junioren', { page: 'junioren', teams: juniorTeams });
});

app.get('/events', (req, res) => {
  const events = db.prepare(
    `SELECT * FROM events ORDER BY event_date ASC`
  ).all();
  res.render('events', { page: 'events', events });
});

app.get('/kontakt', (req, res) => {
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

// 404
app.use((req, res) => {
  res.status(404).render('404', { page: '404' });
});

app.listen(PORT, () => {
  console.log(`FC Zell Webseite läuft auf http://localhost:${PORT}`);
});
