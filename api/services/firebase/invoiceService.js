import { adminDb } from './adminConfig.js';

/**
 * Fonction utilitaire pour filtrer les valeurs undefined d'un objet
 * @param {Object} obj - Objet à filtrer
 * @returns {Object} - Objet sans valeurs undefined
 */
const filterUndefinedValues = (obj) => {
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
      // Utiliser l'ID de Dolibarr comme identifiant dans Firestore
      const invoiceRef = adminDb.collection('invoices').doc(invoice.id.toString());
      
      // Préparer les données à stocker dans Firestore
      const invoiceData = {
        id: invoice.id,
        ref: invoice.ref,
        ref_ext: invoice.ref_ext,
        ref_client: invoice.ref_client,
        ref_supplier: invoice.ref_supplier,
        socid: invoice.socid,  // ID du client/tiers
        datec: invoice.datec,  // Date de création
        datef: invoice.datef,  // Date de facturation
        date_lim_reglement: invoice.date_lim_reglement,  // Date limite de règlement
        date_valid: invoice.date_valid,  // Date de validation
        date_closing: invoice.date_closing,  // Date de clôture
        tva: invoice.tva,  // TVA
        localtax1: invoice.localtax1,
        localtax2: invoice.localtax2,
        total_ht: invoice.total_ht,  // Total HT
        total_ttc: invoice.total_ttc,  // Total TTC
        total_tva: invoice.total_tva,  // Total TVA
        paye: invoice.paye,  // Statut de paiement (0=non, 1=oui)
        fk_statut: invoice.fk_statut,  // Statut de la facture
        close_code: invoice.close_code,
        close_note: invoice.close_note,
        type: invoice.type,  // Type de facture
        remise_percent: invoice.remise_percent,  // Remise en pourcentage
        remise_absolue: invoice.remise_absolue,  // Remise absolue
        remise: invoice.remise,  // Remise
        note_private: invoice.note_private,  // Note privée
        note_public: invoice.note_public,  // Note publique
        fk_account: invoice.fk_account,  // Compte bancaire
        fk_currency: invoice.fk_currency,  // Devise
        fk_cond_reglement: invoice.fk_cond_reglement,  // Condition de règlement
        fk_mode_reglement: invoice.fk_mode_reglement,  // Mode de règlement
        model_pdf: invoice.model_pdf,  // Modèle PDF
        last_main_doc: invoice.last_main_doc,  // Dernier document principal
        situation_cycle_ref: invoice.situation_cycle_ref,  // Référence du cycle de situation
        situation_counter: invoice.situation_counter,  // Compteur de situation
        situation_final: invoice.situation_final,  // Situation finale
        retained_warranty: invoice.retained_warranty,  // Garantie retenue
        retained_warranty_date_limit: invoice.retained_warranty_date_limit,  // Date limite de garantie retenue
        retained_warranty_fk_cond_reglement: invoice.retained_warranty_fk_cond_reglement,  // Condition de règlement de garantie retenue
        // Métadonnées
        lastSyncedAt: Date.now(),
        source: 'dolibarr'
      };
      
      // Filtrer les valeurs undefined
      const filteredInvoiceData = filterUndefinedValues(invoiceData);
      
      // Enregistrer dans Firestore
      await invoiceRef.set(filteredInvoiceData, { merge: true });
      console.log(`Facture ${invoice.id} (${invoice.ref}) synchronisée avec succès`);
      
      return { success: true, id: invoice.id };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la facture ${invoice.id}:`, error);
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
  }
};

export default FirestoreInvoiceService;
