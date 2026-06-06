const fs = require('fs');
let content = fs.readFileSync('views/verein.ejs', 'utf8');
content = content.split('\\\\n        ').join('\\n        ');
content = content.split('\\\\n').join('\\n');
fs.writeFileSync('views/verein.ejs', content);
console.log('Fixed literal newlines 2');
