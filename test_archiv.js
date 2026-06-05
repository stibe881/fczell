const fs = require('fs');

async function check() {
  const html = fs.readFileSync('archiv_content.html', 'utf16le');
  
  // Quick regex to find links
  const regex = /<a href="(http:\/\/www\.fczell\.ch\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
  let match;
  let links = [];
  while ((match = regex.exec(html)) !== null) {
    if (match[1].includes('archiv') || match[1].includes('vereinsnews') || match[1].includes('juniorenlager') || match[1].includes('dorfturnier')) {
       links.push({ url: match[1].replace('http://www', 'https://www'), text: match[2] });
    }
  }
  
  console.log(`Found ${links.length} potential archive links.`);
  if (links.length > 0) {
    console.log('Testing first link:', links[0]);
    try {
      // Find WP page/post ID by slug or just fetch the HTML
      const url = links[0].url;
      const res = await fetch(url);
      const text = await res.text();
      
      // Look for images in the HTML
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let imgs = [];
      let imgMatch;
      while ((imgMatch = imgRegex.exec(text)) !== null) {
        imgs.push(imgMatch[1]);
      }
      console.log(`Found ${imgs.length} images on the first page.`);
      
    } catch(e) {
      console.error(e);
    }
  }
}
check();
