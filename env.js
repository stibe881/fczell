const fs = require('fs');
const path = require('path');

/** Load KEY=VALUE pairs from .env into process.env (existing variables win) */
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val;
  }
}

for (const key of ['DB_PASSWORD', 'SESSION_SECRET', 'TURNSTILE_SECRET']) {
  if (!process.env[key]) console.error(`WARNUNG: ${key} ist nicht gesetzt (.env fehlt oder unvollständig)`);
}
