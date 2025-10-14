const express = require('express');
const { body, validationResult } = require('express-validator');
const Case = require('../models/Case');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Créer un nouveau dossier d'arbitrage
router.post('/', auth, [
  body('defendeur_id').isInt(),
  body('titre').trim().isLength({ min: 5 }),
  body('description').trim().isLength({ min: 20 }),
  body('type_conflit').isIn(['commercial', 'civil', 'travail', 'immobilier']),
  body('montant_litige').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseData = {
      ...req.body,
      demandeur_id: req.user.id
    };

    const newCase = await Case.create(caseData);
    res.status(201).json(newCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création du dossier' });
  }
});

// Récupérer les dossiers de l'utilisateur
router.get('/my-cases', auth, async (req, res) => {
  try {
    const cases = await Case.findByUserId(req.user.id);
    res.json(cases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des dossiers' });
  }
});

// Récupérer un dossier spécifique
router.get('/:id', auth, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);
    
    if (!caseData) {
      return res.status(404).json({ error: 'Dossier non trouvé' });
    }

    // Vérifier que l'utilisateur a accès à ce dossier
    if (caseData.demandeur_id !== req.user.id && 
        caseData.defendeur_id !== req.user.id && 
        caseData.arbitre_id !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    res.json(caseData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération du dossier' });
  }
});

module.exports = router;