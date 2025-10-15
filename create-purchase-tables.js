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

async function createPurchaseTables() {
  try {
    console.log("🛒 Création des tables d'achat...");

    // Table des commandes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS commandes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type_produit VARCHAR(20) CHECK (type_produit IN ('formation', 'service')),
        produit_id INTEGER NOT NULL,
        prix DECIMAL(10,2) NOT NULL,
        statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'paye', 'annule')),
        date_creation TIMESTAMP DEFAULT NOW(),
        date_paiement TIMESTAMP
      )
    `);

    // Table des paiements
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paiements (
        id SERIAL PRIMARY KEY,
        commande_id INTEGER REFERENCES commandes(id),
        methode_paiement VARCHAR(20) CHECK (methode_paiement IN ('carte', 'paypal', 'virement', 'versement')),
        montant DECIMAL(10,2) NOT NULL,
        statut VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'reussi', 'echec')),
        transaction_id VARCHAR(255),
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("✅ Tables d'achat créées !");
    await pool.end();
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    await pool.end();
    process.exit(1);
  }
}

createPurchaseTables();
