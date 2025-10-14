const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function createTables() {
  try {
    console.log('🔧 Création des tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'client',
        prenom VARCHAR(100),
        nom VARCHAR(100),
        telephone VARCHAR(20),
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    // Formations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS formations (
        id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        duree VARCHAR(100),
        public_cible VARCHAR(255),
        prix DECIMAL(10,2),
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50),
        prix_base DECIMAL(10,2),
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    // Temoignages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS temoignages (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        note INTEGER CHECK (note >= 1 AND note <= 5),
        service_type VARCHAR(50),
        statut VARCHAR(20) DEFAULT 'en_attente',
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Tables créées avec succès !');
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createTables();