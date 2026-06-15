const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

// Replace INSERT logic around line 754
const oldInsert = `app.post('/admin/anlaesse/new', requireRole('content'), uploadAny.any(), async (req, res) => {
  const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday } = req.body;
  let dorfturnier_categories = [];
  if (req.body.cat_a_b === '1') dorfturnier_categories.push('A_B');
  if (req.body.cat_z === '1') dorfturnier_categories.push('Z');
  if (req.body.cat_c === '1') dorfturnier_categories.push('C');
  if (req.body.cat_bp === '1') dorfturnier_categories.push('BP');
  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C,BP';
  let spielplan_file = null;
  let reglement_file = null;
  let flyer_file = null;
  let traktanden_file = null;
  let protokoll_file = null;
  if (req.files) {
    const sp = req.files.find(f => f.fieldname === 'spielplan_file');
    if (sp) spielplan_file = '/documents/' + sp.filename;
    const rg = req.files.find(f => f.fieldname === 'reglement_file');
    if (rg) reglement_file = '/documents/' + rg.filename;
    const fl = req.files.find(f => f.fieldname === 'flyer_file');
    if (fl) flyer_file = '/documents/' + fl.filename;
    const tr = req.files.find(f => f.fieldname === 'traktanden_file');
    if (tr) traktanden_file = '/documents/' + tr.filename;
    const pr = req.files.find(f => f.fieldname === 'protokoll_file');
    if (pr) protokoll_file = '/documents/' + pr.filename;
  }
  try {
    await db.query(\`
      INSERT INTO anlaesse (title, year, slug, body, has_form, form_type, dorfturnier_categories, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday, deadline, sort_order, is_archived, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file]);`;

// Nothing actually needs to change in the oldInsert block above, it was mostly correct but let's make sure it's pristine.
// Wait, in oldInsert `dCatsString` is built correctly. The issue is in edit.

const oldEdit = `app.post('/admin/anlaesse/:id/edit', requireRole('content'), uploadAny.any(), async (req, res) => {
  const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info } = req.body;
  let dorfturnier_categories = [];
  if (req.body.cat_a_b === '1') dorfturnier_categories.push('A_B');
  if (req.body.cat_z === '1') dorfturnier_categories.push('Z');
  if (req.body.cat_c === '1') dorfturnier_categories.push('C');
  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C';
  
  // Get existing values
  const [existing] = await db.query('SELECT spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file FROM anlaesse WHERE id = ?', [req.params.id]);
  let spielplan_file = existing[0] ? existing[0].spielplan_file : null;
  let reglement_file = existing[0] ? existing[0].reglement_file : null;
  let flyer_file = existing[0] ? existing[0].flyer_file : null;
  let traktanden_file = existing[0] ? existing[0].traktanden_file : null;
  let protokoll_file = existing[0] ? existing[0].protokoll_file : null;
  
  // Handle deletions
  if (req.body.delete_spielplan === '1') spielplan_file = null;
  if (req.body.delete_reglement === '1') reglement_file = null;
  if (req.body.delete_flyer === '1') flyer_file = null;
  if (req.body.delete_traktanden === '1') traktanden_file = null;
  if (req.body.delete_protokoll === '1') protokoll_file = null;
  
  // Handle new uploads
  if (req.files) {
    const sp = req.files.find(f => f.fieldname === 'spielplan_file');
    if (sp) spielplan_file = '/documents/' + sp.filename;
    const rg = req.files.find(f => f.fieldname === 'reglement_file');
    if (rg) reglement_file = '/documents/' + rg.filename;
    const fl = req.files.find(f => f.fieldname === 'flyer_file');
    if (fl) flyer_file = '/documents/' + fl.filename;
    const tr = req.files.find(f => f.fieldname === 'traktanden_file');
    if (tr) traktanden_file = '/documents/' + tr.filename;
    const pr = req.files.find(f => f.fieldname === 'protokoll_file');
    if (pr) protokoll_file = '/documents/' + pr.filename;
  }
  
  try {
    await db.query(\`
      UPDATE anlaesse 
      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, cat_a_b_info=?, cat_z_info=?, cat_c_info=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?
      WHERE id=?
    \`, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file, req.params.id]);`;

const newEdit = `app.post('/admin/anlaesse/:id/edit', requireRole('content'), uploadAny.any(), async (req, res) => {
  const { title, year, slug, body, has_form, form_type, deadline, sort_order, is_archived, cat_a_b_info, cat_z_info, cat_c_info, cat_beerpong_info, program_friday, program_saturday, program_sunday } = req.body;
  let dorfturnier_categories = [];
  if (req.body.cat_a_b === '1') dorfturnier_categories.push('A_B');
  if (req.body.cat_z === '1') dorfturnier_categories.push('Z');
  if (req.body.cat_c === '1') dorfturnier_categories.push('C');
  if (req.body.cat_bp === '1') dorfturnier_categories.push('BP');
  const dCatsString = dorfturnier_categories.join(',') || 'A_B,Z,C,BP';
  
  // Get existing values
  const [existing] = await db.query('SELECT spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file FROM anlaesse WHERE id = ?', [req.params.id]);
  let spielplan_file = existing[0] ? existing[0].spielplan_file : null;
  let reglement_file = existing[0] ? existing[0].reglement_file : null;
  let flyer_file = existing[0] ? existing[0].flyer_file : null;
  let traktanden_file = existing[0] ? existing[0].traktanden_file : null;
  let protokoll_file = existing[0] ? existing[0].protokoll_file : null;
  
  // Handle deletions
  if (req.body.delete_spielplan === '1') spielplan_file = null;
  if (req.body.delete_reglement === '1') reglement_file = null;
  if (req.body.delete_flyer === '1') flyer_file = null;
  if (req.body.delete_traktanden === '1') traktanden_file = null;
  if (req.body.delete_protokoll === '1') protokoll_file = null;
  
  // Handle new uploads
  if (req.files) {
    const sp = req.files.find(f => f.fieldname === 'spielplan_file');
    if (sp) spielplan_file = '/documents/' + sp.filename;
    const rg = req.files.find(f => f.fieldname === 'reglement_file');
    if (rg) reglement_file = '/documents/' + rg.filename;
    const fl = req.files.find(f => f.fieldname === 'flyer_file');
    if (fl) flyer_file = '/documents/' + fl.filename;
    const tr = req.files.find(f => f.fieldname === 'traktanden_file');
    if (tr) traktanden_file = '/documents/' + tr.filename;
    const pr = req.files.find(f => f.fieldname === 'protokoll_file');
    if (pr) protokoll_file = '/documents/' + pr.filename;
  }
  
  try {
    await db.query(\`
      UPDATE anlaesse 
      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, cat_a_b_info=?, cat_z_info=?, cat_c_info=?, cat_beerpong_info=?, program_friday=?, program_saturday=?, program_sunday=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?
      WHERE id=?
    \`, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file, req.params.id]);`;

if (content.includes(oldEdit)) {
  content = content.replace(oldEdit, newEdit);
} else if (content.includes(oldEdit.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldEdit.replace(/\n/g, '\r\n'), newEdit);
} else {
  console.error("Failed to find oldEdit target code block");
  process.exit(1);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed edit post handler');
