const fs = require('fs');

let c = fs.readFileSync('views/admin/news-form.ejs', 'utf8');

const targetStr = `<label>
        <span>Kategorie</span>
        <div style="display: flex; gap: 0.5rem;">
          <select onchange="document.getElementById('cat_input').value = this.value" style="flex: 1;">
            <option value="">-- Auswählen --</option>
            <% categories.forEach(c => { %>
              <option value="<%= c.category %>" <%= item && item.category === c.category ? 'selected' : (!item && c.category === 'Allgemein' ? 'selected' : '') %>><%= c.category %></option>
            <% }) %>
          </select>
          <input id="cat_input" name="category" value="<%= item ? item.category : 'Allgemein' %>" placeholder="Oder neue tippen..." style="flex: 1;" />
        </div>
      </label>`;

const replacementStr = `<label style="flex: 1;">
        <span>Kategorien (mehrere möglich)</span>
        <div style="margin-bottom: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.75rem;">
          <% 
            let selectedCats = item && item.category ? item.category.split(',').map(s => s.trim()) : ['Allgemein'];
            categories.forEach(c => { 
              if(!c.category) return;
              let isSelected = selectedCats.includes(c.category);
          %>
            <label style="display:flex; align-items:center; gap:0.25rem; font-weight:normal; cursor:pointer;">
              <input type="checkbox" name="category_chk" value="<%= c.category %>" <%= isSelected ? 'checked' : '' %> style="width:auto; margin:0;" />
              <%= c.category %>
            </label>
          <% }) %>
        </div>
        <input name="new_category" placeholder="Neue Kategorie(n) tippen (kommagetrennt)..." style="width:100%;" />
        <small class="muted">Kreuze bestehende an oder tippe neue Kategorien ein.</small>
      </label>`;

c = c.replace(targetStr, replacementStr);
fs.writeFileSync('views/admin/news-form.ejs', c);
console.log('Updated news-form.ejs');
