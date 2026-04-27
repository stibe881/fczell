const https = require('https');

https.get('https://www.fczell.ch/verein/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Just find the block containing "Der FC Zell ist ein Fussballclub"
    const match = d.match(/Der&nbsp;FC Zell ist ein Fussballclub[\s\S]*?(?=<div class="fusion-clearfix"><\/div>)/);
    if(match) {
      console.log(match[0].replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n').trim());
    } else {
      console.log("Not found. Dumping part of html:");
      console.log(d.substring(d.indexOf('Fussballclub') - 200, d.indexOf('Fussballclub') + 1000));
    }
  });
});
