import * as ftp from 'basic-ftp';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listFtpDirectory() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Activer les logs détaillés
  
  try {
    console.log('Connexion au serveur FTP...');
    console.log(`Host: ${process.env.FTP_HOST}`);
    console.log(`Port: ${process.env.FTP_PORT}`);
    console.log(`User: ${process.env.FTP_USER}`);
    console.log(`Secure: ${process.env.FTP_SECURE}`);
    console.log(`FTP_INVOICE_PATH: ${process.env.FTP_INVOICE_PATH}`);
    
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true' ? true : false
    });
    
    console.log('Connexion réussie!');
    
    // Lister le contenu du répertoire racine
    console.log('\nContenu du répertoire racine:');
    const rootList = await client.list();
    rootList.forEach(item => {
      console.log(`${item.type === 2 ? 'D' : 'F'} - ${item.name}`);
    });
    
    // Vérifier si le dossier facture existe à la racine
    const rootFolders = rootList.filter(item => item.type === 2);
    const factureFolder = rootFolders.find(item => item.name === 'facture');
    
    if (factureFolder) {
      // Lister le contenu du dossier facture
      console.log('\nContenu du dossier /facture:');
      await client.cd('/facture');
      const factureList = await client.list();
      factureList.forEach(item => {
        console.log(`${item.type === 2 ? 'D' : 'F'} - ${item.name}`);
      });
      
      // Si le dossier facture contient des sous-dossiers, lister le contenu du premier sous-dossier
      const subFolders = factureList.filter(item => item.type === 2);
      if (subFolders.length > 0) {
        console.log(`\nContenu du premier sous-dossier /facture/${subFolders[0].name}:`);
        await client.cd(subFolders[0].name);
        const subFolderList = await client.list();
        subFolderList.forEach(item => {
          console.log(`${item.type === 2 ? 'D' : 'F'} - ${item.name}`);
        });
      }
    }
    
    // Essayer aussi avec le chemin FTP_INVOICE_PATH
    if (process.env.FTP_INVOICE_PATH) {
      const invoicePath = process.env.FTP_INVOICE_PATH;
      console.log(`\nEssai avec le chemin configuré: ${invoicePath}`);
      
      try {
        await client.cd(invoicePath);
        console.log(`Contenu du répertoire ${invoicePath}:`);
        const pathList = await client.list();
        pathList.forEach(item => {
          console.log(`${item.type === 2 ? 'D' : 'F'} - ${item.name}`);
        });
        
        // Vérifier si le dossier facture existe dans ce chemin
        const pathFolders = pathList.filter(item => item.type === 2);
        const pathFactureFolder = pathFolders.find(item => item.name === 'facture');
        
        if (pathFactureFolder) {
          console.log(`\nContenu du dossier ${invoicePath}facture:`);
          await client.cd('facture');
          const pathFactureList = await client.list();
          pathFactureList.forEach(item => {
            console.log(`${item.type === 2 ? 'D' : 'F'} - ${item.name}`);
          });
        }
      } catch (error) {
        console.error(`Erreur lors de l'accès au répertoire ${invoicePath}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    client.close();
  }
}

listFtpDirectory();
