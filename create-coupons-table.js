const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function createCouponsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        nom VARCHAR(200) NOT NULL,
        type_reduction VARCHAR(20) CHECK (type_reduction IN ('pourcentage', 'montant')) NOT NULL,
        valeur_reduction DECIMAL(10,2) NOT NULL,
        date_debut DATE NOT NULL,
        date_fin DATE NOT NULL,
        limite_utilisation INTEGER DEFAULT NULL,
        utilisations_actuelles INTEGER DEFAULT 0,
        statut VARCHAR(20) DEFAULT 'actif' CHECK (statut IN ('actif', 'inactif', 'expire')),
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS utilisations_coupons (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER REFERENCES coupons(id),
        user_id INTEGER REFERENCES users(id),
        commande_id INTEGER REFERENCES commandes(id),
        montant_reduction DECIMAL(10,2) NOT NULL,
        date_utilisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Tables coupons créées avec succès');
  } catch (error) {
    console.error('Erreur création tables:', error);
  } finally {
    await pool.end();
  }
}

createCouponsTable();