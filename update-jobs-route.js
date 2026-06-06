const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

const target = "app.get('/jobs', async (req, res) => {\r\n  const [jobs] = await db.query(`SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC`);\r\n  res.render('jobs', { page: 'jobs', jobs });\r\n});";

const targetLF = "app.get('/jobs', async (req, res) => {\n  const [jobs] = await db.query(`SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC`);\n  res.render('jobs', { page: 'jobs', jobs });\n});";


const newCode = `app.get('/jobs', async (req, res) => {
  const [jobs] = await db.query(\`SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC\`);
  const parsedJobs = jobs.map(j => ({
    ...j,
    description: j.description ? marked.parse(String(j.description)) : '',
    contact_info: j.contact_info ? marked.parse(String(j.contact_info)) : ''
  }));
  res.render('jobs', { page: 'jobs', jobs: parsedJobs });
});`;

if (content.includes(target)) {
  fs.writeFileSync('server.js', content.replace(target, newCode));
  console.log("Updated with CRLF");
} else if (content.includes(targetLF)) {
  fs.writeFileSync('server.js', content.replace(targetLF, newCode));
  console.log("Updated with LF");
} else {
  // Try regex
  const regex = /app\.get\('\/jobs', async \(req, res\) => \{\s*const \[jobs\] = await db\.query\(`SELECT \* FROM jobs WHERE is_active = 1 ORDER BY created_at DESC`\);\s*res\.render\('jobs', \{ page: 'jobs', jobs \}\);\s*\}\);/;
  if (regex.test(content)) {
    fs.writeFileSync('server.js', content.replace(regex, newCode));
    console.log("Updated with regex");
  } else {
    console.log("Not found");
  }
}
