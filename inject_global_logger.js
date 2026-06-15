const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const middleware = `
app.use((req, res, next) => {
  if (req.method === 'POST') {
    require('fs').appendFileSync('all_requests.log', new Date().toISOString() + ' ' + req.url + '\\n');
  }
  next();
});
`;

if (!code.includes("all_requests.log")) {
  code = code.replace(
    "const app = express();",
    "const app = express();\n" + middleware
  );
  fs.writeFileSync('server.js', code);
  console.log("Injected global request logger");
} else {
  console.log("Global logger already exists");
}
