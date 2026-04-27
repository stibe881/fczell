const fs = require('fs');
const https = require('https');

https.get('https://www.fczell.ch/sponsoren/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    fs.writeFileSync('sponsoren.html', d);
    console.log("Saved sponsoren.html");
  });
});
https.get('https://www.fczell.ch/verein/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    fs.writeFileSync('verein.html', d);
    console.log("Saved verein.html");
  });
});
