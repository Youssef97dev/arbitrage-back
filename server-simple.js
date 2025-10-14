const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Plateforme d\'arbitrage API fonctionnelle',
    timestamp: new Date().toISOString()
  });
});

// Route d'authentification simple
app.post('/api/auth/login', (req, res) => {
  const { email, mot_de_passe } = req.body;
  
  // Compte admin par défaut
  if (email === 'admin@arbitrage.ma' && mot_de_passe === 'admin123') {
    const user = {
      id: 1,
      nom: 'Admin',
      prenom: 'Système',
      email: email,
      role: 'admin'
    };
    
    res.json({
      user: user,
      token: 'admin-jwt-token-' + Date.now()
    });
  } else if (email && mot_de_passe) {
    const user = {
      id: 2,
      nom: 'Test',
      prenom: 'Utilisateur',
      email: email,
      role: 'utilisateur'
    };
    
    res.json({
      user: user,
      token: 'user-jwt-token-' + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Identifiants requis' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { nom, prenom, email } = req.body;
  
  if (nom && prenom && email) {
    const user = {
      id: Date.now(),
      nom,
      prenom,
      email,
      role: req.body.role || 'partie'
    };
    
    res.status(201).json({
      user: user,
      token: 'fake-jwt-token-' + Date.now()
    });
  } else {
    res.status(400).json({ error: 'Données manquantes' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 API disponible sur: http://localhost:${PORT}/api/health`);
});