const db = require('./db');

async function migrate() {
  try {
    // Wait for DB initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add gallery_id column if it doesn't exist
    try {
      await db.query(`ALTER TABLE gallery_photos ADD COLUMN gallery_id INT`);
      console.log('Added gallery_id to gallery_photos');
    } catch (e) {
      // Ignore if exists
    }

    try {
      await db.query(`ALTER TABLE gallery_photos MODIFY COLUMN gallery VARCHAR(255)`);
      console.log('Modified gallery column in gallery_photos to allow NULLs');
    } catch (e) {
      // Ignore
    }

    const [rows] = await db.query(`SELECT DISTINCT gallery FROM gallery_photos WHERE gallery_id IS NULL AND gallery IS NOT NULL AND gallery != ''`);
    console.log(`Found ${rows.length} unique text galleries to migrate`);

    // Fetch the Archiv anlass id
    const [archivRows] = await db.query(`SELECT id FROM anlaesse WHERE slug = 'archiv'`);
    let archivId = archivRows.length > 0 ? archivRows[0].id : null;

    for (const row of rows) {
      const galleryName = row.gallery;
      
      // Determine anlass
      let assignedAnlassId = null;
      if (galleryName === 'juniorenlager') {
        const [jl] = await db.query(`SELECT id FROM anlaesse WHERE slug = 'juniorenlager'`);
        if (jl.length) assignedAnlassId = jl[0].id;
      } else if (galleryName === 'dorfturnier') {
        const [dt] = await db.query(`SELECT id FROM anlaesse WHERE slug = 'dorfturnier'`);
        if (dt.length) assignedAnlassId = dt[0].id;
      } else {
        assignedAnlassId = archivId;
      }

      // Create gallery entry
      const [res] = await db.query(`INSERT INTO galleries (name, anlass_id) VALUES (?, ?)`, [galleryName, assignedAnlassId]);
      const galleryId = res.insertId;

      // Update photos
      await db.query(`UPDATE gallery_photos SET gallery_id = ? WHERE gallery = ? AND gallery_id IS NULL`, [galleryId, galleryName]);
      console.log(`Migrated ${galleryName} -> ID ${galleryId} (Anlass: ${assignedAnlassId})`);
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
