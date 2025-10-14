const db = require('../config/database');

class Service {
  static async create(serviceData) {
    const { titre, description, nom, type, prix_base, prix } = serviceData;
    
    const query = `
      INSERT INTO services (nom, description, type, prix_base, prix, date_creation)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [titre || nom, description, type || 'arbitrage', prix_base || 0, prix || prix_base || 0]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM services ORDER BY date_creation DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM services WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, serviceData) {
    const { titre, description, nom, type, prix_base, prix } = serviceData;
    
    const query = `
      UPDATE services 
      SET nom = $1, description = $2, type = $3, prix_base = $4, prix = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await db.query(query, [titre || nom, description, type || 'arbitrage', prix_base || 0, prix || prix_base || 0, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM services WHERE id = $1';
    await db.query(query, [id]);
  }
}

module.exports = Service;