const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'arbitrage_db',
  password: process.env.DB_PASSWORD || 'root',
  port: process.env.DB_PORT || 5432,
});

const router = express.Router();

// Routes publiques pour afficher services et formations
router.get('/services', (req, res) => {
  res.json(services);
});

const { formations, services } = require('../shared/data');

router.get('/formations', (req, res) => {
  console.log('Formations demandées pour home page:', formations.length);
  res.json(formations);
});

router.get('/testimonials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM temoignages WHERE statut = $1 ORDER BY date_creation DESC', ['approuve']);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/testimonials', async (req, res) => {
  try {
    const { nom, prenom, email, message, note, service_type } = req.body;
    const result = await pool.query(
      'INSERT INTO temoignages (nom, prenom, email, message, note, service_type, date_creation) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [nom, prenom, email, message, note, service_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;