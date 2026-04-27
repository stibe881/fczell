const cheerio = require('cheerio');
const https = require('https');
const db = require('../db');

db.prepare('DELETE FROM advertisers').run();

https.get('https://www.fczell.ch/sponsoren/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    let count = 0;
    
    // Bandenwerber are typically p tags with text like "Sponsor Name / Location"
    $('p').each((i, el) => {
      let text = $(el).text().trim();
      if (text.includes('/') && !text.includes('Hauptsponsor')) {
        let parts = text.split('/');
        let namePart = parts[0].trim();
        let locPart = parts[1].trim();
        
        // Sometimes the name is wrapped in an 'a' tag
        let aTag = $(el).find('a');
        let link = aTag.attr('href') || '';
        let name = aTag.text().trim() || namePart;
        
        if (name.length > 2) {
          db.prepare(`INSERT INTO advertisers (name, link, location, sort_order) VALUES (?, ?, ?, ?)`).run(
            name, link, locPart, count++
          );
        }
      }
    });
    console.log(`Imported ${count} Bandenwerber.`);
  });
});
