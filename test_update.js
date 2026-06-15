const db = require('./db');

async function testUpdate() {
  try {
    const id = 1; // Assuming there is an anlass with ID 1, we will just update where id is something valid or run a dry run.
    const [rows] = await db.query('SELECT id FROM anlaesse LIMIT 1');
    if (rows.length === 0) {
      console.log('No anlaesse to test');
      process.exit(0);
    }
    const testId = rows[0].id;
    
    const title = 'Test';
    const year = 2026;
    const slug = 'test';
    const body = 'test';
    const has_form = 1;
    const form_type = 'dorfturnier';
    const dCatsString = 'A_B,Z,C,BP';
    const cat_a_b_info = 'test info';
    const cat_z_info = '';
    const cat_c_info = '';
    const cat_beerpong_info = 'bp info';
    const program_friday = 'fri';
    const program_saturday = 'sat';
    const program_sunday = 'sun';
    const deadline = null;
    const sort_order = 0;
    const is_archived = 0;
    const spielplan_file = null;
    const reglement_file = null;
    const flyer_file = null;
    const traktanden_file = null;
    const protokoll_file = null;

    console.log('Running query...');
    await db.query(`
      UPDATE anlaesse 
      SET title=?, year=?, slug=?, body=?, has_form=?, form_type=?, dorfturnier_categories=?, cat_a_b_info=?, cat_z_info=?, cat_c_info=?, cat_beerpong_info=?, program_friday=?, program_saturday=?, program_sunday=?, deadline=?, sort_order=?, is_archived=?, spielplan_file=?, reglement_file=?, flyer_file=?, traktanden_file=?, protokoll_file=?
      WHERE id=?
    `, [title, year || null, slug, body, has_form ? 1 : 0, form_type || 'standard', dCatsString, cat_a_b_info || '', cat_z_info || '', cat_c_info || '', cat_beerpong_info || '', program_friday || '', program_saturday || '', program_sunday || '', deadline || null, sort_order || 0, is_archived ? 1 : 0, spielplan_file, reglement_file, flyer_file, traktanden_file, protokoll_file, testId]);
    console.log('Query success!');
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    process.exit(0);
  }
}
testUpdate();
