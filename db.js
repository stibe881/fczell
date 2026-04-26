const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'fczell.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    excerpt TEXT,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'Allgemein',
    published_at TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (userCount === 0) {
    const hash = bcrypt.hashSync('fczell2026', 10);
    db.prepare(
      'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
    ).run('admin', hash, 'Administrator');
    console.log('-> Standard-Admin angelegt: admin / fczell2026');
  }

  const newsCount = db.prepare('SELECT COUNT(*) AS c FROM news').get().c;
  if (newsCount === 0) {
    const insertNews = db.prepare(
      `INSERT INTO news (title, excerpt, body, category, published_at)
       VALUES (?, ?, ?, ?, ?)`
    );
    const seedNews = [
      [
        'FC Ruswil : FC Zell 3:1',
        'Spielbericht 3. Liga vom Samstag, 25.04.2026.',
        'Die erste Mannschaft musste sich auswärts in Ruswil mit 3:1 geschlagen geben. Trotz engagiertem Auftritt reichte es nicht zu Punkten. Halbzeitstand: 1:0 für die Gastgeber.',
        '1. Mannschaft',
        '2026-04-26'
      ],
      [
        'FC Malters : FC Zell 1:0',
        'Spielbericht 3. Liga vom Samstag, 11.04.2026.',
        'Knappe Niederlage in Malters: Ein Tor in der ersten Halbzeit entschied die Partie zu Gunsten der Gastgeber.',
        '1. Mannschaft',
        '2026-04-12'
      ],
      [
        'FC Zell : FC Horw 2:3',
        'Spielbericht 3. Liga vom Samstag, 28.03.2026.',
        'Die Zeller mussten sich gegen Horw nach Führung in der ersten Hälfte schliesslich mit 2:3 geschlagen geben.',
        '1. Mannschaft',
        '2026-03-29'
      ],
      [
        'FC Zell : FC Buttisholz 4:1',
        'Spielbericht 3. Liga vom Mittwoch, 25.03.2026.',
        'Souveräner Heimsieg gegen Buttisholz. Die Zeller dominierten die Partie über die volle Spielzeit.',
        '1. Mannschaft',
        '2026-03-26'
      ],
      [
        'FC Entlebuch : FC Zell 3:2',
        'Spielbericht 3. Liga vom Samstag, 21.03.2026.',
        'Auswärts in Entlebuch reichte es trotz Aufholjagd nicht zum Punktgewinn.',
        '1. Mannschaft',
        '2026-03-22'
      ],
      [
        'FC Zell Ausrüstungsbestellung',
        'Bestellfenster vom 29.11.2025 – 06.12.2025.',
        'In der Woche vom 29. November bis 6. Dezember 2025 läuft das Bestellfenster für die FC Zell Ausrüstung. Details und Bestellunterlagen sind im Clubhaus oder beim Materialwart erhältlich.',
        'Verein',
        '2025-11-16'
      ]
    ];
    const insertMany = db.transaction((rows) => {
      for (const r of rows) insertNews.run(...r);
    });
    insertMany(seedNews);
  }

  const eventCount = db.prepare('SELECT COUNT(*) AS c FROM events').get().c;
  if (eventCount === 0) {
    const insertEvent = db.prepare(
      `INSERT INTO events (title, event_date, event_time, location, description)
       VALUES (?, ?, ?, ?, ?)`
    );
    insertEvent.run(
      'GV FC Zell',
      '2026-03-06',
      '19:30',
      'Clubhaus Gass, Zell',
      'Generalversammlung des FC Zell. Alle Vereinsmitglieder sind herzlich eingeladen.'
    );
  }

  const pageCount = db.prepare('SELECT COUNT(*) AS c FROM pages').get().c;
  if (pageCount === 0) {
    const insertPage = db.prepare(
      'INSERT INTO pages (slug, title, body) VALUES (?, ?, ?)'
    );
    insertPage.run(
      'hero',
      'Willkommen beim FC Zell',
      'Seit Jahrzehnten Heimat des Fussballs in Zell – vom Piccolo bis zur 3. Liga. Komm vorbei auf der Gass, sei dabei und werde Teil unserer Vereinsfamilie.'
    );
    insertPage.run(
      'verein-intro',
      'Über uns',
      'Der FC Zell ist mehr als ein Fussballverein. Wir sind eine Gemeinschaft, in der Kameradschaft, Fairness und Freude am Spiel im Vordergrund stehen. Von den Piccolos bis zu den Senioren bieten wir für jede Altersklasse die passende Mannschaft.'
    );
    insertPage.run(
      'clubhaus',
      'Clubhaus',
      `Unser Clubhaus auf der Sportanlage Gass kann gemietet werden.

**Tarife pro Tag**
- CHF 200.– für Vereinsmitglieder
- CHF 350.– für Nichtmitglieder
- CHF 350.– für Vereine und Organisationen
- CHF 200.– für Vorstands-, Ehren-, und Freimitglieder, Donatoren und Bandenwerber

**Im Mietpreis inbegriffen**
- Benützung des Clubhauses und der Terrasse
- Benützung der WC-Anlagen
- Strom und Wasser
- Grill / Friteuse: Zusatzkosten CHF 50.– (komplett gereinigt)

Sämtliche Getränke (ausser Wein) werden durch den FC Zell geliefert. Der Verbrauch wird gemäss interner Preisliste verrechnet.

Fragen zur Nutzung beantworten wir gerne unter info(at)fczell.ch.`
    );
    insertPage.run(
      'penaltyclub',
      'Penalty-Club Zell',
      `**Die etwas andere Gönnervereinigung**

Unter dem Namen Penalty-Club Zell verbirgt sich die Gönnervereinigung des FC Zell. Als die Planungsarbeiten rund um den Bau der Sportanlage „Gass" begannen, wurde das Thema „Gründung eines Donatorenclubs" laut. Wagemutig machten sich ein paar verschworene FCZ-ler daran, ein Konzept für einen Donatorenclub zu erarbeiten.

**Ziele**
- Pflege der gesellschaftlichen Beziehungen unter den Mitgliedern
- Moralische und finanzielle Unterstützung des FC Zell

**Gründung 1997**
Am Freitag, 24. Januar 1997, fand die Gründungsversammlung im Gasthof Lindengarten Zell statt. Heute zählt der Club rund 70 Mitglieder. In den ersten drei Jahren wurden insgesamt CHF 26'000.– für die Finanzierung des Sportplatzes und Clubhauses Gass eingesetzt.

**Mitgliederbeitrag**
- Einzelmitglied: CHF 300.–
- Partner/in eines Mitglieds: CHF 100.–`
    );
    insertPage.run(
      'jobs',
      'Wir suchen DICH',
      `**… als Grillmeister/in**

Damit wir unsere Matchbesucher an den Spielen unserer 1. Mannschaft auch kulinarisch verwöhnen können, suchen wir Unterstützung am Grill.

Kannst du dir vorstellen, an einem Heimspiel pro Halbjahr bei uns am Grill mitzuhelfen? Dann komm in unsere neue „Grillmannschaft".

Kontakt: joerg.graber@bithawk.ch · 079 333 97 59`
    );
  }
}

seed();

module.exports = db;
