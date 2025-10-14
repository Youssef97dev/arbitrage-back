const { Pool } = require('pg');
require('dotenv').config();

const db = {
  query: async (text, params) => {
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'plateforme_arbitrage',
      password: 'root',
      port: 5432,
    });
    return await pool.query(text, params);
  }
};

async function insertSampleData() {
  try {
    // Création des tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS formations (
        id SERIAL PRIMARY KEY,
        titre VARCHAR(255) NOT NULL,
        description TEXT,
        duree VARCHAR(100),
        public_cible VARCHAR(255),
        objectifs TEXT,
        programme TEXT,
        prix DECIMAL(10,2),
        date_creation TIMESTAMP DEFAULT NOW(),
        date_modification TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS temoignages (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        note INTEGER CHECK (note >= 1 AND note <= 5),
        service_type VARCHAR(50),
        service_id INTEGER,
        statut VARCHAR(20) DEFAULT 'en_attente',
        date_creation TIMESTAMP DEFAULT NOW()
      )
    `);

    // Formations
    const formations = [
      ['Formation Arbitrage Commercial', 'Maîtrisez les techniques d\'arbitrage pour les litiges commerciaux', '3 jours', 'Juristes, Avocats', 2500],
      ['Médiation et Négociation', 'Apprenez les méthodes de résolution amiable des conflits', '2 jours', 'Professionnels RH', 1800],
      ['Arbitrage International', 'Spécialisez-vous dans l\'arbitrage transfrontalier', '5 jours', 'Experts juridiques', 4200]
    ];

    for (const formation of formations) {
      await db.query(
        'INSERT INTO formations (titre, description, duree, public_cible, prix, date_creation) VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT DO NOTHING',
        formation
      );
    }

    // Témoignages
    const testimonials = [
      ['Benali', 'Ahmed', 'ahmed.benali@email.com', 'Service exceptionnel ! L\'arbitrage de notre litige commercial s\'est déroulé rapidement et équitablement. Je recommande vivement cette plateforme.', 5, 'arbitrage', 'approuve'],
      ['Martin', 'Sophie', 'sophie.martin@email.com', 'Formation très enrichissante sur la médiation. Les formateurs sont compétents et l\'approche pratique m\'a beaucoup aidée dans mon travail.', 5, 'formation', 'approuve'],
      ['Alami', 'Youssef', 'youssef.alami@email.com', 'Résolution efficace de notre conflit immobilier. Le processus était transparent et le résultat satisfaisant pour toutes les parties.', 4, 'arbitrage', 'approuve'],
      ['Dubois', 'Marie', 'marie.dubois@email.com', 'Excellente plateforme ! L\'arbitrage s\'est fait en ligne facilement. Gain de temps considérable par rapport aux tribunaux classiques.', 5, 'arbitrage', 'approuve'],
      ['Tazi', 'Karim', 'karim.tazi@email.com', 'Formation complète sur l\'arbitrage international. Contenu de qualité et certificat reconnu. Parfait pour ma carrière.', 4, 'formation', 'approuve'],
      ['Rousseau', 'Claire', 'claire.rousseau@email.com', 'Service professionnel et discret. Notre litige du travail a été résolu rapidement avec une solution équitable pour tous.', 5, 'arbitrage', 'approuve']
    ];

    for (const testimonial of testimonials) {
      await db.query(
        'INSERT INTO temoignages (nom, prenom, email, message, note, service_type, statut, date_creation) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT DO NOTHING',
        testimonial
      );
    }

    console.log('✅ Données d\'exemple insérées avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

insertSampleData();