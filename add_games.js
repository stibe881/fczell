const db = require('./db');

async function run() {
  const [rows] = await db.query('SELECT amtscup_games FROM anlaesse WHERE id=1');
  let games = [];
  try {
    games = JSON.parse(rows[0].amtscup_games || '[]');
  } catch (e) {
    games = [];
  }

  const newGames = [
    { day: "Donnerstag", date: "24.07.2025", time: "19:00", home: "FC Zell", away: "SV Sumiswald", result: "4:1" },
    { day: "Donnerstag", date: "24.07.2025", time: "20:00", home: "SV Sumiswald", away: "SC Huttwil", result: "2:2" },
    { day: "Donnerstag", date: "24.07.2025", time: "21:00", home: "SC Huttwil", away: "FC Zell", result: "0:2" },
    { day: "Samstag", date: "26.07.2025", time: "18:00", home: "FC Dagmersellen", away: "FC Willisau II", result: "1:0" },
    { day: "Samstag", date: "26.07.2025", time: "19:00", home: "FC Willisau II", away: "FC Zell", result: "0:3" },
    { day: "Samstag", date: "26.07.2025", time: "20:00", home: "FC Zell", away: "FC Dagmersellen", result: "1:0" }
  ];

  games = games.concat(newGames);

  await db.query('UPDATE anlaesse SET amtscup_games=? WHERE id=1', [JSON.stringify(games)]);
  console.log("Updated games successfully");
  process.exit(0);
}

run().catch(console.error);
