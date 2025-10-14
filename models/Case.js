const db = require('../config/database');

class Case {
  static async create(caseData) {
    const { demandeur_id, defendeur_id, titre, description, type_conflit, montant_litige } = caseData;
    
    const query = `
      INSERT INTO dossiers_arbitrage (
        demandeur_id, defendeur_id, titre, description, 
        type_conflit, montant_litige, statut, date_creation
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'en_attente', NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [demandeur_id, defendeur_id, titre, description, type_conflit, montant_litige]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT d.*, 
             u1.nom as demandeur_nom, u1.prenom as demandeur_prenom,
             u2.nom as defendeur_nom, u2.prenom as defendeur_prenom,
             u3.nom as arbitre_nom, u3.prenom as arbitre_prenom
      FROM dossiers_arbitrage d
      LEFT JOIN utilisateurs u1 ON d.demandeur_id = u1.id
      LEFT JOIN utilisateurs u2 ON d.defendeur_id = u2.id
      LEFT JOIN utilisateurs u3 ON d.arbitre_id = u3.id
      WHERE d.id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT d.*, 
             u1.nom as demandeur_nom, u1.prenom as demandeur_prenom,
             u2.nom as defendeur_nom, u2.prenom as defendeur_prenom
      FROM dossiers_arbitrage d
      LEFT JOIN utilisateurs u1 ON d.demandeur_id = u1.id
      LEFT JOIN utilisateurs u2 ON d.defendeur_id = u2.id
      WHERE d.demandeur_id = $1 OR d.defendeur_id = $1
      ORDER BY d.date_creation DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Case;