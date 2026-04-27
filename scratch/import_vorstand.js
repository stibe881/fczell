const cheerio = require('cheerio');
const db = require('../db');
const https = require('https');

const fetchPage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

(async () => {
  try {
    console.log("Fetching Vorstand...");
    const html = await fetchPage('https://www.fczell.ch/verein/vorstand/');
    const $ = cheerio.load(html);
    
    db.prepare('DELETE FROM vorstand').run();

    let count = 0;
    
    // WordPress typically uses something like an Elementor or standard block grid.
    // Let's try a heuristic search for names/roles. Often they are in h2/h3 and p tags.
    // However, without seeing the page, a simple heuristic is:
    // Look for h2 or h3 or strong which might be the name. 
    // Wait, let's just use the `sponsoren.html` or `verein.html` files we already downloaded if it's there?
    // Wait! In `verein.html`, the vorstand is already there! Let's check `extract.js`.
    
    // I will read `verein.html` from disk, as it was saved previously by `extract.js`.
    const localHtml = require('fs').readFileSync('verein.html', 'utf-8');
    const $local = cheerio.load(localHtml);
    
    // We can extract people by looking for contact blocks
    // Usually they are in divs with class `wp-block-column` or similar.
    $local('.wp-block-column').each((i, el) => {
      const text = $local(el).text().trim();
      if (!text) return;
      
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return;

      const name = lines[0];
      const role = lines[1];
      
      // Heuristics for phone and email
      let phone = '';
      let email = '';
      let address = '';

      for (let j = 2; j < lines.length; j++) {
        const line = lines[j];
        if (line.includes('@') || line.includes('(at)')) {
          email = line.replace('(at)', '@').trim();
        } else if (line.match(/[0-9]{3}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}/) || line.includes('+41')) {
          phone = line.trim();
        } else if (line.includes('Tel')) {
          phone = line.replace('Tel:', '').replace('Tel.', '').trim();
        } else if (line.includes('Strasse') || line.includes('Weg') || line.match(/^[0-9]{4}\s/)) {
           address += line + ' ';
        }
      }

      // Check if it really looks like a person
      if (name.length > 2 && role.length > 2 && (email || phone || role.includes('Präsident'))) {
        db.prepare(`INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(
          name, role, address.trim(), phone, email, count * 10
        );
        count++;
      }
    });

    console.log(`Imported ${count} vorstand members.`);
    if (count === 0) {
        console.log("Attempting online fetch fallback...");
        // Fallback to the live page
        const $live = cheerio.load(html);
        $live('.wp-block-column, .elementor-widget-text-editor').each((i, el) => {
          const text = $live(el).text().trim();
          if (!text) return;
          const lines = text.split('\n').map(l => l.trim()).filter(l => l);
          if (lines.length < 2) return;
          const name = lines[0];
          const role = lines[1];
          let phone = '', email = '', address = '';
          for (let j = 2; j < lines.length; j++) {
            const line = lines[j];
            if (line.includes('@') || line.includes('(at)')) email = line.replace('(at)', '@').trim();
            else if (line.match(/[0-9]{2,}/)) phone = line.trim();
            else address += line + ' ';
          }
          if (name.length > 2 && role.length > 2 && name.split(' ').length <= 3) {
             try {
                db.prepare(`INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(
                  name, role, address.trim(), phone, email, count * 10
                );
                count++;
             } catch(e){}
          }
        });
        console.log(`Imported ${count} vorstand members via fallback.`);
    }

  } catch (err) {
    console.error(err);
  }
})();
