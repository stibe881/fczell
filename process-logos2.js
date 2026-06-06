const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

const imagesToProcess = [
  {
    source: 'media__1780662130176.jpg', // Armin Kunz
    dest: 'kunz-saegewerk.jpg',
    advertiserId: 29
  },
  {
    source: 'media__1780662130176.png', // IFF Motorcycles
    dest: 'iff-motorcycles.png',
    advertiserId: 28
  },
  {
    source: 'media__1780662130199.png', // Imbach Fischbach
    dest: 'imbach-fischbach.png',
    advertiserId: 51
  },
  {
    source: 'media__1780662175549.png', // Sonne Zell
    dest: 'sonne-zell.png',
    advertiserId: 20
  }
];

(async () => {
  for (const img of imagesToProcess) {
    const srcPath = path.join(brainDir, img.source);
    const destPath = path.join(publicDir, img.dest);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${img.source} to ${img.dest}`);
      
      const logoUrl = `/images/sponsors/${img.dest}`;
      await db.query('UPDATE advertisers SET logo = ? WHERE id = ?', [logoUrl, img.advertiserId]);
      console.log(`Updated advertiser ID ${img.advertiserId} with logo ${logoUrl}`);
    } else {
      console.log(`File not found: ${srcPath}`);
    }
  }
  process.exit(0);
})();
