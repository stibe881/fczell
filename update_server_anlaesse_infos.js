const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

// POST new
content = content.replace(
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived } = req.body;\n  let dorfturnier_categories = [];",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;\n  let dorfturnier_categories = [];"
);
content = content.replace( // LF fallback
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived } = req.body;\r\n  let dorfturnier_categories = [];",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;\r\n  let dorfturnier_categories = [];"
);

content = content.replace(
  "INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    `, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file]);",
  "INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    `, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file]);"
);
content = content.replace( // LF fallback
  "INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)\r\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\r\n    `, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file]);",
  "INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)\r\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\r\n    `, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file]);"
);


// POST edit
content = content.replace(
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived } = req.body;\n  let dorfturnier_categories = [];",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;\n  let dorfturnier_categories = [];"
);
content = content.replace( // LF fallback
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived } = req.body;\r\n  let dorfturnier_categories = [];",
  "const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;\r\n  let dorfturnier_categories = [];"
);


content = content.replace(
  "UPDATE anlaesse \n      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?\n      WHERE id=?",
  "UPDATE anlaesse \n      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, cat_a_b_info=?, cat_z_info=?, cat_c_info=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?\n      WHERE id=?"
);
content = content.replace( // LF fallback
  "UPDATE anlaesse \r\n      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?\r\n      WHERE id=?",
  "UPDATE anlaesse \r\n      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, cat_a_b_info=?, cat_z_info=?, cat_c_info=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?\r\n      WHERE id=?"
);

content = content.replace(
  "[title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file, req.params.id]",
  "[title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file, req.params.id]"
);


fs.writeFileSync(file, content, 'utf8');
console.log('Done server.js updates for anlaesse info');
