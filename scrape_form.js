const https = require('https');

https.get('https://www.fczell.ch/events/dorfturnier-2026/', (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    // Basic regex to find form fields around categories
    const lines = data.split('\n');
    lines.forEach((line, i) => {
      if (line.match(/input|label|Kategorie|select/i) && line.match(/cf7/i)) {
        console.log(line.trim());
      }
    });
  });
});
