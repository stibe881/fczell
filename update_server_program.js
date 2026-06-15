const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

// POST new
content = content.replace(
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info } = req.body;",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday } = req.body;"
);

content = content.replace(
  "dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, deadline",
  "dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, deadline"
);
content = content.replace(
  "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?",
  "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?"
);
content = content.replace(
  "cat_beerpong_info || '', deadline",
  "cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline"
);

// POST edit
content = content.replace(
  "cat_beerpong_info || '', deadline",
  "cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done server.js updates for program info');
