const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function createTestCertificat() {
  try {
    // Créer un certificat en attente
    const result = await pool.query(`
      INSERT INTO certificats (user_id, formation_id, numero_certificat, nom_complet, formation_titre, date_formation, statut, reglement_complete, presence_complete)
      VALUES (1, 1, 'CERT-ATTENTE-123', 'Jean Dupont', 'Formation Arbitrage Commercial', '2024-01-15', 'en_attente', true, true)
      RETURNING *
    `);
    
    console.log('Certificat en attente créé:', result.rows[0]);
    
    // Vérifier les utilisateurs
    const users = await pool.query('SELECT id, nom, prenom, email FROM users LIMIT 5');
    console.log('Utilisateurs disponibles:', users.rows);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

createTestCertificat();