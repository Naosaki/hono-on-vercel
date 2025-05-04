import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from './adminConfig.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service pour gérer les fichiers dans Firebase Storage
 */
export const FirestoreStorageService = {
  /**
   * Télécharge un fichier PDF de facture dans Firebase Storage
   * @param {string} invoiceId - ID de la facture
   * @param {Buffer} pdfData - Données binaires du PDF
   * @returns {Promise<Object>} - Informations sur le fichier téléchargé
   */
  uploadInvoicePdf: async (invoiceId, pdfData) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      // Définir le chemin du fichier dans Storage
      const filePath = `invoices/FA${invoiceId}.pdf`;
      
      // Vérifier que pdfData est bien un Buffer
      if (!Buffer.isBuffer(pdfData)) {
        console.log('pdfData n\'est pas un Buffer, conversion...');
        // Si ce n'est pas un Buffer, essayer de le convertir
        if (typeof pdfData === 'string') {
          // Si c'est une chaîne de caractères (peut-être base64), convertir en Buffer
          pdfData = Buffer.from(pdfData, 'base64');
        } else if (pdfData instanceof ArrayBuffer || pdfData instanceof Uint8Array) {
          // Si c'est un ArrayBuffer ou Uint8Array, convertir en Buffer
          pdfData = Buffer.from(pdfData);
        }
      }
      
      // Vérifier la taille du PDF pour débogage
      console.log(`Taille du PDF pour la facture ${invoiceId}: ${pdfData.length} octets`);
      
      // Vérifier les premiers octets pour s'assurer qu'il s'agit bien d'un PDF (signature PDF: %PDF-)
      const pdfSignature = '%PDF-';
      const firstBytes = pdfData.slice(0, 5).toString('ascii');
      
      if (firstBytes !== pdfSignature) {
        console.warn(`Le fichier pour la facture ${invoiceId} ne semble pas être un PDF valide. Signature: ${firstBytes}`);
        console.warn('Premiers octets:', pdfData.slice(0, 20).toString('hex'));
        return {
          success: false,
          error: 'Le fichier n\'est pas un PDF valide'
        };
      } else {
        console.log(`Signature PDF valide pour la facture ${invoiceId}: ${firstBytes}`);
      }
      
      // Créer un fichier temporaire pour le PDF
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, `FA${invoiceId}.pdf`);
      fs.writeFileSync(tempFilePath, pdfData);
      
      console.log(`Fichier temporaire créé: ${tempFilePath}`);
      
      // Télécharger le fichier avec les options appropriées
      await bucket.upload(tempFilePath, {
        destination: filePath,
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000',
        },
        resumable: false, // Désactiver le téléchargement reprenant pour les petits fichiers
      });
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(tempFilePath);
      
      // Rendre le fichier public
      const file = bucket.file(filePath);
      await file.makePublic();
      
      // Obtenir l'URL publique du fichier
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      return {
        success: true,
        path: filePath,
        url: publicUrl,
        size: pdfData.length,
      };
    } catch (error) {
      console.error(`Erreur lors du téléchargement du PDF de la facture ${invoiceId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  /**
   * Récupère l'URL d'un PDF de facture depuis Firebase Storage
   * @param {string} invoiceId - ID de la facture
   * @returns {Promise<string>} - URL du fichier PDF
   */
  getInvoicePdfUrl: async (invoiceId) => {
    try {
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      const filePath = `invoices/FA${invoiceId}.pdf`;
      const file = bucket.file(filePath);
      
      // Vérifier si le fichier existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`Le PDF de la facture ${invoiceId} n'existe pas dans Storage`);
      }
      
      // Obtenir l'URL publique
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      return publicUrl;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL du PDF de la facture ${invoiceId}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime un PDF de facture de Firebase Storage
   * @param {string} invoiceId - ID de la facture
   * @returns {Promise<boolean>} - Résultat de l'opération
   */
  deleteInvoicePdf: async (invoiceId) => {
    try {
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      const filePath = `invoices/FA${invoiceId}.pdf`;
      const file = bucket.file(filePath);
      
      // Vérifier si le fichier existe
      const [exists] = await file.exists();
      if (!exists) {
        return {
          success: false,
          message: `Le PDF de la facture ${invoiceId} n'existe pas dans Storage`,
        };
      }
      
      // Supprimer le fichier
      await file.delete();
      
      return {
        success: true,
        message: `Le PDF de la facture ${invoiceId} a été supprimé avec succès`,
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du PDF de la facture ${invoiceId}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  /**
   * Télécharge une fiche de stock d'entrepôt dans Firebase Storage
   * @param {string} fileName - Nom du fichier à stocker
   * @param {Buffer} pdfData - Données binaires du PDF
   * @param {Object} metadata - Métadonnées de la fiche de stock
   * @returns {Promise<Object>} - Informations sur le fichier téléchargé
   */
  uploadWarehouseStockSheet: async (fileName, pdfData, metadata = {}) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      // Définir le chemin du fichier dans Storage
      const filePath = `warehouses/stock-sheets/${fileName}`;
      
      // Vérifier que pdfData est bien un Buffer
      if (!Buffer.isBuffer(pdfData)) {
        console.log('pdfData n\'est pas un Buffer, conversion...');
        // Si ce n'est pas un Buffer, essayer de le convertir
        if (typeof pdfData === 'string') {
          // Si c'est une chaîne de caractères (peut-être base64), convertir en Buffer
          pdfData = Buffer.from(pdfData, 'base64');
        } else if (pdfData instanceof ArrayBuffer || pdfData instanceof Uint8Array) {
          // Si c'est un ArrayBuffer ou Uint8Array, convertir en Buffer
          pdfData = Buffer.from(pdfData);
        }
      }
      
      // Vérifier la taille du PDF pour débogage
      console.log(`Taille du PDF pour la fiche de stock ${fileName}: ${pdfData.length} octets`);
      
      // Vérifier les premiers octets pour s'assurer qu'il s'agit bien d'un PDF (signature PDF: %PDF-)
      const pdfSignature = '%PDF-';
      const firstBytes = pdfData.slice(0, 5).toString('ascii');
      
      if (firstBytes !== pdfSignature) {
        console.warn(`Le fichier ${fileName} ne semble pas être un PDF valide. Signature: ${firstBytes}`);
        console.warn('Premiers octets:', pdfData.slice(0, 20).toString('hex'));
        return {
          success: false,
          error: 'Le fichier n\'est pas un PDF valide'
        };
      } else {
        console.log(`Signature PDF valide pour la fiche de stock ${fileName}: ${firstBytes}`);
      }
      
      // Créer un fichier temporaire pour le PDF
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const tempFilePath = path.join(tempDir, fileName);
      fs.writeFileSync(tempFilePath, pdfData);
      
      console.log(`Fichier temporaire créé: ${tempFilePath}`);
      
      // Télécharger le fichier avec les options appropriées
      await bucket.upload(tempFilePath, {
        destination: filePath,
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000',
          metadata: metadata
        },
        resumable: false, // Désactiver le téléchargement reprenant pour les petits fichiers
      });
      
      // Supprimer le fichier temporaire
      fs.unlinkSync(tempFilePath);
      
      // Rendre le fichier public
      const file = bucket.file(filePath);
      await file.makePublic();
      
      // Obtenir l'URL publique du fichier
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      return {
        success: true,
        path: filePath,
        url: publicUrl,
        size: pdfData.length,
        metadata: metadata
      };
    } catch (error) {
      console.error(`Erreur lors du téléchargement de la fiche de stock ${fileName}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  
  /**
   * Récupère l'URL d'une fiche de stock depuis Firebase Storage
   * @param {string} fileName - Nom du fichier à récupérer
   * @returns {Promise<string>} - URL du fichier PDF
   */
  getWarehouseStockSheetUrl: async (fileName) => {
    try {
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      const filePath = `warehouses/stock-sheets/${fileName}`;
      const file = bucket.file(filePath);
      
      // Vérifier si le fichier existe
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`La fiche de stock ${fileName} n'existe pas dans Storage`);
      }
      
      // Obtenir l'URL publique
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
      
      return publicUrl;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL de la fiche de stock ${fileName}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime une fiche de stock de Firebase Storage
   * @param {string} fileName - Nom du fichier à supprimer
   * @returns {Promise<boolean>} - Résultat de l'opération
   */
  deleteWarehouseStockSheet: async (fileName) => {
    try {
      const admin = getFirebaseAdmin();
      const storage = getStorage();
      const bucket = storage.bucket();
      
      const filePath = `warehouses/stock-sheets/${fileName}`;
      const file = bucket.file(filePath);
      
      // Vérifier si le fichier existe
      const [exists] = await file.exists();
      if (!exists) {
        return false;
      }
      
      // Supprimer le fichier
      await file.delete();
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la fiche de stock ${fileName}:`, error);
      return false;
    }
  }
};

export default FirestoreStorageService;
