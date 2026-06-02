const fs = require('fs');

const addition = `
      <% if (team.contact_phone || team.contact_email) { %>
        <div style="margin-top: 1rem; font-size:0.95rem; color:var(--fcz-gray-700);">
          <strong>Kontakt:</strong><br>
          <% if (team.contact_phone) { %><a href="tel:<%= team.contact_phone.replace(/\\s/g, '') %>" style="color:inherit; text-decoration:none; margin-right:1rem;"><%= team.contact_phone %></a><% } %>
          <% if (team.contact_email) { %><a href="mailto:<%= team.contact_email %>" style="color:inherit; text-decoration:none;"><%= team.contact_email %></a><% } %>
        </div>
      <% } %>`;

let c = fs.readFileSync('views/mannschaften.ejs', 'utf8');
c = c.replace(/(<% if \(team\.extra\) { %>[\s\S]*?<% } %>)/g, match => match + addition);
fs.writeFileSync('views/mannschaften.ejs', c);

let d = fs.readFileSync('views/team-detail.ejs', 'utf8');
d = d.replace(/(<% if \(team\.extra\) { %><div><dt>Info<\/dt><dd><%- team\.extra %><\/dd><\/div><% } %>)/g, match => match + `
        <% if (team.contact_phone || team.contact_email) { %>
          <div>
            <dt>Kontakt</dt>
            <dd>
              <% if (team.contact_phone) { %><a href="tel:<%= team.contact_phone.replace(/\\s/g, '') %>" style="color:var(--fcz-gray-600); text-decoration:none;"><%= team.contact_phone %></a><br><% } %>
              <% if (team.contact_email) { %><a href="mailto:<%= team.contact_email %>" style="color:var(--fcz-gray-600); text-decoration:none;"><%= team.contact_email %></a><% } %>
            </dd>
          </div>
        <% } %>`);
fs.writeFileSync('views/team-detail.ejs', d);
