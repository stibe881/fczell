const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'admin', 'dashboard.ejs');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<a([^>]*?)>\s*(?:[Bb]earbeiten)\s*<\/a>/g, (match, p1) => {
  if (!p1.includes('class=')) {
    return `<a${p1} class="btn btn-sm btn-primary">Bearbeiten</a>`;
  }
  return match;
});

fs.writeFileSync(file, content, 'utf8');
console.log('Updated dashboard.ejs');
