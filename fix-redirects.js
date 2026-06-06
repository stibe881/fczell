const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const replacements = [
  {
    find: /req\.session\.flash = { type: 'success', msg: 'News aktualisiert\.' };\s+res\.redirect\('\/admin\/news'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'News aktualisiert.' };\n    res.redirect('/admin/news/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Termin aktualisiert\.' };\s+res\.redirect\('\/admin\/events'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Termin aktualisiert.' };\n    res.redirect('/admin/events/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Anlass aktualisiert\.' };\s+res\.redirect\(is_archived \? '\/admin\/anlaesse\/archiv' : '\/admin\/anlaesse'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Anlass aktualisiert.' };\n    res.redirect('/admin/anlaesse/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Seite aktualisiert\.' };\s+res\.redirect\('\/admin\/pages'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Seite aktualisiert.' };\n    res.redirect('/admin/pages/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Mitglied aktualisiert\.' };\s+res\.redirect\('\/admin\/vorstand'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Mitglied aktualisiert.' };\n    res.redirect('/admin/vorstand/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Sponsor aktualisiert\.' };\s+res\.redirect\('\/admin\/sponsors'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Sponsor aktualisiert.' };\n    res.redirect('/admin/sponsors/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Bandenwerber aktualisiert\.' };\s+res\.redirect\('\/admin\/advertisers'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Bandenwerber aktualisiert.' };\n    res.redirect('/admin/advertisers/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Team aktualisiert\.' };\s+res\.redirect\('\/admin\/teams'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Team aktualisiert.' };\n    res.redirect('/admin/teams/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Job aktualisiert\.' };\s+res\.redirect\('\/admin\/jobs'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Job aktualisiert.' };\n    res.redirect('/admin/jobs/' + req.params.id + '/edit');"
  },
  {
    find: /req\.session\.flash = { type: 'success', msg: 'Benutzer aktualisiert\.' };\s+res\.redirect\('\/admin\/users'\);/,
    replace: "req.session.flash = { type: 'success', msg: 'Benutzer aktualisiert.' };\n    res.redirect('/admin/users/' + req.params.id + '/edit');"
  }
];

let changed = false;
replacements.forEach(r => {
  if (content.match(r.find)) {
    content = content.replace(r.find, r.replace);
    changed = true;
  }
});

if (changed) {
  fs.writeFileSync('server.js', content, 'utf8');
  console.log('Update redirects applied successfully.');
} else {
  console.log('No matches found.');
}
