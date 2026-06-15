const fs = require('fs');
let content = fs.readFileSync('views/anlaesse.ejs', 'utf8');

// ============================================================
// 1. Add active Amtscup view (Matchballspende, Gruppen, Spielplan)
//    Insert BEFORE the "Registration Form" comment
// ============================================================
const formComment = '  <!-- Registration Form -->';

const amtscupActiveBlock = `  <% if (anlass.form_type === 'amtscup') { %>
    <%
      let groups = [];
      let games = [];
      try { groups = JSON.parse(anlass.amtscup_groups || '[]'); } catch(e){}
      try { games = JSON.parse(anlass.amtscup_games || '[]'); } catch(e){}
    %>
    <div style="margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
      <div class="anlass-docs-wrapper" style="margin-bottom: 0;">
        <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            Matchballspende
          </span>
          <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="anlass-docs-content" style="display: none;">
          <div style="background: var(--fcz-light-gray); padding: 2rem; border-radius: 8px;">
            <p style="margin-bottom: 1.5rem;">Unterstütze den FC Zell mit einer Matchballspende für den Amtscup!</p>
            <form action="/anlaesse/<%= anlass.id %>/matchballspende" method="POST" class="anlass-form-block">
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Vorname *</label>
                <input type="text" name="firstname" required style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Nachname *</label>
                <input type="text" name="lastname" required style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Betrag (CHF) *</label>
                <input type="number" name="amount" min="1" required style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Bemerkungen</label>
                <textarea name="remarks" rows="3" style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Matchballspende senden</button>
            </form>
          </div>
        </div>
      </div>

      <% if (groups.length > 0) { %>
        <div class="anlass-docs-wrapper" style="margin-bottom: 0;">
          <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Gruppen
            </span>
            <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="anlass-docs-content" style="display: none;">
            <div class="groups-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
              <% groups.forEach(g => { %>
                <div class="group-card" style="background: rgba(0,0,0,0.03); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.08);">
                  <h4 style="border-bottom: 2px solid rgba(245,158,11,0.3); padding-bottom: 0.5rem; margin-bottom: 1rem;"><%= g.name %></h4>
                  <ol style="padding-left: 1.5rem; margin: 0;">
                    <% g.teams.forEach(t => { %>
                      <li style="margin-bottom: 0.25rem;"><%= t %></li>
                    <% }) %>
                  </ol>
                </div>
              <% }) %>
            </div>
          </div>
        </div>
      <% } %>

      <% if (games.length > 0) { %>
        <div class="anlass-docs-wrapper" style="margin-bottom: 0;">
          <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Spielplan
            </span>
            <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="anlass-docs-content" style="display: none;">
            <div class="games-list" style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem;">
              <%
                const groupedGames = {};
                games.forEach(gm => {
                  const key = (gm.date || '') + '|' + (gm.day || '');
                  if (!groupedGames[key]) {
                    groupedGames[key] = { day: gm.day, date: gm.date, games: [] };
                  }
                  groupedGames[key].games.push(gm);
                });
              %>
              <% Object.values(groupedGames).forEach(group => { %>
                <div class="game-group">
                  <h4 style="color: var(--fcz-accent); border-bottom: 2px solid rgba(245,158,11,0.2); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                    <%= group.day ? group.day + (group.date ? ', ' : '') : '' %><%= group.date || 'Ohne Datum' %>
                  </h4>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <% group.games.forEach(gm => { %>
                      <div class="game-row" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08); padding: 1rem; border-radius: 6px;">
                        <div class="game-time" style="color: var(--fcz-gray-500); font-size: 0.9rem; flex: 1; min-width: 100px;">
                          <strong><%= gm.time %></strong>
                        </div>
                        <div class="game-teams" style="flex: 3; display: flex; align-items: center; gap: 0.5rem; min-width: 200px;">
                          <span style="flex: 1; text-align: right; font-weight: 500;"><%= gm.home %></span>
                          <span style="font-size: 0.8rem; color: var(--fcz-gray-400);">vs</span>
                          <span style="flex: 1; font-weight: 500;"><%= gm.away %></span>
                        </div>
                        <div class="game-score" style="flex: 1; text-align: right; font-weight: bold; font-size: 1.1rem; min-width: 60px;">
                          <% if (gm.scoreHome !== undefined && gm.scoreHome !== '' && gm.scoreAway !== undefined && gm.scoreAway !== '') { %>
                            <%= gm.scoreHome %>:<%= gm.scoreAway %>
                          <% } else { %>
                            <span style="color: var(--fcz-gray-400);">-:-</span>
                          <% } %>
                        </div>
                      </div>
                    <% }) %>
                  </div>
                </div>
              <% }) %>
            </div>
          </div>
        </div>
      <% } %>
    </div>
  <% } %>

`;

if (!content.includes("anlass.form_type === 'amtscup'")) {
  content = content.replace(formComment, amtscupActiveBlock + formComment);
  console.log('1. Active Amtscup block inserted.');
} else {
  console.log('1. Active Amtscup block already present.');
}

// ============================================================
// 2. Add Ewige Siegerliste into archive section
// ============================================================
const archiveGalleriesComment = '              <!-- Galleries for this archived anlass -->';

const siegerliste = `
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

if (!content.includes('historicalAmtscupWinners')) {
  content = content.replace(archiveGalleriesComment, siegerliste + '\n' + archiveGalleriesComment);
  console.log('2. Ewige Siegerliste inserted into archive.');
} else {
  console.log('2. Ewige Siegerliste already present.');
}

// ============================================================
// 3. Add archive Amtscup view (groups + spielplan for archived entries)
// ============================================================
const archAmtscupTarget = '              <% if (archAnlass.flyer_file || archAnlass.spielplan_file || archAnlass.reglement_file || archAnlass.traktanden_file || archAnlass.protokoll_file) { %>';

const archAmtscupBlock = `              <% if (archAnlass.form_type === 'amtscup') { %>
                <% 
                  let archGroups = [];
                  let archGames = [];
                  try { archGroups = JSON.parse(archAnlass.amtscup_groups || '[]'); } catch(e){}
                  try { archGames = JSON.parse(archAnlass.amtscup_games || '[]'); } catch(e){}
                %>
                <% if (archGroups.length > 0) { %>
                  <div class="anlass-docs-wrapper archive-docs-wrapper" style="margin-bottom: 2rem;">
                    <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Gruppen
                      </span>
                      <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="anlass-docs-content" style="display: none;">
                      <div class="groups-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                        <% archGroups.forEach(g => { %>
                          <div class="group-card" style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                            <h4 style="color: #fff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem; margin-bottom: 1rem;"><%= g.name %></h4>
                            <ol style="padding-left: 1.5rem; margin: 0; color: rgba(255,255,255,0.8);">
                              <% g.teams.forEach(t => { %>
                                <li style="margin-bottom: 0.25rem;"><%= t %></li>
                              <% }) %>
                            </ol>
                          </div>
                        <% }) %>
                      </div>
                    </div>
                  </div>
                <% } %>

                <% if (archGames.length > 0) { %>
                  <div class="anlass-docs-wrapper archive-docs-wrapper" style="margin-bottom: 2rem;">
                    <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Spielplan
                      </span>
                      <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="anlass-docs-content" style="display: none;">
                      <div class="games-list" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <% 
                          const archGroupedGames = {};
                          archGames.forEach(gm => {
                            const key = (gm.date || '') + '|' + (gm.day || '');
                            if (!archGroupedGames[key]) {
                              archGroupedGames[key] = { day: gm.day, date: gm.date, games: [] };
                            }
                            archGroupedGames[key].games.push(gm);
                          });
                        %>
                        <% Object.values(archGroupedGames).forEach(group => { %>
                          <div class="game-group">
                            <h4 style="color: #fff; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                              <%= group.day ? group.day + (group.date ? ', ' : '') : '' %><%= group.date || 'Ohne Datum' %>
                            </h4>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                              <% group.games.forEach(gm => { %>
                                <div class="game-row" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 6px;">
                                  <div class="game-time" style="color: rgba(255,255,255,0.6); font-size: 0.9rem; flex: 1; min-width: 100px;">
                                    <strong><%= gm.time %></strong>
                                  </div>
                                  <div class="game-teams" style="flex: 3; display: flex; align-items: center; gap: 0.5rem; min-width: 200px;">
                                    <span style="flex: 1; text-align: right; font-weight: 500; color: rgba(255,255,255,0.9);"><%= gm.home %></span>
                                    <span style="font-size: 0.8rem; color: rgba(255,255,255,0.4);">vs</span>
                                    <span style="flex: 1; font-weight: 500; color: rgba(255,255,255,0.9);"><%= gm.away %></span>
                                  </div>
                                  <div class="game-score" style="flex: 1; text-align: right; font-weight: bold; font-size: 1.1rem; color: var(--fcz-accent); min-width: 60px;">
                                    <% if (gm.scoreHome !== undefined && gm.scoreHome !== '' && gm.scoreAway !== undefined && gm.scoreAway !== '') { %>
                                      <%= gm.scoreHome %>:<%= gm.scoreAway %>
                                    <% } else { %>
                                      <span style="color: rgba(255,255,255,0.3);">-:-</span>
                                    <% } %>
                                  </div>
                                </div>
                              <% }) %>
                            </div>
                          </div>
                        <% }) %>
                      </div>
                    </div>
                  </div>
                <% } %>
              <% } %>

`;

if (!content.includes("archAnlass.form_type === 'amtscup'")) {
  content = content.replace(archAmtscupTarget, archAmtscupBlock + archAmtscupTarget);
  console.log('3. Archive Amtscup block inserted.');
} else {
  console.log('3. Archive Amtscup block already present.');
}

fs.writeFileSync('views/anlaesse.ejs', content);
console.log('Done! All changes applied to views/anlaesse.ejs');
