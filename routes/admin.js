const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const Service = require('../models/Service');
const Formation = require('../models/Formation');
const { formations, services } = require('../shared/data');

const router = express.Router();

// Routes Services
router.get('/services', (req, res) => {
  res.json(services);
});

router.post('/services', (req, res) => {
  const { nom, description, type, prix_base, prix } = req.body;
  const newService = {
    id: Math.max(...services.map(s => s.id)) + 1,
    nom,
    description,
    type: type || 'arbitrage',
    prix_base: prix_base || 0,
    prix: prix || prix_base || 0
  };
  services.push(newService);
  res.json(newService);
});

router.put('/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    const { nom, description, type, prix_base, prix } = req.body;
    services[index] = {
      ...services[index],
      nom: nom || services[index].nom,
      description: description || services[index].description,
      type: type || services[index].type,
      prix_base: prix_base !== undefined ? prix_base : services[index].prix_base,
      prix: prix !== undefined ? prix : services[index].prix
    };
    res.json(services[index]);
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

router.delete('/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = services.findIndex(s => s.id === id);
  if (index !== -1) {
    services.splice(index, 1);
    res.json({ message: 'Service supprimé' });
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

// Routes Stats
router.get('/stats', (req, res) => {
  res.json({
    totalUsers: 4,
    activeCases: 0,
    totalServices: 5,
    totalFormations: 4
  });
});

// Routes Certificats
router.get('/certificats', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'arbitrage_db',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query(`
      SELECT 
        c.*,
        u.nom,
        u.prenom,
        u.email
      FROM certificats c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.date_creation DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur certificats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/certificats/:id/valider', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'arbitrage_db',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query(
      'UPDATE certificats SET statut = $1, date_emission = CURRENT_DATE WHERE id = $2 RETURNING *',
      ['valide', req.params.id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes Encaissements
router.get('/encaissements', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'arbitrage_db',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query(`
      SELECT 
        p.id,
        p.transaction_id,
        p.methode_paiement,
        p.montant,
        p.statut,
        p.date_creation,
        p.recu_path,
        u.nom,
        u.prenom,
        u.email,
        c.type_produit,
        c.produit_id
      FROM paiements p
      JOIN commandes c ON p.commande_id = c.id
      JOIN users u ON c.user_id = u.id
      ORDER BY p.date_creation DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur encaissements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes Users
router.get('/users', (req, res) => {
  res.json([
    { id: 1, prenom: 'Admin', nom: 'Système', email: 'admin@arbitrage.com', role: 'admin', date_creation: '2024-01-01' },
    { id: 2, prenom: 'Jean', nom: 'Dupont', email: 'arbitre1@arbitrage.com', role: 'arbitre', date_creation: '2024-01-02' },
    { id: 3, prenom: 'Marie', nom: 'Martin', email: 'client1@email.com', role: 'client', date_creation: '2024-01-03' },
    { id: 4, prenom: 'Ahmed', nom: 'Benali', email: 'client2@email.com', role: 'client', date_creation: '2024-01-04' }
  ]);
});

// Routes Formations
router.get('/formations', (req, res) => {
  res.json(formations);
});

router.post('/formations', (req, res) => {
  const { titre, description, duree, public_cible, objectifs, programme, prix, date } = req.body;
  const newFormation = {
    id: Math.max(...formations.map(f => f.id)) + 1,
    titre,
    description,
    duree: duree || '',
    public_cible: public_cible || '',
    objectifs: objectifs || '',
    programme: programme || '',
    prix: prix || 0,
    date: date || new Date().toISOString().split('T')[0]
  };
  formations.push(newFormation);
  res.json(newFormation);
});

router.put('/formations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = formations.findIndex(f => f.id === id);
  if (index !== -1) {
    const { titre, description, duree, public_cible, objectifs, programme, prix, date } = req.body;
    formations[index] = {
      ...formations[index],
      titre: titre || formations[index].titre,
      description: description || formations[index].description,
      duree: duree || formations[index].duree,
      public_cible: public_cible || formations[index].public_cible,
      objectifs: objectifs || formations[index].objectifs,
      programme: programme || formations[index].programme,
      prix: prix !== undefined ? prix : formations[index].prix,
      date: date || formations[index].date
    };
    res.json(formations[index]);
  } else {
    res.status(404).json({ error: 'Formation non trouvée' });
  }
});

router.delete('/formations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = formations.findIndex(f => f.id === id);
  if (index !== -1) {
    formations.splice(index, 1);
    res.json({ message: 'Formation supprimée' });
  } else {
    res.status(404).json({ error: 'Formation non trouvée' });
  }
});

// Télécharger un reçu
router.get('/recu/:filename', (req, res) => {
  const filename = req.params.filename;
  const path = require('path');
  const filePath = path.join(__dirname, '../uploads', filename);
  res.download(filePath);
});

// Générer certificat PDF
router.get('/certificat-pdf/:id', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'arbitrage_db',
      password: process.env.DB_PASSWORD || 'root',
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query('SELECT * FROM certificats WHERE id = $1', [req.params.id]);
    const certificat = result.rows[0];
    
    if (!certificat) {
      return res.status(404).json({ error: 'Certificat non trouvé' });
    }

    const pdfContent = `
      <html>
        <head>
          <title>Certificat de Formation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .certificat { border: 5px solid #1e3a8a; padding: 40px; margin: 20px; }
            .titre { font-size: 32px; color: #1e3a8a; margin-bottom: 20px; }
            .nom { font-size: 24px; font-weight: bold; margin: 20px 0; }
            .formation { font-size: 18px; margin: 15px 0; }
            .numero { font-size: 12px; color: #666; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="certificat">
            <h1 class="titre">CERTIFICAT DE FORMATION</h1>
            <p>Il est certifié que</p>
            <h2 class="nom">${certificat.nom_complet}</h2>
            <p>a suivi avec succès la formation</p>
            <h3 class="formation">${certificat.formation_titre}</h3>
            <p>Le ${new Date(certificat.date_formation).toLocaleDateString('fr-FR')}</p>
            <p class="numero">N° ${certificat.numero_certificat}</p>
            <p class="numero">Émis le ${new Date(certificat.date_emission).toLocaleDateString('fr-FR')}</p>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;