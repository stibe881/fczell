const fs = require('fs');
const path = require('path');
const db = require('./db');

const brainDir = 'C:/Users/StefanGross/.gemini/antigravity/brain/af517b03-ffbd-4d6c-baf0-145453292551/';
const publicDir = path.join(__dirname, 'public/images/sponsors');

const imgSource = 'media__1780662254786.jpg';
const destFileName = 'iff-motorcycles-new.jpg';
const advertiserId = 28;

(async () => {
  const srcPath = path.join(brainDir, imgSource);
  const destPath = path.join(publicDir, destFileName);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${imgSource} to ${destFileName}`);
    
    const logoUrl = `/images/sponsors/${destFileName}`;
    await db.query('UPDATE advertisers SET logo = ? WHERE id = ?', [logoUrl, advertiserId]);
    console.log(`Updated advertiser ID ${advertiserId} with logo ${logoUrl}`);
  } else {
    console.log(`File not found: ${srcPath}`);
  }
  process.exit(0);
})();
