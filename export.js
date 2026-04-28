const fs = require('fs');
const path = require('path');
const http = require('http');
const db = require('./db');
const app = require('./server');

const outDir = path.join(__dirname, 'dist');

// Recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function exportRoutes() {
  console.log('Starte Export der statischen HTML-Dateien...');

  // 1. Ordner vorbereiten
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 2. Public-Ordner kopieren (Bilder, CSS, JS)
  console.log('Kopiere public/ Verzeichnis...');
  copyDir(path.join(__dirname, 'public'), outDir);

  // 3. Routen sammeln
  const routes = [
    '/',
    '/news',
    '/verein',
    '/clubhaus',
    '/aktive',
    '/junioren',
    '/events',
    '/events/archiv',
    '/jobs',
    '/kontakt'
  ];

  // News-Seiten
  const newsItems = db.prepare(`SELECT id FROM news`).all();
  for (const item of newsItems) {
    routes.push(`/news/${item.id}`);
  }

  // Junioren-Teams
  const junioren = db.prepare(`SELECT slug FROM teams WHERE type = 'junioren'`).all();
  for (const team of junioren) {
    routes.push(`/junioren/${team.slug}`);
  }

  // Events-Seiten
  const eventItems = db.prepare(`SELECT id FROM events`).all();
  for (const item of eventItems) {
    routes.push(`/events/${item.id}`);
  }

  // 4. Temporären Server starten
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  // 5. Seiten fetchen und speichern
  for (const route of routes) {
    const url = `http://localhost:${port}${route}`;
    console.log(`Exportiere: ${route}`);
    
    await new Promise((resolve, reject) => {
      http.get(url, (res) => {
        if (res.statusCode !== 200) {
          console.warn(`WARNUNG: Route ${route} gab Status ${res.statusCode} zurück.`);
          res.resume();
          return resolve();
        }
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let filePath = path.join(outDir, route);
          if (route === '/') {
            filePath = path.join(outDir, 'index.html');
          } else {
            // Speichere als /route/index.html für saubere URLs ohne .html Endung
            fs.mkdirSync(filePath, { recursive: true });
            filePath = path.join(filePath, 'index.html');
          }
          fs.writeFileSync(filePath, data);
          resolve();
        });
      }).on('error', reject);
    });
  }

  server.close();
  console.log('\nExport erfolgreich! Alle Dateien liegen im Ordner "dist".');
  console.log('Du kannst nun den Inhalt des Ordners "dist" auf dein Hetzner Webhosting hochladen.');
  process.exit(0);
}

exportRoutes().catch(err => {
  console.error('Fehler beim Export:', err);
  process.exit(1);
});
