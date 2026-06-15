const fs = require('fs');
let code = fs.readFileSync('views/admin/anlaesse-form.ejs', 'utf8');

// Undo the broken placement
code = code.replace(
  "document.getElementById('anlassForm').addEventListener('submit', function() {\n    if(typeof updateAmtscupHidden === 'function') updateAmtscupHidden();\n  });\n  document.addEventListener('DOMContentLoaded', function() {",
  "document.addEventListener('DOMContentLoaded', function() {"
);

// Add it properly inside DOMContentLoaded
code = code.replace(
  "document.addEventListener('DOMContentLoaded', function() {\n    if (document.getElementById('amtscup-section')) {\n      renderAmtscup();\n    }",
  "document.addEventListener('DOMContentLoaded', function() {\n    const frm = document.getElementById('anlassForm');\n    if (frm) {\n      frm.addEventListener('submit', function() {\n        if(typeof updateAmtscupHidden === 'function') updateAmtscupHidden();\n      });\n    }\n    if (document.getElementById('amtscup-section')) {\n      renderAmtscup();\n    }"
);

fs.writeFileSync('views/admin/anlaesse-form.ejs', code);
console.log('Fixed submit listener placement');
