const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
const db = require('../db');

db.prepare('DELETE FROM advertisers').run();

https.get('https://www.fczell.ch/sponsoren/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const $ = cheerio.load(data);
    
    const advertisers = [];
    let count = 0;

    $('.fusion-layout-column').each((i, el) => {
      // Find columns that have "Vielen Dank unseren Bandenwerbern" text nearby or are part of that section.
      // But actually, on the Sponsoren page, Bandenwerber are just the logos at the bottom?
      // Wait, we can just scrape all logos under a certain heading or just all `img` tags?
      // Better: let's just find the text "Bandenwerber" and get the next containers.
      // Actually, let's just extract all images inside a specific container.
    });

    // Alternatively, I can just write a simpler script to get all `.imageframe-align-center img` or similar.
    // I'll log the DOM structure to figure it out.
  });
});
