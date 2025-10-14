// Données partagées entre admin et public
let formations = [
  { id: 1, titre: 'Formation Arbitrage Commercial', description: 'Maîtrisez les techniques d\'arbitrage pour les litiges commerciaux', duree: '3 jours', public_cible: 'Juristes, Avocats, Médiateurs', prix: 2500, date: '2024-02-15' },
  { id: 2, titre: 'Médiation et Négociation', description: 'Apprenez les méthodes de résolution amiable des conflits', duree: '2 jours', public_cible: 'Professionnels RH, Managers', prix: 1800, date: '2024-03-10' },
  { id: 3, titre: 'Arbitrage International', description: 'Spécialisez-vous dans l\'arbitrage transfrontalier', duree: '5 jours', public_cible: 'Experts juridiques, Avocats internationaux', prix: 4200, date: '2024-04-05' },
  { id: 4, titre: 'Gestion des Conflits en Entreprise', description: 'Formation pratique pour gérer les conflits internes', duree: '1 jour', public_cible: 'DRH, Managers, Chefs d\'équipe', prix: 950, date: '2024-02-28' }
];

let services = [
  { id: 1, nom: 'Arbitrage Commercial', description: 'Résolution rapide des litiges commerciaux entre entreprises', type: 'arbitrage', prix_base: 1500, prix: 1500 },
  { id: 2, nom: 'Médiation Familiale', description: 'Accompagnement dans la résolution des conflits familiaux', type: 'mediation', prix_base: 800, prix: 800 },
  { id: 3, nom: 'Arbitrage Immobilier', description: 'Règlement des différends liés aux transactions immobilières', type: 'arbitrage', prix_base: 1200, prix: 1200 },
  { id: 4, nom: 'Médiation du Travail', description: 'Résolution des conflits entre employeurs et salariés', type: 'mediation', prix_base: 600, prix: 600 },
  { id: 5, nom: 'Arbitrage International', description: 'Arbitrage pour les litiges transfrontaliers', type: 'arbitrage', prix_base: 3000, prix: 3000 }
];

module.exports = { formations, services };