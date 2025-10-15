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

async function createPresenceTables() {
  try {
    // Table des sessions de formation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions_formation (
        id SERIAL PRIMARY KEY,
        formation_id INTEGER NOT NULL,
        code_session VARCHAR(50) UNIQUE NOT NULL,
        date_session DATE NOT NULL,
        heure_debut TIME NOT NULL,
        heure_fin TIME NOT NULL,
        statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'terminee', 'annulee')),
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des présences
    await pool.query(`
      CREATE TABLE IF NOT EXISTS presences (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions_formation(id),
        user_id INTEGER REFERENCES users(id),
        heure_presence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, user_id)
      )
    `);

    console.log("Tables de présence créées avec succès");
  } catch (error) {
    console.error("Erreur création tables:", error);
  } finally {
    await pool.end();
  }
}

createPresenceTables();
