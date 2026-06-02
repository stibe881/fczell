const fs = require('fs');

['views/index.ejs', 'views/news.ejs'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  // 1. Add image placeholder if no image exists
  // The current code is:
  // <% if (n.image) { %>
  //   <img src="<%= n.image %>" alt="<%= n.title %>" style="width:100%; height:200px; object-fit:cover; display:block;" />
  // <% } %>
  c = c.replace(/<% if \(n\.image\) \{ %>\s*<img src="<%= n\.image %>" alt="<%= n\.title %>" style="width:100%; height:200px; object-fit:cover; display:block;" \/>\s*<% \} %>/g, 
    `<% if (n.image) { %>
          <img src="<%= n.image %>" alt="<%= n.title %>" style="width:100%; height:200px; object-fit:cover; display:block;" />
        <% } else { %>
          <div style="width:100%; height:200px; background:var(--fcz-gray-200); display:block;"></div>
        <% } %>`);

  // 2. Fix card layout (flex column, min-height for title, margin-top: auto for link)
  // Find .news-card { ... }
  c = c.replace(/\.news-card \{[\s\S]*?\}/g, match => {
    if (!match.includes('flex-direction: column')) {
      return match.replace('}', '  display: flex;\n  flex-direction: column;\n}');
    }
    return match;
  });

  // Find .news-card-body { ... }
  c = c.replace(/\.news-card-body \{[\s\S]*?\}/g, match => {
    if (!match.includes('flex-direction: column')) {
      return match.replace('}', '  display: flex;\n  flex-direction: column;\n  flex: 1;\n}');
    }
    return match;
  });

  // Find .news-card-title { ... }
  c = c.replace(/\.news-card-title \{[\s\S]*?\}/g, match => {
    if (!match.includes('-webkit-line-clamp')) {
      return match.replace('}', '  display: -webkit-box;\n  -webkit-line-clamp: 2;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n  min-height: 2.88rem;\n  line-height: 1.2;\n}');
    }
    return match;
  });

  // Find .news-card-link { ... }
  c = c.replace(/\.news-card-link \{[\s\S]*?\}/g, match => {
    if (!match.includes('margin-top: auto')) {
      // Replace margin-top: 1rem with margin-top: auto, or just add it
      return match.replace('margin-top: 1rem;', 'margin-top: auto;');
    }
    return match;
  });

  fs.writeFileSync(f, c);
  console.log('Updated ' + f);
});
