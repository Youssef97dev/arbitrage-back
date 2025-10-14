const { formations } = require('../shared/data');

class FormationController {
  static getAllFormations(req, res) {
    res.json(formations);
  }

  static getFormationById(req, res) {
    const id = parseInt(req.params.id);
    const formation = formations.find(f => f.id === id);
    
    if (!formation) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }
    
    res.json(formation);
  }

  static createFormation(req, res) {
    const { titre, description, duree, public_cible, objectifs, programme, prix, date } = req.body;
    
    if (!titre || !description) {
      return res.status(400).json({ error: 'Titre et description requis' });
    }

    const newFormation = {
      id: Math.max(...formations.map(f => f.id)) + 1,
      titre,
      description,
      duree: duree || '',
      public_cible: public_cible || '',
      objectifs: objectifs || '',
      programme: programme || '',
      prix: prix || 0,
      date: date || new Date().toISOString().split('T')[0]
    };

    formations.push(newFormation);
    res.status(201).json(newFormation);
  }

  static updateFormation(req, res) {
    const id = parseInt(req.params.id);
    const formationIndex = formations.findIndex(f => f.id === id);
    
    if (formationIndex === -1) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    const { titre, description, duree, public_cible, objectifs, programme, prix, date } = req.body;
    
    formations[formationIndex] = {
      ...formations[formationIndex],
      titre: titre || formations[formationIndex].titre,
      description: description || formations[formationIndex].description,
      duree: duree || formations[formationIndex].duree,
      public_cible: public_cible || formations[formationIndex].public_cible,
      objectifs: objectifs || formations[formationIndex].objectifs,
      programme: programme || formations[formationIndex].programme,
      prix: prix !== undefined ? prix : formations[formationIndex].prix,
      date: date || formations[formationIndex].date
    };

    res.json(formations[formationIndex]);
  }

  static deleteFormation(req, res) {
    const id = parseInt(req.params.id);
    const formationIndex = formations.findIndex(f => f.id === id);
    
    if (formationIndex === -1) {
      return res.status(404).json({ error: 'Formation non trouvée' });
    }

    formations.splice(formationIndex, 1);
    res.status(204).send();
  }
}

module.exports = FormationController;