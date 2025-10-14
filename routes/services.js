const express = require('express');
const ServiceController = require('../controllers/serviceController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);

// Routes protégées (admin)
router.post('/', auth, ServiceController.createService);
router.put('/:id', auth, ServiceController.updateService);
router.delete('/:id', auth, ServiceController.deleteService);

module.exports = router;