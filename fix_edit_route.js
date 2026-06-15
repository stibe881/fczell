const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const editRegex = /app\.post\('\/admin\/anlaesse\/:id\/edit', requireRole\('content'\), uploadAny\.any\(\), async \(req, res\) => \{\s*console\.log\('--- REQ BODY ---', req\.body\);\s*const \{ title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived \} = req\.body;/;

const newReqBodyStr = `  const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, amtscup_groups, amtscup_games } = req.body;
  let dorfturnier_categories = [];
  if (req.body.cat_a_b === '1') dorfturnier_categories.push('A_B');
  if (req.body.cat_z === '1') dorfturnier_categories.push('Z');
  if (req.body.cat_c === '1') dorfturnier_categories.push('C');
  if (req.body.cat_bp === '1') dorfturnier_categories.push('BP');
  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C,BP';`;

if (editRegex.test(code)) {
  code = code.replace(editRegex, `app.post('/admin/anlaesse/:id/edit', requireRole('content'), uploadAny.any(), async (req, res) => {\n` + newReqBodyStr);
  fs.writeFileSync('server.js', code);
  console.log('Fixed EDIT route successfully.');
} else {
  console.log('Regex failed to match EDIT route.');
}
