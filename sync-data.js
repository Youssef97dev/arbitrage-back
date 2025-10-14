const { Pool } = require('pg');
const { formations, services } = require('./shared/data');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function syncData() {
  try {
    // Synchroniser les formations
    await pool.query('DELETE FROM formations');
    for (const formation of formations) {
      await pool.query(
        'INSERT INTO formations (id, titre, description, duree, public_cible, prix, date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [formation.id, formation.titre, formation.description, formation.duree, formation.public_cible, formation.prix, formation.date]
      );
    }

    // Synchroniser les services
    await pool.query('DELETE FROM services');
    for (const service of services) {
      await pool.query(
        'INSERT INTO services (id, nom, description, type, prix_base, prix) VALUES ($1, $2, $3, $4, $5, $6)',
        [service.id, service.nom, service.description, service.type, service.prix_base, service.prix]
      );
    }

    console.log('Données synchronisées avec succès');
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error);
  } finally {
    await pool.end();
  }
}

syncData();