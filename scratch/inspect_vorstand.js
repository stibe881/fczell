const cheerio = require('cheerio');
const https = require('https');
https.get('https://www.fczell.ch/verein/vorstand/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    const p = [];
    $('p').each((i, el) => {
       p.push($(el).text().trim());
    });
    console.log("Paragraphs:");
    console.log(p.slice(0, 15));
    
    // Check if it uses table or ul/li
    console.log("Li:");
    $('li').each((i, el) => {
      console.log($(el).text().trim().substring(0,50));
    });
  });
});
