const fs = require('fs');
const https = require('https');
const path = require('path');
const cheerio = require('cheerio');
const db = require('./db');

const IMG_DIR = path.join(__dirname, 'public', 'images', 'archiv');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : require('http');
    client.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function fetchPage(url) {
  const res = await fetch(url);
  const text = await res.text();
  return cheerio.load(text);
}

async function importArchiv() {
  const html = fs.readFileSync('archiv_content.html', 'utf16le');
  const $ = cheerio.load(html);
  
  const entries = [];
  
  // The html has <h2>2017</h2> <ul><li><a>...</a></li></ul>
  $('h2').each((i, el) => {
    const year = $(el).text().trim();
    if (!/20\d\d/.test(year)) return;
    
    const ul = $(el).next('ul');
    ul.find('a').each((j, a) => {
      const title = $(a).text().trim().replace(/[^a-zA-Z0-9 äöüÄÖÜß-]/g, '');
      let url = $(a).attr('href');
      if (url) {
        url = url.replace('http://', 'https://');
        entries.push({ year, title, url });
      }
    });
  });

  console.log(`Found ${entries.length} entries.`);

  let bodyMarkdown = '';
  
  // We'll group them by year using markdown
  const grouped = {};
  for (const entry of entries) {
    if (!grouped[entry.year]) grouped[entry.year] = [];
    grouped[entry.year].push(entry);
  }

  // Iterate from newest to oldest
  const years = Object.keys(grouped).sort((a,b) => b - a);

  for (const year of years) {
    bodyMarkdown += `\n<details>\n  <summary><h2>${year}</h2></summary>\n  <div style="padding: 1rem 0;">\n`;
    
    for (const entry of grouped[year]) {
      console.log(`Fetching ${entry.title} (${entry.year}) from ${entry.url}`);
      try {
        const page$ = await fetchPage(entry.url);
        
        // Extract text
        // Most content in Avada is in .post-content or .fusion-text
        let contentHtml = '';
        if (page$('.fusion-text').length > 0) {
          contentHtml = page$('.fusion-text').html();
        } else if (page$('.post-content').length > 0) {
          contentHtml = page$('.post-content').html();
        }
        
        const cleanText = cheerio.load(contentHtml || '')('body').text().replace(/\s+/g, ' ').trim();
        
        // Extract images
        let images = [];
        page$('img').each((i, img) => {
          let src = page$(img).attr('src');
          if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon')) {
             images.push(src);
          }
        });
        // Remove duplicates and small ones (like WP emoticons)
        images = [...new Set(images)].filter(src => !src.includes('wp-includes/images/smilies'));
        
        bodyMarkdown += `\n<h3>${entry.title}</h3>\n`;
        if (cleanText) {
          bodyMarkdown += `<p>${cleanText}</p>\n`;
        }
        
        if (images.length >= 6) {
          console.log(`  -> Found gallery with ${images.length} images!`);
          const galleryName = `archiv_${entry.title.toLowerCase().replace(/[^a-z0-9]/g, '')}_${entry.year}`;
          
          let sortOrder = 0;
          for (const src of images) {
            const filename = path.basename(src);
            const localPath = path.join(IMG_DIR, filename);
            const relativePath = '/images/archiv/' + filename;
            
            // Check if exists
            if (!fs.existsSync(localPath)) {
               try {
                 await downloadImage(src, localPath);
               } catch(e) { console.error('  Failed to DL', src); }
            }
            
            // Insert into db
            const [exists] = await db.query('SELECT id FROM gallery_photos WHERE gallery = ? AND image_path = ?', [galleryName, relativePath]);
            if (exists.length === 0) {
              await db.query('INSERT INTO gallery_photos (gallery, image_path, sort_order) VALUES (?, ?, ?)', [galleryName, relativePath, sortOrder++]);
            }
          }
          
          // Embed the gallery in the markdown using our gallery-grid partial equivalent
          bodyMarkdown += `\n<div class="gallery-grid" style="margin-top:2rem; margin-bottom:2rem;">`;
          const [photos] = await db.query('SELECT * FROM gallery_photos WHERE gallery = ? ORDER BY sort_order ASC', [galleryName]);
          for (const p of photos) {
            bodyMarkdown += `\n  <a href="${p.image_path}" class="gallery-item lightbox-trigger"><img src="${p.image_path}" alt="" loading="lazy"></a>`;
          }
          bodyMarkdown += `\n</div>\n`;
          
        } else if (images.length > 0) {
          console.log(`  -> Found ${images.length} images (inline)`);
          bodyMarkdown += `\n<div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:2rem;">`;
          for (const src of images) {
            const filename = path.basename(src);
            const localPath = path.join(IMG_DIR, filename);
            const relativePath = '/images/archiv/' + filename;
            if (!fs.existsSync(localPath)) {
               try { await downloadImage(src, localPath); } catch(e) {}
            }
            bodyMarkdown += `\n  <img src="${relativePath}" style="max-height: 250px; border-radius: 4px;" alt="">`;
          }
          bodyMarkdown += `\n</div>\n`;
        }
        
      } catch (err) {
        console.error('Error processing', entry.url, err);
      }
    }
    
    bodyMarkdown += `\n  </div>\n</details>\n`;
  }

  // Update or insert into anlaesse table
  const [existing] = await db.query('SELECT id FROM anlaesse WHERE slug = ?', ['archiv']);
  if (existing.length > 0) {
    await db.query('UPDATE anlaesse SET body = ? WHERE slug = ?', [bodyMarkdown, 'archiv']);
    console.log('Updated existing archiv entry.');
  } else {
    await db.query('INSERT INTO anlaesse (slug, title, body, sort_order) VALUES (?, ?, ?, ?)', ['archiv', 'Archiv', bodyMarkdown, 99]);
    console.log('Inserted new archiv entry.');
  }
  
  process.exit(0);
}

importArchiv();
