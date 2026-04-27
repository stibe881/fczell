const Database = require('better-sqlite3');
const db = new Database('fczell.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS vorstand (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    logo TEXT,
    link TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS advertisers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    link TEXT,
    location TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    league TEXT,
    extra TEXT,
    trainer TEXT,
    coach TEXT,
    goalie TEXT,
    physio TEXT,
    times TEXT,
    location TEXT,
    sort_order INTEGER DEFAULT 0
  );
`);

// Arrays
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

const sponsorenListe = [
  { name: 'KKLH', kategorie: 'Hauptsponsor', logo: '/images/sponsoren/kklh.jpg', link: 'https://www.kklh.ch/' },
  { name: 'Valiant', kategorie: 'Co-Sponsor', logo: '/images/sponsoren/valiant.jpg', link: 'https://www.valiant.ch/' },
  { name: 'Leuenberger', kategorie: 'Juniorensponsor', logo: '/images/sponsoren/leuenberger.jpg', link: 'https://www.ldilag.ch/' },
  { name: 'Kunz Sport', kategorie: 'Ausrüster', logo: '/images/sponsoren/kunzsport.png', link: 'https://go-in.ch/kunzsport/' },
  { name: 'Swisslos', kategorie: 'Sportfonds', logo: '/images/sponsoren/swisslos.jpg', link: 'https://sport.lu.ch/' }
];

const bandenwerber = [
  { name: '4K Architektur', link: 'https://www.4ka.ch/', location: '6144 Zell' },
  { name: 'Adi Besachungen und Spenglerei GmbH', link: 'https://adibedachungen.ch/', location: '6204 Sempach' },
  { name: 'Adolf Müller GmbH', link: 'https://adolfmueller.ch/', location: '6146 Grossdietwil' },
  { name: 'Artemis Drogerie GmbH', link: 'https://www.maertgassdrogerie.ch/', location: '6144 Zell' },
  { name: 'Axa Wintherthur', link: 'https://www.axa.ch/de/ueber-axa/standorte/agenturen/willisau_50002571.html', location: '6130 Willisau' },
  { name: 'Basler Versicherung AG Agentur Sursee', link: null, location: '6130 Willisau' },
  { name: 'Beck + Unternährer AG', link: null, location: '6144 Zell' },
  { name: 'Bell Schweiz AG', link: null, location: '6144 Zell' },
  { name: 'Birrer Fahrzeugbau', link: null, location: '6154 Hofstatt' },
  { name: 'Birrer Bäckerei', link: null, location: '6144 Zell' },
  { name: 'BOWI Spielplatzgeräte', link: null, location: '6130 Willisau' },
  { name: 'www.camper-koenig.ch', link: 'http://www.camper-koenig.ch', location: '6156 Luthern' },
  { name: 'Carrosserie Emmenegger', link: null, location: '6130 Willisau' },
  { name: 'CKW Zell', link: null, location: '6144 Zell' },
  { name: 'Dubach Holzbau AG', link: null, location: '6152 Hüswil' },
  { name: 'Fankhauser AG', link: null, location: '4955 Gondiswil' },
  { name: 'Flückiger & Hecht Kaminfeger', link: null, location: '6144 Zell' },
  { name: 'Frontwerk AG – Fenster und Fassadentechnik', link: null, location: '6142 Gettnau' },
  { name: 'Garage Arnet AG', link: null, location: '6130 Willisau' },
  { name: 'Gasthof Sonne Zell AG', link: null, location: '6144 Zell' },
  { name: 'Grafic Desing Dubach GmbH', link: null, location: '6112 St. Erhard' },
  { name: 'GS Möbel', link: null, location: '6144 Zell' },
  { name: 'Habisreutinger Gebäudehülle GmbH', link: null, location: '6144 Zell' },
  { name: 'Häfliger Baugeschäft', link: null, location: '6144 Zell' },
  { name: 'Häfliger Bodenbeläge', link: null, location: '6144 Zell' },
  { name: 'Heller Garage AG', link: null, location: '6142 Getnau' },
  { name: 'Herzog Malerei', link: null, location: '6144 Zell' },
  { name: 'IFF Motorcycles AG', link: null, location: '6142 Gettnau' },
  { name: 'Kunz Sägewerk und Holzhandlung', link: null, location: '6154 Hofstatt' },
  { name: 'Kurmann Gartenbau und –pflege', link: null, location: '6130 Willisau' },
  { name: 'Landi Luzern-West Genossenschaft', link: null, location: '6130 Willisau' },
  { name: 'Lustenberger Metallbau AG', link: null, location: '6145 Fischbach' },
  { name: 'Luzerner Kantonalbank', link: null, location: '6130 Willisau' },
  { name: 'Märtgass AG', link: null, location: '6144 Zell' },
  { name: 'Marti Betriebe', link: null, location: '6144 Zell' },
  { name: 'Müller Talbach- Carosserie', link: null, location: '6144 Zell' },
  { name: 'Müller Talbach Garage AG', link: null, location: '6144 Zell' },
  { name: 'Otto’s AG', link: null, location: '6210 Sursee' },
  { name: 'Pneu Häfliger AG', link: null, location: '6156 Luthern' },
  { name: 'Pizza Kebap Haus Zell', link: null, location: '6144 Zell' },
  { name: 'Raiffeisen Hinterland', link: null, location: '6142 Gettnau' },
  { name: 'Rast Sanitär u. Heizungen', link: null, location: '6144 Zell' },
  { name: 'Restaurant Eisenbahn', link: null, location: '6144 Zell' },
  { name: 'Schär Sport', link: null, location: '6210 Sursee' },
  { name: 'Schreinerei Meier AG', link: null, location: '6144 Zell' },
  { name: 'Stadelmann Bäckerei u. Konditorei', link: null, location: '6144 Zell' },
  { name: 'Stöckli Metzgerei', link: null, location: '6144 Zell' },
  { name: 'Time out cafe Bar AG', link: null, location: '6144 Zell' },
  { name: 'Vogel Trockenbaumontage GmbH', link: null, location: '6152 Hüswil' },
  { name: 'Wagner Dorfgarage', link: null, location: '6144 Zell' },
  { name: 'Gebr. Imbach AG', link: null, location: '6145 Fischbach' }
];

const aktiveTeams = [
  { slug: '1-mannschaft', name: '1. Mannschaft', league: '3. Liga', trainer: 'Lucas De Jesus', coach: 'Patrick de Jesus', goalie: 'Pascal Gerber', times: 'Dienstag & Donnerstag: 19.30 – 21.00 Uhr', location: 'Sportplatz Gass' },
  { slug: '2-mannschaft', name: '2. Mannschaft', league: '5. Liga', trainer: 'Daniel Schwegler', coach: 'Paulo Cerejo', goalie: 'Pascal Gerber', physio: 'Paul Steinmann', times: 'Montag 19.30 – 21.00 Uhr & Donnerstag 19.45 – 21.15 Uhr', location: 'Sportplatz Gass' },
  { slug: 'senioren-30', name: 'Senioren 30+', league: 'SG mit FC Willisau', trainer: 'Adrian Bossert', coach: 'Pascal Gertsch / Martin Steiner', times: 'Dienstag 19.30 – 21.00 Uhr', location: 'Schlossfeld Willisau' }
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

// Seed Vorstand
if (db.prepare('SELECT COUNT(*) AS c FROM vorstand').get().c === 0) {
  const stmt = db.prepare('INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  vorstand.forEach((v, i) => stmt.run(v.name, v.role || '', v.address || '', v.phone || '', v.email || '', i));
}

// Seed Sponsors
if (db.prepare('SELECT COUNT(*) AS c FROM sponsors').get().c === 0) {
  const stmt = db.prepare('INSERT INTO sponsors (name, category, logo, link, sort_order) VALUES (?, ?, ?, ?, ?)');
  sponsorenListe.forEach((s, i) => stmt.run(s.name, s.kategorie || '', s.logo || '', s.link || '', i));
}

// Seed Advertisers
if (db.prepare('SELECT COUNT(*) AS c FROM advertisers').get().c === 0) {
  const stmt = db.prepare('INSERT INTO advertisers (name, link, location, sort_order) VALUES (?, ?, ?, ?)');
  bandenwerber.forEach((b, i) => stmt.run(b.name, b.link || '', b.location || '', i));
}

// Seed Teams
if (db.prepare('SELECT COUNT(*) AS c FROM teams').get().c === 0) {
  const stmt = db.prepare('INSERT INTO teams (slug, type, name, league, extra, trainer, coach, goalie, physio, times, location, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  aktiveTeams.forEach((t, i) => stmt.run(t.slug, 'aktive', t.name, t.league || '', t.extra || '', t.trainer || '', t.coach || '', t.goalie || '', t.physio || '', t.times || '', t.location || '', i));
  juniorTeams.forEach((t, i) => stmt.run(t.slug, 'junioren', t.name, t.league || '', t.extra || '', t.trainer || '', t.coach || '', t.goalie || '', t.physio || '', t.times || '', t.location || '', i));
}

console.log("Migration finished.");
