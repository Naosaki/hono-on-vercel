import * as ftp from 'basic-ftp';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Script de test pour la connexion FTP
 */
async function testFtpConnection() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Activer les logs détaillés
  
  try {
    console.log('Tentative de connexion au serveur FTP...');
    console.log(`Hôte: ${process.env.FTP_HOST}`);
    console.log(`Port: ${process.env.FTP_PORT}`);
    console.log(`Utilisateur: ${process.env.FTP_USER}`);
    console.log(`Chemin des factures: ${process.env.FTP_INVOICE_PATH}`);
    
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT || '21'),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true'
    });
    
    console.log('Connexion FTP établie avec succès');
    
    // Afficher le répertoire courant
    const currentDir = await client.pwd();
    console.log(`Répertoire courant: ${currentDir}`);
    
    // Lister les fichiers à la racine
    console.log('Fichiers à la racine:');
    const rootList = await client.list();
    console.log(rootList);
    
    // Essayer d'aller dans le répertoire des factures
    try {
      const invoicePath = process.env.FTP_INVOICE_PATH || '/home/pqud0920/dolibarrdatawdp/facture';
      console.log(`Tentative d'accès au répertoire: ${invoicePath}`);
      await client.cd(invoicePath);
      
      // Afficher le nouveau répertoire courant
      const invoiceDir = await client.pwd();
      console.log(`Répertoire des factures: ${invoiceDir}`);
      
      // Lister les fichiers dans le répertoire des factures
      console.log('Contenu du répertoire des factures:');
      const invoiceList = await client.list();
      console.log(invoiceList);
      
      // Si des dossiers de factures sont trouvés, explorer le premier
      if (invoiceList.length > 0) {
        const firstFolder = invoiceList.find(item => item.type === 2 && item.name !== '.' && item.name !== '..');
        
        if (firstFolder) {
          console.log(`Exploration du dossier de facture: ${firstFolder.name}`);
          await client.cd(firstFolder.name);
          
          // Lister les fichiers dans ce dossier de facture
          console.log(`Contenu du dossier ${firstFolder.name}:`);
          const filesList = await client.list();
          console.log(filesList);
          
          // Chercher les PDFs
          const pdfFiles = filesList.filter(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf'));
          if (pdfFiles.length > 0) {
            console.log(`PDFs trouvés dans le dossier ${firstFolder.name}:`);
            pdfFiles.forEach(pdf => console.log(`- ${pdf.name} (${pdf.size} octets)`));
          } else {
            console.log(`Aucun PDF trouvé dans le dossier ${firstFolder.name}`);
          }
        }
      }
    } catch (cdError) {
      console.error(`Erreur lors de l'accès au répertoire des factures:`, cdError.message);
    }
  } catch (error) {
    console.error('Erreur lors de la connexion FTP:', error.message);
  } finally {
    client.close();
    console.log('Connexion FTP fermée');
  }
}

// Exécuter le test
testFtpConnection().catch(err => console.error('Erreur non gérée:', err));
