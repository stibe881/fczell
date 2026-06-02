const fs = require('fs');

['views/index.ejs', 'views/news.ejs'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/\.news-card-excerpt\s*\{([\s\S]*?)\}/g, (match, inner) => {
    if (inner.includes('-webkit-line-clamp')) return match; // already added
    return `.news-card-excerpt {${inner}  display: -webkit-box;\n  -webkit-line-clamp: 4;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}`;
  });
  fs.writeFileSync(f, c);
  console.log('Updated ' + f);
});
