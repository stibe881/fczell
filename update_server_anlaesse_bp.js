const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

// POST new
content = content.replace(
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info } = req.body;"
);
content = content.replace(
  "if (req.body.cat_c === '1') dorfturnier_categories.push('C');\n  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C';",
  "if (req.body.cat_c === '1') dorfturnier_categories.push('C');\n  if (req.body.cat_bp === '1') dorfturnier_categories.push('BP');\n  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C,BP';"
);
content = content.replace( // LF fallback
  "if (req.body.cat_c === '1') dorfturnier_categories.push('C');\r\n  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C';",
  "if (req.body.cat_c === '1') dorfturnier_categories.push('C');\r\n  if (req.body.cat_bp === '1') dorfturnier_categories.push('BP');\r\n  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C,BP';"
);
content = content.replace(
  "dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, deadline",
  "dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, deadline"
);
content = content.replace(
  "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
  "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?"
);
content = content.replace(
  "cat_c_info || '', deadline",
  "cat_c_info || '', cat_beerpong_info || '', deadline"
);

// POST edit
content = content.replace(
  "cat_c_info || '', deadline",
  "cat_c_info || '', cat_beerpong_info || '', deadline"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done server.js updates for beerpong info');
