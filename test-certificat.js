const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

async function testCertificat() {
  try {
    // Insérer un certificat de test
    const result = await pool.query(`
      INSERT INTO certificats (user_id, formation_id, numero_certificat, nom_complet, formation_titre, date_formation, statut, reglement_complete, presence_complete)
      VALUES (1, 1, 'CERT-TEST-123', 'Test User', 'Formation Test', '2024-01-15', 'valide', true, true)
      RETURNING *
    `);
    
    console.log('Certificat test créé:', result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await pool.end();
  }
}

testCertificat();