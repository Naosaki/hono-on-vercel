import * as ftp from 'basic-ftp';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGetInvoicePdf(invoiceRef) {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Activer les logs du00e9taillu00e9s
  
  try {
    console.log(`Test de ru00e9cupu00e9ration du PDF pour la facture ${invoiceRef}`);
    console.log('Connexion au serveur FTP...');
    
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT) || 21,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true' ? true : false
    });
    
    console.log('Connexion ru00e9ussie!');
    
    // Aller dans le ru00e9pertoire facture
    const invoicePath = '/facture';
    console.log(`Accu00e8s au ru00e9pertoire ${invoicePath}...`);
    await client.cd(invoicePath);
    
    // Lister les dossiers pour trouver celui qui correspond u00e0 la ru00e9fu00e9rence
    console.log(`Recherche du dossier ${invoiceRef}...`);
    const list = await client.list();
    
    // Afficher tous les dossiers disponibles
    console.log('Dossiers disponibles:');
    list.filter(item => item.type === 2 && !item.name.startsWith('.')).forEach(folder => {
      console.log(` - ${folder.name}`);
    });
    
    // Chercher le dossier correspondant u00e0 la ru00e9fu00e9rence
    const matchingFolder = list.find(item => item.type === 2 && item.name === invoiceRef);
    
    if (!matchingFolder) {
      console.error(`Dossier pour la facture ${invoiceRef} non trouvu00e9 dans ${invoicePath}`);
      return;
    }
    
    console.log(`Dossier trouvu00e9 pour la facture ${invoiceRef}: ${matchingFolder.name}`);
    
    // Aller dans le dossier de la facture
    await client.cd(matchingFolder.name);
    
    // Lister les fichiers dans ce dossier
    const files = await client.list();
    
    // Afficher tous les fichiers disponibles
    console.log(`Fichiers disponibles dans ${invoicePath}/${invoiceRef}:`);
    files.filter(item => item.type === 1).forEach(file => {
      console.log(` - ${file.name}`);
    });
    
    // Chercher le fichier PDF
    // D'abord, essayer de trouver un fichier qui correspond exactement u00e0 la ru00e9fu00e9rence de la facture
    let pdfFile = files.find(item => item.type === 1 && item.name === `${invoiceRef}.pdf`);
    
    // Si on ne trouve pas de fichier correspondant exactement, chercher n'importe quel fichier PDF
    if (!pdfFile) {
      pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf'));
    }
    
    if (!pdfFile) {
      console.error(`Fichier PDF non trouvu00e9 dans le dossier ${invoicePath}/${invoiceRef}`);
      return;
    }
    
    console.log(`Fichier PDF trouvu00e9 pour la facture ${invoiceRef}: ${pdfFile.name}`);
    
    // Cru00e9er un dossier temporaire local si nu00e9cessaire
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Chemin local temporaire pour le fichier
    const localPath = path.join(tempDir, `${invoiceRef}.pdf`);
    
    // Tu00e9lu00e9charger le fichier
    console.log(`Tu00e9lu00e9chargement du fichier ${pdfFile.name} vers ${localPath}...`);
    await client.downloadTo(localPath, pdfFile.name);
    
    // Vu00e9rifier si le fichier a u00e9tu00e9 tu00e9lu00e9chargu00e9 avec succu00e8s
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      console.log(`Fichier tu00e9lu00e9chargu00e9 avec succu00e8s! Taille: ${stats.size} octets`);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(localPath);
      console.log(`Fichier temporaire supprimu00e9`);
      
      return true;
    } else {
      console.error(`Erreur: Le fichier n'a pas u00e9tu00e9 tu00e9lu00e9chargu00e9`);
      return false;
    }
  } catch (error) {
    console.error(`Erreur lors de la ru00e9cupu00e9ration du PDF de la facture ${invoiceRef}:`, error);
    return false;
  } finally {
    // Fermer la connexion FTP
    client.close();
  }
}

// Tester avec une ru00e9fu00e9rence spu00e9cifique
const invoiceRef = process.argv[2] || '(PROV17)';
testGetInvoicePdf(invoiceRef);
