const fs = require('fs');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');
const { marked } = require('marked');
const mysql = require('mysql2/promise');
const path = require('path');
const https = require('https');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.tables);

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

async function run() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'lguh.your-database.de',
    user: process.env.DB_USER || 'fczell',
    password: process.env.DB_PASSWORD || '!LeliBist.1561!',
    database: process.env.DB_NAME || 'fczell',
    multipleStatements: true
  });

  const html = fs.readFileSync('archiv_content.html', 'utf16le');
  const $ = cheerio.load(html);
  const entries = [];
  
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

  for (const entry of entries) {
    const yearInt = parseInt(entry.year);
    const slug = entry.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + yearInt;

    // Check if it exists
    const [existing] = await db.query('SELECT id FROM anlaesse WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      console.log(`Skipping ${slug}, already exists.`);
      continue;
    }

    console.log(`Processing ${entry.title} (${entry.year})...`);
    
    let cleanHtml = '';
    let images = [];
    try {
      const page$ = await fetchPage(entry.url);
      let contentHtml = '';
      if (page$('.fusion-text').length > 0) {
        contentHtml = page$('.fusion-text').html();
      } else if (page$('.post-content').length > 0) {
        contentHtml = page$('.post-content').html();
      }
      
      const $content = cheerio.load(contentHtml || '');
      $content('img, script, style, .gallery, .fusion-portfolio').remove();
      let htmlToConvert = $content('body').html() || '';
      let mdText = turndownService.turndown(htmlToConvert);
      
      cleanHtml = mdText; // save markdown directly!
      
      page$('img').each((i, img) => {
        let src = page$(img).attr('src');
        if (src && !src.includes('avatar') && !src.includes('logo') && !src.includes('icon')) {
            images.push(src);
        }
      });
      images = [...new Set(images)].filter(src => !src.includes('wp-includes/images/smilies'));
    } catch (e) {
      console.error('Error fetching page', e.message);
    }

    // Insert Anlass
    const [res] = await db.query(
      'INSERT INTO anlaesse (title, year, slug, body, is_archived, sort_order) VALUES (?, ?, ?, ?, 1, 0)',
      [entry.title, yearInt, slug, cleanHtml]
    );
    const anlassId = res.insertId;

    if (images.length >= 6) {
      const galleryName = `Archiv ${entry.title} ${entry.year}`;
      const [gRes] = await db.query('INSERT INTO galleries (name, anlass_id) VALUES (?, ?)', [galleryName, anlassId]);
      const galleryId = gRes.insertId;

      let sortOrder = 0;
      for (const src of images) {
        const filename = path.basename(src);
        const localPath = path.join(IMG_DIR, filename);
        const relativePath = '/images/archiv/' + filename;
        if (!fs.existsSync(localPath)) {
          try { await downloadImage(src, localPath); } catch(e) {}
        }
        await db.query('INSERT INTO gallery_photos (gallery_id, image_path, sort_order) VALUES (?, ?, ?)', [galleryId, relativePath, sortOrder++]);
      }
    } else if (images.length > 0) {
      // Just append inline images to the markdown body
      let inlineImages = '\n\n';
      for (const src of images) {
        const filename = path.basename(src);
        const localPath = path.join(IMG_DIR, filename);
        const relativePath = '/images/archiv/' + filename;
        if (!fs.existsSync(localPath)) {
          try { await downloadImage(src, localPath); } catch(e) {}
        }
        inlineImages += `![](${relativePath})\n`;
      }
      await db.query('UPDATE anlaesse SET body = CONCAT(body, ?) WHERE id = ?', [inlineImages, anlassId]);
    }
  }

  console.log("Done restoring archive.");
  process.exit(0);
}
run();
