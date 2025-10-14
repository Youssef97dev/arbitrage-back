const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { generateReceipt } = require('../utils/pdfGenerator');
const { sendReceiptEmail } = require('../utils/emailService');
const upload = require('../middleware/upload');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

// Middleware simple d'auth
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requis' });
  }
  // Extraire le token (Bearer token)
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) {
    return res.status(401).json({ error: 'Token invalide' });
  }
  next();
};

// Route de test GET
router.get('/test', async (req, res) => {
  console.log('=== TEST ROUTE GET ===');
  res.json({ success: true, message: 'Route de test OK' });
});

// Test DB
router.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, db: 'OK', time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Paiement simple sans auth
router.post('/paiement-simple', async (req, res) => {
  try {
    console.log('Paiement simple reçu:', req.body);
    
    // Créer une commande d'abord
    const commande = await pool.query(
      'INSERT INTO commandes (user_id, type_produit, produit_id, prix) VALUES ($1, $2, $3, $4) RETURNING *',
      [1, 'formation', 1, 100]
    );
    
    // Puis le paiement
    const paiement = await pool.query(
      'INSERT INTO paiements (commande_id, methode_paiement, montant, statut, transaction_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [commande.rows[0].id, 'carte', 100, 'reussi', 'TXN_' + Date.now()]
    );
    
    res.json({ success: true, commande: commande.rows[0], paiement: paiement.rows[0] });
  } catch (error) {
    console.error('Erreur paiement simple:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de test POST
router.post('/test', async (req, res) => {
  console.log('=== TEST ROUTE POST ===');
  console.log('Body:', req.body);
  res.json({ success: true, message: 'Route de test POST OK' });
});

// Test paiement sans auth
router.post('/test-paiement', async (req, res) => {
  try {
    console.log('=== TEST PAIEMENT ===');
    console.log('Body:', req.body);
    
    const { commande_id, methode_paiement, montant } = req.body;
    
    // Test avec des valeurs par défaut si manquantes
    const testCommande = commande_id || 1;
    const testMethode = methode_paiement || 'carte';
    const testMontant = montant || 100;
    
    console.log('Test avec:', { testCommande, testMethode, testMontant });
    
    const paiement = await pool.query(
      'INSERT INTO paiements (commande_id, methode_paiement, montant, statut, transaction_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [testCommande, testMethode, testMontant, 'reussi', 'TXN_' + Date.now()]
    );
    
    res.json({ success: true, paiement: paiement.rows[0] });
  } catch (error) {
    console.error('Erreur test paiement:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Créer une commande
router.post('/commande', authMiddleware, async (req, res) => {
  try {
    const { user_id, type_produit, produit_id, prix } = req.body;
    
    const result = await pool.query(
      'INSERT INTO commandes (user_id, type_produit, produit_id, prix) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, type_produit, produit_id, prix]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Traiter un paiement complet (commande + paiement)
router.post('/paiement', upload.single('recu'), async (req, res) => {
  try {
    const { user_id, type_produit, produit_id, prix, methode_paiement, details_paiement } = req.body;
    const recuFile = req.file;
    
    // Créer la commande (avec des IDs sécurisés)
    const safeUserId = parseInt(user_id) || 1;
    const safeProduitId = 1;
    const safePrix = parseFloat(prix) || 100;
    
    console.log('ID utilisateur reçu:', user_id, 'ID sécurisé:', safeUserId);
    
    const commande = await pool.query(
      'INSERT INTO commandes (user_id, type_produit, produit_id, prix) VALUES ($1, $2, $3, $4) RETURNING *',
      [safeUserId, type_produit, safeProduitId, safePrix]
    );
    
    // Créer le paiement
    const transactionId = 'TXN_' + Math.floor(Math.random() * 999999);
    const recuPath = recuFile ? `/uploads/${recuFile.filename}` : null;
    const paiement = await pool.query(
      'INSERT INTO paiements (commande_id, methode_paiement, montant, statut, transaction_id, details_paiement, recu_path) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [commande.rows[0].id, methode_paiement, safePrix, 'reussi', transactionId, details_paiement, recuPath]
    );

    // Si c'est une formation, créer le suivi
    if (type_produit === 'formation') {
      await pool.query(
        'INSERT INTO formation_suivi (user_id, formation_id, commande_id) VALUES ($1, $2, $3)',
        [safeUserId, produit_id, commande.rows[0].id]
      );
    }
    
    // Mettre à jour la commande
    await pool.query(
      'UPDATE commandes SET statut = $1, date_paiement = NOW() WHERE id = $2',
      ['paye', commande.rows[0].id]
    );
    
    // Générer le reçu PDF
    console.log('=== DÉBUT GÉNÉRATION REÇU ===');
    try {
      // Récupérer les infos utilisateur
      console.log('Récupération utilisateur ID:', safeUserId);
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [safeUserId]);
      const user = userResult.rows[0];
      console.log('Utilisateur trouvé:', user ? user.email : 'AUCUN');
      
      if (user && user.email) {
        console.log('Génération PDF en cours...');
        // Générer le PDF
        const pdfPath = await generateReceipt(commande.rows[0], paiement.rows[0], user);
        console.log('Reçu PDF généré:', pdfPath);
        
        console.log('Envoi email en cours...');
        // Envoyer par email
        const emailSent = await sendReceiptEmail(
          user.email, 
          `${user.prenom} ${user.nom}`, 
          pdfPath, 
          paiement.rows[0].transaction_id
        );
        
        if (emailSent) {
          console.log('Reçu envoyé par email à:', user.email);
        } else {
          console.log('ECHEC envoi email');
        }
      } else {
        console.log('AUCUN utilisateur ou email manquant');
      }
    } catch (error) {
      console.error('Erreur génération reçu:', error);
    }
    
    res.json({ success: true, commande: commande.rows[0], paiement: paiement.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;