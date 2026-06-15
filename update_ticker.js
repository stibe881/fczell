const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'partials', 'header.ejs');
let content = fs.readFileSync(file, 'utf8');

// 1. Update activeMatch anchor
content = content.replace(
  'font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\n          <span id="tickerDot"',
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\n          <span id="tickerDot"'
);
content = content.replace( // LF fallback
  'font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\r\n          <span id="tickerDot"',
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\r\n          <span id="tickerDot"'
);

// Update activeMatch tickerText span
content = content.replace(
  '<span class="ticker-text" id="tickerText">LIVE: <%= activeMatch.title %></span>',
  '<span class="ticker-text" id="tickerText" style="display: flex; gap: 0.25rem; overflow: hidden; max-width: 100%;">LIVE: <%= activeMatch.title %></span>'
);

// Update activeMatch JS
content = content.replace(
  "text.textContent = 'LIVE: ' + matchTitle;",
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">LIVE: ' + matchTitle + '</span>';"
);
content = content.replace(
  "text.textContent = matchTitle + ' startet in ' + countdown;",
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">' + matchTitle + '</span><span style=\"flex-shrink: 0; white-space: nowrap;\"> in ' + countdown + '</span>';"
);

// 2. Update nextMatch anchor
content = content.replace(
  'font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\n          <svg xmlns',
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\n          <svg xmlns'
);
content = content.replace( // LF fallback
  'font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\r\n          <svg xmlns',
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\r\n          <svg xmlns'
);

// Update nextMatch tickerText span
content = content.replace(
  '<span class="ticker-text" id="tickerText"><%= nextMatch.title %></span>',
  '<span class="ticker-text" id="tickerText" style="display: flex; gap: 0.25rem; overflow: hidden; max-width: 100%;"><%= nextMatch.title %></span>'
);

// Update nextMatch JS
content = content.replace(
  "text.textContent = 'LIVE: ' + matchTitle;",
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">LIVE: ' + matchTitle + '</span>';"
);
content = content.replace(
  "text.textContent = matchTitle + ' in ' + countdown;",
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">' + matchTitle + '</span><span style=\"flex-shrink: 0; white-space: nowrap;\"> in ' + countdown + '</span>';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done');
