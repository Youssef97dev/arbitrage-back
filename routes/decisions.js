const express = require('express');
const { auth, arbitreAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  res.json({ message: 'Route décisions' });
});

module.exports = router;