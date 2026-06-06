const fs = require('fs');
const c = fs.readFileSync('server.js','utf8');
const getRoute = c.match(/app\.get\('\/admin\/settings'[\s\S]*?\}\);/);
const postRoute = c.match(/app\.post\('\/admin\/settings'[\s\S]*?\}\);/);
console.log("GET:\n", getRoute ? getRoute[0] : 'not found');
console.log("POST:\n", postRoute ? postRoute[0] : 'not found');
