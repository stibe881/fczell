const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'views', 'admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ejs'));

files.forEach(file => {
  const isListOrDashboard = file.includes('-list') || file.includes('registrations-') || file === 'dashboard.ejs';
  if (!isListOrDashboard) return;

  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace bearbeiten links
  // Match `<a ... href="X" ...>bearbeiten</a>`
  content = content.replace(/<a([^>]*?)href="([^"]+)"([^>]*?)>\s*[Bb]earbeiten\s*<\/a>/g, (match, p1, href, p2) => {
    return `<a class="btn btn-sm btn-primary" href="${href}">Bearbeiten</a>`;
  });

  // Since some might have href before class or after class, the above handles it by capturing href specifically
  
  // Replace löschen buttons
  // Match `<button ...>löschen</button>`
  content = content.replace(/<button([^>]*?)>\s*[Ll]öschen\s*<\/button>/g, (match, p1) => {
    // preserve onclick if present
    const onclickMatch = p1.match(/onclick="([^"]+)"/);
    const onclick = onclickMatch ? ` onclick="${onclickMatch[1]}"` : '';
    // preserve type if present
    const typeMatch = p1.match(/type="([^"]+)"/);
    const type = typeMatch ? ` type="${typeMatch[1]}"` : ' type="submit"';
    
    return `<button class="btn btn-sm btn-danger"${type}${onclick}>Löschen</button>`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', file);
  }
});
