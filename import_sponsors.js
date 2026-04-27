const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const db = require('./db');

const html = fs.readFileSync('sponsoren.html', 'utf-8');
const $ = cheerio.load(html);

const downloadImage = (url, dest) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    protocol.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

(async () => {
  // Clear existing sponsors to avoid duplicates
  db.prepare('DELETE FROM sponsors').run();

  let count = 0;
  
  // Exclude the FC Zell Logo in the header
  const images = $('img').filter((i, el) => {
    const src = $(el).attr('src') || '';
    return src && !src.includes('pixel.wp.com') && !src.includes('FC-Zell_Logo');
  });

  for (let i = 0; i < images.length; i++) {
    const el = images[i];
    let src = $(el).attr('src');
    if (src.startsWith('//')) src = 'https:' + src;
    
    let alt = $(el).attr('alt') || '';
    const parentA = $(el).closest('a');
    const link = parentA.attr('href') || '';
    
    // Guess category
    let category = 'Sponsor';
    const h2 = $(el).closest('.wp-block-group').prevAll('h2').first().text();
    if (h2) category = h2;
    else if (i === 0) category = 'Hauptsponsor';
    else if (i === 1 || i === 2) category = 'Co-Sponsor';
    else category = 'Sponsor';

    // Guess name if alt is empty
    let name = alt;
    if (!name) {
      const parts = src.split('/');
      let filename = parts[parts.length - 1];
      name = filename.split('.')[0].replace(/[-_]/g, ' ').replace(/[0-9]/g, '').trim();
    }
    
    // Generate local filename
    const ext = path.extname(src) || '.jpg';
    const localFilename = `sponsor_import_${i}${ext}`;
    const localPath = path.join(__dirname, 'public/images/sponsoren', localFilename);
    const dbPath = `/images/sponsoren/${localFilename}`;

    try {
      console.log(`Downloading ${src}...`);
      await downloadImage(src, localPath);
      
      db.prepare(`INSERT INTO sponsors (name, category, logo, link, sort_order) VALUES (?, ?, ?, ?, ?)`).run(
        name || 'Unbekannt',
        category,
        dbPath,
        link,
        i * 10
      );
      count++;
    } catch (e) {
      console.error(`Failed to download or insert ${src}: ${e.message}`);
    }
  }

  console.log(`Imported ${count} sponsors successfully.`);
})();
