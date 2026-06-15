const fs = require('fs');

let content = fs.readFileSync('views/anlaesse.ejs', 'utf8');

const targetStr = `            <% } else if (anlass.form_type === 'dorfturnier') { %>`;

const newAmtscupContent = fs.readFileSync('new_amtscup_utf8.txt', 'utf8');

const injection = `            <% } else if (anlass.form_type === 'amtscup') { %>
            <% 
              let groups = [];
              let games = [];
              try { groups = JSON.parse(anlass.amtscup_groups || '[]'); } catch(e){}
              try { games = JSON.parse(anlass.amtscup_games || '[]'); } catch(e){}
            %>
            <% if (groups.length > 0) { %>
${newAmtscupContent}
            <% } %>
`;

if (!content.includes(`anlass.form_type === 'amtscup'`)) {
  content = content.replace(targetStr, injection + targetStr);
  fs.writeFileSync('views/anlaesse.ejs', content);
  console.log('Restored active Amtscup view!');
} else {
  console.log('Already restored?');
}
