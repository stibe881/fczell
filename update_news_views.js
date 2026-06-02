const fs = require('fs');

let c = fs.readFileSync('views/index.ejs', 'utf8');
c = c.replace(/<div class="news-card-body">/, `<% if (n.image) { %>
          <img src="<%= n.image %>" alt="<%= n.title %>" style="width:100%; height:200px; object-fit:cover; display:block;" />
        <% } %>
        <div class="news-card-body">`);
fs.writeFileSync('views/index.ejs', c);

let c2 = fs.readFileSync('views/news.ejs', 'utf8');
c2 = c2.replace(/<div class="news-card-body">/, `<% if (n.image) { %>
          <img src="<%= n.image %>" alt="<%= n.title %>" style="width:100%; height:200px; object-fit:cover; display:block;" />
        <% } %>
        <div class="news-card-body">`);
fs.writeFileSync('views/news.ejs', c2);

let c3 = fs.readFileSync('views/news-single.ejs', 'utf8');
c3 = c3.replace(/<div class="article-head">[\s\S]*?<\/div>/, match => match + `
  <% if (item.image) { %>
    <div style="margin: 2rem 0;">
      <img src="<%= item.image %>" alt="<%= item.title %>" style="width: 100%; border-radius: 8px; max-height: 500px; object-fit: cover;" />
    </div>
  <% } %>`);
// Use item.content || item.body
c3 = c3.replace(/<% item\.body\.split\(\/\\n\\n\+\/\)\.forEach\(p => { %>[\s\S]*?<% }\) %>/, `<%- item.content || item.body %>`);
fs.writeFileSync('views/news-single.ejs', c3);
