const { services } = require('../shared/data');

class ServiceController {
  static getAllServices(req, res) {
    res.json(services);
  }

  static getServiceById(req, res) {
    const id = parseInt(req.params.id);
    const service = services.find(s => s.id === id);
    
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }
    
    res.json(service);
  }

  static createService(req, res) {
    const { nom, description, type, prix_base, prix } = req.body;
    
    if (!nom || !description) {
      return res.status(400).json({ error: 'Nom et description requis' });
    }

    const newService = {
      id: Math.max(...services.map(s => s.id)) + 1,
      nom,
      description,
      type: type || 'arbitrage',
      prix_base: prix_base || 0,
      prix: prix || prix_base || 0
    };

    services.push(newService);
    res.status(201).json(newService);
  }

  static updateService(req, res) {
    const id = parseInt(req.params.id);
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    const { nom, description, type, prix_base, prix } = req.body;
    
    services[serviceIndex] = {
      ...services[serviceIndex],
      nom: nom || services[serviceIndex].nom,
      description: description || services[serviceIndex].description,
      type: type || services[serviceIndex].type,
      prix_base: prix_base !== undefined ? prix_base : services[serviceIndex].prix_base,
      prix: prix !== undefined ? prix : services[serviceIndex].prix
    };

    res.json(services[serviceIndex]);
  }

  static deleteService(req, res) {
    const id = parseInt(req.params.id);
    const serviceIndex = services.findIndex(s => s.id === id);
    
    if (serviceIndex === -1) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    services.splice(serviceIndex, 1);
    res.status(204).send();
  }
}

module.exports = ServiceController;