const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const regex = /app\.post\('\/admin\/anlaesse\/:id\/edit', requireRole\('content'\), uploadAny\.any\(\), async \(req, res\) => \{\n/;
const replacement = `app.post('/admin/anlaesse/:id/edit', requireRole('content'), uploadAny.any(), async (req, res) => {\n  require('fs').writeFileSync('debug_edit.json', JSON.stringify(req.body, null, 2));\n`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.js', code);
console.log('Injected logger');
