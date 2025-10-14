const db = require('../config/database');

class Formation {
  static async create(formationData) {
    const { titre, description, duree, public_cible, objectifs, programme, prix, date } = formationData;
    
    const query = `
      INSERT INTO formations (titre, description, duree, public_cible, objectifs, programme, prix, date, date_creation)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [titre, description, duree, public_cible, objectifs, programme, prix, date]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM formations ORDER BY date_creation DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM formations WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, formationData) {
    const { titre, description, duree, public_cible, objectifs, programme, prix, date } = formationData;
    
    const query = `
      UPDATE formations 
      SET titre = $1, description = $2, duree = $3, public_cible = $4, objectifs = $5, programme = $6, prix = $7, date = $8, date_modification = NOW()
      WHERE id = $9
      RETURNING *
    `;
    
    const result = await db.query(query, [titre, description, duree, public_cible, objectifs, programme, prix, date, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM formations WHERE id = $1';
    await db.query(query, [id]);
  }
}

module.exports = Formation;