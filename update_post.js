const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `  } else if (anlass.form_type === 'dorfturnier') {
    const { team_name, category, contact_name, contact_email, contact_phone, player_count, notes } = req.body;
    if (!team_name || !category || !contact_name || !contact_email || !contact_phone) {
      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }
    await db.query(\`
      INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`, [anlass.id, category, team_name, contact_name, contact_email, contact_phone, player_count || 0, notes || '']);
    
    sendRegistrationConfirmation({
      to: contact_email, type: 'dorfturnier', name: contact_name,
      details: { 'Kategorie': category, 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': notes || '-' }
    }).catch(err => console.error('E-Mail Fehler:', err));`;

const newCode = `  } else if (anlass.form_type === 'dorfturnier') {
    const { category, notes } = req.body;
    let team_name, contact_name, contact_email, contact_phone, player_count, dbNotes;
    let emailDetails = { 'Kategorie': category };

    if (!category) {
      req.session.flash = { type: 'error', msg: 'Bitte Kategorie auswählen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }

    if (category.includes('A & B')) {
      team_name = req.body.team_name_ab;
      contact_name = req.body.contact_name_ab;
      contact_email = req.body.contact_email_ab;
      contact_phone = req.body.contact_phone_ab;
      player_count = req.body.player_count_ab;
      dbNotes = notes || '';
      Object.assign(emailDetails, { 'Teamname': team_name, 'Kontaktperson': contact_name, 'E-Mail': contact_email, 'Telefon': contact_phone, 'Anzahl Spieler': player_count || '-', 'Bemerkungen': dbNotes || '-' });
    } else if (category.includes('Z)')) {
      team_name = req.body.contact_name_z;
      contact_name = req.body.contact_name_z;
      contact_email = req.body.contact_email_z;
      contact_phone = '-';
      player_count = 1;
      dbNotes = notes || '';
      Object.assign(emailDetails, { 'Vorname Name': contact_name, 'E-Mail': contact_email, 'Bemerkungen': dbNotes || '-' });
    } else if (category.includes('C)')) {
      team_name = req.body.contact_name_c;
      contact_name = req.body.contact_name_c;
      contact_email = req.body.contact_email_c;
      contact_phone = '-';
      player_count = 1;
      let wohnort = req.body.wohnort_c || '';
      let jahrgang = req.body.jahrgang_c || '';
      dbNotes = \`Wohnort: \${wohnort}\\nJahrgang: \${jahrgang}\`;
      if (notes) dbNotes += \`\\nBemerkungen: \${notes}\`;
      Object.assign(emailDetails, { 'Vorname Name': contact_name, 'E-Mail': contact_email, 'Wohnort': wohnort, 'Jahrgang': jahrgang, 'Bemerkungen': notes || '-' });
    }

    if (!team_name || !contact_name || !contact_email) {
      req.session.flash = { type: 'error', msg: 'Bitte alle Pflichtfelder ausfüllen.' };
      return res.redirect('/anlaesse#' + anlass.slug);
    }

    await db.query(\`
      INSERT INTO registrations_dorfturnier (anlass_id, category, team_name, contact_name, contact_email, contact_phone, player_count, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    \`, [anlass.id, category, team_name, contact_name, contact_email, contact_phone, player_count || 0, dbNotes]);
    
    sendRegistrationConfirmation({
      to: contact_email, type: 'dorfturnier', name: contact_name,
      details: emailDetails
    }).catch(err => console.error('E-Mail Fehler:', err));`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
} else if (content.includes(oldCode.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldCode.replace(/\n/g, '\r\n'), newCode);
} else {
  console.error("Could not find the target codeblock");
  process.exit(1);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated dorfturnier POST endpoint');
