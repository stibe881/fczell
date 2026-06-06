const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

// Make sure directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const imagesToProcess = [
  {
    source: 'media__1780661940796.png',
    dest: 'heller-garage.png',
    advertiserId: 26
  },
  {
    source: 'media__1780661940799.jpg',
    dest: 'haefliger-bau.jpg',
    advertiserId: 24
  },
  {
    source: 'media__1780661940800.png',
    dest: 'habisreutinger.png',
    advertiserId: 23
  },
  {
    source: 'media__1780661940932.png',
    dest: 'grafic-design.png',
    advertiserId: 21
  }
];

(async () => {
  for (const img of imagesToProcess) {
    const srcPath = path.join(brainDir, img.source);
    const destPath = path.join(publicDir, img.dest);
    
    // Copy file
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${img.source} to ${img.dest}`);
    
    // Update DB
    const logoUrl = `/images/sponsors/${img.dest}`;
    await db.query('UPDATE advertisers SET logo = ? WHERE id = ?', [logoUrl, img.advertiserId]);
    console.log(`Updated advertiser ID ${img.advertiserId} with logo ${logoUrl}`);
  }
  
  process.exit(0);
})();
