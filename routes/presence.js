const express = require('express');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

// Créer une session de formation
router.post('/session/create', async (req, res) => {
  try {
    const { formation_id, date_session, heure_debut, heure_fin } = req.body;
    
    const sessionCode = 'SESS_' + Date.now();
    const result = await pool.query(`
      INSERT INTO sessions_formation (formation_id, code_session, date_session, heure_debut, heure_fin, statut)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `, [formation_id, sessionCode, date_session, heure_debut, heure_fin]);
    
    // Générer QR code
    const qrData = JSON.stringify({
      session_id: result.rows[0].id,
      code: sessionCode,
      formation_id
    });
    
    const qrCode = await QRCode.toDataURL(qrData);
    
    res.json({
      session: result.rows[0],
      qr_code: qrCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scanner QR code pour marquer présence
router.post('/scan', async (req, res) => {
  try {
    const { qr_data, user_id } = req.body;
    const sessionData = JSON.parse(qr_data);
    
    // Vérifier si l'utilisateur a acheté cette formation
    const achatCheck = await pool.query(`
      SELECT fs.* FROM formation_suivi fs
      JOIN commandes c ON fs.commande_id = c.id
      WHERE fs.user_id = $1 AND fs.formation_id = $2
    `, [user_id, sessionData.formation_id]);
    
    if (achatCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Formation non achetée' });
    }
    
    // Marquer présence
    await pool.query(`
      INSERT INTO presences (session_id, user_id, heure_presence)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id, user_id) DO UPDATE SET heure_presence = NOW()
    `, [sessionData.session_id, user_id]);
    
    // Mettre à jour le suivi formation
    await pool.query(`
      UPDATE formation_suivi 
      SET presence_confirmee = TRUE, date_completion = NOW()
      WHERE user_id = $1 AND formation_id = $2
    `, [user_id, sessionData.formation_id]);
    
    res.json({ success: true, message: 'Présence enregistrée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des présences pour une session
router.get('/session/:id/presences', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        u.nom,
        u.prenom,
        u.email
      FROM presences p
      JOIN users u ON p.user_id = u.id
      WHERE p.session_id = $1
      ORDER BY p.heure_presence DESC
    `, [req.params.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sessions actives
router.get('/sessions/active', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.*,
        COUNT(p.id) as nb_presents
      FROM sessions_formation s
      LEFT JOIN presences p ON s.id = p.session_id
      WHERE s.statut = 'active'
      GROUP BY s.id
      ORDER BY s.date_creation DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;