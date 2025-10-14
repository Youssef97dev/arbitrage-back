const express = require('express');
const FormationController = require('../controllers/formationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', FormationController.getAllFormations);
router.get('/:id', FormationController.getFormationById);

// Routes protégées (admin)
router.post('/', auth, FormationController.createFormation);
router.put('/:id', auth, FormationController.updateFormation);
router.delete('/:id', auth, FormationController.deleteFormation);

module.exports = router;