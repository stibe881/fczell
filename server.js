const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');
const multer = require('multer');
const { sendContactEmail, sendRegistrationConfirmation } = require('./email');

// --- Multer storages ---
const sponsorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images/sponsoren')),
  filename: (req, file, cb) => cb(null, 'sponsor-' + Date.now() + path.extname(file.originalname))
});
const uploadSponsors = multer({ storage: sponsorStorage });

const advertiserStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images/advertisers')),
  filename: (req, file, cb) => cb(null, 'advertiser-' + Date.now() + path.extname(file.originalname))
});
const uploadAdvertisers = multer({ storage: advertiserStorage });

const trainerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images/trainers')),
  filename: (req, file, cb) => cb(null, 'trainer-' + Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname))
});
const uploadTrainers = multer({ storage: trainerStorage });

const uploadAny = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname.startsWith('staff_photo')) cb(null, path.join(__dirname, 'public/images/trainers'));
      else cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => cb(null, 'upload-' + Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname))
  })
});

const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images/gallery')),
  filename: (req, file, cb) => cb(null, 'gallery-' + Date.now() + '-' + Math.round(Math.random() * 1000) + path.extname(file.originalname))
});
const uploadGallery = multer({ storage: galleryStorage });

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/documents')),
  filename: (req, file, cb) => cb(null, 'doc-' + Date.now() + path.extname(file.originalname))
});
const uploadDocument = multer({ storage: documentStorage });

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new MySQLStore({}, db),
    secret: process.env.SESSION_SECRET || 'fczell-change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8, httpOnly: true, sameSite: 'lax' }
  })
);

// --- Helpers ---
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

/** Format a date string or Date object to DD.MM.YYYY */
function formatDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

/** Format a datetime string to DD.MM.YYYY HH:MM */
function formatDateTime(val) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

app.locals.mdToHtml = mdToHtml;
app.locals.escapeHtml = escapeHtml;
app.locals.formatDate = formatDate;
app.locals.formatDateTime = formatDateTime;

// --- Global middleware ---
app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  res.locals.path = req.path;
  
  const [globalSponsors] = await db.query(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`);
  res.locals.globalSponsors = globalSponsors;
  
  const [activeMatchRows] = await db.query(`SELECT * FROM events WHERE is_match = 1 AND DATE(event_date) = CURDATE() LIMIT 1`);
  res.locals.activeMatch = activeMatchRows[0];
  
  const [nextMatchRows] = await db.query(`SELECT * FROM events WHERE is_match = 1 AND DATE(event_date) > CURDATE() ORDER BY event_date ASC LIMIT 1`);
  res.locals.nextMatch = nextMatchRows[0];
  
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

function requireRole(role) {
  return function(req, res, next) {
    if (!req.session.user) {
      req.session.flash = { type: 'error', msg: 'Bitte zuerst einloggen.' };
      return res.redirect('/login');
    }
    let userRoles = [];
    try {
      userRoles = JSON.parse(req.session.user.roles || '[]');
    } catch (e) { }
    
    if (userRoles.includes('admin') || userRoles.includes(role)) {
      return next();
    }
    req.session.flash = { type: 'error', msg: 'Keine Berechtigung für diesen Bereich.' };
    return res.redirect('/admin');
  }
}

// Helper to get page body as URL/text
async function getPageBody(slug) {
  const [rows] = await db.query(`SELECT body FROM pages WHERE slug = ?`, [slug]);
  const p = rows[0];
  return p ? p.body : '';
}

// ========== PUBLIC ROUTES ==========

// --- Homepage ---
app.get('/', async (req, res) => {
  const [news] = await db.query(`SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT 6`);
  const [heroRows] = await db.query(`SELECT * FROM pages WHERE slug = 'hero'`);
  const hero = heroRows[0];
  res.render('index', { page: 'home', news, hero });
});

// --- News ---
app.get('/news', async (req, res) => {
  const [news] = await db.query(`SELECT * FROM news ORDER BY published_at DESC, id DESC`);
  const [categories] = await db.query(`SELECT DISTINCT category FROM news WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`);
  res.render('news', { page: 'news', news, categories });
});

app.get('/news/:id', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM news WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.status(404).render('404', { page: '404' });
  res.render('news-single', { page: 'news', item });
});

// --- Verein (mega page, without Mannschaften) ---
app.get('/verein', async (req, res) => {
  const [introRows] = await db.query(`SELECT * FROM pages WHERE slug = 'verein-intro'`);
  const intro = introRows[0];
  const [penaltyclubRows] = await db.query(`SELECT * FROM pages WHERE slug = 'penaltyclub'`);
  const penaltyclub = penaltyclubRows[0];
  const [clubhausRows] = await db.query(`SELECT * FROM pages WHERE slug = 'clubhaus'`);
  const clubhaus = clubhausRows[0];
  const [verhaltenscodexRows] = await db.query(`SELECT * FROM pages WHERE slug = 'verhaltenscodex'`);
  const verhaltenscodex = verhaltenscodexRows[0];  const [sponsorenDankRows] = await db.query(`SELECT * FROM pages WHERE slug = 'sponsoren-dank'`);
  const sponsorenDank = sponsorenDankRows[0];
  
  const [vorstand] = await db.query(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`);
  const [sponsorenListe] = await db.query(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`);
  const [bandenwerber] = await db.query(`SELECT * FROM advertisers ORDER BY sort_order ASC, name ASC`);
  const [trainers] = await db.query(`SELECT ts.*, t.name AS team_name, t.slug AS team_slug, t.type AS team_type FROM team_staff ts JOIN teams t ON ts.team_id = t.id WHERE ts.role IN ('Trainer', 'Co-Trainer') ORDER BY t.sort_order ASC, ts.id ASC`);

  const [sponsorentafelPhotos] = await db.query(`SELECT * FROM gallery_photos WHERE gallery = 'sponsorentafel' ORDER BY sort_order ASC`);

  res.render('verein', {
    page: 'verein',
    intro,
    penaltyclub,
    clubhaus,
    verhaltenscodex,
    sponsorenDank,
    vorstand,
    sponsorenListe,
    bandenwerber,
    trainers,
    sponsorentafelPhotos
  });
});

// --- Mannschaften ---
app.get('/mannschaften', async (req, res) => {
  const [aktiveTeams] = await db.query(`SELECT * FROM teams WHERE type = 'aktive' ORDER BY sort_order ASC, id ASC`);
  const [juniorTeams] = await db.query(`SELECT * FROM teams WHERE type = 'junioren' ORDER BY sort_order ASC, id ASC`);
  
  const [allStaff] = await db.query(`SELECT * FROM team_staff`);
  const mapStaff = (t) => { t.staff = allStaff.filter(s => s.team_id === t.id).sort((a,b)=>a.sort_order - b.sort_order); return t; };
  aktiveTeams.forEach(mapStaff);
  juniorTeams.forEach(mapStaff);
  
  const footballUrl = await getPageBody('football-url');
  const matchcenterUrl = await getPageBody('matchcenter-url');
  const veoUrl = await getPageBody('veo-url');

  // Gather team photos from gallery
  const teamPhotos = {};
  const allTeams = [...aktiveTeams, ...juniorTeams];
  for (const t of allTeams) {
    const [photos] = await db.query(`SELECT * FROM gallery_photos WHERE gallery = ? ORDER BY sort_order ASC`, ['team-' + t.slug]);
    if (photos.length > 0) teamPhotos[t.slug] = photos;
  }

  res.render('mannschaften', {
    page: 'mannschaften',
    aktiveTeams,
    juniorTeams,
    footballUrl,
    matchcenterUrl,
    veoUrl,
    teamPhotos
  });
});

// --- Junioren Detail ---
app.get('/mannschaften/junioren/:slug', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM teams WHERE type = 'junioren' AND slug = ?`, [req.params.slug]);
  const team = rows[0];
  if (!team) return res.status(404).render('404', { page: '404' });
  
  const [staff] = await db.query(`SELECT * FROM team_staff WHERE team_id = ? ORDER BY sort_order ASC, id ASC`, [team.id]);
  team.staff = staff;
  res.render('team-detail', { page: 'mannschaften', team });
});

// --- Anlässe ---
app.get('/anlaesse', async (req, res) => {
  const [anlaesse] = await db.query(`SELECT * FROM anlaesse ORDER BY sort_order ASC, id ASC`);

  // News tagged as Juniorenlager (legacy compatibility)
  const [juniorenlagerNews] = await db.query(`SELECT * FROM news WHERE category = 'Juniorenlager' ORDER BY published_at DESC`);

  // Photos
  const [juniorenlagerPhotos] = await db.query(`SELECT * FROM gallery_photos WHERE gallery = 'juniorenlager' ORDER BY sort_order ASC`);
  const [dorfturnierPhotos] = await db.query(`SELECT * FROM gallery_photos WHERE gallery = 'dorfturnier' ORDER BY sort_order ASC`);

  // Documents
  const [juniorenlagerDocs] = await db.query(`SELECT * FROM documents WHERE category = 'juniorenlager' ORDER BY upload_date DESC`);
  const [amtscupDocs] = await db.query(`SELECT * FROM documents WHERE category = 'amtscup' ORDER BY upload_date DESC`);
  const [dorfturnierDocs] = await db.query(`SELECT * FROM documents WHERE category = 'dorfturnier' ORDER BY upload_date DESC`);
  const [gvDocs] = await db.query(`SELECT * FROM documents WHERE category = 'gv-protokoll' ORDER BY upload_date DESC`);

  // Next GV event
  const [nextGvRows] = await db.query(`SELECT * FROM events WHERE title LIKE '%GV%' AND DATE(event_date) >= CURDATE() ORDER BY event_date ASC LIMIT 1`);
  const nextGv = nextGvRows[0];

  res.render('anlaesse', {
    page: 'anlaesse',
    anlaesse,
    juniorenlagerNews,
    juniorenlagerPhotos,
    dorfturnierPhotos,
    juniorenlagerDocs,
    amtscupDocs,
    dorfturnierDocs,
    gvDocs,
    nextGv
  });
});

// --- Anlässe Registrations ---
app.post('/anlaesse/:slug/anmelden', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM anlaesse WHERE slug = ?', [req.params.slug]);
  const anlass = rows[0];
  if (!anlass || !anlass.has_form) {
    req.session.flash = { type: 'error', msg: 'Anmeldung für diesen Anlass nicht möglich.' };
    return res.redirect('/anlaesse');
  }

  // Check deadline
  if (anlass.deadline && new Date() > new Date(anlass.deadline)) {
    req.session.flash = { type: 'error', msg: 'Anmeldeschluss bereits erreicht.' };
    return res.redirect('/anlaesse#' + anlass.slug);
  }

  if (anlass.form_type === 'juniorenlager') {
    const { child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes } = req.body;
    if (!child_name || !parent_name || !parent_email || !parent_phone) {
      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }
    await db.query(`
      INSERT INTO registrations_juniorenlager (child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [child_name, child_birthdate || '', parent_name, parent_email, parent_phone, address || '', allergies || '', notes || '']);
    
    sendRegistrationConfirmation({
      to: parent_email, type: 'juniorenlager', name: parent_name,
      details: { 'Kind': child_name, 'Geburtsdatum': child_birthdate || '-', 'Elternteil': parent_name, 'E-Mail': parent_email, 'Telefon': parent_phone, 'Adresse': address || '-', 'Allergien': allergies || '-', 'Bemerkungen': notes || '-' }
    }).catch(err => console.error('E-Mail Fehler:', err));

  } else if (anlass.form_type === 'dorfturnier') {
    const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;
    if (!team_name || !contact_name || !contact_email || !contact_phone) {
      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }
    await db.query(`
      INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);
    
    sendRegistrationConfirmation({
      to: contact_email, type: 'dorfturnier', name: contact_name,
      details: { 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }
    }).catch(err => console.error('E-Mail Fehler:', err));

  } else {
    // Standard Form Type
    const { name, email, phone, notes } = req.body;
    if (!name || !email) {
      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }
    await db.query('INSERT INTO registrations_standard (anlass_id, name, email, phone, notes) VALUES (?, ?, ?, ?, ?)', [anlass.id, name, email, phone || '', notes || '']);
    
    sendRegistrationConfirmation({
      to: email, type: 'standard', name: name,
      details: { 'Name': name, 'E-Mail': email, 'Telefon': phone || '-', 'Bemerkungen': notes || '-' }
    }).catch(err => console.error('E-Mail Fehler:', err));
  }

  req.session.flash = { type: 'success', msg: 'Anmeldung erfolgreich! Du erhältst in Kürze eine Bestätigung per E-Mail.' };
  res.redirect('/anlaesse#' + anlass.slug);
});

// --- Kontakt ---
app.get('/kontakt', async (req, res) => {
  const [vorstand] = await db.query(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`);
  const preselect = req.query.grund || '';
  res.render('kontakt', { page: 'kontakt', vorstand, preselect });
});

app.post('/kontakt', async (req, res) => {
  const { subject, name, email, phone, message, alte_adresse, neue_adresse, datum, personen, anlass } = req.body;

  if (!subject || !name || !email || !message) {
    req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
    return res.redirect('/kontakt');
  }

  const extraFields = {};
  if (subject === 'Adressänderung') {
    if (alte_adresse) extraFields['Alte Adresse'] = alte_adresse;
    if (neue_adresse) extraFields['Neue Adresse'] = neue_adresse;
  }
  if (subject === 'Clubhausbuchung') {
    if (datum) extraFields['Gewünschtes Datum'] = datum;
    if (personen) extraFields['Anzahl Personen'] = personen;
    if (anlass) extraFields['Anlass'] = anlass;
  }

  const sent = await sendContactEmail({ subject, name, email, phone, message, extraFields });
  
  if (sent) {
    req.session.flash = { type: 'success', msg: 'Deine Nachricht wurde erfolgreich gesendet. Wir melden uns in Kürze!' };
  } else {
    req.session.flash = { type: 'success', msg: 'Deine Nachricht wurde registriert. Wir melden uns in Kürze! (E-Mail-Versand ist noch nicht konfiguriert)' };
  }
  res.redirect('/kontakt');
});

// --- Datenschutz ---
app.get('/datenschutz', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM pages WHERE slug = 'datenschutz'`);
  const datenschutz = rows[0];
  res.render('datenschutz', { page: 'datenschutz', datenschutz });
});

// --- Jobs ---
app.get('/jobs', async (req, res) => {
  const [jobs] = await db.query(`SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC`);
  res.render('jobs', { page: 'jobs', jobs });
});

// --- 301 Redirects for old URLs ---
app.get('/clubhaus', async (req, res) => res.redirect(301, '/verein#clubhaus'));
app.get('/aktive', async (req, res) => res.redirect(301, '/mannschaften'));
app.get('/junioren', async (req, res) => res.redirect(301, '/mannschaften'));
app.get('/junioren/:slug', async (req, res) => res.redirect(301, '/mannschaften'));
app.get('/verein/mannschaften', async (req, res) => res.redirect(301, '/mannschaften'));
app.get('/events', async (req, res) => res.redirect(301, '/anlaesse'));
app.get('/events/archiv', async (req, res) => res.redirect(301, '/anlaesse'));
app.get('/events/:id', async (req, res) => res.redirect(301, '/anlaesse'));

// ========== AUTH ==========
app.get('/login', async (req, res) => {
  if (req.session.user) return res.redirect('/admin');
  res.render('login', { page: 'login' });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    req.session.flash = { type: 'error', msg: 'Ungültige Zugangsdaten.' };
    return res.redirect('/login');
  }
  req.session.user = { id: user.id, username: user.username, displayName: user.display_name, roles: user.roles || '["admin"]' };
  res.redirect('/admin');
});

app.post('/logout', async (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ========== ADMIN ==========
app.get('/admin', requireAuth, async (req, res) => {
  const [newsCountRows] = await db.query(`SELECT COUNT(*) AS c FROM news`);
  const newsCount = newsCountRows[0].c;
  const [eventsCountRows] = await db.query(`SELECT COUNT(*) AS c FROM events`);
  const eventsCount = eventsCountRows[0].c;
  const [pagesCountRows] = await db.query(`SELECT COUNT(*) AS c FROM pages`);
  const pagesCount = pagesCountRows[0].c;
  const [vorstandCountRows] = await db.query(`SELECT COUNT(*) AS c FROM vorstand`);
  const vorstandCount = vorstandCountRows[0].c;
  const [sponsorsCountRows] = await db.query(`SELECT COUNT(*) AS c FROM sponsors`);
  const sponsorsCount = sponsorsCountRows[0].c;
  const [advertisersCountRows] = await db.query(`SELECT COUNT(*) AS c FROM advertisers`);
  const advertisersCount = advertisersCountRows[0].c;
  const [teamsCountRows] = await db.query(`SELECT COUNT(*) AS c FROM teams`);
  const teamsCount = teamsCountRows[0].c;
  const [documentsCountRows] = await db.query(`SELECT COUNT(*) AS c FROM documents`);
  const documentsCount = documentsCountRows[0].c;
  const [galleryCountRows] = await db.query(`SELECT COUNT(*) AS c FROM gallery_photos`);
  const galleryCount = galleryCountRows[0].c;
  const [regJuniorenlagerRows] = await db.query(`SELECT COUNT(*) AS c FROM registrations_juniorenlager`);
  const regJuniorenlager = regJuniorenlagerRows[0].c;
  const [regDorfturnierRows] = await db.query(`SELECT COUNT(*) AS c FROM registrations_dorfturnier`);
  const regDorfturnier = regDorfturnierRows[0].c;

  const [upcomingEvents] = await db.query(
    `SELECT * FROM events WHERE DATE(event_date) >= CURDATE() ORDER BY event_date ASC LIMIT 5`
  );
  const [recentNews] = await db.query(
    `SELECT * FROM news ORDER BY published_at DESC, id DESC LIMIT 5`
  );
  
  res.render('admin/dashboard', {
    page: 'admin',
    newsCount,
    eventsCount,
    pagesCount,
    vorstandCount,
    sponsorsCount,
    advertisersCount,
    teamsCount,
    documentsCount,
    galleryCount,
    regJuniorenlager,
    regDorfturnier,
    upcomingEvents,
    recentNews
  });
});

// --- News CRUD ---
app.get('/admin/news', requireRole('news'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM news ORDER BY published_at DESC, id DESC`);
  res.render('admin/news-list', { page: 'admin', items });
});

app.get('/admin/news/new', requireRole('news'), async (req, res) => {
  const [categories] = await db.query(`SELECT DISTINCT category FROM news WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`);
  res.render('admin/news-form', { page: 'admin', item: null, categories });
});

app.post('/admin/news/new', requireRole('news'), async (req, res) => {
  const { title, excerpt, body, category, published_at } = req.body;
  await db.query(
    `INSERT INTO news (title, excerpt, body, category, published_at) VALUES (?, ?, ?, ?, ?)`,
    [title, excerpt || '', body, category || 'Allgemein', published_at || new Date().toISOString().slice(0, 10)]
  );
  req.session.flash = { type: 'success', msg: 'News gespeichert.' };
  res.redirect('/admin/news');
});

app.get('/admin/news/:id/edit', requireRole('news'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM news WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/news');
  const [categories] = await db.query(`SELECT DISTINCT category FROM news WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`);
  res.render('admin/news-form', { page: 'admin', item, categories });
});

app.post('/admin/news/:id/edit', requireRole('news'), async (req, res) => {
  const { title, excerpt, body, category, published_at } = req.body;
  await db.query(
    `UPDATE news SET title=?, excerpt=?, body=?, category=?, published_at=?, updated_at=NOW() WHERE id=?`,
    [title, excerpt || '', body, category || 'Allgemein', published_at, req.params.id]
  );
  req.session.flash = { type: 'success', msg: 'News aktualisiert.' };
  res.redirect('/admin/news');
});

app.post('/admin/news/:id/delete', requireRole('news'), async (req, res) => {
  await db.query(`DELETE FROM news WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'News gelöscht.' };
  res.redirect('/admin/news');
});

// --- Events CRUD ---
app.get('/admin/events', requireRole('teams'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM events ORDER BY event_date ASC`);
  res.render('admin/events-list', { page: 'admin', items });
});

app.get('/admin/events/new', requireRole('teams'), async (req, res) => {
  res.render('admin/events-form', { page: 'admin', item: null });
});

app.post('/admin/events/new', requireRole('teams'), async (req, res) => {
  const { title, event_date, event_time, location, description, is_match, live_ticker } = req.body;
  const isMatchVal = is_match === '1' ? 1 : 0;
  await db.query(
    `INSERT INTO events (title, event_date, event_time, location, description, is_match, live_ticker) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, event_date, event_time || '', location || '', description || '', isMatchVal, live_ticker || '']
  );
  req.session.flash = { type: 'success', msg: 'Termin gespeichert.' };
  res.redirect('/admin/events');
});

app.get('/admin/events/:id/edit', requireRole('teams'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM events WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/events');
  res.render('admin/events-form', { page: 'admin', item });
});

app.post('/admin/events/:id/edit', requireRole('teams'), async (req, res) => {
  const { title, event_date, event_time, location, description, is_match, live_ticker } = req.body;
  const isMatchVal = is_match === '1' ? 1 : 0;
  await db.query(
    `UPDATE events SET title=?, event_date=?, event_time=?, location=?, description=?, is_match=?, live_ticker=?, updated_at=NOW() WHERE id=?`,
    [title, event_date, event_time || '', location || '', description || '', isMatchVal, live_ticker || '', req.params.id]
  );
  req.session.flash = { type: 'success', msg: 'Termin aktualisiert.' };
  res.redirect('/admin/events');
});

app.post('/admin/events/:id/delete', requireRole('teams'), async (req, res) => {
  await db.query(`DELETE FROM events WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Termin gelöscht.' };
  res.redirect('/admin/events');
});

// --- Anlässe ---
app.get('/admin/anlaesse', requireRole('content'), async (req, res) => {
  const [anlaesse] = await db.query(`SELECT * FROM anlaesse ORDER BY sort_order ASC, id ASC`);
  res.render('admin/anlaesse-list', { page: 'admin', anlaesse });
});

app.get('/admin/anlaesse/new', requireRole('content'), async (req, res) => {
  res.render('admin/anlaesse-form', { page: 'admin', anlass: null });
});

app.post('/admin/anlaesse/new', requireRole('content'), async (req, res) => {
  const { title, slug, body, has_form, form_type, deadline, sort_order } = req.body;
  try {
    await db.query(`
      INSERT INTO anlaesse (title, slug, body, has_form, form_type, deadline, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, slug, body, has_form ? 1 : 0, form_type || 'standard', deadline || null, sort_order || 0]);
    req.session.flash = { type: 'success', msg: 'Anlass erstellt.' };
    res.redirect('/admin/anlaesse');
  } catch (err) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Erstellen (Slug schon vergeben?).' };
    res.redirect('/admin/anlaesse/new');
  }
});

app.get('/admin/anlaesse/:id/edit', requireRole('content'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM anlaesse WHERE id = ?`, [req.params.id]);
  const anlass = rows[0];
  if (!anlass) return res.redirect('/admin/anlaesse');
  res.render('admin/anlaesse-form', { page: 'admin', anlass });
});

app.post('/admin/anlaesse/:id/edit', requireRole('content'), async (req, res) => {
  const { title, slug, body, has_form, form_type, deadline, sort_order } = req.body;
  try {
    await db.query(`
      UPDATE anlaesse 
      SET title=?, slug=?, body=?, has_form=?, form_type=?, deadline=?, sort_order=?
      WHERE id=?
    `, [title, slug, body, has_form ? 1 : 0, form_type || 'standard', deadline || null, sort_order || 0, req.params.id]);
    req.session.flash = { type: 'success', msg: 'Anlass aktualisiert.' };
    res.redirect('/admin/anlaesse');
  } catch (err) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Aktualisieren (Slug schon vergeben?).' };
    res.redirect('/admin/anlaesse/' + req.params.id + '/edit');
  }
});

app.post('/admin/anlaesse/:id/delete', requireRole('content'), async (req, res) => {
  await db.query(`DELETE FROM anlaesse WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Anlass gelöscht.' };
  res.redirect('/admin/anlaesse');
});

// --- Anlässe Registrations Admin ---
app.get('/admin/anlaesse/:id/registrations', requireRole('content'), async (req, res) => {
  const [anlassRows] = await db.query(`SELECT * FROM anlaesse WHERE id = ?`, [req.params.id]);
  const anlass = anlassRows[0];
  if (!anlass) return res.redirect('/admin/anlaesse');

  let registrations = [];
  if (anlass.form_type === 'juniorenlager') {
    const [regs] = await db.query(`SELECT * FROM registrations_juniorenlager ORDER BY created_at DESC`);
    registrations = regs;
  } else if (anlass.form_type === 'dorfturnier') {
    const [regs] = await db.query(`SELECT * FROM registrations_dorfturnier ORDER BY created_at DESC`);
    registrations = regs;
  } else {
    const [regs] = await db.query(`SELECT * FROM registrations_standard WHERE anlass_id = ? ORDER BY created_at DESC`, [anlass.id]);
    registrations = regs;
  }

  res.render(`admin/registrations-${anlass.form_type}`, { page: 'admin', anlass, registrations });
});

app.get('/admin/registrations/:type/new', requireRole('content'), async (req, res) => {
  const { type } = req.params;
  const anlassId = req.query.anlass_id;
  res.render(`admin/registrations-${type}-form`, { page: 'admin', registration: null, anlassId });
});

app.post('/admin/registrations/:type/new', requireRole('content'), async (req, res) => {
  const { type } = req.params;
  const anlassId = req.body.anlass_id;
  
  try {
    if (type === 'juniorenlager') {
      const { child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes } = req.body;
      await db.query(`
        INSERT INTO registrations_juniorenlager (child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [child_name, child_birthdate || '', parent_name, parent_email, parent_phone, address || '', allergies || '', notes || '']);
    } else if (type === 'dorfturnier') {
      const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;
      await db.query(`
        INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [team_name, contact_name, contact_email, contact_phone, player_count, notes || '']);
    } else {
      const { name, email, phone, notes } = req.body;
      await db.query(`
        INSERT INTO registrations_standard (anlass_id, name, email, phone, notes)
        VALUES (?, ?, ?, ?, ?)
      `, [anlassId, name, email, phone || '', notes || '']);
    }
    req.session.flash = { type: 'success', msg: 'Anmeldung erfolgreich erstellt.' };
  } catch (err) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Erstellen der Anmeldung.' };
  }
  
  res.redirect(anlassId ? '/admin/anlaesse/' + anlassId + '/registrations' : '/admin/anlaesse');
});

app.get('/admin/registrations/:type/:regId/edit', requireRole('content'), async (req, res) => {
  const { type, regId } = req.params;
  const anlassId = req.query.anlass_id;
  
  let table = 'registrations_standard';
  if (type === 'juniorenlager') table = 'registrations_juniorenlager';
  if (type === 'dorfturnier') table = 'registrations_dorfturnier';

  const [regRows] = await db.query(`SELECT * FROM ${table} WHERE id = ?`, [regId]);
  const registration = regRows[0];
  if (!registration) return res.redirect(anlassId ? '/admin/anlaesse/' + anlassId + '/registrations' : '/admin/anlaesse');

  res.render(`admin/registrations-${type}-form`, { page: 'admin', registration, anlassId });
});

app.post('/admin/registrations/:type/:regId/edit', requireRole('content'), async (req, res) => {
  const { type, regId } = req.params;
  const anlassId = req.body.anlass_id;
  
  try {
    if (type === 'juniorenlager') {
      const { child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes } = req.body;
      await db.query(`
        UPDATE registrations_juniorenlager 
        SET child_name=?, child_birthdate=?, parent_name=?, parent_email=?, parent_phone=?, address=?, allergies=?, notes=? 
        WHERE id=?
      `, [child_name, child_birthdate, parent_name, parent_email, parent_phone, address, allergies, notes, regId]);
    } else if (type === 'dorfturnier') {
      const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;
      await db.query(`
        UPDATE registrations_dorfturnier 
        SET team_name=?, contact_name=?, contact_email=?, contact_phone=?, player_count=?, notes=? 
        WHERE id=?
      `, [team_name, contact_name, contact_email, contact_phone, player_count, notes, regId]);
    } else {
      const { name, email, phone, notes } = req.body;
      await db.query(`
        UPDATE registrations_standard 
        SET name=?, email=?, phone=?, notes=? 
        WHERE id=?
      `, [name, email, phone, notes, regId]);
    }
    req.session.flash = { type: 'success', msg: 'Anmeldung aktualisiert.' };
  } catch (err) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Speichern der Anmeldung.' };
  }
  
  res.redirect(anlassId ? '/admin/anlaesse/' + anlassId + '/registrations' : '/admin/anlaesse');
});

app.post('/admin/registrations/:type/:regId/delete', requireRole('content'), async (req, res) => {
  const { type, regId } = req.params;
  const anlassId = req.body.anlass_id;
  
  let table = 'registrations_standard';
  if (type === 'juniorenlager') table = 'registrations_juniorenlager';
  if (type === 'dorfturnier') table = 'registrations_dorfturnier';

  await db.query(`DELETE FROM ${table} WHERE id = ?`, [regId]);
  req.session.flash = { type: 'success', msg: 'Anmeldung gelöscht.' };
  
  res.redirect(anlassId ? '/admin/anlaesse/' + anlassId + '/registrations' : '/admin/anlaesse');
});

// --- Pages (text blocks) ---
app.get('/admin/pages', requireRole('content'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM pages ORDER BY slug ASC`);
  res.render('admin/pages-list', { page: 'admin', items });
});

app.get('/admin/pages/:id/edit', requireRole('content'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM pages WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/pages');
  res.render('admin/pages-form', { page: 'admin', item });
});

app.post('/admin/pages/:id/edit', requireRole('content'), async (req, res) => {
  const { title, body } = req.body;
  await db.query(
    `UPDATE pages SET title=?, body=?, updated_at=NOW() WHERE id=?`,
    [title, body, req.params.id]
  );
  req.session.flash = { type: 'success', msg: 'Inhalt aktualisiert.' };
  res.redirect('/admin/pages');
});

// --- Account / password change ---
app.get('/admin/account', requireAuth, async (req, res) => {
  res.render('admin/account', { page: 'admin' });
});

app.post('/admin/account', requireAuth, async (req, res) => {
  const { current_password, new_password, new_password_confirm } = req.body;
  const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [req.session.user.id]);
  const user = rows[0];
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
  await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [hash, user.id]);
  req.session.flash = { type: 'success', msg: 'Passwort wurde aktualisiert.' };
  res.redirect('/admin/account');
});

// --- Vorstand CRUD ---
app.get('/admin/vorstand', requireRole('content'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM vorstand ORDER BY sort_order ASC, id ASC`);
  res.render('admin/vorstand-list', { page: 'admin', items });
});

app.get('/admin/vorstand/new', requireRole('content'), async (req, res) => {
  res.render('admin/vorstand-form', { page: 'admin', item: null });
});

app.post('/admin/vorstand/new', requireRole('content'), async (req, res) => {
  const { name, role, address, phone, email, sort_order } = req.body;
  await db.query(`INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)`, [name, role||'', address||'', phone||'', email||'', sort_order||0]);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied hinzugefügt.' };
  res.redirect('/admin/vorstand');
});

app.get('/admin/vorstand/:id/edit', requireRole('content'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM vorstand WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/vorstand');
  res.render('admin/vorstand-form', { page: 'admin', item });
});

app.post('/admin/vorstand/:id/edit', requireRole('content'), async (req, res) => {
  const { name, role, address, phone, email, sort_order } = req.body;
  await db.query(`UPDATE vorstand SET name=?, role=?, address=?, phone=?, email=?, sort_order=? WHERE id=?`, [name, role||'', address||'', phone||'', email||'', sort_order||0, req.params.id]);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied aktualisiert.' };
  res.redirect('/admin/vorstand');
});

app.post('/admin/vorstand/:id/delete', requireRole('content'), async (req, res) => {
  await db.query(`DELETE FROM vorstand WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Vorstandsmitglied gelöscht.' };
  res.redirect('/admin/vorstand');
});

// --- Sponsors CRUD ---
app.get('/admin/sponsors', requireRole('sponsoring'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM sponsors ORDER BY sort_order ASC, id ASC`);
  res.render('admin/sponsors-list', { page: 'admin', items });
});

app.get('/admin/sponsors/new', requireRole('sponsoring'), async (req, res) => {
  res.render('admin/sponsors-form', { page: 'admin', item: null });
});

app.post('/admin/sponsors/new', requireRole('sponsoring'), uploadSponsors.single('logo_file'), async (req, res) => {
  const { name, category, logo, link, sort_order } = req.body;
  let finalLogo = logo || '';
  if (req.file) finalLogo = '/images/sponsoren/' + req.file.filename;
  await db.query(`INSERT INTO sponsors (name, category, logo, link, sort_order) VALUES (?, ?, ?, ?, ?)`, [name, category||'', finalLogo, link||'', sort_order||0]);
  req.session.flash = { type: 'success', msg: 'Sponsor hinzugefügt.' };
  res.redirect('/admin/sponsors');
});

app.get('/admin/sponsors/:id/edit', requireRole('sponsoring'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM sponsors WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/sponsors');
  res.render('admin/sponsors-form', { page: 'admin', item });
});

app.post('/admin/sponsors/:id/edit', requireRole('sponsoring'), uploadSponsors.single('logo_file'), async (req, res) => {
  const { name, category, logo, link, sort_order } = req.body;
  let finalLogo = logo || '';
  if (req.file) finalLogo = '/images/sponsoren/' + req.file.filename;
  await db.query(`UPDATE sponsors SET name=?, category=?, logo=?, link=?, sort_order=? WHERE id=?`, [name, category||'', finalLogo, link||'', sort_order||0, req.params.id]);
  req.session.flash = { type: 'success', msg: 'Sponsor aktualisiert.' };
  res.redirect('/admin/sponsors');
});

app.post('/admin/sponsors/:id/delete', requireRole('sponsoring'), async (req, res) => {
  await db.query(`DELETE FROM sponsors WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Sponsor gelöscht.' };
  res.redirect('/admin/sponsors');
});

// --- Advertisers CRUD ---
app.get('/admin/advertisers', requireRole('sponsoring'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM advertisers ORDER BY sort_order ASC, name ASC`);
  res.render('admin/advertisers-list', { page: 'admin', items });
});

app.get('/admin/advertisers/new', requireRole('sponsoring'), async (req, res) => {
  res.render('admin/advertisers-form', { page: 'admin', item: null });
});

app.post('/admin/advertisers/new', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, sort_order } = req.body;
  let logoUrl = null;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(`INSERT INTO advertisers (name, link, location, sort_order, logo) VALUES (?, ?, ?, ?, ?)`, [
    name, link || '', location || '', sort_order || 0, logoUrl
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gespeichert.' };
  res.redirect('/admin/advertisers');
});

app.get('/admin/advertisers/:id/edit', requireRole('sponsoring'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM advertisers WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/advertisers');
  res.render('admin/advertisers-form', { page: 'admin', item });
});

app.post('/admin/advertisers/:id/edit', requireRole('sponsoring'), uploadAdvertisers.single('logo'), async (req, res) => {
  const { name, link, location, sort_order } = req.body;
  let logoUrl = req.body.existing_logo;
  if (req.file) logoUrl = '/images/advertisers/' + req.file.filename;
  await db.query(`UPDATE advertisers SET name=?, link=?, location=?, sort_order=?, logo=? WHERE id=?`, [
    name, link || '', location || '', sort_order || 0, logoUrl, req.params.id
  ]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };
  res.redirect('/admin/advertisers');
});

app.post('/admin/advertisers/:id/delete', requireRole('sponsoring'), async (req, res) => {
  await db.query(`DELETE FROM advertisers WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Bandenwerber gelöscht.' };
  res.redirect('/admin/advertisers');
});

// --- Teams CRUD ---
app.get('/admin/teams', requireRole('teams'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM teams ORDER BY type ASC, sort_order ASC, id ASC`);
  res.render('admin/teams-list', { page: 'admin', items });
});

app.get('/admin/teams/new', requireRole('teams'), (req, res) => {
  res.render('admin/teams-form', { page: 'admin', item: null });
});

app.post('/admin/teams/new', requireRole('teams'), uploadAny.any(), async (req, res) => {
  const { type, name, slug, league, extra, times, location, sort_order } = req.body;
  const [result] = await db.query(
    `INSERT INTO teams (type, name, slug, league, extra, times, location, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [type || 'aktive', name, slug || '', league || '', extra || '', times || '', location || '', sort_order || 0]
  );
  const teamId = result.insertId;

  // Process dynamic staff
  const staffRoles = req.body.staff_role || [];
  const staffNames = req.body.staff_name || [];
  
  if (Array.isArray(staffRoles)) {
    for (let i = 0; i < staffRoles.length; i++) {
      const role = staffRoles[i];
      const sName = staffNames[i];
      if (!sName) continue;
      
      let photo = '';
      const file = req.files && req.files.find(f => f.fieldname === `staff_photo_${i}`);
      if (file) photo = '/images/trainers/' + file.filename;
      
      await db.query(`INSERT INTO team_staff (team_id, role, name, photo) VALUES (?, ?, ?, ?)`, [teamId, role, sName, photo]);
    }
  } else if (staffRoles && staffNames) {
    const role = staffRoles;
    const sName = staffNames;
    let photo = '';
    const file = req.files && req.files.find(f => f.fieldname === `staff_photo_0`);
    if (file) photo = '/images/trainers/' + file.filename;
    await db.query(`INSERT INTO team_staff (team_id, role, name, photo) VALUES (?, ?, ?, ?)`, [teamId, role, sName, photo]);
  }

  req.session.flash = { type: 'success', msg: 'Team erstellt.' };
  res.redirect('/admin/teams');
});

app.get('/admin/teams/:id/edit', requireRole('teams'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM teams WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/teams');
  const [staff] = await db.query(`SELECT * FROM team_staff WHERE team_id = ? ORDER BY id ASC`, [item.id]);
  item.staff = staff;
  res.render('admin/teams-form', { page: 'admin', item });
});

app.post('/admin/teams/:id/edit', requireRole('teams'), uploadAny.any(), async (req, res) => {
  const { type, name, slug, league, extra, times, location, sort_order } = req.body;
  await db.query(
    `UPDATE teams SET type=?, name=?, slug=?, league=?, extra=?, times=?, location=?, sort_order=? WHERE id=?`,
    [type || 'aktive', name, slug || '', league || '', extra || '', times || '', location || '', sort_order || 0, req.params.id]
  );
  
  // Process dynamic staff
  const staffRoles = req.body.staff_role || [];
  const staffNames = req.body.staff_name || [];
  const staffExistingPhotos = req.body.staff_existing_photo || [];
  
  await db.query(`DELETE FROM team_staff WHERE team_id = ?`, [req.params.id]);
  
  if (Array.isArray(staffRoles)) {
    for (let i = 0; i < staffRoles.length; i++) {
      const role = staffRoles[i];
      const sName = staffNames[i];
      if (!sName) continue;
      
      let photo = staffExistingPhotos[i] || '';
      const file = req.files && req.files.find(f => f.fieldname === `staff_photo_${i}`);
      if (file) photo = '/images/trainers/' + file.filename;
      
      await db.query(`INSERT INTO team_staff (team_id, role, name, photo) VALUES (?, ?, ?, ?)`, [req.params.id, role, sName, photo]);
    }
  } else if (staffRoles && staffNames) {
    // Single item
    const role = staffRoles;
    const sName = staffNames;
    let photo = staffExistingPhotos || '';
    const file = req.files && req.files.find(f => f.fieldname === `staff_photo_0`);
    if (file) photo = '/images/trainers/' + file.filename;
    await db.query(`INSERT INTO team_staff (team_id, role, name, photo) VALUES (?, ?, ?, ?)`, [req.params.id, role, sName, photo]);
  }

  req.session.flash = { type: 'success', msg: 'Team aktualisiert.' };
  res.redirect('/admin/teams');
});

app.post('/admin/teams/:id/delete', requireRole('teams'), async (req, res) => {
  await db.query(`DELETE FROM teams WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Team gelöscht.' };
  res.redirect('/admin/teams');
});

// --- Jobs CRUD ---
app.get('/admin/jobs', requireRole('content'), async (req, res) => {
  const [jobs] = await db.query(`SELECT * FROM jobs ORDER BY created_at DESC`);
  res.render('admin/jobs-list', { page: 'admin', jobs });
});

app.get('/admin/jobs/new', requireRole('content'), async (req, res) => {
  res.render('admin/jobs-form', { page: 'admin', job: {} });
});

app.post('/admin/jobs', requireRole('content'), async (req, res) => {
  const { title, description, contact_info, is_active } = req.body;
  const active = is_active === '1' ? 1 : 0;
  await db.query(`INSERT INTO jobs (title, description, contact_info, is_active) VALUES (?, ?, ?, ?)`, [title, description, contact_info, active]);
  req.session.flash = { type: 'success', msg: 'Job erstellt.' };
  res.redirect('/admin/jobs');
});

app.get('/admin/jobs/:id/edit', requireRole('content'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM jobs WHERE id = ?`, [req.params.id]);
  const job = rows[0];
  if (!job) return res.redirect('/admin/jobs');
  res.render('admin/jobs-form', { page: 'admin', job });
});

app.post('/admin/jobs/:id/edit', requireRole('content'), async (req, res) => {
  const { title, description, contact_info, is_active } = req.body;
  const active = is_active === '1' ? 1 : 0;
  await db.query(`UPDATE jobs SET title = ?, description = ?, contact_info = ?, is_active = ?, updated_at = NOW() WHERE id = ?`, [title, description, contact_info, active, req.params.id]);
  req.session.flash = { type: 'success', msg: 'Job aktualisiert.' };
  res.redirect('/admin/jobs');
});

app.post('/admin/jobs/:id/delete', requireRole('content'), async (req, res) => {
  await db.query(`DELETE FROM jobs WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Job gelöscht.' };
  res.redirect('/admin/jobs');
});

// --- Documents CRUD ---
app.get('/admin/documents', requireRole('content'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM documents ORDER BY upload_date DESC, id DESC`);
  res.render('admin/documents-list', { page: 'admin', items });
});

app.get('/admin/documents/new', requireRole('content'), async (req, res) => {
  res.render('admin/documents-form', { page: 'admin', item: null });
});

app.post('/admin/documents/new', requireRole('content'), uploadDocument.single('file'), async (req, res) => {
  const { title, category, upload_date } = req.body;
  if (!req.file) {
    req.session.flash = { type: 'error', msg: 'Bitte eine Datei hochladen.' };
    return res.redirect('/admin/documents/new');
  }
  const filePath = '/documents/' + req.file.filename;
  await db.query(`INSERT INTO documents (title, category, file_path, upload_date) VALUES (?, ?, ?, ?)`, [
    title, category || 'allgemein', filePath, upload_date || new Date().toISOString().slice(0, 10)
  ]);
  req.session.flash = { type: 'success', msg: 'Dokument hochgeladen.' };
  res.redirect('/admin/documents');
});

app.post('/admin/documents/:id/delete', requireRole('content'), async (req, res) => {
  await db.query(`DELETE FROM documents WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Dokument gelöscht.' };
  res.redirect('/admin/documents');
});

// --- Gallery CRUD ---
app.get('/admin/gallery', requireRole('content'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM gallery_photos ORDER BY gallery ASC, sort_order ASC, id DESC`);
  const galleries = {};
  items.forEach(i => {
    if (!galleries[i.gallery]) galleries[i.gallery] = [];
    galleries[i.gallery].push(i);
  });
  res.render('admin/gallery-list', { page: 'admin', galleries, items });
});

app.get('/admin/gallery/new', requireRole('content'), async (req, res) => {
  const gallery = req.query.gallery || '';
  res.render('admin/gallery-form', { page: 'admin', item: null, gallery });
});

app.post('/admin/gallery/new', requireRole('content'), uploadGallery.single('image'), async (req, res) => {
  const { gallery, caption, sort_order } = req.body;
  if (!req.file) {
    req.session.flash = { type: 'error', msg: 'Bitte ein Bild hochladen.' };
    return res.redirect('/admin/gallery/new');
  }
  const imagePath = '/images/gallery/' + req.file.filename;
  await db.query(`INSERT INTO gallery_photos (gallery, image_path, caption, sort_order) VALUES (?, ?, ?, ?)`, [
    gallery || 'allgemein', imagePath, caption || '', sort_order || 0
  ]);
  req.session.flash = { type: 'success', msg: 'Foto hochgeladen.' };
  res.redirect('/admin/gallery');
});

app.post('/admin/gallery/:id/delete', requireRole('content'), async (req, res) => {
  await db.query(`DELETE FROM gallery_photos WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Foto gelöscht.' };
  res.redirect('/admin/gallery');
});

// --- Registrations (read only for admin) ---
app.get('/admin/registrations/juniorenlager', requireRole('admin'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM registrations_juniorenlager ORDER BY created_at DESC`);
  res.render('admin/registrations-juniorenlager', { page: 'admin', items });
});

app.get('/admin/registrations/dorfturnier', requireRole('admin'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM registrations_dorfturnier ORDER BY created_at DESC`);
  res.render('admin/registrations-dorfturnier', { page: 'admin', items });
});

// --- Users CRUD ---
app.get('/admin/users', requireRole('admin'), async (req, res) => {
  const [items] = await db.query(`SELECT * FROM users ORDER BY created_at ASC`);
  res.render('admin/users-list', { page: 'admin', items });
});

app.get('/admin/users/new', requireRole('admin'), async (req, res) => {
  res.render('admin/users-form', { page: 'admin', item: null });
});

app.post('/admin/users/new', requireRole('admin'), async (req, res) => {
  const { username, display_name, password, roles } = req.body;
  const rolesArray = Array.isArray(roles) ? roles : (roles ? [roles] : []);
  
  if (!username || !password) {
    req.session.flash = { type: 'error', msg: 'Benutzername und Passwort sind erforderlich.' };
    return res.redirect('/admin/users/new');
  }
  
  const hash = bcrypt.hashSync(password, 10);
  try {
    await db.query(`INSERT INTO users (username, password_hash, display_name, roles) VALUES (?, ?, ?, ?)`, [
      username, hash, display_name || '', JSON.stringify(rolesArray)
    ]);
    req.session.flash = { type: 'success', msg: 'Benutzer erfolgreich angelegt.' };
  } catch (err) {
    req.session.flash = { type: 'error', msg: 'Fehler beim Anlegen (Benutzername evtl. schon vergeben).' };
  }
  res.redirect('/admin/users');
});

app.get('/admin/users/:id/edit', requireRole('admin'), async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [req.params.id]);
  const item = rows[0];
  if (!item) return res.redirect('/admin/users');
  res.render('admin/users-form', { page: 'admin', item });
});

app.post('/admin/users/:id/edit', requireRole('admin'), async (req, res) => {
  const { username, display_name, password, roles } = req.body;
  const rolesArray = Array.isArray(roles) ? roles : (roles ? [roles] : []);
  
  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    await db.query(`UPDATE users SET username=?, display_name=?, roles=?, password_hash=? WHERE id=?`, [
      username, display_name || '', JSON.stringify(rolesArray), hash, req.params.id
    ]);
  } else {
    await db.query(`UPDATE users SET username=?, display_name=?, roles=? WHERE id=?`, [
      username, display_name || '', JSON.stringify(rolesArray), req.params.id
    ]);
  }
  
  req.session.flash = { type: 'success', msg: 'Benutzer aktualisiert.' };
  res.redirect('/admin/users');
});

app.post('/admin/users/:id/delete', requireRole('admin'), async (req, res) => {
  if (parseInt(req.params.id) === req.session.user.id) {
    req.session.flash = { type: 'error', msg: 'Du kannst deinen eigenen Account nicht löschen.' };
    return res.redirect('/admin/users');
  }
  await db.query(`DELETE FROM users WHERE id = ?`, [req.params.id]);
  req.session.flash = { type: 'success', msg: 'Benutzer gelöscht.' };
  res.redirect('/admin/users');
});

// 404
app.use(async (req, res) => {
  res.status(404).render('404', { page: '404' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`FC Zell Webseite läuft auf http://localhost:${PORT}`);
  });
}

module.exports = app;
