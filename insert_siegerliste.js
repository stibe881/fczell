const fs = require('fs');
let content = fs.readFileSync('views/anlaesse.ejs', 'utf8');

const targetStr = '              <!-- Galleries for this archived anlass -->';
const insertContent = `
                <!-- Ewige Siegerliste -->
                <%
                  const historicalAmtscupWinners = {
                    2025: "FC Zell", 2024: "FC Algro", 2023: "FC Wauwil-Egolzwil", 2022: "FC Dagmersellen", 2021: "FC Dagmersellen",
                    2020: "FC Schötz", 2019: "FC Dagmersellen", 2018: "FC Grosswangen-Ettiswil", 2017: "FC Algro", 2016: "FC Schötz",
                    2015: "FC Willisau", 2014: "FC Zell", 2013: "FC Wauwil-Egolzwil", 2012: "FC Algro", 2011: "FC Dagmersellen",
                    2010: "SC Reiden", 2009: "SC Nebikon", 2008: "FC Zell", 2007: "FC Dagmersellen", 2006: "SC Reiden",
                    2005: "FC Algro", 2004: "FC Dagmersellen", 2003: "SC Reiden", 2002: "SC Reiden", 2001: "FC Zell",
                    2000: "SC Reiden", 1999: "FC Algro", 1998: "FC Algro", 1995: "SC Reiden", 1994: "FC Algro",
                    1991: "FC Schötz", 1990: "FC Schötz", 1989: "FC Schötz", 1988: "FC Willisau", 1987: "FC Schötz",
                    1986: "FC Willisau", 1985: "FC Dagmersellen", 1984: "SC Nebikon", 1983: "FC Zell", 1982: "FC Zell",
                    1981: "SC Reiden", 1980: "FC Zell", 1979: "FC Zell", 1978: "FC Willisau", 1977: "FC Zell",
                    1976: "SC Reiden", 1975: "FC Zell", 1974: "FC Schötz", 1973: "FC Willisau", 1972: "FC Zell",
                    1971: "FC Schötz", 1970: "FC Willisau", 1969: "FC Zell"
                  };
                  
                  let combinedWinners = { ...historicalAmtscupWinners };
                  // Add dynamically archived winners from DB
                  if (typeof archivedAnlaesse !== 'undefined') {
                    archivedAnlaesse.forEach(ev => {
                      if (ev.form_type === 'amtscup' && ev.amtscup_winner && ev.year) {
                        combinedWinners[ev.year] = ev.amtscup_winner;
                      }
                    });
                  }
                  
                  let currentArchYear = parseInt(year);
                  if (isNaN(currentArchYear)) currentArchYear = new Date().getFullYear();
                  
                  let tally = {};
                  Object.keys(combinedWinners).forEach(y => {
                    const yInt = parseInt(y);
                    if (yInt <= currentArchYear) {
                      const winner = combinedWinners[y];
                      tally[winner] = (tally[winner] || 0) + 1;
                    }
                  });
                  
                  const sortedLeaderboard = Object.keys(tally).map(team => ({
                    team: team,
                    count: tally[team]
                  })).sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));
                %>
                
                <% if (sortedLeaderboard.length > 0) { %>
                  <div class="anlass-docs-wrapper archive-docs-wrapper" style="margin-bottom: 2rem;">
                    <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15c-3.87 0-7-3.13-7-7v-1h14v1c0 3.87-3.13 7-7 7Z"></path><path d="M12 15v7"></path><path d="M8 22h8"></path><path d="M5 8H3a2 2 0 0 0-2 2v1c0 2.21 1.79 4 4 4h0"></path><path d="M19 8h2a2 2 0 0 1 2 2v1c0 2.21-1.79 4-4 4h0"></path></svg>
                        Ewige Siegerliste (Stand <%= currentArchYear %>)
                      </span>
                      <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="anlass-docs-content" style="display: none;">
                      <ul style="list-style: none; padding: 0; margin: 1rem 0 0 0; color: rgba(255,255,255,0.9);">
                        <% sortedLeaderboard.forEach((entry, index) => { %>
                          <li style="display: flex; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); background: <%= index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' %>;">
                            <span style="font-weight: <%= index < 3 ? 'bold' : 'normal' %>;"><%= index + 1 %>. <%= entry.team %></span>
                            <span style="font-weight: bold; color: var(--fcz-accent);"><%= entry.count %> Titel</span>
                          </li>
                        <% }) %>
                      </ul>
                    </div>
                  </div>
                <% } %>
`;

// Avoid double insertion if run twice
if (!content.includes('historicalAmtscupWinners')) {
  content = content.replace(targetStr, insertContent + '\n' + targetStr);
  fs.writeFileSync('views/anlaesse.ejs', content);
  console.log('Ewige Siegerliste inserted into views/anlaesse.ejs');
} else {
  console.log('Already inserted.');
}
