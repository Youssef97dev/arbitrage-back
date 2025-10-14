const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = (commande, paiement, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `recu_${paiement.transaction_id}.pdf`;
      const filepath = path.join(__dirname, '../uploads', filename);
      
      // Stream vers fichier
      doc.pipe(fs.createWriteStream(filepath));
      
      // En-tête avec logo
      const logoPath = path.join(__dirname, '../uploads/logo.jpeg');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 40, { width: 60, height: 60 });
        doc.fontSize(20)
           .fillColor('#2563EB')
           .text('PLATEFORME D\'ARBITRAGE MAROC', 120, 50);
      } else {
        doc.fontSize(20)
           .fillColor('#2563EB')
           .text('🏛️ PLATEFORME D\'ARBITRAGE MAROC', 50, 50);
      }
      
      doc.fontSize(12)
         .fillColor('#666')
         .text('Centre d\'Arbitrage et de Médiation', 120, 75)
         .text('Casablanca, Maroc', 120, 90);
      
      // Ligne de séparation
      doc.moveTo(50, 120)
         .lineTo(550, 120)
         .stroke('#2563EB');
      
      // Titre du reçu
      doc.fontSize(18)
         .fillColor('#000')
         .text('REÇU DE PAIEMENT', 50, 140);
      
      // Informations client
      doc.fontSize(12)
         .text(`Client: ${user.prenom} ${user.nom}`, 50, 180)
         .text(`Email: ${user.email}`, 50, 200)
         .text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 50, 220);
      
      // Détails de la commande
      doc.fontSize(14)
         .fillColor('#2563EB')
         .text('DÉTAILS DE LA COMMANDE', 50, 260);
      
      doc.fontSize(12)
         .fillColor('#000')
         .text(`Type: ${commande.type_produit === 'formation' ? 'Formation' : 'Service'}`, 50, 290)
         .text(`Référence: #${commande.id}`, 50, 310)
         .text(`Montant: ${paiement.montant} €`, 50, 330)
         .text(`Méthode: ${paiement.methode_paiement}`, 50, 350)
         .text(`Transaction: ${paiement.transaction_id}`, 50, 370);
      
      // Statut
      doc.fontSize(12)
         .fillColor('#10B981')
         .text('✅ PAIEMENT CONFIRMÉ', 50, 400);
      
      // Message de remerciement
      doc.fontSize(14)
         .fillColor('#2563EB')
         .text('MERCI POUR VOTRE CONFIANCE', 50, 440);
      
      doc.fontSize(11)
         .fillColor('#666')
         .text('Nous vous remercions pour votre achat. Votre formation/service', 50, 470)
         .text('sera disponible dans votre espace personnel sous 24h.', 50, 485)
         .text('Pour toute question: contact@arbitrage-maroc.ma', 50, 510);
      
      // Pied de page
      doc.fontSize(10)
         .fillColor('#999')
         .text('Ce reçu fait foi de paiement - Document généré automatiquement', 50, 700);
      
      doc.end();
      
      doc.on('end', () => {
        resolve(filepath);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateReceipt };