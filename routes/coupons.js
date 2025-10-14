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

// Admin - Créer un coupon
router.post('/create', async (req, res) => {
  try {
    const { code, nom, type_reduction, valeur_reduction, date_debut, date_fin, limite_utilisation } = req.body;
    
    const result = await pool.query(`
      INSERT INTO coupons (code, nom, type_reduction, valeur_reduction, date_debut, date_fin, limite_utilisation)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [code, nom, type_reduction, valeur_reduction, date_debut, date_fin, limite_utilisation]);
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin - Liste des coupons
router.get('/admin/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(uc.id) as total_utilisations
      FROM coupons c
      LEFT JOIN utilisations_coupons uc ON c.id = uc.coupon_id
      GROUP BY c.id
      ORDER BY c.date_creation DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier un coupon
router.post('/verify', async (req, res) => {
  try {
    const { code, montant_commande } = req.body;
    
    const result = await pool.query(`
      SELECT * FROM coupons 
      WHERE code = $1 
      AND statut = 'actif' 
      AND date_debut <= CURRENT_DATE 
      AND date_fin >= CURRENT_DATE
      AND (limite_utilisation IS NULL OR utilisations_actuelles < limite_utilisation)
    `, [code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Coupon invalide ou expiré' });
    }
    
    const coupon = result.rows[0];
    let montant_reduction = 0;
    
    if (coupon.type_reduction === 'pourcentage') {
      montant_reduction = (montant_commande * coupon.valeur_reduction) / 100;
    } else {
      montant_reduction = Math.min(coupon.valeur_reduction, montant_commande);
    }
    
    res.json({
      coupon,
      montant_reduction: parseFloat(montant_reduction.toFixed(2)),
      nouveau_total: parseFloat((montant_commande - montant_reduction).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utiliser un coupon
router.post('/use', async (req, res) => {
  try {
    const { coupon_id, user_id, commande_id, montant_reduction } = req.body;
    
    // Enregistrer l'utilisation
    await pool.query(`
      INSERT INTO utilisations_coupons (coupon_id, user_id, commande_id, montant_reduction)
      VALUES ($1, $2, $3, $4)
    `, [coupon_id, user_id, commande_id, montant_reduction]);
    
    // Mettre à jour le compteur
    await pool.query(`
      UPDATE coupons 
      SET utilisations_actuelles = utilisations_actuelles + 1
      WHERE id = $1
    `, [coupon_id]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;