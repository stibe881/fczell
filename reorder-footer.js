const fs = require('fs');
let c = fs.readFileSync('views/partials/footer.ejs', 'utf8');

// The current string is: <a href="/datenschutz">Datenschutz</a> &middot; <a href="/impressum">Impressum</a>
// Let's replace it
c = c.replace('<a href="/datenschutz">Datenschutz</a> &middot; <a href="/impressum">Impressum</a>', '<a href="/impressum">Impressum</a> &middot; <a href="/datenschutz">Datenschutz</a>');

fs.writeFileSync('views/partials/footer.ejs', c);
