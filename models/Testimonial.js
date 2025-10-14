const db = require('../config/database');

class Testimonial {
  static async create(testimonialData) {
    const { nom, prenom, email, message, note, service_type, service_id } = testimonialData;
    
    const query = `
      INSERT INTO temoignages (nom, prenom, email, message, note, service_type, service_id, date_creation, statut)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'en_attente')
      RETURNING *
    `;
    
    const result = await db.query(query, [nom, prenom, email, message, note, service_type, service_id]);
    return result.rows[0];
  }

  static async findApproved() {
    const query = 'SELECT * FROM temoignages WHERE statut = \'approuve\' ORDER BY date_creation DESC LIMIT 6';
    const result = await db.query(query);
    return result.rows;
  }

  static async approve(id) {
    const query = 'UPDATE temoignages SET statut = \'approuve\' WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Testimonial;