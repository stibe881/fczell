# FC Zell – Vereinswebseite

Moderne, vollbreite Webseite des FC Zell mit integriertem Admin-Bereich (CMS) zum Pflegen von News, Terminen und Inhaltstexten.

## Features

- **Vollbreite, moderne Optik** ohne Kachel-Layouts – Sektionen sind als durchgehende Bänder aufgebaut
- **Alle Inhalte der bisherigen Webseite**: Verein/Vorstand, Clubhaus, Penaltyclub, Jobs, Sponsoren, alle Aktiv- und Junioren-Mannschaften, News/Spielberichte, Events, Kontakt
- **Admin-Login im Footer** sowie über `/login`
- **CMS für Administratoren**: News erstellen/bearbeiten/löschen, Termine verwalten, Inhaltsblöcke pflegen, Passwort ändern
- Responsive · Dark/Light-Bänder · Sticky-Header · Mobile-Navigation
- SQLite-Datenbank (lokale Datei, keine externe DB nötig)

## Tech-Stack

- Node.js + Express
- EJS Templates
- better-sqlite3
- bcryptjs für Passwort-Hashing
- express-session + connect-sqlite3 für Sessions

## Installation

```bash
npm install
npm start
```

Die Webseite läuft danach auf **http://localhost:3000**

## Standard-Admin-Login

Beim ersten Start wird automatisch ein Admin-Account angelegt:

- **Benutzername:** `admin`
- **Passwort:** `fczell2026`

> **Wichtig:** Nach dem ersten Login das Passwort unter *Konto* ändern.

## Wo logge ich mich ein?

Es gibt zwei Wege:

1. Login-Form direkt im **Footer jeder Seite**
2. Klassische Login-Seite unter **`/login`**

Nach erfolgreichem Login geht es ins Admin-Dashboard unter `/admin`.

## Struktur

```
fczell/
├── server.js              # Express-Server, Routing, Auth
├── db.js                  # SQLite-Setup, Seed-Daten
├── package.json
├── public/
│   ├── styles.css         # Hauptstil (Public)
│   ├── admin.css          # Admin-Stil
│   └── script.js          # Mobile-Nav & UI-Helfer
├── views/
│   ├── partials/          # Header & Footer
│   ├── index.ejs          # Startseite
│   ├── verein.ejs         # Vorstand, Clubhaus, Penaltyclub, Jobs
│   ├── aktive.ejs         # 1. Mannschaft, 2. Mannschaft, Senioren 30+
│   ├── junioren.ejs       # Alle Junioren-Teams
│   ├── events.ejs         # Termine
│   ├── news.ejs           # Newsübersicht
│   ├── news-single.ejs    # Einzelner News-Beitrag
│   ├── kontakt.ejs        # Kontaktformular & Vorstand
│   ├── login.ejs          # Admin-Login-Seite
│   ├── 404.ejs
│   └── admin/             # Admin-CMS-Views
└── fczell.db              # SQLite-DB (wird automatisch erstellt)
```

## Konfiguration

Über Umgebungsvariablen:

- `PORT` – Port (Standard `3000`)
- `SESSION_SECRET` – Session-Secret (im Produktivbetrieb unbedingt setzen!)

Beispiel:
```bash
PORT=8080 SESSION_SECRET="ein-zufaelliges-langes-secret" npm start
```

## Datenbank-Reset

DB löschen (z.B. um Seed-Daten neu einzuspielen):
```bash
rm fczell.db sessions.db
npm start
```

## Deployment-Tipps

- Reverse-Proxy (nginx) vor Node.js setzen, HTTPS via Let's Encrypt
- `SESSION_SECRET` als Umgebungsvariable setzen
- `fczell.db` regelmässig sichern (z.B. tägliches Backup)
