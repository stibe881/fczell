const cheerio = require('cheerio');
const https = require('https');

https.get('https://www.fczell.ch/sponsoren/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    
    // find the Bandenwerber section. Usually it's preceded by a heading.
    // Let's just find all images and print them to see.
    let imgs = [];
    $('a.fusion-imageframe').each((i, el) => {
      let href = $(el).attr('href');
      let imgSrc = $(el).find('img').attr('src');
      let alt = $(el).find('img').attr('alt');
      imgs.push({ href, imgSrc, alt });
    });
    console.log(JSON.stringify(imgs, null, 2));
  });
});
