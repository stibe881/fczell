const db = require('../db');

const vorstand = [
  {
    "name": "Jörg Graber",
    "role": "Präsident",
    "phone": "079 333 97 59",
    "email": "joerg.graber@bithawk.ch",
    "address": "Grünenbodenweid 2, 6144 Zell"
  },
  {
    "name": "Martin Werder",
    "role": "Vize-Präsident",
    "phone": "078 600 83 36",
    "email": "martin@werder.lu",
    "address": ""
  },
  {
    "name": "Patrick Albisser",
    "role": "Verantwortlicher Events",
    "phone": "079 756 46 29",
    "email": "patrick.albisser@bluewin.ch",
    "address": "Hoger 9, 6130 Willisau"
  },
  {
    "name": "Heinz Beck",
    "role": "Infrastruktur/Platz",
    "phone": "079 343 09 40",
    "email": "info@buag-kuechen.ch",
    "address": "Luzernstrasse 8, 6144 Zell"
  },
  {
    "name": "Simon Egli",
    "role": "Junioren",
    "phone": "079 208 57 00",
    "email": "joli-seimen@bluewin.ch",
    "address": ""
  },
  {
    "name": "Nicole Mehr",
    "role": "Finanzen",
    "phone": "077 429 20 30",
    "email": "nicole_mehr@hotmail.com",
    "address": ""
  },
  {
    "name": "Othmar Meyer",
    "role": "Spiko-Präsident",
    "phone": "079 796 61 19",
    "email": "othmar.meyer58@bluewin.ch",
    "address": "Neuhushof 3, 6144 Zell"
  },
  {
    "name": "Dominic Hecht",
    "role": "Material",
    "phone": "079 195 22 24",
    "email": "dominic-2000@gmx.ch",
    "address": ""
  }
];

db.prepare('DELETE FROM vorstand').run();

vorstand.forEach((member, index) => {
  db.prepare(`INSERT INTO vorstand (name, role, address, phone, email, sort_order) VALUES (?, ?, ?, ?, ?, ?)`).run(
    member.name, member.role, member.address, member.phone, member.email, index * 10
  );
});

console.log("Vorstand imported successfully.");
