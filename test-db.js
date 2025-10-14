const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('🔍 Test de connexion PostgreSQL...');
    
    // Test connexion
    const client = await pool.connect();
    console.log('✅ Connexion réussie !');
    
    // Liste des bases
    const databases = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
    console.log('📊 Bases disponibles:', databases.rows.map(row => row.datname));
    
    // Vérifier si plateforme_arbitrage existe
    const dbExists = databases.rows.some(row => row.datname === 'plateforme_arbitrage');
    
    if (!dbExists) {
      console.log('⚠️  Base plateforme_arbitrage n\'existe pas. Création...');
      await client.query('CREATE DATABASE plateforme_arbitrage;');
      console.log('✅ Base plateforme_arbitrage créée !');
    } else {
      console.log('✅ Base plateforme_arbitrage existe déjà');
    }
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    process.exit(1);
  }
}

testConnection();