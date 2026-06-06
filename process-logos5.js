const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

const imagesToProcess = [
  {
    source: 'media__1780662760286.jpg', // Stöckli Metzgerei
    dest: 'stoeckli-metzgerei.jpg',
    advertiserId: 47
  },
  {
    source: 'media__1780662762975.png', // Stadelmann
    dest: 'stadelmann-baeckerei.png',
    advertiserId: 46
  },
  {
    source: 'media__1780662765250.jpg', // Schreinerei Meier
    dest: 'schreinerei-meier.jpg',
    advertiserId: 45
  },
  {
    source: 'media__1780662767306.png', // Raiffeisen
    dest: 'raiffeisen.png',
    advertiserId: 41
  },
  {
    source: 'media__1780662769857.png', // Vogel Trockenbau
    dest: 'vogel-trockenbau.png',
    advertiserId: 49
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
