import * as ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

/**
 * Service pour gérer les connexions et opérations FTP
 */
export const FtpService = {
  /**
   * Crée un client FTP et se connecte au serveur
   * @returns {Promise<ftp.Client>} - Client FTP connecté
   */
  createClient: async () => {
    const client = new ftp.Client();
    client.ftp.verbose = process.env.NODE_ENV === 'development'; // Activer les logs en développement
    
    try {
      await client.access({
        host: process.env.FTP_HOST,
        port: parseInt(process.env.FTP_PORT || '21'),
        user: process.env.FTP_USER,
        password: process.env.FTP_PASSWORD,
        secure: process.env.FTP_SECURE === 'true' // FTPS si true
      });
      
      console.log('Connexion FTP établie avec succès');
      return client;
    } catch (error) {
      console.error('Erreur lors de la connexion FTP:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un fichier PDF de facture depuis le serveur FTP
   * @param {string} invoiceRef - Référence de la facture
   * @returns {Promise<Buffer>} - Données binaires du PDF
   */
  getInvoicePdf: async (invoiceRef) => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Les dossiers des factures sont directement à la racine du serveur FTP
      console.log(`Recherche du dossier de facture ${invoiceRef} à la racine...`);
      
      // Lister les dossiers pour trouver celui qui correspond à la référence
      const list = await client.list();
      
      // Chercher le dossier correspondant à la référence
      const matchingFolder = list.find(item => item.type === 2 && item.name === invoiceRef); // type 2 = dossier
      
      if (!matchingFolder) {
        throw new Error(`Dossier pour la facture ${invoiceRef} non trouvé sur le serveur FTP`);
      }
      
      console.log(`Dossier trouvé pour la facture ${invoiceRef}: ${matchingFolder.name}`);
      
      // Aller dans le dossier de la facture
      await client.cd(matchingFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      
      // Chercher le fichier PDF
      const pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf')); // type 1 = fichier
      
      if (!pdfFile) {
        throw new Error(`Fichier PDF non trouvé dans le dossier ${invoiceRef}`);
      }
      
      console.log(`Fichier PDF trouvé pour la facture ${invoiceRef}: ${pdfFile.name}`);
      
      // Créer un dossier temporaire local si nécessaire
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Chemin local temporaire pour le fichier
      const localPath = path.join(tempDir, `${invoiceRef}.pdf`);
      
      // Télécharger le fichier
      await client.downloadTo(localPath, pdfFile.name);
      
      // Lire le fichier en mémoire
      const pdfData = fs.readFileSync(localPath);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(localPath);
      
      return pdfData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du PDF de la facture ${invoiceRef} via FTP:`, error);
      throw error;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Liste les fichiers PDF disponibles dans un répertoire FTP
   * @param {string} directory - Répertoire à lister (chemin relatif à la racine FTP)
   * @returns {Promise<Array>} - Liste des fichiers
   */
  listInvoicePdfs: async (directory = '') => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Construire le chemin du répertoire sur le serveur FTP
      const remotePath = directory || process.env.FTP_INVOICE_PATH || '/invoices';
      console.log(`Listage du répertoire FTP: ${remotePath}`);
      
      // Lister les fichiers
      const list = await client.list(remotePath);
      
      // Filtrer pour ne garder que les PDFs
      const pdfFiles = list.filter(item => {
        return item.type === 1 && item.name.toLowerCase().endsWith('.pdf');
      });
      
      return pdfFiles.map(file => ({
        name: file.name,
        size: file.size,
        date: file.date,
        path: `${remotePath}/${file.name}`
      }));
    } catch (error) {
      console.error(`Erreur lors du listage des PDFs dans ${directory} via FTP:`, error);
      throw error;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Vérifie si un fichier PDF de facture existe sur le serveur FTP
   * @param {string} invoiceRef - Référence de la facture
   * @returns {Promise<boolean>} - true si le fichier existe
   */
  checkInvoicePdfExists: async (invoiceRef) => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Les dossiers des factures sont directement à la racine du serveur FTP
      console.log(`Vérification de l'existence du dossier ${invoiceRef} à la racine...`);
      
      // Lister les dossiers pour trouver celui qui correspond à la référence
      const list = await client.list();
      
      // Chercher le dossier correspondant à la référence
      const matchingFolder = list.find(item => item.type === 2 && item.name === invoiceRef); // type 2 = dossier
      
      if (!matchingFolder) {
        console.log(`Dossier pour la facture ${invoiceRef} non trouvé sur le serveur FTP`);
        return false;
      }
      
      // Aller dans le dossier de la facture
      await client.cd(matchingFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      
      // Chercher le fichier PDF
      const pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf')); // type 1 = fichier
      
      if (!pdfFile) {
        console.log(`Fichier PDF non trouvé dans le dossier ${invoiceRef}`);
        return false;
      }
      
      console.log(`Fichier PDF trouvé pour la facture ${invoiceRef}: ${pdfFile.name}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la vérification du PDF de la facture ${invoiceRef} via FTP:`, error);
      return false;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  }
};

export default FtpService;
