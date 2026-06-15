const fs = require('fs');
let content = fs.readFileSync('views/admin/anlaesse-form.ejs', 'utf8');

// Fix the missing closing div for docs-section
content = content.replace(
  '      </div>\n    </div>\n\n    <!-- GV Dokumente (Traktanden & Protokoll) -->',
  '      </div>\n    </div>\n  </div>\n\n    <!-- GV Dokumente (Traktanden & Protokoll) -->'
);

// Fix the extra closing div at the end of gv-section
content = content.replace(
  '<small>Protokoll der Generalversammlung hochladen.</small>\n      </div>\n        </div>\n      </div>\n    </div>\n\n    <div class="form-group">\n      <label for="body">Inhalt',
  '<small>Protokoll der Generalversammlung hochladen.</small>\n      </div>\n    </div>\n\n    <div class="form-group">\n      <label for="body">Inhalt'
);

// Fallback in case the exact spacing of the extra div is different
content = content.replace(
  '        </div>\n      </div>\n    </div>\n\n    <div class="form-group">\n      <label for="body">Inhalt',
  '    </div>\n\n    <div class="form-group">\n      <label for="body">Inhalt'
);

fs.writeFileSync('views/admin/anlaesse-form.ejs', content);
console.log('Fixed div structures.');
