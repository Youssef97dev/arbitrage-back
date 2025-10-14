const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { nom, prenom, email, telephone, mot_de_passe, fonction, niveau_etude, etablissement, photo_path } = userData;
    const hashedPassword = await bcrypt.hash(mot_de_passe, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    const query = `
      INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, fonction, niveau_etude, etablissement, photo_path, role, date_creation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'utilisateur', NOW())
      RETURNING id, nom, prenom, email, telephone, fonction, niveau_etude, etablissement, photo_path, role, date_creation
    `;
    
    const result = await db.query(query, [nom, prenom, email, telephone, hashedPassword, fonction, niveau_etude, etablissement, photo_path]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    // Chercher d'abord dans la table users (pour admin)
    let query = 'SELECT * FROM users WHERE email = $1';
    let result = await db.query(query, [email]);
    
    if (result.rows[0]) {
      return result.rows[0];
    }
    
    // Si pas trouvé, chercher dans utilisateurs
    query = 'SELECT * FROM utilisateurs WHERE email = $1';
    result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, nom, prenom, email, telephone, fonction, niveau_etude, etablissement, photo_path, role, date_creation FROM utilisateurs WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;