const fs = require('fs');

const replacement = `<% if (team.staff && team.staff.length > 0) { %>
          <% team.staff.forEach(s => { %>
            <div>
              <dt><%= s.role %></dt>
              <dd>
                <%= s.name %>
                <% if (s.phone) { %> <br><a href="tel:<%= s.phone.replace(/\\s/g,'') %>" style="color:var(--fcz-gray-600); text-decoration:none; font-size:0.9em;"><%= s.phone %></a><% } %>
                <% if (s.email) { %> <br><a href="mailto:<%= s.email %>" style="color:var(--fcz-gray-600); text-decoration:none; font-size:0.9em;"><%= s.email %></a><% } %>
              </dd>
            </div>
          <% }) %>
        <% } %>`;

['views/mannschaften.ejs', 'views/aktive.ejs', 'views/team-single.ejs'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /<% if \(team\.trainer\) { %>[\s\S]*?<% if \(team\.physio\) { %>.*?<\/div><% } %>/g;
    content = content.replace(regex, replacement);
    // Also team-single.ejs might have slightly different format:
    const regex2 = /<% if \(team\.trainer\) { %>[\s\S]*?<% if \(team\.physio\) { %>.*?<\/div>\n/g;
    content = content.replace(regex2, replacement + '\n');
    fs.writeFileSync(file, content);
  }
});
