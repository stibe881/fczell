const fs = require('fs');
const path = require('path');
const https = require('https');
const db = require('./db');

const API_URL = 'https://www.fczell.ch/wp-json/wp/v2/posts?per_page=100&_embed&after=2024-12-31T23:59:59Z';
const IMG_DIR = path.join(__dirname, 'public', 'images', 'news');

if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve('');
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

function decodeHtml(html) {
  return html.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
             .replace(/&quot;/g, '"')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#8211;/g, '–');
}

function stripHtml(html) {
  return html.replace(/<[^>]*>?/gm, '');
}

async function importNews() {
  console.log('Fetching news from WP API...');
  
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const posts = await res.json();
    
    console.log(`Found ${posts.length} posts from 2025/2026.`);
    
    for (const post of posts) {
      const title = decodeHtml(post.title.rendered);
      const date = post.date.split('T')[0];
      const content = post.content.rendered;
      const excerpt = stripHtml(decodeHtml(post.excerpt.rendered)).trim();
      let imagePath = '';
      
      // Try to get featured image
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const sourceUrl = post._embedded['wp:featuredmedia'][0].source_url;
        if (sourceUrl) {
          const filename = path.basename(sourceUrl);
          const localPath = path.join(IMG_DIR, filename);
          console.log(`Downloading image for "${title}": ${filename}`);
          try {
            await downloadImage(sourceUrl, localPath);
            imagePath = '/images/news/' + filename;
          } catch (imgErr) {
            console.error('Failed to download image:', imgErr);
          }
        }
      }
      
      // We check if it already exists to prevent duplicates on multiple runs
      const [existing] = await db.query('SELECT id FROM news WHERE title = ? AND published_at = ?', [title, date]);
      if (existing.length > 0) {
        console.log(`Skipping existing post: ${title}`);
        continue;
      }
      
      console.log(`Inserting: ${title}`);
      await db.query(
        'INSERT INTO news (title, excerpt, body, category, published_at, content, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [title, excerpt, content, 'Allgemein', date, content, imagePath]
      );
    }
    
    console.log('Import completed successfully!');
  } catch (err) {
    console.error('Import failed:', err);
  } finally {
    process.exit(0);
  }
}

importNews();
