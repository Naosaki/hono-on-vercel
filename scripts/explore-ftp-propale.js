import { Client } from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

async function exploreFtpPropale() {
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
    
    // Explorer le dossier propale
    console.log('\nNavigation vers le dossier /propale...');
    await client.cd('/propale');
    
    // Lister les dossiers des propositions commerciales
    const propaleList = await client.list();
    console.log('Contenu du dossier propale:');
    propaleList.forEach(item => {
      console.log(`${item.type} ${item.name}`);
    });
    
    // Explorer un dossier de proposition commerciale si disponible
    if (propaleList.length > 0 && propaleList.some(item => item.type === 2 && !item.name.startsWith('.'))) {
      const sampleFolder = propaleList.find(item => item.type === 2 && !item.name.startsWith('.'));
      console.log(`\nNavigation vers le dossier /propale/${sampleFolder.name}...`);
      await client.cd(sampleFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      console.log(`Contenu du dossier ${sampleFolder.name}:`);
      files.forEach(item => {
        console.log(`${item.type} ${item.name}`);
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'exploration du dossier propale:', error);
  } finally {
    client.close();
    console.log('Connexion FTP fermée');
  }
}

exploreFtpPropale();
