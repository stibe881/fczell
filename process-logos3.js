const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

const imagesToProcess = [
  {
    source: 'media__1780662205081.jpg', // CKW
    dest: 'ckw.jpg',
    advertiserId: 14
  },
  {
    source: 'media__1780662207562.png', // Dubach
    dest: 'dubach-holzbau.png',
    advertiserId: 15
  },
  {
    source: 'media__1780662209864.jpg', // Fankhauser
    dest: 'fankhauser.jpg',
    advertiserId: 16
  },
  {
    source: 'media__1780662212066.jpg', // Flückiger
    dest: 'flueckiger-hecht.jpg',
    advertiserId: 17
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
