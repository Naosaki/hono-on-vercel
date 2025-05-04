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
      
      // Les dossiers des factures sont dans le répertoire /facture à la racine
      const invoicePath = '/facture';
      console.log(`Recherche du dossier de facture ${invoiceRef} dans ${invoicePath}...`);
      
      // Aller dans le répertoire facture
      await client.cd(invoicePath);
      
      // Lister les dossiers pour trouver celui qui correspond à la référence
      const list = await client.list();
      
      // Chercher le dossier correspondant à la référence
      const matchingFolder = list.find(item => item.type === 2 && item.name === invoiceRef); // type 2 = dossier
      
      if (!matchingFolder) {
        throw new Error(`Dossier pour la facture ${invoiceRef} non trouvé dans ${invoicePath} sur le serveur FTP`);
      }
      
      console.log(`Dossier trouvé pour la facture ${invoiceRef}: ${matchingFolder.name}`);
      
      // Aller dans le dossier de la facture
      await client.cd(matchingFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      
      // Chercher le fichier PDF
      // D'abord, essayer de trouver un fichier qui correspond exactement à la référence de la facture
      let pdfFile = files.find(item => item.type === 1 && item.name === `${invoiceRef}.pdf`);
      
      // Si on ne trouve pas de fichier correspondant exactement, chercher n'importe quel fichier PDF
      if (!pdfFile) {
        pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf'));
      }
      
      if (!pdfFile) {
        throw new Error(`Fichier PDF non trouvé dans le dossier ${invoicePath}/${invoiceRef}`);
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
      
      // Les dossiers des factures sont dans le répertoire /facture
      const invoicePath = '/facture';
      console.log(`Vérification de l'existence du dossier ${invoiceRef} dans ${invoicePath}...`);
      
      // Aller dans le répertoire facture
      await client.cd(invoicePath);
      
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
      // D'abord, essayer de trouver un fichier qui correspond exactement à la référence de la facture
      let pdfFile = files.find(item => item.type === 1 && item.name === `${invoiceRef}.pdf`);
      
      // Si on ne trouve pas de fichier correspondant exactement, chercher n'importe quel fichier PDF
      if (!pdfFile) {
        pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf'));
      }
      
      if (!pdfFile) {
        console.log(`Fichier PDF non trouvé dans le dossier ${invoicePath}/${invoiceRef}`);
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
  },
  
  /**
   * Récupère un fichier PDF de proposition commerciale depuis le serveur FTP
   * @param {string} proposalRef - Référence de la proposition commerciale
   * @returns {Promise<Buffer>} - Données binaires du PDF
   */
  getProposalPdf: async (proposalRef) => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Les dossiers des propositions commerciales sont dans le répertoire /propale/
      console.log(`Recherche du dossier de proposition ${proposalRef} dans /propale/...`);
      
      // Aller dans le répertoire propale
      await client.cd('/propale');
      
      // Lister les dossiers pour trouver celui qui correspond à la référence
      const list = await client.list();
      
      // Chercher le dossier correspondant à la référence
      const matchingFolder = list.find(item => item.type === 2 && item.name === proposalRef); // type 2 = dossier
      
      if (!matchingFolder) {
        throw new Error(`Dossier pour la proposition ${proposalRef} non trouvé dans /propale/ sur le serveur FTP`);
      }
      
      console.log(`Dossier trouvé pour la proposition ${proposalRef}: ${matchingFolder.name}`);
      
      // Aller dans le dossier de la proposition
      await client.cd(matchingFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      
      // Chercher le fichier PDF
      const pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf') && !item.name.includes('preview')); // type 1 = fichier
      
      if (!pdfFile) {
        throw new Error(`Fichier PDF non trouvé dans le dossier /propale/${proposalRef}`);
      }
      
      console.log(`Fichier PDF trouvé pour la proposition ${proposalRef}: ${pdfFile.name}`);
      
      // Créer un dossier temporaire local si nécessaire
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Chemin local temporaire pour le fichier
      const localPath = path.join(tempDir, `${proposalRef}.pdf`);
      
      // Télécharger le fichier
      await client.downloadTo(localPath, pdfFile.name);
      
      // Lire le fichier en mémoire
      const pdfData = fs.readFileSync(localPath);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(localPath);
      
      return pdfData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du PDF de la proposition ${proposalRef} via FTP:`, error);
      throw error;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Vérifie si un fichier PDF de proposition commerciale existe sur le serveur FTP
   * @param {string} proposalRef - Référence de la proposition commerciale
   * @returns {Promise<boolean>} - true si le fichier existe
   */
  checkProposalPdfExists: async (proposalRef) => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Les dossiers des propositions commerciales sont dans le répertoire /propale/
      console.log(`Vérification de l'existence du dossier ${proposalRef} dans /propale/...`);
      
      // Aller dans le répertoire propale
      await client.cd('/propale');
      
      // Lister les dossiers pour trouver celui qui correspond à la référence
      const list = await client.list();
      
      // Chercher le dossier correspondant à la référence
      const matchingFolder = list.find(item => item.type === 2 && item.name === proposalRef); // type 2 = dossier
      
      if (!matchingFolder) {
        console.log(`Dossier pour la proposition ${proposalRef} non trouvé dans /propale/ sur le serveur FTP`);
        return false;
      }
      
      // Aller dans le dossier de la proposition
      await client.cd(matchingFolder.name);
      
      // Lister les fichiers dans ce dossier
      const files = await client.list();
      
      // Chercher le fichier PDF
      const pdfFile = files.find(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf') && !item.name.includes('preview')); // type 1 = fichier
      
      if (!pdfFile) {
        console.log(`Fichier PDF non trouvé dans le dossier /propale/${proposalRef}`);
        return false;
      }
      
      console.log(`Fichier PDF trouvé pour la proposition ${proposalRef}: ${pdfFile.name}`);
      return true;
    } catch (error) {
      console.error(`Erreur lors de la vérification du PDF de la proposition ${proposalRef} via FTP:`, error);
      return false;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Récupère la liste des logos disponibles dans le dossier /mycompany/logos/
   * @returns {Promise<Array>} - Liste des fichiers de logo
   */
  getLogosList: async () => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Aller dans le répertoire des logos
      console.log('Navigation vers le dossier /mycompany/logos...');
      await client.cd('/mycompany/logos');
      
      // Lister les fichiers dans ce dossier
      const list = await client.list();
      
      // Filtrer pour ne garder que les fichiers (pas les dossiers)
      const logoFiles = list.filter(item => item.type === 1 && !item.name.startsWith('.'));
      
      return logoFiles.map(file => ({
        name: file.name,
        size: file.size,
        modifyTime: file.modifyTime
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste des logos:', error);
      throw error;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Récupère un logo spécifique depuis le dossier /mycompany/logos/
   * @param {string} logoName - Nom du fichier logo à récupérer
   * @returns {Promise<Buffer>} - Données binaires du logo
   */
  getLogo: async (logoName) => {
    let client = null;
    try {
      client = await FtpService.createClient();
      
      // Aller dans le répertoire des logos
      console.log(`Récupération du logo ${logoName} depuis /mycompany/logos/...`);
      await client.cd('/mycompany/logos');
      
      // Créer un dossier temporaire local si nécessaire
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Chemin local temporaire pour le fichier
      const localPath = path.join(tempDir, logoName);
      
      // Télécharger le fichier
      await client.downloadTo(localPath, logoName);
      
      // Lire le fichier en mémoire
      const logoData = fs.readFileSync(localPath);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(localPath);
      
      return logoData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du logo ${logoName}:`, error);
      throw error;
    } finally {
      // Fermer la connexion FTP
      if (client) {
        client.close();
      }
    }
  },
  
  /**
   * Récupère la liste des dossiers d'entrepôts disponibles sur le serveur FTP
   * @returns {Promise<Array>} - Liste des dossiers d'entrepôts
   */
  getWarehouseFolders: async () => {
    const client = await FtpService.createClient();
    try {
      // Naviguer vers le dossier des stocks
      await client.cd('/stock');
      
      // Lister les dossiers d'entrepôts
      const list = await client.list();
      
      // Filtrer pour ne garder que les dossiers
      const folders = list
        .filter(item => item.type === 2) // Type 2 = dossier
        .map(item => ({
          name: item.name,
          date: item.date,
          size: item.size
        }));
      
      return folders;
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers d\'entrepôts:', error);
      throw error;
    } finally {
      client.close();
    }
  },

  /**
   * Récupère la liste des fiches de stock disponibles pour un entrepôt spécifique
   * @param {string} warehouseFolder - Nom du dossier de l'entrepôt
   * @returns {Promise<Array>} - Liste des fiches de stock
   */
  getWarehouseStockSheets: async (warehouseFolder) => {
    const client = await FtpService.createClient();
    try {
      // Naviguer vers le dossier de l'entrepôt
      await client.cd(`/stock/${warehouseFolder}`);
      
      // Lister les fichiers PDF
      const list = await client.list();
      
      // Filtrer pour ne garder que les fichiers PDF
      const pdfFiles = list
        .filter(item => item.type === 1 && item.name.toLowerCase().endsWith('.pdf')) // Type 1 = fichier
        .map(item => ({
          name: item.name,
          date: item.date,
          size: item.size
        }));
      
      return pdfFiles;
    } catch (error) {
      console.error(`Erreur lors de la récupération des fiches de stock pour l'entrepôt ${warehouseFolder}:`, error);
      throw error;
    } finally {
      client.close();
    }
  },

  /**
   * Récupère une fiche de stock spécifique pour un entrepôt
   * @param {string} warehouseFolder - Nom du dossier de l'entrepôt
   * @param {string} fileName - Nom du fichier PDF
   * @returns {Promise<Buffer>} - Contenu binaire du fichier PDF
   */
  getWarehouseStockSheet: async (warehouseFolder, fileName) => {
    const client = await FtpService.createClient();
    try {
      // Naviguer vers le dossier de l'entrepôt
      await client.cd(`/stock/${warehouseFolder}`);
      
      // Vérifier si le fichier existe
      const list = await client.list();
      const fileExists = list.some(item => item.type === 1 && item.name === fileName);
      
      if (!fileExists) {
        throw new Error(`Le fichier ${fileName} n'existe pas dans le dossier de l'entrepôt ${warehouseFolder}`);
      }
      
      // Télécharger le fichier PDF
      const tempFilePath = `/tmp/${fileName}`;
      await client.downloadTo(tempFilePath, fileName);
      
      // Lire le fichier téléchargé
      const fileContent = fs.readFileSync(tempFilePath);
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(tempFilePath);
      
      return fileContent;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la fiche de stock ${fileName} pour l'entrepôt ${warehouseFolder}:`, error);
      throw error;
    } finally {
      client.close();
    }
  },
};

export default FtpService;
