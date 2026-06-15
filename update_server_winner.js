const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Update '/admin/anlaesse/new'
content = content.replace(
  'const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games } = req.body;',
  'const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games, amtscup_winner } = req.body;'
);

content = content.replace(
  'INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)',
  'INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games, amtscup_winner, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)'
);

content = content.replace(
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

content = content.replace(
  'amtscup_groups || \'\', amtscup_games || \'\', deadline || null',
  'amtscup_groups || \'\', amtscup_games || \'\', amtscup_winner || null, deadline || null'
);

// 2. Update '/admin/anlaesse/:id/edit'
content = content.replace(
  'const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games } = req.body;',
  'const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games, amtscup_winner } = req.body;'
);

content = content.replace(
  'amtscup_groups=?, amtscup_games=?, deadline=?',
  'amtscup_groups=?, amtscup_games=?, amtscup_winner=?, deadline=?'
);

fs.writeFileSync('server.js', content);
console.log('server.js updated successfully.');
