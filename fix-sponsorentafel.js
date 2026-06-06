const fs = require('fs');

// 1. Fix verein.ejs
let content = fs.readFileSync('views/verein.ejs', 'utf8');
// replace literal "\n        " with nothing or empty string
content = content.replace(/\\n\s+/g, ' '); 
content = content.replace(/\\n/g, ' ');
fs.writeFileSync('views/verein.ejs', content);

// 2. Add CSS to styles.css
let css = `
/* ==========================================================================
   NEUBAU SPONSORENTAFEL
   ========================================================================== */
.neubau-masonry {
  column-count: 1;
  column-gap: 2rem;
}
@media(min-width: 768px) { .neubau-masonry { column-count: 2; } }
@media(min-width: 1024px) { .neubau-masonry { column-count: 3; } }

.neubau-card {
  break-inside: avoid;
  margin-bottom: 2rem;
  background: #fff;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
  border-top: 6px solid #ccc;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.neubau-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.06);
}

.neubau-card.cat-oeffentlich { border-color: #6c757d; }
.neubau-card.cat-smaragd { border-color: #50C878; }
.neubau-card.cat-diamant { border-color: #7bd3e8; }
.neubau-card.cat-platin { border-color: #c9c9c9; }
.neubau-card.cat-gold { border-color: #FFD700; }
.neubau-card.cat-silber { border-color: #C0C0C0; }
.neubau-card.cat-bronze { border-color: #CD7F32; }
.neubau-card.cat-perlen { border-color: #e0e0e0; }

.neubau-card h3 {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.neubau-initial {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  color: #fff;
  line-height: 1;
}

.neubau-card.cat-oeffentlich .neubau-initial { background: #6c757d; }
.neubau-card.cat-smaragd .neubau-initial { background: #50C878; }
.neubau-card.cat-diamant .neubau-initial { background: #7bd3e8; }
.neubau-card.cat-platin .neubau-initial { background: #c9c9c9; }
.neubau-card.cat-gold .neubau-initial { background: #e8bd10; }
.neubau-card.cat-silber .neubau-initial { background: #a3a3a3; }
.neubau-card.cat-bronze .neubau-initial { background: #b07033; }
.neubau-card.cat-perlen .neubau-initial { background: #d0d0d0; }

.neubau-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--fcz-gray-700);
}
.neubau-list li { margin-bottom: 0.5rem; display: flex; }
.neubau-list li::before {
  content: '•';
  color: var(--fcz-gray-400);
  margin-right: 0.5rem;
}
`;

fs.appendFileSync('public/styles.css', '\\n' + css);
console.log('Fixed newlines and added CSS!');
