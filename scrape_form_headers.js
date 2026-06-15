const https = require('https');
const cheerio = require('cheerio'); 

https.get('https://www.fczell.ch/events/dorfturnier-2026/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const $ = cheerio.load(data);
    $('.wpcf7').each((i, el) => {
      console.log(`\n--- Form ${i+1} ---`);
      let prev = $(el).parent().prev();
      while (prev.length && prev.text().trim() === '') {
        prev = prev.prev();
      }
      console.log('Heading above form:', prev.text().trim());
      let prev2 = prev.prev();
      if(prev2.length) console.log('Heading 2 above form:', prev2.text().trim());
    });
  });
});
