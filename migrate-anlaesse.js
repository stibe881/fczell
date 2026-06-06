const db = require('./db');

async function migrate() {
  // Add column
  try {
    await db.query(`ALTER TABLE anlaesse ADD COLUMN is_archived TINYINT(1) DEFAULT 0`);
    console.log('Added is_archived column');
  } catch (e) {
    // Ignore if exists
  }

  // Get the old Archiv anlass ID
  const [archivRows] = await db.query(`SELECT id FROM anlaesse WHERE slug = 'archiv'`);
  let archivId = null;
  if (archivRows.length) archivId = archivRows[0].id;

  if (archivId) {
    // Get all galleries assigned to the old Archiv anlass
    const [galleries] = await db.query(`SELECT * FROM galleries WHERE anlass_id = ?`, [archivId]);
    
    for (const g of galleries) {
      // Create a new archived Anlass for each gallery
      const title = g.name; // e.g. "Dorfturnier 2017"
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const [res] = await db.query(`INSERT INTO anlaesse (title, slug, body, is_archived) VALUES (?, ?, ?, 1)`, [title, slug, '']);
      const newAnlassId = res.insertId;
      
      // Reassign gallery to the new Anlass
      await db.query(`UPDATE galleries SET anlass_id = ? WHERE id = ?`, [newAnlassId, g.id]);
      console.log(`Created archived anlass ${title} and reassigned gallery`);
    }

    // Delete the old 'archiv' Anlass
    await db.query(`DELETE FROM anlaesse WHERE id = ?`, [archivId]);
    console.log('Deleted the old generic Archiv anlass');
  }

  process.exit(0);
}

migrate();
