const https = require('https');
const db = require('../db');
const cheerio = require('cheerio'); // if installed, or just simple regex. Since I am not sure cheerio is installed, I will use Regex on HTML.

const urls = [
  { slug: 'b-junioren', url: 'https://www.fczell.ch/junioren/b-junioren/' },
  { slug: 'c-junioren', url: 'https://www.fczell.ch/junioren/c-junioren/' },
  { slug: 'da-junioren', url: 'https://www.fczell.ch/junioren/da-junioren/' },
  { slug: 'db-junioren', url: 'https://www.fczell.ch/junioren/db-junioren/' },
  { slug: 'd7-junioren', url: 'https://www.fczell.ch/junioren/d7-junioren/' },
  { slug: 'e-junioren', url: 'https://www.fczell.ch/junioren/e-junioren/' },
  { slug: 'piccolos', url: 'https://www.fczell.ch/junioren/piccolos/' }
];

async function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '');
}

async function run() {
  for (const item of urls) {
    try {
      console.log('Fetching', item.slug);
      const html = await fetchHTML(item.url);
      
      let trainer = '';
      let times = '';
      let location = '';
      let extra = '';

      // Extrahieren des Extra-Texts (z.B. SG Algro-Zell) aus H1 oder H2
      const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i) || html.match(/<h2[^>]*>(.*?)<\/h2>/i);
      if (titleMatch) {
         const titleText = stripHtml(titleMatch[1]).trim();
         const extraMatch = titleText.match(/\((.*?)\)/);
         if (extraMatch) extra = extraMatch[1];
      }

      // Suche nach Trainer
      const trainerRegex = /Trainer:\s*([^<]+)</i;
      const tMatch = html.match(trainerRegex);
      if (tMatch) trainer = tMatch[1].trim();

      // Suche nach Trainingszeiten
      const timesRegex = /Training(?:szeiten)?(?: und |-ort)?:?\s*([^<]+)</i;
      let timesMatch = html.match(timesRegex);
      if (timesMatch) {
          times = timesMatch[1].trim();
          // Ort separieren wenn möglich
          if (times.includes('Trainingsort:')) {
             const parts = times.split('Trainingsort:');
             times = parts[0].replace('|', '').trim();
             location = parts[1].trim();
          } else if (times.includes('Sportplatz')) {
             // Wenn Sportplatz drin ist, aber kein explizites "Trainingsort:", übernehmen wir es als Trainings-String
          }
      }

      console.log(' ->', { trainer, times, location, extra });

      db.prepare(`UPDATE teams SET trainer = ?, times = ?, location = ?, extra = ? WHERE slug = ?`)
        .run(trainer, times, location, extra, item.slug);
        
    } catch (e) {
      console.error('Failed', item.slug, e);
    }
  }
}

run();
