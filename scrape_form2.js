const https = require('https');
const cheerio = require('cheerio'); // If available, otherwise basic parsing

https.get('https://www.fczell.ch/events/dorfturnier-2026/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const $ = require('cheerio').load(data);
      $('.wpcf7').each((i, el) => {
        console.log(`\n--- Form ${i+1} ---`);
        console.log('Context:', $(el).parent().prev().text());
        $(el).find('label, input[type="text"], input[type="email"], input[type="submit"]').each((j, formEl) => {
          if (formEl.name === 'label') {
            console.log('Label:', $(formEl).text().trim());
          } else {
            console.log('Input:', $(formEl).attr('name'), $(formEl).attr('placeholder'));
          }
        });
      });
    } catch (e) {
      console.log("cheerio not found, doing naive parse");
      const parts = data.split('wpcf7-form');
      parts.forEach((p, i) => {
        if (i===0) return;
        console.log(`\n--- FORM ${i} ---`);
        const snippet = p.substring(0, 1000);
        console.log(snippet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
      });
    }
  });
});
