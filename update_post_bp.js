const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'server.js');
let content = fs.readFileSync(file, 'utf8');

const oldCode = `    } else if (category.includes('C)')) {
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
    }`;

const newCode = `    } else if (category.includes('C)')) {
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
    } else if (category.includes('Beerpong')) {
      team_name = req.body.team_name_bp;
      contact_name = req.body.contact_name_bp1; // Use player 1 as contact
      contact_email = req.body.contact_email_bp;
      contact_phone = '-';
      player_count = 2;
      let player2 = req.body.contact_name_bp2 || '';
      dbNotes = \`Spieler 1: \${contact_name}\\nSpieler 2: \${player2}\`;
      if (notes) dbNotes += \`\\nBemerkungen: \${notes}\`;
      Object.assign(emailDetails, { 'Teamname': team_name, 'Spieler 1': contact_name, 'Spieler 2': player2, 'E-Mail': contact_email, 'Bemerkungen': notes || '-' });
    }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
} else if (content.includes(oldCode.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldCode.replace(/\n/g, '\r\n'), newCode);
} else {
  console.error("Could not find the target codeblock");
  process.exit(1);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated dorfturnier POST endpoint for Beerpong');
