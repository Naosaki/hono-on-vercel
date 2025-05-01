import { adminDb } from './adminConfig.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './adminConfig.js';
import { FirestoreStorageService } from './storageService.js';
import { DolibarrService } from '../dolibarrService.js';

/**
 * Fonction utilitaire pour filtrer les valeurs undefined d'un objet
 * @param {Object} obj - Objet à filtrer
 * @returns {Object} - Objet sans valeurs undefined
 */
function filterUndefinedValues(obj) {
  const filteredObj = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      filteredObj[key] = obj[key];
    }
  }
  
  return filteredObj;
};

/**
 * Service pour gérer les factures dans Firestore
 */
export const FirestoreInvoiceService = {
  /**
   * Synchronise une facture de Dolibarr vers Firestore
   * @param {Object} invoice - Données de la facture provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncInvoice: async (invoice) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const db = getFirestore();
      
      // Filtrer les valeurs undefined
      const filteredInvoice = filterUndefinedValues(invoice);
      
      // Référence à la collection des factures
      const invoicesRef = db.collection('invoices');
      
      // ID de la facture
      const invoiceId = invoice.id.toString();
      
      // Ajouter ou mettre à jour la facture dans Firestore
      await invoicesRef.doc(invoiceId).set(filteredInvoice, { merge: true });
      
      // Récupérer et stocker le PDF de la facture
      try {
        // Récupérer le PDF depuis Dolibarr
        const pdfData = await DolibarrService.getInvoicePdf(invoiceId);
        
        // Télécharger le PDF dans Firebase Storage
        const storageResult = await FirestoreStorageService.uploadInvoicePdf(invoiceId, pdfData);
        
        // Mettre à jour la facture dans Firestore avec l'URL du PDF
        if (storageResult.success) {
          await invoicesRef.doc(invoiceId).update({
            pdf_url: storageResult.url
          });
        }
      } catch (pdfError) {
        console.error(`Erreur lors de la synchronisation du PDF de la facture ${invoiceId}:`, pdfError);
        // On continue même si le PDF n'a pas pu être synchronisé
      }
      
      return {
        success: true,
        id: invoiceId
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la facture:', error);
      throw error;
    }
  },
  
  /**
   * Synchronise toutes les factures de Dolibarr vers Firestore
   * @param {Array} invoices - Liste des factures provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllInvoices: async (invoices) => {
    try {
      const batch = adminDb.batch();
      let count = 0;
      let batchCount = 0;
      
      // Traiter chaque facture par lots pour optimiser les performances
      for (const invoice of invoices) {
        const invoiceRef = adminDb.collection('invoices').doc(invoice.id.toString());
        
        // Préparer les données à stocker
        const invoiceData = {
          id: invoice.id,
          ref: invoice.ref,
          ref_ext: invoice.ref_ext,
          ref_client: invoice.ref_client,
          ref_supplier: invoice.ref_supplier,
          socid: invoice.socid,
          datec: invoice.datec,
          datef: invoice.datef,
          date_lim_reglement: invoice.date_lim_reglement,
          date_valid: invoice.date_valid,
          date_closing: invoice.date_closing,
          tva: invoice.tva,
          localtax1: invoice.localtax1,
          localtax2: invoice.localtax2,
          total_ht: invoice.total_ht,
          total_ttc: invoice.total_ttc,
          total_tva: invoice.total_tva,
          paye: invoice.paye,
          fk_statut: invoice.fk_statut,
          close_code: invoice.close_code,
          close_note: invoice.close_note,
          type: invoice.type,
          remise_percent: invoice.remise_percent,
          remise_absolue: invoice.remise_absolue,
          remise: invoice.remise,
          note_private: invoice.note_private,
          note_public: invoice.note_public,
          fk_account: invoice.fk_account,
          fk_currency: invoice.fk_currency,
          fk_cond_reglement: invoice.fk_cond_reglement,
          fk_mode_reglement: invoice.fk_mode_reglement,
          model_pdf: invoice.model_pdf,
          last_main_doc: invoice.last_main_doc,
          situation_cycle_ref: invoice.situation_cycle_ref,
          situation_counter: invoice.situation_counter,
          situation_final: invoice.situation_final,
          retained_warranty: invoice.retained_warranty,
          retained_warranty_date_limit: invoice.retained_warranty_date_limit,
          retained_warranty_fk_cond_reglement: invoice.retained_warranty_fk_cond_reglement,
          // Métadonnées
          lastSyncedAt: Date.now(),
          source: 'dolibarr'
        };
        
        // Filtrer les valeurs undefined
        const filteredInvoiceData = filterUndefinedValues(invoiceData);
        
        batch.set(invoiceRef, filteredInvoiceData, { merge: true });
        count++;
        batchCount++;
        
        // Firestore a une limite de 500 opérations par lot
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`Lot de ${batchCount} factures synchronisées`);
          batch = adminDb.batch();
          batchCount = 0;
        }
      }
      
      // Envoyer le dernier lot s'il reste des opérations
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Dernier lot de ${batchCount} factures synchronisées`);
      }
      
      return { success: true, count: invoices.length };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des factures:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer toutes les factures depuis Firestore
   * @returns {Promise} - Promesse contenant les résultats
   */
  getAllInvoices: async () => {
    try {
      const snapshot = await adminDb.collection('invoices').get();
      const invoices = [];
      
      snapshot.forEach(doc => {
        invoices.push(doc.data());
      });
      
      return invoices;
    } catch (error) {
      console.error('Erreur lors de la récupération des factures depuis Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer une facture par son ID depuis Firestore
   * @param {string} id - ID de la facture
   * @returns {Promise} - Promesse contenant les résultats
   */
  getInvoiceById: async (id) => {
    try {
      const doc = await adminDb.collection('invoices').doc(id.toString()).get();
      
      if (!doc.exists) {
        throw new Error(`Facture avec ID ${id} non trouvée dans Firestore`);
      }
      
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture ${id} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Récupérer toutes les factures d'un client spécifique
   * @param {string} clientId - ID du client
   * @returns {Promise} - Promesse contenant les résultats
   */
  getInvoicesByClientId: async (clientId) => {
    try {
      const snapshot = await adminDb.collection('invoices')
        .where('socid', '==', clientId.toString())
        .get();
      
      const invoices = [];
      
      snapshot.forEach(doc => {
        invoices.push(doc.data());
      });
      
      return invoices;
    } catch (error) {
      console.error(`Erreur lors de la récupération des factures du client ${clientId} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Met à jour une facture existante dans Firestore
   * @param {string} id - ID de la facture à mettre à jour
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  updateInvoice: async (id, data) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const db = getFirestore();
      
      // Référence à la collection des factures
      const invoicesRef = db.collection('invoices');
      
      // Filtrer les valeurs undefined
      const filteredData = filterUndefinedValues(data);
      
      // Ajouter un timestamp de mise à jour
      filteredData.lastUpdatedAt = Date.now();
      
      // Mettre à jour la facture dans Firestore
      await invoicesRef.doc(id.toString()).update(filteredData);
      
      return {
        success: true,
        id: id,
        message: 'Facture mise à jour avec succès'
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise une facture spécifique de Dolibarr vers Firestore avec toutes les informations associées
   * @param {Object} invoice - Données de la facture à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les lignes, remises et paiements
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncInvoiceWithDetails: async (invoice, includeDetails = true) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const db = getFirestore();
      
      // Filtrer les valeurs undefined
      const filteredInvoice = filterUndefinedValues(invoice);
      
      // Référence à la collection des factures
      const invoicesRef = db.collection('invoices');
      
      // ID de la facture
      const invoiceId = invoice.id.toString();
      
      // Données à enregistrer
      const invoiceData = {
        ...filteredInvoice,
        lastSyncedAt: Date.now()
      };
      
      // Si on veut inclure les détails
      if (includeDetails) {
        try {
          // Récupérer les lignes de la facture
          const lines = await DolibarrService.getInvoiceLines(invoiceId);
          if (lines && Array.isArray(lines)) {
            invoiceData.lines = lines;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des lignes de la facture ${invoiceId}:`, error);
          // On continue même si on n'a pas pu récupérer les lignes
        }
        
        try {
          // Récupérer les remises de la facture
          const discounts = await DolibarrService.getInvoiceDiscounts(invoiceId);
          if (discounts && Array.isArray(discounts)) {
            invoiceData.discounts = discounts;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des remises de la facture ${invoiceId}:`, error);
          // On continue même si on n'a pas pu récupérer les remises
        }
        
        try {
          // Récupérer les paiements de la facture
          const payments = await DolibarrService.getInvoicePayments(invoiceId);
          if (payments && Array.isArray(payments)) {
            invoiceData.payments = payments;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des paiements de la facture ${invoiceId}:`, error);
          // On continue même si on n'a pas pu récupérer les paiements
        }
      }
      
      // Ajouter ou mettre à jour la facture dans Firestore
      await invoicesRef.doc(invoiceId).set(invoiceData, { merge: true });
      
      // Récupérer et stocker le PDF de la facture
      try {
        // Récupérer le PDF depuis Dolibarr
        const pdfData = await DolibarrService.getInvoicePdf(invoiceId);
        
        // Télécharger le PDF dans Firebase Storage
        const storageResult = await FirestoreStorageService.uploadInvoicePdf(invoiceId, pdfData);
        
        // Mettre à jour la facture dans Firestore avec l'URL du PDF
        if (storageResult.success) {
          await invoicesRef.doc(invoiceId).update({
            pdf_url: storageResult.url
          });
        }
      } catch (pdfError) {
        console.error(`Erreur lors de la synchronisation du PDF de la facture ${invoiceId}:`, pdfError);
        // On continue même si le PDF n'a pas pu être synchronisé
      }
      
      return {
        success: true,
        id: invoiceId,
        message: `Facture ${invoiceId} synchronisée avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la facture avec détails:', error);
      throw error;
    }
  },
  
  /**
   * Synchronise une facture spécifique de Dolibarr vers Firestore avec son PDF
   * @param {Object} invoice - Données de la facture à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @param {boolean} includePdf - Si true, télécharge et stocke le PDF de la facture
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncInvoiceWithDetailsAndPdf: async (invoice, includeDetails = true, includePdf = true) => {
    try {
      // Vérifier si la facture a une référence valide pour le PDF
      if (includePdf && (!invoice.ref || invoice.ref.includes('(PROV)'))) {
        console.warn(`La facture ${invoice.id} a une référence invalide ou provisoire (${invoice.ref}), impossible de récupérer son PDF`);
        
        // Synchroniser quand même la facture sans PDF
        const invoiceResult = await FirestoreInvoiceService.syncInvoiceWithDetails(invoice, includeDetails);
        return {
          ...invoiceResult,
          pdf: {
            success: false,
            error: 'Référence de facture invalide ou provisoire'
          }
        };
      }
      
      // Synchroniser la facture avec ses détails
      const invoiceResult = await FirestoreInvoiceService.syncInvoiceWithDetails(invoice, includeDetails);
      
      // Si on ne veut pas inclure le PDF, on s'arrête là
      if (!includePdf) {
        return invoiceResult;
      }
      
      try {
        console.log(`Récupération du PDF pour la facture ${invoice.id} avec la référence ${invoice.ref}`);
        
        // Récupérer le PDF de la facture
        const pdfData = await DolibarrService.getInvoicePdf(invoice.id);
        
        // Stocker le PDF dans Firebase Storage
        const pdfResult = await FirestoreStorageService.uploadInvoicePdf(invoice.id, pdfData);
        
        // Mettre à jour la facture dans Firestore avec l'URL du PDF
        if (pdfResult.success) {
          const db = getFirestore();
          const invoiceRef = db.collection('invoices').doc(invoice.id.toString());
          
          await invoiceRef.update({
            pdfUrl: pdfResult.url,
            pdfPath: pdfResult.path,
            pdfSize: pdfResult.size,
            lastPdfSyncedAt: Date.now(),
            ref: invoice.ref // Stocker la référence pour faciliter les recherches futures
          });
          
          return {
            ...invoiceResult,
            pdf: {
              success: true,
              url: pdfResult.url,
              path: pdfResult.path,
              size: pdfResult.size,
              ref: invoice.ref
            }
          };
        }
        
        return {
          ...invoiceResult,
          pdf: {
            success: false,
            message: 'Le PDF a été synchronisé mais n\'a pas pu être stocké dans Firebase Storage'
          }
        };
      } catch (pdfError) {
        console.error(`Erreur lors de la synchronisation du PDF de la facture ${invoice.id} (${invoice.ref}):`, pdfError.message);
        
        return {
          ...invoiceResult,
          pdf: {
            success: false,
            error: pdfError.message,
            ref: invoice.ref
          }
        };
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation de la facture avec détails et PDF:', error);
      throw error;
    }
  },
};

export default FirestoreInvoiceService;
