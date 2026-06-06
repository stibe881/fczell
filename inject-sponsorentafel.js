const fs = require('fs');

const data = [
  {
    id: 'oeffentlich',
    initial: 'B',
    title: 'Beiträge der öffentlichen Hand',
    items: [
      'Einwohnergemeinde Zell', 'Röm.-Kath Kirchgemeinde Zell', 'Einwohnergemeinde Fischbach', 'Einwohnergemeinde Ufhusen', 'Einwohnergemeinde Gettnau', 'Röm.-Kath Kirchgemeinde Gettnau', 'Reformierte Kirchgemeinde Willisau-Hüswil'
    ]
  },
  {
    id: 'smaragd',
    initial: 'S',
    title: 'Smaragd-Sponsoren',
    items: ['Makies AG, Zell']
  },
  {
    id: 'diamant',
    initial: 'D',
    title: 'Diamant-Sponsoren',
    items: [
      '4K Architektur AG Zell', 'Baumeler Getränke GmbH, Ruswil / Sursee', 'Bowi Garten + Freizeit AG, Willisau', 'Dubach Elektro GmbH, Gettnau', 'Dubach Holzbau AG, Hüswil', 'Familien Brunner', 'HB Systeme GmbH, Hüswil', 'Leuenberger AG, Zell', 'Leuenberger Dienstleistungen AG, Zell', 'Penalty-Club Zell, Zell', 'Präsidenten FC Zell', 'Sanitär Bieri, Zell', 'SV Horny Boys'
    ]
  },
  {
    id: 'platin',
    initial: 'P',
    title: 'Platin-Sponsoren',
    items: [
      'AEK AG, Bern', 'B + U AG, Zell', 'Belli Schweiz AG, Zell', 'Dorfgarage Wagner AG, Zell', 'Häfliger Bau AG, Zell', 'Korporation Briseck, Zell', 'Max und Marlis Galliker Stiftung, Horw', 'Stöckli Metzgerei AG, Zell', 'Torm Holz AG, Buttisholz', 'Valiant Bank AG, Zell', 'Wasserversorgungsgenossenschaft Zell'
    ]
  },
  {
    id: 'gold',
    initial: 'G',
    title: 'Gold-Sponsoren',
    items: [
      'Agila AG, Sursee', 'Arthur Weber AG Nebikon', 'AXA Versicherungen, Willisau', 'Emmenegger Festzeltvermietung, Geiss', 'Fankhauser AG, Landmaschinen, Gondiswil', 'Häfliger René, Bodenbeläge, Zell', 'Kammermann Holz GmbH, Zell', 'Kieswerk Hüswil AG, Hüswil', 'Kunz Armin, Sägerei und Holzhandel, Hofstatt', 'LBG Architektur und Bau, Sursee', 'Mehr Alois und Heidi, Gettnau', 'Meyer Othmar, Zell', 'Milihunters, Zell', 'Müller Tolbach Carrosserie AG, Zell', 'Müller Tolbach Garage AG, Zell', 'Müller Tolbach Spritzwerk GmbH, Zell', 'Natura Stein AG, Zell', 'Nyfarm AG, Eriswil', 'Raiffeisenbank Luzerner Hinterland, Zell', 'Sanimat AG, Sursee', 'Sustra AG, Sursee', 'Time out café bar AG, Zell', 'Tourenplaner, Zell', 'Viessmann Schweiz AG, Worb', 'wein44gmbh, Waldemar Bernet, Zell'
    ]
  },
  {
    id: 'silber',
    initial: 'S',
    title: 'Silber-Sponsoren',
    items: [
      '3a Elektro AG, Zell', 'Andermatt Service AG Grossdietwil', 'Artaverde Gartengestaltung GmbH, Hüswil', 'Atelier für Farb- und Raumgestaltung, Zell', 'Bättig Daniel und Brigitte, Gettnau', 'Elmer Röhner AG, Gettnau', 'Erni Simon, Zell', 'Gebrüder Oetterli AG Altbüron', 'Gebrüder Wüest AG, Eriswil', 'Graber Cornelia, Willisau', 'Grafic-Design Dubach GmbH, St. Erhard', 'HF Motorcycles AG, Gettnau', 'Iseli Edi, Schötz', 'Jöri Platten AG, Martin Dubach, Zell', 'Kammermann Urs AG, Zell', 'Kiener Heinz und Pia, Zell', 'Krankenkasse Luzerner Hinterland, Zell', 'Kunz Werner, Fischbach', 'Lackierwerkstatt Hüswil AG, Hüswil', 'Ligtiguide AG, Roggliswil', 'Marmobisa AG, Ebersecken', 'Müller Rudolf und Monica, Zell', 'Schloseli Pub, Steinmann Bruno, Schötz', 'Schwegler Roland, Betonbohren T-Fräsen, Hergiswil b. W.', 'Stutz Martin, Zell', 'Trocknungsanlage Zell, Zell', 'Truvag Treuhand AG, Willisau', 'Vita Finance GmbH, Sursee', 'Vogel Trockenbaumontage GmbH, Hüswil', 'Wagner Anton und Cécile, Bäckerei, Zell', 'Wirz Lohnunternehmen, St. Urban'
    ]
  },
  {
    id: 'bronze',
    initial: 'B',
    title: 'Bronze-Sponsoren',
    items: [
      'Adolf Müller GmbH, Grossdietwil', 'Alwa Automaten AG, Zell', 'Antika Feuer AG, Cham', 'Auto Amrein AG, Altbüron', 'Bärtschi Andreas, Altishofen', 'Bättig Walter und Margrith, Ruswil', 'Blumengarten, Zell', 'Bucher Roland, Gettnau', 'Bühler Gartenbau, Hüswil / Altbüron', 'Carrosserie-Spenglerei Emmenegger, Willisau', 'Centralhof Fashion AG, Sursee', 'Concordia, Schötz', 'Die Mobiliar, Willisau', 'Eiholzer Jürg und Ursi, Zell', 'FIF-Treuhand, Fritz Fivian, Zell', 'Flückiger Hecht AG, Zell', 'Galliker Transport AG, Altishofen', 'Gebrüder Imbach AG, Fischbach', 'Graber Stephan, Chantal, Livia und Jonas, Willisau', 'Grüter Viehhandels AG, Zell', 'Habisreutinger Gebäudenhüllen GmbH, Huttwil', 'Häfliger Rita, Willisau', 'Hecht Dominic, Zell', 'Hodel Pirmin und Denise, Willisau', 'Huber René, Dagmersellen', 'IT-Store Schweiz GmbH, Gettnau', 'Jurt Andrea und Paul, Zell', 'Koller Peter, Fischbach', 'Küng Platten AG, Willisau', 'Kurmann Andreas, Winterthur', 'Lanz GmbH, Gerüstbau, Ufhusen', 'Lichtsteiner Moritz und Bernadette, Zell', 'Mühle Briseck GmbH, Zell', 'Müller Heinz und Romy, Zell', 'Schreinerei Meier AG, Zell', 'Senioren 40+ FC Grosswangen-Ettiswil', 'Steinmann + Ruch GmbH, Zell', 'Stirnimann Edi, Nebikon', 'Stöckli Gregor, Möbel-Innenausbau, Zell', 'Swiss Green Sportstättenunterhalt AG, Lohn SO', 'von Ah Manfred und Marletheres, Zell', 'Walter Haas GmbH, Zell', 'Wechsler Gerhard AG, Luthern', 'Zihlmann Abdichtungen GmbH, Willisau'
    ]
  },
  {
    id: 'perlen',
    initial: 'P',
    title: 'Perlen-Sponsoren',
    items: [
      'Amst Othmar, Ebikon', 'Bachmann Brigitte / Schumacher Gabriela, Menznau / Grosswangen', 'Beglinger Ruedi, Roggliswil', 'Bernet Haustechnik GmbH, Hüswil', 'Blum Lukas, Fischbach', 'Bossert Oskar, Schötz', 'Brun Fabian, Entlebuch', 'Bürli Erwin, Geschirrverleih, Zell', 'Bürli Josef, Grafiker, Zell', 'Burri Thomas und Dorit, Zell', 'co Birrer Coiffure, Willisau', 'Corbo Pino, Zell', 'Coiffeur Brigitte, Graber Brigitte, Zell', 'Dobler Roland und Susanne, Willisau', 'Eggimann Thomas, Zell', 'Felber Othmar, Nottwil', 'Felder Coneli, Entlebuch', 'Flash Hair & Make up, Gettnau', 'Flexibell.ch, Rita Müller, Zell', 'Gasthof Krone, Luthern', 'Gewerbeverein Wolhusen-Werthenstein', 'Glanzmann Thomas, Fischbach', 'Graber Josef, Brasilien', 'Grossmann Paul, Zell', 'Grüter Franz, Buttisholz', 'Häberli Hans, Zell', 'Häfliger Agnes, Zell', 'Häfliger Markus, Willisau', 'Häfliger Reto, Willisau', 'Hurni Baumatik AG, Willisau', 'Imbach Paul, Roggliswil', 'Kiemenwenger Norbert, Zell', 'Knüsel-Egli Monika, Neuenkirch', 'Koller Josef, Sachseln', 'Koller Marianne, Hergiswil b.W.', 'Kurmann Alois, Gartenbau, Zell', 'Kurmann Franz, Zell', 'Lerch Thomas, Huttwil', 'Lingg Evelyn, Ballwil', 'Mehr Peter, Zell', 'Meier Franz und Priska, Fischbach', 'Meyer Theres, Zell', 'Moser Adrian, Zell', 'Müller Martini AG, Zofingen', 'Müller Peter, Luthern', 'Neuhaus AG, Grosswangen', 'Nussbaumer Beat, Zell', 'Physiotherapie am Napf GmbH, Hergiswil b.W.', 'Restaurant Grill-Hous, Gettnau', 'Rölli Philipp, Zell', 'Rölli Roger, Fischbach', 'Roos-Hirt Nicole, Luthern', 'Roth Jens und Susanne, Willisau', 'Roth Joseph, Greppen', 'Ruckstuhl Bruno, Zell', 'Schärli Hanspeter, Zell', 'Schwegler Hans, Zell', 'Stähler Bier GmbH, Grossdietwil', 'Steinmann Bau Ufhusen GmbH, Ufhusen', 'Steinmann Erwin und Pia, Ufhusen', 'Thalmann Armin, Willisau', 'Tino und Holz, Entlebuch', 'Two Wheels Zmuli GmbH, Ufhusen', 'Vogel Chantal, Hergiswil b.W.', 'Vogel Luzia und Walter, Luthern', 'Wechsler Adolf, Zell', 'Wechsler Andreas, Ufhusen', 'Wermelinger Paul, Zell', 'Wüest Franz, Zell', 'Wüest Stefan, Zell'
    ]
  }
];

let html = `
<div class="neubau-sponsors-section" style="margin-top: 6rem; margin-bottom: 6rem; padding: 4rem 2rem; background: var(--fcz-cream); border-radius: 32px; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);">
  <div style="text-align: center; margin-bottom: 4rem;">
    <p class="eyebrow eyebrow-red" style="font-size: 1.1rem; letter-spacing: 2px;">Neubau Garderoben- und Clublokal</p>
    <h2 style="font-size: 2.8rem; text-transform: uppercase; margin-bottom: 1rem; color: var(--fcz-gray-900);">Herzlichen Dank!</h2>
    <p style="font-size: 1.2rem; color: var(--fcz-gray-600);">An unsere grosszügigen Sponsoren und Gönner</p>
    <p style="font-size: 0.9rem; color: var(--fcz-gray-500); margin-top: 0.5rem; font-style: italic;">Beiträge ab Fr. 100.00 | Stand 07. Juni 2022</p>
  </div>
  
  <div class="neubau-masonry">
`;

data.forEach(cat => {
  html += `
    <div class="neubau-card cat-${cat.id}">
      <h3>
        <div class="neubau-initial">${cat.initial}</div>
        ${cat.title}
      </h3>
      <ul class="neubau-list">
        ${cat.items.map(i => '<li>' + i + '</li>').join('\\n        ')}
      </ul>
    </div>
  `;
});

html += `
  </div>
</div>
`;

let content = fs.readFileSync('views/verein.ejs', 'utf8');
content = content.replace('<!-- Bandenwerber -->', html + '\\n\\n  <!-- Bandenwerber -->');

let styles = `
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

content = content.replace('<!-- ============ PAGE STYLES ============ -->\\n<style>', '<!-- ============ PAGE STYLES ============ -->\\n<style>\\n' + styles);

fs.writeFileSync('views/verein.ejs', content);
console.log('Successfully injected Neubau Sponsorentafel.');
