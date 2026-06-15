const fs = require('fs');
let content = fs.readFileSync('views/anlaesse.ejs', 'utf8');

// 1 & 2 & 3. Re-implement Amtscup active view (Groups, Spielplan grouped by date, Matchballspende at the top)
const oldAmtscupRegex = /<% if \(groups\.length > 0\) { %>[\s\S]*?(?=<% } else if \(anlass\.form_type === 'dorfturnier'\) { %>)/;

const newAmtscupContent = `    <div style="margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 2rem;">
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
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Firma (Optional)</label>
                <input type="text" name="company" style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">E-Mail *</label>
                <input type="email" name="email" required style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;">
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display:block; font-weight:bold; margin-bottom:0.5rem;">Betrag (CHF) *</label>
                <input type="number" name="amount" required style="width:100%; padding:0.5rem; border:1px solid #ccc; border-radius:4px;" value="100">
              </div>
              <button type="submit" class="btn btn-primary" style="background: var(--fcz-red); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Spenden</button>
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
                <div class="group-card" style="background: var(--fcz-light-gray); padding: 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                  <h4 style="color: var(--fcz-accent); border-bottom: 2px solid rgba(245,158,11,0.2); padding-bottom: 0.5rem; margin-bottom: 1rem;"><%= g.name %></h4>
                  <ol style="padding-left: 1.5rem; margin: 0; color: #4b5563;">
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
                      <div class="game-row" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #e5e7eb; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div class="game-time" style="color: #6b7280; font-size: 0.9rem; flex: 1; min-width: 100px;">
                          <strong><%= gm.time %></strong>
                        </div>
                        <div class="game-teams" style="flex: 2; text-align: center; font-weight: 500; font-size: 1.1rem; min-width: 200px;">
                          <%= gm.home %> <span style="color: #9ca3af; margin: 0 0.5rem;">:</span> <%= gm.away %>
                        </div>
                        <div class="game-result" style="flex: 1; text-align: right; font-weight: bold; font-size: 1.2rem; min-width: 100px; color: var(--fcz-dark);">
                          <%= gm.result %>
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
  `;

content = content.replace(oldAmtscupRegex, newAmtscupContent);

// 4. Archive Amtscup block
const archiveTarget = `              <!-- Galleries for this archived anlass -->`;
const archiveAmtscupContent = `              <% if (archAnlass.form_type === 'amtscup') { %>
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
                                  <div class="game-teams" style="flex: 2; text-align: center; font-weight: 500; font-size: 1.1rem; min-width: 200px; color: #fff;">
                                    <%= gm.home %> <span style="color: rgba(255,255,255,0.3); margin: 0 0.5rem;">:</span> <%= gm.away %>
                                  </div>
                                  <div class="game-result" style="flex: 1; text-align: right; font-weight: bold; font-size: 1.2rem; min-width: 100px; color: #fff;">
                                    <%= gm.result %>
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

              <!-- Galleries for this archived anlass -->`;

content = content.replace(archiveTarget, archiveAmtscupContent);

// 5. New Request: Make juniorenlagerDocs, amtscupDocs, dorfturnierDocs collapsible
const jlTarget = /<% if \(juniorenlagerDocs && juniorenlagerDocs\.length > 0\) { %>\s*<div class="anlass-subsection">\s*<h3>Dokumente<\/h3>\s*<ul class="doc-list">\s*<% juniorenlagerDocs\.forEach\(doc => { %>\s*<li>\s*<a href="<%= doc\.file_path %>" target="_blank" rel="noopener" class="doc-link">\s*<svg[^>]*>.*?<\/svg>\s*<span><%= doc\.title %><\/span>\s*<\/a>\s*<\/li>\s*<% }\) %>\s*<\/ul>\s*<\/div>\s*<% } %>/g;

const jlReplace = `<% if (juniorenlagerDocs && juniorenlagerDocs.length > 0) { %>
      <div class="anlass-docs-wrapper" style="margin-bottom: 2rem;">
        <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Dokumente
          </span>
          <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="anlass-docs-content" style="display: none;">
          <ul class="doc-list" style="margin-top: 1rem;">
            <% juniorenlagerDocs.forEach(doc => { %>
              <li>
                <a href="<%= doc.file_path %>" target="_blank" rel="noopener" class="doc-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span><%= doc.title %></span>
                </a>
              </li>
            <% }) %>
          </ul>
        </div>
      </div>
    <% } %>`;

const amtscupDocsTarget = /<% if \(amtscupDocs && amtscupDocs\.length > 0\) { %>\s*<div class="anlass-subsection">\s*<h3>Spielpläne & Reglement<\/h3>\s*<ul class="doc-list">\s*<% amtscupDocs\.forEach\(doc => { %>\s*<li>\s*<a href="<%= doc\.file_path %>" target="_blank" rel="noopener" class="doc-link">\s*<svg[^>]*>.*?<\/svg>\s*<span><%= doc\.title %><\/span>\s*<\/a>\s*<\/li>\s*<% }\) %>\s*<\/ul>\s*<\/div>\s*<% } %>/g;

const amtscupDocsReplace = `<% if (amtscupDocs && amtscupDocs.length > 0) { %>
      <div class="anlass-docs-wrapper" style="margin-bottom: 2rem;">
        <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Spielpläne & Reglement
          </span>
          <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="anlass-docs-content" style="display: none;">
          <ul class="doc-list" style="margin-top: 1rem;">
            <% amtscupDocs.forEach(doc => { %>
              <li>
                <a href="<%= doc.file_path %>" target="_blank" rel="noopener" class="doc-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span><%= doc.title %></span>
                </a>
              </li>
            <% }) %>
          </ul>
        </div>
      </div>
    <% } %>`;

const dtDocsTarget = /<% if \(dorfturnierDocs && dorfturnierDocs\.length > 0\) { %>\s*<div class="anlass-subsection">\s*<h3>Spielpläne<\/h3>\s*<ul class="doc-list">\s*<% dorfturnierDocs\.forEach\(doc => { %>\s*<li>\s*<a href="<%= doc\.file_path %>" target="_blank" rel="noopener" class="doc-link">\s*<svg[^>]*>.*?<\/svg>\s*<span><%= doc\.title %><\/span>\s*<\/a>\s*<\/li>\s*<% }\) %>\s*<\/ul>\s*<\/div>\s*<% } %>/g;

const dtDocsReplace = `<% if (dorfturnierDocs && dorfturnierDocs.length > 0) { %>
      <div class="anlass-docs-wrapper" style="margin-bottom: 2rem;">
        <button class="anlass-docs-toggle" onclick="toggleDocs(this)">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Spielpläne
          </span>
          <svg class="anlass-docs-chevron" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="anlass-docs-content" style="display: none;">
          <ul class="doc-list" style="margin-top: 1rem;">
            <% dorfturnierDocs.forEach(doc => { %>
              <li>
                <a href="<%= doc.file_path %>" target="_blank" rel="noopener" class="doc-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span><%= doc.title %></span>
                </a>
              </li>
            <% }) %>
          </ul>
        </div>
      </div>
    <% } %>`;

content = content.replace(jlTarget, jlReplace);
content = content.replace(amtscupDocsTarget, amtscupDocsReplace);
content = content.replace(dtDocsTarget, dtDocsReplace);

fs.writeFileSync('views/anlaesse.ejs', content);
console.log("Successfully rebuilt anlaesse.ejs");
