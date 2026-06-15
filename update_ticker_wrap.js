const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'views', 'partials', 'header.ejs');
let content = fs.readFileSync(file, 'utf8');

// Restore the activeMatch JS
content = content.replace(
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">LIVE: ' + matchTitle + '</span>';",
  "text.textContent = 'LIVE: ' + matchTitle;"
);
content = content.replace(
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">' + matchTitle + '</span><span style=\"flex-shrink: 0; white-space: nowrap;\"> in ' + countdown + '</span>';",
  "text.textContent = matchTitle + ' startet in ' + countdown;"
);

// Restore the nextMatch JS
content = content.replace(
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">LIVE: ' + matchTitle + '</span>';",
  "text.textContent = 'LIVE: ' + matchTitle;"
);
content = content.replace(
  "text.innerHTML = '<span style=\"text-overflow: ellipsis; overflow: hidden; white-space: nowrap;\">' + matchTitle + '</span><span style=\"flex-shrink: 0; white-space: nowrap;\"> in ' + countdown + '</span>';",
  "text.textContent = matchTitle + ' in ' + countdown;"
);

// Update activeMatch ticker span to allow wrapping
content = content.replace(
  '<span class="ticker-text" id="tickerText" style="display: flex; gap: 0.25rem; overflow: hidden; max-width: 100%;">LIVE: <%= activeMatch.title %></span>',
  '<span class="ticker-text" id="tickerText" style="white-space: normal; line-height: 1.2; text-align: center;">LIVE: <%= activeMatch.title %></span>'
);

// Update nextMatch ticker span to allow wrapping
content = content.replace(
  '<span class="ticker-text" id="tickerText" style="display: flex; gap: 0.25rem; overflow: hidden; max-width: 100%;"><%= nextMatch.title %></span>',
  '<span class="ticker-text" id="tickerText" style="white-space: normal; line-height: 1.2; text-align: center;"><%= nextMatch.title %></span>'
);

// Update activeMatch badge style (remove max-width: 100% and overflow: hidden that restrict wrapping)
content = content.replace(
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\n          <span id="tickerDot"',
  'font-size: 0.75rem; max-width: 100%;">\n          <span id="tickerDot"'
);
content = content.replace( // LF fallback
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\r\n          <span id="tickerDot"',
  'font-size: 0.75rem; max-width: 100%;">\r\n          <span id="tickerDot"'
);

// Update nextMatch badge style
content = content.replace(
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\n          <svg xmlns',
  'font-size: 0.75rem; max-width: 100%;">\n          <svg xmlns'
);
content = content.replace( // LF fallback
  'font-size: 0.75rem; overflow: hidden; max-width: 100%;">\r\n          <svg xmlns',
  'font-size: 0.75rem; max-width: 100%;">\r\n          <svg xmlns'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Done wrapping');
