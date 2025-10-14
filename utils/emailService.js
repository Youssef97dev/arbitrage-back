const nodemailer = require('nodemailer');
const fs = require('fs');

// Configuration email simplifiée
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'votressalles@gmail.com',
    pass: process.env.SMTP_PASS || 'V23121988s'
  }
});

const sendReceiptEmail = async (userEmail, userName, pdfPath, transactionId) => {
  try {
    console.log('Tentative d\'envoi email à:', userEmail);
    console.log('Avec les identifiants:', process.env.SMTP_USER);
    const mailOptions = {
      from: process.env.SMTP_USER || 'votressalles@gmail.com',
      to: userEmail,
      subject: `🧾 Reçu de paiement - Transaction ${transactionId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563EB, #1D4ED8); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">🏛️ Plateforme d'Arbitrage Maroc</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Confirmation de paiement</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #2563EB; margin-top: 0;">Bonjour ${userName},</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              🎉 <strong>Merci pour votre confiance !</strong>
            </p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #6B7280;">
              Nous avons bien reçu votre paiement. Vous trouverez en pièce jointe 
              votre reçu officiel pour la transaction <strong>${transactionId}</strong>.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 0; color: #10B981; font-weight: bold;">✅ Paiement confirmé</p>
              <p style="margin: 5px 0 0 0; color: #6B7280; font-size: 14px;">
                Votre formation/service sera disponible dans votre espace personnel sous 24h.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6B7280;">
              Pour toute question, n'hésitez pas à nous contacter à 
              <a href="mailto:contact@arbitrage-maroc.ma" style="color: #2563EB;">contact@arbitrage-maroc.ma</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3001/dashboard" 
                 style="background: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accéder à mon espace
              </a>
            </div>
          </div>
          
          <div style="background: #374151; padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
            <p style="margin: 0;">© 2024 Plateforme d'Arbitrage Maroc - Tous droits réservés</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `recu_${transactionId}.pdf`,
          path: pdfPath
        }
      ]
    };

    console.log('Envoi en cours...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès:', result.messageId);
    
    // Supprimer le fichier PDF après envoi
    fs.unlinkSync(pdfPath);
    
    return true;
  } catch (error) {
    console.error('Erreur détaillée envoi email:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
    return false;
  }
};

module.exports = { sendReceiptEmail };