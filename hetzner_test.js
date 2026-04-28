const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end('<h1>Hetzner Node.js Test Erfolgreich! 🎉</h1><p>Node.js laeuft auf diesem Server ohne Probleme.</p>');
});

// Hetzner (Passenger) übergibt den Port automatisch über diese Umgebungsvariable
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Test-Server gestartet auf Port ${port}`);
});
