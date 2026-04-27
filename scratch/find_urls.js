const db = require('../db');
const https = require('https');

const advertisers = db.prepare(`SELECT id, name FROM advertisers WHERE link = '' OR link IS NULL`).all();

function fetchUrl(name) {
  return new Promise((resolve) => {
    const q = encodeURIComponent(name + ' Schweiz');
    const options = {
      hostname: 'html.duckduckgo.com',
      port: 443,
      path: '/html/?q=' + q,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };
    const req = https.request(options, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const match = body.match(/class="result__url" href="([^"]+)"/);
        if (match && match[1]) {
          let url = match[1];
          if (url.startsWith('//')) {
             url = 'https:' + url;
          }
          if (url.includes('duckduckgo.com/l/?uddg=')) {
             const uddgMatch = url.match(/uddg=([^&]+)/);
             if (uddgMatch) {
                url = decodeURIComponent(uddgMatch[1]);
             }
          }
          resolve(url);
        } else {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

async function run() {
  for (const ad of advertisers) {
    console.log('Searching for', ad.name);
    const url = await fetchUrl(ad.name);
    if (url && !url.includes('local.ch') && !url.includes('search.ch') && !url.includes('facebook') && !url.includes('instagram') && !url.includes('directories')) {
      console.log(' -> Found:', url);
      const logo = 'https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=' + encodeURIComponent(new URL(url).origin) + '&size=128';
      db.prepare('UPDATE advertisers SET link = ?, logo = ? WHERE id = ?').run(url, logo, ad.id);
    } else {
      console.log(' -> Not found or invalid:', url);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

run();
