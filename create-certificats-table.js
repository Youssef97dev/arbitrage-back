const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "arbitrage_db",
  password: process.env.DB_PASSWORD || "root",
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // required for Render PostgreSQL
  },
});

async function createCertificatsTable() {
  try {
    // Table des certificats
    await pool.query(`
      CREATE TABLE IF NOT EXISTS certificats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        formation_id INTEGER,
        numero_certificat VARCHAR(50) UNIQUE NOT NULL,
        nom_complet VARCHAR(200) NOT NULL,
        formation_titre VARCHAR(200) NOT NULL,
        date_formation DATE NOT NULL,
        date_emission DATE DEFAULT CURRENT_DATE,
        statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'annule')),
        reglement_complete BOOLEAN DEFAULT FALSE,
        presence_complete BOOLEAN DEFAULT FALSE,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table de suivi des formations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS formation_suivi (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        formation_id INTEGER,
        commande_id INTEGER,
        reglement_lu BOOLEAN DEFAULT FALSE,
        presence_confirmee BOOLEAN DEFAULT FALSE,
        date_completion TIMESTAMP,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Tables certificats créées avec succès");
  } catch (error) {
    console.error("Erreur création tables:", error);
  } finally {
    await pool.end();
  }
}

createCertificatsTable();
