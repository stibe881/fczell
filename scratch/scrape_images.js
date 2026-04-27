const https = require('https');
const db = require('../db');

const urls = [
  { slug: 'b-junioren', url: 'https://www.fczell.ch/junioren/b-junioren/' },
  { slug: 'c-junioren', url: 'https://www.fczell.ch/junioren/c-junioren/' },
  { slug: 'da-junioren', url: 'https://www.fczell.ch/junioren/da-junioren/' },
  { slug: 'db-junioren', url: 'https://www.fczell.ch/junioren/db-junioren/' },
  { slug: 'd7-junioren', url: 'https://www.fczell.ch/junioren/d7-junioren/' },
  { slug: 'e-junioren', url: 'https://www.fczell.ch/junioren/e-junioren/' },
  { slug: 'piccolos', url: 'https://www.fczell.ch/junioren/piccolos/' }
];

function fetchHTML(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function run() {
  for (const item of urls) {
    const html = await fetchHTML(item.url);
    if (!html) continue;

    const imgRegex = /<img[^>]+src="([^">]+)"[^>]*>/gi;
    let match;
    const images = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      if (src.includes('wp-content/uploads') && !src.includes('logo') && !src.includes('Logo') && !src.includes('Sponsor') && !src.includes('sponsor')) {
        images.push(src);
      }
    }
    
    // Attempt to find the sponsor logo near the text "Dresssponsor"
    let sponsor_logo = '';
    const sponsorRegex = /Dresssponsor[^<]*.*?<img[^>]+src="([^">]+)"/is;
    const sMatch = html.match(sponsorRegex);
    if (sMatch) {
       sponsor_logo = sMatch[1];
    }
    
    // Usually the team photo is one of the first few large images that are not logos
    // In WordPress, they often have "wp-image" or similar classes.
    // Let's just pick the first image that is not a known logo.
    let photo = images.length > 0 ? images[0] : '';
    
    console.log(item.slug, '-> Photo:', photo, '| Sponsor:', sponsor_logo);
    db.prepare('UPDATE teams SET photo = ?, sponsor_logo = ? WHERE slug = ?').run(photo, sponsor_logo, item.slug);
  }
}

run();
