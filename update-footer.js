const fs = require('fs');
let c = fs.readFileSync('views/partials/footer.ejs', 'utf8');

c = c.replace('<a href="/datenschutz">Datenschutz</a>', '<a href="/datenschutz">Datenschutz</a> &middot; <a href="/impressum">Impressum</a>');

if (!c.includes('cookie-banner')) {
    c = c.replace('</body>', '  <%- include(\'cookie-banner\') %>\n</body>');
}

fs.writeFileSync('views/partials/footer.ejs', c);
