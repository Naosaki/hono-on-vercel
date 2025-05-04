import { Client } from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

async function exploreFtpLogos() {
  const client = new Client();
  client.ftp.verbose = true;
  
  try {
    console.log('Connexion au serveur FTP...');
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT || '21'),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true'
    });
    
    // Explorer le dossier mycompany/logos
    console.log('\nNavigation vers le dossier /mycompany/logos...');
    try {
      await client.cd('/mycompany/logos');
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      console.log('Contenu du dossier /mycompany/logos:');
      files.forEach(item => {
        console.log(`${item.type === 1 ? 'Fichier' : 'Dossier'} ${item.name} (${item.size} octets)`);
      });
    } catch (error) {
      console.error(`Erreur lors de la navigation vers /mycompany/logos: ${error.message}`);
      
      // Essayer de naviguer d'abord vers /mycompany
      console.log('\nTentative de navigation vers /mycompany...');
      try {
        await client.cd('/mycompany');
        
        // Lister les dossiers dans /mycompany
        const dirs = await client.list();
        console.log('Contenu du dossier /mycompany:');
        dirs.forEach(item => {
          console.log(`${item.type === 1 ? 'Fichier' : 'Dossier'} ${item.name}`);
        });
        
        // Essayer de trouver un dossier qui pourrait contenir les logos
        const logoDir = dirs.find(item => 
          item.type === 2 && 
          (item.name.toLowerCase().includes('logo') || 
           item.name.toLowerCase().includes('image') || 
           item.name.toLowerCase().includes('img')));
        
        if (logoDir) {
          console.log(`\nNavigation vers le dossier /mycompany/${logoDir.name}...`);
          await client.cd(logoDir.name);
          
          // Lister les fichiers dans ce dossier
          const logoFiles = await client.list();
          console.log(`Contenu du dossier /mycompany/${logoDir.name}:`);
          logoFiles.forEach(item => {
            console.log(`${item.type === 1 ? 'Fichier' : 'Dossier'} ${item.name} (${item.size} octets)`);
          });
        }
      } catch (subError) {
        console.error(`Erreur lors de la navigation vers /mycompany: ${subError.message}`);
        
        // Lister les dossiers à la racine pour trouver où pourraient être les logos
        console.log('\nListe des dossiers à la racine:');
        await client.cd('/');
        const rootDirs = await client.list();
        rootDirs.forEach(item => {
          console.log(`${item.type === 1 ? 'Fichier' : 'Dossier'} ${item.name}`);
        });
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'exploration du dossier des logos:', error);
  } finally {
    client.close();
    console.log('Connexion FTP fermée');
  }
}

exploreFtpLogos();
