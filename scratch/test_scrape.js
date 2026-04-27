const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('sponsoren.html', 'utf-8');
const $ = cheerio.load(html);

const sponsors = [];
$('img').each((i, el) => {
  const src = $(el).attr('src');
  const alt = $(el).attr('alt') || '';
  const parentA = $(el).closest('a');
  const link = parentA.attr('href') || '';
  
  // Try to find category by looking at preceding headings
  const prevHeading = $(el).closest('.wp-block-group').prevAll('h2, h3, h4').first().text() || 
                      $(el).parents().prevAll('h2, h3, h4').first().text() ||
                      'Sponsor';
                      
  if (src && !src.includes('pixel.wp.com')) {
    sponsors.push({ alt, src, link, category: prevHeading.trim() });
  }
});

console.log(JSON.stringify(sponsors.slice(0, 5), null, 2));
