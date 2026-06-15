const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
if (!code.includes("require('./hijack_console');")) {
  code = "require('./hijack_console');\n" + code;
  fs.writeFileSync('server.js', code);
}
console.log("Hijacked console setup complete");
