const fs = require('fs');

let c = fs.readFileSync('views/news.ejs', 'utf8');
c = c.replace(/if \(filter === 'all' \|\| card\.dataset\.category === filter\) \{/,
  `const cardCats = card.dataset.category ? card.dataset.category.split(',').map(s => s.trim()) : [];
            if (filter === 'all' || cardCats.includes(filter)) {`);
fs.writeFileSync('views/news.ejs', c);

let c2 = fs.readFileSync('views/admin/news-form.ejs', 'utf8');
c2 = c2.replace(/<input type="date" name="published_at" required value="<%.*?%>" \/>/,
  `<%
          let d = new Date();
          if (item && item.published_at) d = new Date(item.published_at);
          const dateStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        %>
        <input type="date" name="published_at" required value="<%= dateStr %>" />`);
fs.writeFileSync('views/admin/news-form.ejs', c2);

console.log('Fixed bugs');
