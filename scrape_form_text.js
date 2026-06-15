const https = require('https');
const cheerio = require('cheerio'); 

https.get('https://www.fczell.ch/events/dorfturnier-2026/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    const $ = cheerio.load(data);
    $('.fusion-text').each((i, el) => {
      console.log($(el).text().substring(0, 200).trim().replace(/\n/g, ' '));
    });
  });
});
