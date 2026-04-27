const cheerio = require('cheerio');
const db = require('../db');
const https = require('https');

const fetchPage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
};

(async () => {
  try {
    console.log("Importing Teams...");
    
    // Clear existing teams and news related to these just in case? No, better to just insert.
    // Actually, I'll delete teams with these slugs to avoid constraint failures.
    db.prepare(`DELETE FROM teams WHERE slug IN ('1-mannschaft', '2-mannschaft', 'senioren-30')`).run();
    db.prepare(`DELETE FROM news WHERE category LIKE 'Spielbericht%'`).run();

    const teamsToFetch = [
      { url: 'https://www.fczell.ch/aktive/1-mannschaft/', slug: '1-mannschaft', type: 'aktive', name: '1. Mannschaft' },
      { url: 'https://www.fczell.ch/aktive/2-mannschaft/', slug: '2-mannschaft', type: 'aktive', name: '2. Mannschaft' },
      { url: 'https://www.fczell.ch/senioren-30/', slug: 'senioren-30', type: 'aktive', name: 'Senioren 30+' }
    ];

    for (const t of teamsToFetch) {
      console.log(`Fetching team: ${t.url}`);
      const html = await fetchPage(t.url);
      const $ = cheerio.load(html);
      
      // Attempt to extract trainer, league, etc.
      // WordPress pages can be messy. We will do a generic scrape.
      const text = $('.entry-content').text() || $('body').text();
      
      let trainer = '';
      let league = '';
      let times = '';
      
      // Simple regex heuristics
      const trainerMatch = text.match(/(?:Trainer|Coach):\s*([^\n]+)/i);
      if (trainerMatch) trainer = trainerMatch[1].trim();
      
      const leagueMatch = text.match(/(?:Liga|Klasse):\s*([^\n]+)/i);
      if (leagueMatch) league = leagueMatch[1].trim();

      db.prepare(`INSERT INTO teams (slug, type, name, league, trainer, times, location, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
        t.slug, t.type, t.name, league || 'Unbekannt', trainer || 'Unbekannt', times || 'Auf Anfrage', 'Gass, Zell', 10
      );
    }
    console.log("Teams imported.");

    console.log("Importing News...");
    const newsToFetch = [
      { url: 'https://www.fczell.ch/spielberichte/', category: 'Spielbericht 1. Mannschaft' },
      { url: 'https://www.fczell.ch/spielberichte-2-mannschaft-2/', category: 'Spielbericht 2. Mannschaft' }
    ];

    for (const n of newsToFetch) {
      console.log(`Fetching news from: ${n.url}`);
      const html = await fetchPage(n.url);
      const $ = cheerio.load(html);
      
      // Assuming it's a blog loop
      $('.post, .type-post').each((i, el) => {
        if (i >= 5) return; // limit to 5 per category
        const title = $(el).find('h2, h3, .entry-title').first().text().trim() || 'Spielbericht';
        const excerpt = $(el).find('.entry-summary, .entry-content p').first().text().trim();
        const published_at = $(el).find('time').attr('datetime') || new Date().toISOString().slice(0, 10);
        
        // Ensure no duplicate titles for the same date just in case
        try {
          db.prepare(`INSERT INTO news (title, excerpt, body, category, published_at) VALUES (?, ?, ?, ?, ?)`).run(
            title, excerpt.slice(0, 200), excerpt, n.category, published_at.slice(0, 10)
          );
        } catch (err) {
          console.error("Error inserting news:", err.message);
        }
      });
    }
    console.log("News imported.");
    
  } catch (err) {
    console.error("Fatal Error:", err);
  }
})();
