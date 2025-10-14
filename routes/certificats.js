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

// Marquer le règlement comme lu
router.post('/reglement/:formationId', async (req, res) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    await pool.query(
      'UPDATE formation_suivi SET reglement_lu = TRUE WHERE user_id = $1 AND formation_id = $2',
      [user.id, req.params.formationId]
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirmer la présence
router.post('/presence/:formationId', async (req, res) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const result = await pool.query(
      'UPDATE formation_suivi SET presence_confirmee = TRUE, date_completion = NOW() WHERE user_id = $1 AND formation_id = $2 RETURNING *',
      [user.id, req.params.formationId]
    );
    
    // Vérifier si conditions remplies pour certificat
    const suivi = result.rows[0];
    if (suivi.reglement_lu && suivi.presence_confirmee) {
      // Générer certificat
      const numeroCertificat = 'CERT-' + Date.now();
      const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
      const userData = userResult.rows[0];
      
      await pool.query(
        'INSERT INTO certificats (user_id, formation_id, numero_certificat, nom_complet, formation_titre, date_formation, statut, reglement_complete, presence_complete) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [user.id, req.params.formationId, numeroCertificat, `${userData.prenom} ${userData.nom}`, 'Formation', new Date(), 'en_attente', true, true]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir mes certificats
router.get('/mes-certificats', async (req, res) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    const result = await pool.query(
      'SELECT * FROM certificats WHERE user_id = $1 ORDER BY date_creation DESC',
      [user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;