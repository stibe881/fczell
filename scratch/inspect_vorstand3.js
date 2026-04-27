const cheerio = require('cheerio');
const https = require('https');
https.get('https://www.fczell.ch/verein/vorstand/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const nodes = [];
    $('*').each((i, el) => {
       const children = $(el).children();
       if (children.length === 0) {
           const t = $(el).text().trim();
           if (t && t.length > 2) nodes.push(t);
       }
    });
    console.log(nodes.slice(0, 50));
  });
});
