const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

// 1. Admin GET route
content = content.replace(
  "const [regs] = await db.query(`SELECT * FROM registrations_dorfturnier ORDER BY created_at DESC`);",
  "const [regs] = await db.query(`SELECT * FROM registrations_dorfturnier WHERE anlass_id = ? ORDER BY created_at DESC`, [anlass.id]);"
);

// 2. Admin POST new route
content = content.replace(
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n        await db.query(`\n          INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)\n          VALUES (?, ?, ?, ?, ?, ?)\n        `, [team_name, contact_name, contact_email, contact_phone, player_count, notes || '']);",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n        await db.query(`\n          INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n        `, [anlassId, category, team_name, contact_name, contact_email, contact_phone, player_count, notes || '']);"
);
content = content.replace( // LF fallback
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n        await db.query(`\r\n          INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)\r\n          VALUES (?, ?, ?, ?, ?, ?)\r\n        `, [team_name, contact_name, contact_email, contact_phone, player_count, notes || '']);",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n        await db.query(`\r\n          INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)\r\n          VALUES (?, ?, ?, ?, ?, ?, ?, ?)\r\n        `, [anlassId, category, team_name, contact_name, contact_email, contact_phone, player_count, notes || '']);"
);

// 3. Admin POST edit route
content = content.replace(
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n        await db.query(`\n          UPDATE registrations_dorfturnier \n          SET team_name=?, contact_name=?, contact_email=?, contact_phone=?, player_count=?, notes=? \n          WHERE id=?\n        `, [team_name, contact_name, contact_email, contact_phone, player_count, notes, regId]);",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n        await db.query(`\n          UPDATE registrations_dorfturnier \n          SET anlass_id=?, category=?, team_name=?, contact_name=?, contact_email=?, contact_phone=?, player_count=?, notes=? \n          WHERE id=?\n        `, [anlassId, category, team_name, contact_name, contact_email, contact_phone, player_count, notes, regId]);"
);
content = content.replace( // LF fallback
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n        await db.query(`\r\n          UPDATE registrations_dorfturnier \r\n          SET team_name=?, contact_name=?, contact_email=?, contact_phone=?, player_count=?, notes=? \r\n          WHERE id=?\r\n        `, [team_name, contact_name, contact_email, contact_phone, player_count, notes, regId]);",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n        await db.query(`\r\n          UPDATE registrations_dorfturnier \r\n          SET anlass_id=?, category=?, team_name=?, contact_name=?, contact_email=?, contact_phone=?, player_count=?, notes=? \r\n          WHERE id=?\r\n        `, [anlassId, category, team_name, contact_name, contact_email, contact_phone, player_count, notes, regId]);"
);

// 4. Public POST route
content = content.replace(
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n    if (!team_name || !contact_name || !contact_email || !contact_phone) {\n      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };\n      return res.redirect('/anlaesse#' + anlass.slug);\n    }\n    await db.query(`\n      INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)\n      VALUES (?, ?, ?, ?, ?, ?)\n    `, [team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);\n    \n    sendRegistrationConfirmation({\n      to: contact_email, type: 'dorfturnier', name: contact_name,\n      details: { 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }\n    })",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\n    if (!team_name || !category || !contact_name || !contact_email || !contact_phone) {\n      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };\n      return res.redirect('/anlaesse#' + anlass.slug);\n    }\n    await db.query(`\n      INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n    `, [anlass.id, category, team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);\n    \n    sendRegistrationConfirmation({\n      to: contact_email, type: 'dorfturnier', name: contact_name,\n      details: { 'Kategorie': category, 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }\n    })"
);
content = content.replace( // LF fallback
  "const { team_name, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n    if (!team_name || !contact_name || !contact_email || !contact_phone) {\r\n      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };\r\n      return res.redirect('/anlaesse#' + anlass.slug);\r\n    }\r\n    await db.query(`\r\n      INSERT INTO registrations_dorfturnier (team_name, contact_name, contact_email, contact_phone, player_count, notes)\r\n      VALUES (?, ?, ?, ?, ?, ?)\r\n    `, [team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);\r\n    \r\n    sendRegistrationConfirmation({\r\n      to: contact_email, type: 'dorfturnier', name: contact_name,\r\n      details: { 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }\r\n    })",
  "const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;\r\n    if (!team_name || !category || !contact_name || !contact_email || !contact_phone) {\r\n      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };\r\n      return res.redirect('/anlaesse#' + anlass.slug);\r\n    }\r\n    await db.query(`\r\n      INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)\r\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?)\r\n    `, [anlass.id, category, team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);\r\n    \r\n    sendRegistrationConfirmation({\r\n      to: contact_email, type: 'dorfturnier', name: contact_name,\r\n      details: { 'Kategorie': category, 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }\r\n    })"
);


fs.writeFileSync(file, content, 'utf8');
console.log('Done server updates');
