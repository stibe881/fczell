const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'lguh.your-database.de',
  user: process.env.DB_USER || 'fczell',
  password: process.env.DB_PASSWORD || '!LeliBist.1561!',
  database: process.env.DB_NAME || 'fczell',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Initialize Database Schema
async function initDb() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(255),
      roles TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      excerpt TEXT,
      body TEXT NOT NULL,
      category VARCHAR(255) DEFAULT 'Allgemein',
      published_at DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      event_date DATE NOT NULL,
      event_time VARCHAR(255),
      location VARCHAR(255),
      description TEXT,
      is_match TINYINT(1) DEFAULT 0,
      live_ticker TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vorstand (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(255),
      address VARCHAR(255),
      phone VARCHAR(255),
      email VARCHAR(255),
      sort_order INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sponsors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      logo VARCHAR(255),
      link VARCHAR(255),
      sort_order INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS advertisers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      link VARCHAR(255),
      location VARCHAR(255),
      sort_order INT DEFAULT 0,
      logo VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      league VARCHAR(255),
      extra TEXT,
      trainer VARCHAR(255),
      coach VARCHAR(255),
      goalie VARCHAR(255),
      physio VARCHAR(255),
      times VARCHAR(255),
      location VARCHAR(255),
      photo VARCHAR(255),
      sponsor_logo VARCHAR(255),
      sort_order INT DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      contact_info TEXT,
      is_active TINYINT(1) DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      file_path VARCHAR(255) NOT NULL,
      upload_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS galleries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      anlass_id INT,
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery_photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gallery_id INT,
      gallery VARCHAR(255),
      image_path VARCHAR(255) NOT NULL,
      caption VARCHAR(255),
      sort_order INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations_juniorenlager (
      id INT AUTO_INCREMENT PRIMARY KEY,
      child_name VARCHAR(255) NOT NULL,
      child_birthdate VARCHAR(255),
      parent_name VARCHAR(255) NOT NULL,
      parent_email VARCHAR(255) NOT NULL,
      parent_phone VARCHAR(255) NOT NULL,
      address VARCHAR(255),
      allergies TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations_dorfturnier (
      id INT AUTO_INCREMENT PRIMARY KEY,
      anlass_id INT,
      category VARCHAR(255),
      team_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(255) NOT NULL,
      player_count INT DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS registrations_standard (
      id INT AUTO_INCREMENT PRIMARY KEY,
      anlass_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS anlaesse (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      year INT,
      body TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      has_form TINYINT(1) DEFAULT 0,
      form_type VARCHAR(255) DEFAULT 'standard',
      deadline DATE,
      is_archived TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.query(schema);
    await seed();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function seed() {
  const [userRows] = await db.query('SELECT COUNT(*) AS c FROM users');
  if (userRows[0].c === 0) {
    const hash = bcrypt.hashSync('fczell2026', 10);
    await db.query(
      'INSERT INTO users (username, password_hash, display_name, roles) VALUES (?, ?, ?, ?)',
      ['admin', hash, 'Administrator', '["admin"]']
    );
    console.log('-> Standard-Admin angelegt: admin / fczell2026');
  }
}

initDb();

module.exports = db;
