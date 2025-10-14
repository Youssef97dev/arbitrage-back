const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function migrateDatabase() {
  try {
    // Ajouter la colonne date aux formations
    await pool.query('ALTER TABLE formations ADD COLUMN IF NOT EXISTS date DATE');
    
    // Ajouter la colonne prix aux services
    await pool.query('ALTER TABLE services ADD COLUMN IF NOT EXISTS prix DECIMAL(10,2) DEFAULT 0');
    
    console.log('Migration de la base de données terminée');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    await pool.end();
  }
}

migrateDatabase();