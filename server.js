const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
});
app.use(limiter);

// Middleware pour parser JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes auth désactivées
// app.use('/api/users', require('./routes/users'));
// app.use('/api/cases', require('./routes/cases'));
// app.use('/api/decisions', require('./routes/decisions'));
// app.use('/api/messages', require('./routes/messages'));

// Route de test
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Plateforme d'arbitrage API" });
});

// Route d'authentification
app.post("/api/auth/login", async (req, res) => {
  console.log("Login attempt:", req.body);
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    // Vérifier si l'utilisateur existe
    const { Pool } = require("pg");
    const pool = new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "arbitrage_db",
      password: process.env.DB_PASSWORD || "root",
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log("User found:", user.email);
      res.json({
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        },
        token: "jwt-token-" + Date.now(),
      });
    } else {
      res.status(401).json({ error: "Utilisateur non trouvé" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route mot de passe oublié
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requis" });
    }

    const { Pool } = require("pg");
    const pool = new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "arbitrage_db",
      password: process.env.DB_PASSWORD || "root",
      port: process.env.DB_PORT || 5432,
    });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      // Générer un token de réinitialisation
      const resetToken = "reset_" + Date.now();

      // TODO: Envoyer email avec lien de réinitialisation
      console.log("Token de réinitialisation pour", email, ":", resetToken);

      res.json({ message: "Instructions envoyées par email" });
    } else {
      res.status(404).json({ error: "Email non trouvé" });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route Google OAuth (simulation)
app.get("/api/auth/google", (req, res) => {
  // Redirection vers Google OAuth
  const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=https://arbitrage-back-tdns.onrender.com/api/auth/google/callback&scope=email profile&response_type=code`;
  res.redirect(googleAuthUrl);
});

// Callback Google OAuth
app.get("/api/auth/google/callback", async (req, res) => {
  try {
    // TODO: Implémenter la logique Google OAuth
    // Pour l'instant, redirection vers login
    res.redirect("https://arbitrage-back-tdns.onrender.com/login?google=error");
  } catch (error) {
    res.redirect(
      "https://arbitrage-back-tdns.onrender.com/login?error=google_auth_failed"
    );
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const { Pool } = require("pg");
    const pool = new Pool({
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "arbitrage_db",
      password: process.env.DB_PASSWORD || "root",
      port: process.env.DB_PORT || 5432,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const result = await pool.query(
      "INSERT INTO users (email, password, role, prenom, nom, date_creation) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *",
      [email, password, "client", prenom, nom]
    );

    const user = result.rows[0];
    res.status(201).json({
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role,
      },
      token: "jwt-token-" + Date.now(),
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === "23505") {
      res.status(400).json({ error: "Cet email est déjà utilisé" });
    } else {
      res.status(500).json({ error: "Erreur serveur" });
    }
  }
});

// Routes publiques avec données réelles
app.use("/api/public", require("./routes/public"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/purchase", require("./routes/purchase"));
app.use("/api/services", require("./routes/services"));
app.use("/api/formations", require("./routes/formations"));
app.use("/api/certificats", require("./routes/certificats"));
app.use("/api/user", require("./routes/user-dashboard"));
app.use("/api/presence", require("./routes/presence"));
app.use("/api/coupons", require("./routes/coupons"));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
