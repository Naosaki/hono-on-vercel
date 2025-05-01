import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdmin } from './adminConfig.js';

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
      
      // Créer une référence au fichier
      const file = bucket.file(filePath);
      
      // Télécharger le fichier
      await file.save(pdfData, {
        metadata: {
          contentType: 'application/pdf',
        },
      });
      
      // Rendre le fichier public (optionnel, selon vos besoins)
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
  }
};

export default FirestoreStorageService;
