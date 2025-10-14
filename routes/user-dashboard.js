const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

// Mes achats
router.get('/mes-achats', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    const result = await pool.query(`
      SELECT 
        c.*,
        p.transaction_id,
        p.methode_paiement,
        p.statut as statut_paiement,
        p.date_creation as date_paiement
      FROM commandes c
      LEFT JOIN paiements p ON c.id = p.commande_id
      WHERE c.user_id = $1
      ORDER BY c.date_creation DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mon suivi formations
router.get('/mes-formations', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    const result = await pool.query(`
      SELECT 
        fs.*,
        c.type_produit,
        c.produit_id,
        c.prix
      FROM formation_suivi fs
      JOIN commandes c ON fs.commande_id = c.id
      WHERE fs.user_id = $1
      ORDER BY fs.date_creation DESC
    `, [userId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Marquer règlement lu
router.post('/formation/:id/reglement', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    await pool.query(
      'UPDATE formation_suivi SET reglement_lu = TRUE WHERE user_id = $1 AND formation_id = $2',
      [userId, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirmer présence
router.post('/formation/:id/presence', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    const result = await pool.query(
      'UPDATE formation_suivi SET presence_confirmee = TRUE, date_completion = NOW() WHERE user_id = $1 AND formation_id = $2 RETURNING *',
      [userId, req.params.id]
    );
    
    const suivi = result.rows[0];
    if (suivi && suivi.reglement_lu && suivi.presence_confirmee) {
      // Générer certificat
      const numeroCertificat = 'CERT-' + Date.now();
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      const userData = userResult.rows[0];
      
      await pool.query(
        'INSERT INTO certificats (user_id, formation_id, numero_certificat, nom_complet, formation_titre, date_formation, statut, reglement_complete, presence_complete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [userId, req.params.id, numeroCertificat, `${userData.prenom} ${userData.nom}`, 'Formation', new Date(), 'en_attente', true, true]
      );
    }
    
    res.json({ success: true, certificat_genere: suivi.reglement_lu && suivi.presence_confirmee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mes certificats
router.get('/mes-certificats', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    const result = await pool.query(
      'SELECT * FROM certificats WHERE user_id = $1 ORDER BY date_creation DESC',
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;