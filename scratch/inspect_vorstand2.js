const cheerio = require('cheerio');
const https = require('https');
https.get('https://www.fczell.ch/verein/vorstand/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    
    // Often in Elementor, each person is in a column
    $('.elementor-widget-wrap').each((i, wrap) => {
       const text = $(wrap).text().trim().replace(/\s+/g, ' ');
       if (text.includes('Kontakt') && text.includes('@')) {
          console.log("----");
          $(wrap).find('p, h1, h2, h3, h4, h5, span, div').each((j, el) => {
             // just print the direct text
             const t = $(el).clone().children().remove().end().text().trim();
             if (t) console.log(el.tagName, ':', t);
          });
       }
    });
  });
});
