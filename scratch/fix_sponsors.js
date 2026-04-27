const db = require('../db');
db.prepare('DELETE FROM sponsors').run();

const sponsors = [
  { name: 'KKLH', category: 'Hauptsponsor', logo: '/images/sponsoren/kklh.jpg', link: 'https://www.kklh.ch/' },
  { name: 'Valiant', category: 'Co-Sponsor', logo: '/images/sponsoren/valiant.jpg', link: 'https://www.valiant.ch/' },
  { name: 'Leuenberger', category: 'Co-Sponsor', logo: '/images/sponsoren/leuenberger.jpg', link: 'https://www.ldilag.ch/' },
  { name: 'Kunz Sport', category: 'Juniorensponsor', logo: '/images/sponsoren/kunzsport.png', link: 'https://go-in.ch/kunzsport/' },
  { name: 'ProCam', category: 'Ausrüster', logo: '/images/sponsoren/sponsor_import_4.png', link: 'https://www.procam.ch/' },
  { name: 'Swisslos Kanton Luzern', category: 'Sportfonds', logo: '/images/sponsoren/swisslos.jpg', link: 'https://sport.lu.ch/sportfonds' }
];

sponsors.forEach((s, i) => {
  db.prepare(`INSERT INTO sponsors (name, category, logo, link, sort_order) VALUES (?, ?, ?, ?, ?)`).run(
    s.name, s.category, s.logo, s.link, i * 10
  );
});
console.log("Fixed sponsors.");
