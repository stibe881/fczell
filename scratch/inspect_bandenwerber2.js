const cheerio = require('cheerio');
const https = require('https');

https.get('https://www.fczell.ch/sponsoren/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    let out = [];
    $('img').each((i, el) => {
      let src = $(el).attr('src');
      let alt = $(el).attr('alt') || '';
      let parentHref = $(el).closest('a').attr('href') || '';
      if (src && !src.includes('data:image')) {
        out.push({ src, alt, href: parentHref });
      }
    });
    console.log(JSON.stringify(out, null, 2));
  });
});
