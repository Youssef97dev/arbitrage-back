const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true, // force SSL
    rejectUnauthorized: false, // accept self-signed cert
  },
});

// Test de connexion
pool.connect((err, client, release) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err.stack);
  } else {
    console.log("✅ Connexion à la base de données réussie");
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
