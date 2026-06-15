const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'mannschaften.ejs');
let content = fs.readFileSync(file, 'utf8');

// 1. Change nav order
content = content.replace(
  '<a href="#resultate" class="section-nav-link active">Resultate &amp; Ranglisten</a>\r\n    <a href="#spielaufnahmen" class="section-nav-link">Spielaufnahmen</a>\r\n    <a href="#aktive" class="section-nav-link">Aktive</a>\r\n    <a href="#junioren" class="section-nav-link">Junioren</a>',
  '<a href="#resultate" class="section-nav-link active">Resultate &amp; Ranglisten</a>\r\n    <a href="#aktive" class="section-nav-link">Aktive</a>\r\n    <a href="#junioren" class="section-nav-link">Junioren</a>\r\n    <a href="#spielaufnahmen" class="section-nav-link">Spielaufnahmen</a>'
);
content = content.replace( // fallback for LF
  '<a href="#resultate" class="section-nav-link active">Resultate &amp; Ranglisten</a>\n    <a href="#spielaufnahmen" class="section-nav-link">Spielaufnahmen</a>\n    <a href="#aktive" class="section-nav-link">Aktive</a>\n    <a href="#junioren" class="section-nav-link">Junioren</a>',
  '<a href="#resultate" class="section-nav-link active">Resultate &amp; Ranglisten</a>\n    <a href="#aktive" class="section-nav-link">Aktive</a>\n    <a href="#junioren" class="section-nav-link">Junioren</a>\n    <a href="#spielaufnahmen" class="section-nav-link">Spielaufnahmen</a>'
);

// 2. Extract spielaufnahmen section
const spielaufnahmenRegex = /(<!-- ============ #spielaufnahmen ============ -->[\s\S]*?)(?=<!-- ============ #aktive ============ -->)/;
const match = content.match(spielaufnahmenRegex);
if (match) {
  const spielSection = match[1];
  // Remove it from its current position
  content = content.replace(spielSection, '');
  
  // Find where to insert it (after #junioren section)
  // We'll insert it right before <!-- ============ PAGE STYLES ============ -->
  content = content.replace(
    '<!-- ============ PAGE STYLES ============ -->',
    spielSection + '\n<!-- ============ PAGE STYLES ============ -->'
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done moving sections');
