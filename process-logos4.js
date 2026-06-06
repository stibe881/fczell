const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

const imagesToProcess = [
  {
    source: 'media__1780662725757.jpg', // Landi
    dest: 'landi-luzern-west.jpg',
    advertiserId: 31
  },
  {
    source: 'media__1780662729456.png', // Lustenberger
    dest: 'lustenberger-ag.png',
    advertiserId: 32
  },
  {
    source: 'media__1780662732341.png', // Luzerner Kantonalbank
    dest: 'luzerner-kantonalbank.png',
    advertiserId: 33
  },
  {
    source: 'media__1780662735695.jpg', // Müller Talbach Garage
    dest: 'mueller-talbach-garage.jpg',
    advertiserId: 37
  },
  {
    source: 'media__1780662746498.png', // Pizza Kebap Haus
    dest: 'pizza-kebap-haus.png',
    advertiserId: 40
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
