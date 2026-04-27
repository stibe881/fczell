const news = [
  {
    title: "Spielbericht 3. Liga: FC Ruswil : FC Zell 3:1 (1:0); (Sa. 25.04.2026)",
    excerpt: "Zell findet zum Siegen zurück Die Gemütslage der beiden Teams hätte vor dieser Partie kaum unterschiedlicher sein können. Während der FC Ruswil mit drei Siegen aus den letzten drei Spielen mit breiter Brust auf der Gass antrat, befand...",
    published_at: "2026-04-25"
  },
  {
    title: "Spielbericht 3. Liga: FC Malters : FC Zell 1:0 (1:0); (Sa. 11.04.2026)",
    excerpt: "Wieder keine Punkte für die Gass-Elf Der FC Zell musste auch im Auswärtsspiel in Malters ohne Punkte die Heimreise antreten. Der Einsatz konnten man den Jungs von Lucas de Jesus nicht absprechen aber in vielen Phasen des Spiels waren...",
    published_at: "2026-04-11"
  },
  {
    title: "Spielbericht 3. Liga: FC Zell : FC Horw 2:3 (1:0); (Sa. 28.03.2026)",
    excerpt: "Zell gibt durch seine Passivität nach der Pause den Sieg aus der Hand Der FC Zell erwischte auf der heimischen Gass bei winterlichen Bedingungen den besseren Start und legte von Beginn weg ein hohes Tempo vor. Bereits nach vier Minuten...",
    published_at: "2026-03-28"
  },
  {
    title: "Spielbericht 3. Liga: FC Zell : FC Buttisholz 4:1 (2:0); (Mi. 25.03.2026)",
    excerpt: "Zell siegt deutlich gegen Buttisholz Im Nachtragsspiel der ersten Rückrundenpartie setzte sich der FC Zell an diesem nasskalten Mittwochabend auf der heimischen Gass verdient mit 4:1 gegen den FC Buttisholz durch. Für die Zeller war es...",
    published_at: "2026-03-25"
  },
  {
    title: "FC Zell Ausrüstungsbestellung in der Woche vom 29.11.2025 – 06.12.2025",
    excerpt: "Liebe Mitglieder des FC Zell, In Zusammenarbeit mit unserem Ausrüstungspartner Kunz-Sport Willisau bieten wir euch die Gelegenheit, Vereinsausrüstung des FC Zell zu unseren Konditionen zu erwerben. Diese Möglichkeit steht euch exklusiv...",
    published_at: "2025-11-29"
  }
];

const db = require('better-sqlite3')('fczell.db');
db.exec('DELETE FROM news;');
const insert = db.prepare('INSERT INTO news (title, excerpt, body, published_at) VALUES (?, ?, ?, ?)');
for (let n of news) {
  insert.run(n.title, n.excerpt, n.excerpt, n.published_at);
}
console.log("Inserted " + news.length + " news.");
