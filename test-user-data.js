const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function createTestData() {
  try {
    // Créer une commande test
    const commande = await pool.query(`
      INSERT INTO commandes (user_id, type_produit, produit_id, prix, statut, date_creation)
      VALUES (1, 'formation', 1, 1500, 'paye', NOW())
      RETURNING *
    `);
    
    // Créer un paiement test
    await pool.query(`
      INSERT INTO paiements (commande_id, methode_paiement, montant, statut, transaction_id, date_creation)
      VALUES ($1, 'carte', 1500, 'reussi', 'TXN_TEST_123', NOW())
    `, [commande.rows[0].id]);
    
    // Créer un suivi formation test
    await pool.query(`
      INSERT INTO formation_suivi (user_id, formation_id, commande_id, reglement_lu, presence_confirmee)
      VALUES (1, 1, $1, false, false)
    `, [commande.rows[0].id]);
    
    console.log('Données test créées avec succès');
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

createTestData();