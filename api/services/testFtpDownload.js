import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Script de test pour télécharger un PDF spécifique via FTP
 */
async function testDownloadPdf() {
  const client = new ftp.Client();
  client.ftp.verbose = true; // Activer les logs détaillés
  
  try {
    console.log('Tentative de connexion au serveur FTP...');
    console.log(`Hôte: ${process.env.FTP_HOST}`);
    console.log(`Port: ${process.env.FTP_PORT}`);
    console.log(`Utilisateur: ${process.env.FTP_USER}`);
    
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT || '21'),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true'
    });
    
    console.log('Connexion FTP établie avec succès');
    
    // Référence de facture à télécharger
    const invoiceRef = 'FA2503-0004';
    
    // Lister les dossiers à la racine
    console.log('Fichiers à la racine:');
    const rootList = await client.list();
    
    // Chercher le dossier correspondant à la référence
    const matchingFolder = rootList.find(item => item.type === 2 && item.name === invoiceRef); // type 2 = dossier
    
    if (!matchingFolder) {
      console.error(`Dossier pour la facture ${invoiceRef} non trouvé sur le serveur FTP`);
      return;
    }
    
    console.log(`Dossier trouvé pour la facture ${invoiceRef}: ${matchingFolder.name}`);
    
    // Aller dans le dossier de la facture
    await client.cd(matchingFolder.name);
    
    // Lister les fichiers dans ce dossier
    console.log(`Contenu du dossier ${matchingFolder.name}:`);
    const filesList = await client.list();
    console.log(filesList);
    
    // Chercher les PDFs
    const pdfFiles = filesList.filter(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.error(`Aucun PDF trouvé dans le dossier ${invoiceRef}`);
      return;
    }
    
    const pdfFile = pdfFiles[0];
    console.log(`PDF trouvé pour la facture ${invoiceRef}: ${pdfFile.name} (${pdfFile.size} octets)`);
    
    // Créer un dossier temporaire local si nécessaire
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Chemin local temporaire pour le fichier
    const localPath = path.join(tempDir, `${invoiceRef}.pdf`);
    
    // Télécharger le fichier
    console.log(`Téléchargement du fichier ${pdfFile.name} vers ${localPath}...`);
    await client.downloadTo(localPath, pdfFile.name);
    
    // Vérifier que le fichier a bien été téléchargé
    if (fs.existsSync(localPath)) {
      const stats = fs.statSync(localPath);
      console.log(`Fichier téléchargé avec succès: ${localPath} (${stats.size} octets)`);
      
      // Lire les premiers octets pour vérifier s'il s'agit bien d'un PDF
      const buffer = fs.readFileSync(localPath, { encoding: null, flag: 'r' });
      const header = buffer.slice(0, 5).toString('ascii');
      console.log(`En-tête du fichier: ${header}`);
      
      if (header === '%PDF-') {
        console.log('Le fichier est bien un PDF valide');
      } else {
        console.error('Le fichier ne semble pas être un PDF valide');
        // Afficher les 100 premiers octets pour débogage
        console.log('Début du fichier:', buffer.slice(0, 100).toString('hex'));
      }
    } else {
      console.error(`Le fichier n'a pas été téléchargé correctement`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    client.close();
    console.log('Connexion FTP fermée');
  }
}

// Exécuter le test
testDownloadPdf().catch(err => console.error('Erreur non gérée:', err));
