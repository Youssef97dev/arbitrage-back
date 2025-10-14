const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function updatePaiementsTable() {
  try {
    // Ajouter les colonnes pour les détails de paiement et reçus
    await pool.query('ALTER TABLE paiements ADD COLUMN IF NOT EXISTS details_paiement TEXT');
    await pool.query('ALTER TABLE paiements ADD COLUMN IF NOT EXISTS recu_path VARCHAR(500)');
    
    console.log('Table paiements mise à jour avec succès');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  } finally {
    await pool.end();
  }
}

updatePaiementsTable();