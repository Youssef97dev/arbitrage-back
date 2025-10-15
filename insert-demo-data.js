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

async function insertDemoData() {
  try {
    console.log("🚀 Insertion des données de démonstration...");

    // Utilisateurs
    const users = [
      [
        "admin@arbitrage.com",
        "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        "admin",
        "Admin",
        "Système",
        "0600000000",
      ],
      [
        "arbitre1@arbitrage.com",
        "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        "arbitre",
        "Jean",
        "Dupont",
        "0601234567",
      ],
      [
        "client1@email.com",
        "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        "client",
        "Marie",
        "Martin",
        "0607654321",
      ],
      [
        "client2@email.com",
        "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        "client",
        "Ahmed",
        "Benali",
        "0612345678",
      ],
    ];

    for (const user of users) {
      await pool.query(
        "INSERT INTO users (email, password, role, prenom, nom, telephone, date_creation) VALUES ($1, $2, $3, $4, $5, $6, NOW()) ON CONFLICT (email) DO NOTHING",
        user
      );
    }

    // Formations
    const formations = [
      [
        "Formation Arbitrage Commercial",
        "Maîtrisez les techniques d'arbitrage pour les litiges commerciaux. Formation complète avec cas pratiques.",
        "3 jours",
        "Juristes, Avocats, Médiateurs",
        2500,
      ],
      [
        "Médiation et Négociation",
        "Apprenez les méthodes de résolution amiable des conflits. Techniques de communication et de négociation.",
        "2 jours",
        "Professionnels RH, Managers",
        1800,
      ],
      [
        "Arbitrage International",
        "Spécialisez-vous dans l'arbitrage transfrontalier. Droit international et procédures spécialisées.",
        "5 jours",
        "Experts juridiques, Avocats internationaux",
        4200,
      ],
      [
        "Gestion des Conflits en Entreprise",
        "Formation pratique pour gérer les conflits internes et améliorer le climat social.",
        "1 jour",
        "DRH, Managers, Chefs d'équipe",
        950,
      ],
    ];

    for (const formation of formations) {
      await pool.query(
        "INSERT INTO formations (titre, description, duree, public_cible, prix, date_creation) VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT DO NOTHING",
        formation
      );
    }

    // Services
    const services = [
      [
        "Arbitrage Commercial",
        "Résolution rapide et efficace des litiges commerciaux entre entreprises",
        "arbitrage",
        1500,
      ],
      [
        "Médiation Familiale",
        "Accompagnement dans la résolution des conflits familiaux (divorce, succession)",
        "mediation",
        800,
      ],
      [
        "Arbitrage Immobilier",
        "Règlement des différends liés aux transactions immobilières",
        "arbitrage",
        1200,
      ],
      [
        "Médiation du Travail",
        "Résolution des conflits entre employeurs et salariés",
        "mediation",
        600,
      ],
      [
        "Arbitrage International",
        "Arbitrage pour les litiges transfrontaliers",
        "arbitrage",
        3000,
      ],
    ];

    for (const service of services) {
      await pool.query(
        "INSERT INTO services (nom, description, type, prix_base, date_creation) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT DO NOTHING",
        service
      );
    }

    // Témoignages
    const temoignages = [
      [
        "Benali",
        "Ahmed",
        "ahmed.benali@email.com",
        "Service exceptionnel ! L'arbitrage de notre litige commercial s'est déroulé rapidement et équitablement. Je recommande vivement cette plateforme.",
        5,
        "arbitrage",
        "approuve",
      ],
      [
        "Martin",
        "Sophie",
        "sophie.martin@email.com",
        "Formation très enrichissante sur la médiation. Les formateurs sont compétents et l'approche pratique m'a beaucoup aidée dans mon travail.",
        5,
        "formation",
        "approuve",
      ],
      [
        "Alami",
        "Youssef",
        "youssef.alami@email.com",
        "Résolution efficace de notre conflit immobilier. Le processus était transparent et le résultat satisfaisant pour toutes les parties.",
        4,
        "arbitrage",
        "approuve",
      ],
      [
        "Dubois",
        "Marie",
        "marie.dubois@email.com",
        "Excellente plateforme ! L'arbitrage s'est fait en ligne facilement. Gain de temps considérable par rapport aux tribunaux classiques.",
        5,
        "arbitrage",
        "approuve",
      ],
      [
        "Tazi",
        "Karim",
        "karim.tazi@email.com",
        "Formation complète sur l'arbitrage international. Contenu de qualité et certificat reconnu. Parfait pour ma carrière.",
        4,
        "formation",
        "approuve",
      ],
      [
        "Rousseau",
        "Claire",
        "claire.rousseau@email.com",
        "Service professionnel et discret. Notre litige du travail a été résolu rapidement avec une solution équitable pour tous.",
        5,
        "arbitrage",
        "approuve",
      ],
      [
        "Lemoine",
        "Pierre",
        "pierre.lemoine@email.com",
        "Médiation familiale très bien menée. L'arbitre était impartial et nous a aidés à trouver un accord équitable.",
        4,
        "mediation",
        "approuve",
      ],
      [
        "Khalil",
        "Fatima",
        "fatima.khalil@email.com",
        "Formation sur la gestion des conflits très utile. J'ai pu appliquer les techniques apprises dès mon retour au bureau.",
        5,
        "formation",
        "approuve",
      ],
    ];

    for (const temoignage of temoignages) {
      await pool.query(
        "INSERT INTO temoignages (nom, prenom, email, message, note, service_type, statut, date_creation) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) ON CONFLICT DO NOTHING",
        temoignage
      );
    }

    console.log("✅ Données de démonstration insérées avec succès !");
    console.log("📊 Données ajoutées :");
    console.log("   - 4 utilisateurs (admin, arbitre, 2 clients)");
    console.log("   - 4 formations");
    console.log("   - 5 services");
    console.log("   - 8 témoignages");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion:", error.message);
    await pool.end();
    process.exit(1);
  }
}

insertDemoData();
