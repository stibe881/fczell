const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'anlaesse.ejs');
let content = fs.readFileSync(file, 'utf8');

const oldHtml = `            <% } else if (anlass.form_type === 'dorfturnier') { %>
              <div class="form-row">
                <label><span>Kategorie *</span>
                  <select name="category" required>
                    <option value="">Bitte wählen...</option>
                    <option value="Firmen & Vereine (Kategorie A & B)">Firmen & Vereine (Kategorie A & B)</option>
                    <option value="Dorfturnier (Kategorie Z)">Dorfturnier (Kategorie Z)</option>
                    <option value="Schülerturnier (Kategorie C)">Schülerturnier (Kategorie C)</option>
                  </select>
                </label>
                <label><span>Teamname *</span><input type="text" name="team_name" required /></label>
              </div>
              <div class="form-row">
                <label><span>Kontaktperson *</span><input type="text" name="contact_name" required /></label>
                <label><span>E-Mail *</span><input type="email" name="contact_email" required /></label>
              </div>
              <div class="form-row">
                <label><span>Telefon *</span><input type="tel" name="contact_phone" required /></label>
                <label><span>Anzahl Spieler *</span><input type="number" name="player_count" min="1" max="30" required /></label>
              </div>`;

const newHtml = `            <% } else if (anlass.form_type === 'dorfturnier') { %>
              <% const dCats = (anlass && anlass.dorfturnier_categories) ? anlass.dorfturnier_categories.split(',') : ['A_B', 'Z', 'C']; %>
              <div class="form-row">
                <label><span>Kategorie *</span>
                  <select name="category" id="dorfturnier-category" required onchange="updateDorfturnierFields()">
                    <option value="">Bitte wählen...</option>
                    <% if(dCats.includes('A_B')) { %><option value="Firmen & Vereine (Kategorie A & B)">Firmen & Vereine (Kategorie A & B)</option><% } %>
                    <% if(dCats.includes('Z')) { %><option value="Dorfturnier (Kategorie Z)">Dorfturnier (Kategorie Z)</option><% } %>
                    <% if(dCats.includes('C')) { %><option value="Schüler*innenturnier (Kategorie C)">Schüler*innenturnier (Kategorie C)</option><% } %>
                  </select>
                </label>
              </div>

              <!-- Info Texts -->
              <div id="info-kat-ab" class="dorfturnier-info" style="display:none; background: #e0f2fe; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                <strong>Info Firmen & Vereine:</strong><br>
                <%= anlass.cat_a_b_info || '' %>
              </div>
              <div id="info-kat-z" class="dorfturnier-info" style="display:none; background: #e0f2fe; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                <strong>Info Dorfturnier:</strong><br>
                <%= anlass.cat_z_info || '' %>
              </div>
              <div id="info-kat-c" class="dorfturnier-info" style="display:none; background: #e0f2fe; padding: 1rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.9rem;">
                <strong>Info Schüler*innenturnier:</strong><br>
                <%= anlass.cat_c_info || '' %>
              </div>

              <!-- Fields Kat A & B -->
              <div id="fields-kat-ab" class="dorfturnier-fields" style="display:none;">
                <label><span>Teamname *</span><input type="text" name="team_name_ab" class="dorfturnier-input-ab" /></label>
                <div class="form-row">
                  <label><span>Kontaktperson *</span><input type="text" name="contact_name_ab" class="dorfturnier-input-ab" /></label>
                  <label><span>E-Mail *</span><input type="email" name="contact_email_ab" class="dorfturnier-input-ab" /></label>
                </div>
                <div class="form-row">
                  <label><span>Telefon *</span><input type="tel" name="contact_phone_ab" class="dorfturnier-input-ab" /></label>
                  <label><span>Anzahl Spieler *</span><input type="number" name="player_count_ab" min="1" max="30" class="dorfturnier-input-ab" /></label>
                </div>
              </div>

              <!-- Fields Kat Z -->
              <div id="fields-kat-z" class="dorfturnier-fields" style="display:none;">
                <div class="form-row">
                  <label><span>Vorname Name *</span><input type="text" name="contact_name_z" class="dorfturnier-input-z" /></label>
                  <label><span>E-Mail *</span><input type="email" name="contact_email_z" class="dorfturnier-input-z" /></label>
                </div>
              </div>

              <!-- Fields Kat C -->
              <div id="fields-kat-c" class="dorfturnier-fields" style="display:none;">
                <div class="form-row">
                  <label><span>Vorname Name *</span><input type="text" name="contact_name_c" class="dorfturnier-input-c" /></label>
                  <label><span>E-Mail *</span><input type="email" name="contact_email_c" class="dorfturnier-input-c" /></label>
                </div>
                <div class="form-row">
                  <label><span>Wohnort *</span><input type="text" name="wohnort_c" class="dorfturnier-input-c" /></label>
                  <label><span>Jahrgang *</span><input type="text" name="jahrgang_c" class="dorfturnier-input-c" /></label>
                </div>
              </div>

              <script>
                function updateDorfturnierFields() {
                  const cat = document.getElementById('dorfturnier-category').value;
                  document.querySelectorAll('.dorfturnier-fields, .dorfturnier-info').forEach(el => el.style.display = 'none');
                  document.querySelectorAll('.dorfturnier-input-ab, .dorfturnier-input-z, .dorfturnier-input-c').forEach(i => i.required = false);
                  
                  if (cat.includes('A & B')) {
                    document.getElementById('fields-kat-ab').style.display = 'block';
                    <% if(anlass && anlass.cat_a_b_info && anlass.cat_a_b_info.trim() !== '') { %> document.getElementById('info-kat-ab').style.display = 'block'; <% } %>
                    document.querySelectorAll('.dorfturnier-input-ab').forEach(i => i.required = true);
                  } else if (cat.includes('Z)')) {
                    document.getElementById('fields-kat-z').style.display = 'block';
                    <% if(anlass && anlass.cat_z_info && anlass.cat_z_info.trim() !== '') { %> document.getElementById('info-kat-z').style.display = 'block'; <% } %>
                    document.querySelectorAll('.dorfturnier-input-z').forEach(i => i.required = true);
                  } else if (cat.includes('C)')) {
                    document.getElementById('fields-kat-c').style.display = 'block';
                    <% if(anlass && anlass.cat_c_info && anlass.cat_c_info.trim() !== '') { %> document.getElementById('info-kat-c').style.display = 'block'; <% } %>
                    document.querySelectorAll('.dorfturnier-input-c').forEach(i => i.required = true);
                  }
                }
              </script>`;

content = content.replace(oldHtml, newHtml);
content = content.replace(oldHtml.replace(/\r\n/g, '\n'), newHtml); // Fallback for line endings

fs.writeFileSync(file, content, 'utf8');
console.log('Updated views/anlaesse.ejs');
