import { adminDb } from './adminConfig.js';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './adminConfig.js';
import { DolibarrService } from '../dolibarrService.js';

/**
 * Fonction utilitaire pour filtrer les valeurs undefined d'un objet
 * @param {Object} obj - Objet à filtrer
 * @returns {Object} - Objet filtré
 */
function filterUndefinedValues(obj) {
  const filteredObj = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      filteredObj[key] = obj[key];
    }
  }
  
  return filteredObj;
}

/**
 * Service pour gérer les tiers dans Firestore
 */
export const FirestoreThirdPartyService = {
  /**
   * Synchronise un tiers de Dolibarr vers Firestore
   * @param {Object} thirdParty - Données du tiers provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncThirdParty: async (thirdParty) => {
    try {
      // Utiliser l'ID de Dolibarr comme identifiant dans Firestore
      const thirdPartyRef = adminDb.collection('thirdparties').doc(thirdParty.id.toString());
      
      // Préparer les données à stocker dans Firestore
      // Nous pouvons filtrer ou transformer les données si nécessaire
      const thirdPartyData = {
        id: thirdParty.id,
        name: thirdParty.name,
        name_alias: thirdParty.name_alias,
        status: thirdParty.status,
        email: thirdParty.email,
        phone: thirdParty.phone,
        phone_mobile: thirdParty.phone_mobile,
        address: thirdParty.address,
        zip: thirdParty.zip,
        town: thirdParty.town,
        country_code: thirdParty.country_code,
        country_id: thirdParty.country_id,
        client: thirdParty.client,
        prospect: thirdParty.prospect,
        fournisseur: thirdParty.fournisseur,
        code_client: thirdParty.code_client,
        note_public: thirdParty.note_public,
        note_private: thirdParty.note_private,
        url: thirdParty.url,
        date_creation: thirdParty.date_creation,
        date_modification: thirdParty.date_modification,
        // Ajouter des métadonnées supplémentaires
        lastSyncedAt: Date.now(),
        source: 'dolibarr'
      };
      
      // Enregistrer dans Firestore
      await thirdPartyRef.set(thirdPartyData, { merge: true });
      console.log(`Tiers ${thirdParty.id} (${thirdParty.name}) synchronisé avec succès`);
      
      return { success: true, id: thirdParty.id };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du tiers ${thirdParty.id}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise tous les tiers de Dolibarr vers Firestore
   * @param {Array} thirdParties - Liste des tiers provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllThirdParties: async (thirdParties) => {
    try {
      const batch = adminDb.batch();
      let count = 0;
      let batchCount = 0;
      
      // Traiter chaque tiers par lots pour optimiser les performances
      for (const thirdParty of thirdParties) {
        const thirdPartyRef = adminDb.collection('thirdparties').doc(thirdParty.id.toString());
        
        // Préparer les données à stocker
        const thirdPartyData = {
          id: thirdParty.id,
          name: thirdParty.name,
          name_alias: thirdParty.name_alias,
          status: thirdParty.status,
          email: thirdParty.email,
          phone: thirdParty.phone,
          phone_mobile: thirdParty.phone_mobile,
          address: thirdParty.address,
          zip: thirdParty.zip,
          town: thirdParty.town,
          country_code: thirdParty.country_code,
          country_id: thirdParty.country_id,
          client: thirdParty.client,
          prospect: thirdParty.prospect,
          fournisseur: thirdParty.fournisseur,
          code_client: thirdParty.code_client,
          note_public: thirdParty.note_public,
          note_private: thirdParty.note_private,
          url: thirdParty.url,
          date_creation: thirdParty.date_creation,
          date_modification: thirdParty.date_modification,
          // Métadonnées
          lastSyncedAt: Date.now(),
          source: 'dolibarr'
        };
        
        batch.set(thirdPartyRef, thirdPartyData, { merge: true });
        count++;
        batchCount++;
        
        // Firestore a une limite de 500 opérations par lot
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`Lot de ${batchCount} tiers synchronisés`);
          batch = adminDb.batch();
          batchCount = 0;
        }
      }
      
      // Envoyer le dernier lot s'il reste des opérations
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Dernier lot de ${batchCount} tiers synchronisés`);
      }
      
      return { success: true, count: thirdParties.length };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des tiers:', error);
      throw error;
    }
  },
  
  /**
   * Récupère tous les tiers depuis Firestore
   * @returns {Promise} - Promesse contenant les résultats
   */
  getAllThirdParties: async () => {
    try {
      const snapshot = await adminDb.collection('thirdparties').get();
      const thirdParties = [];
      
      snapshot.forEach(doc => {
        thirdParties.push(doc.data());
      });
      
      return thirdParties;
    } catch (error) {
      console.error('Erreur lors de la récupération des tiers depuis Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un tiers par son ID depuis Firestore
   * @param {string} id - ID du tiers
   * @returns {Promise} - Promesse contenant les résultats
   */
  getThirdPartyById: async (id) => {
    try {
      const doc = await adminDb.collection('thirdparties').doc(id.toString()).get();
      
      if (!doc.exists) {
        throw new Error(`Tiers avec ID ${id} non trouvé dans Firestore`);
      }
      
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération du tiers ${id} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise un tiers spécifique de Dolibarr vers Firestore avec toutes les informations associées
   * @param {Object} thirdParty - Données du tiers à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncThirdPartyWithDetails: async (thirdParty, includeDetails = true) => {
    try {
      // Initialiser Firebase Admin si ce n'est pas déjà fait
      const admin = getFirebaseAdmin();
      const db = getFirestore();
      
      // Filtrer les valeurs undefined
      const filteredThirdParty = filterUndefinedValues(thirdParty);
      
      // Référence à la collection des tiers
      const thirdPartiesRef = db.collection('thirdparties');
      
      // ID du tiers
      const thirdPartyId = thirdParty.id.toString();
      
      // Données à enregistrer
      const thirdPartyData = {
        ...filteredThirdParty,
        lastSyncedAt: Date.now()
      };
      
      // Si on veut inclure les détails
      if (includeDetails) {
        try {
          // Récupérer les comptes bancaires du tiers
          const bankAccounts = await DolibarrService.getThirdPartyBankAccounts(thirdPartyId);
          if (bankAccounts && Array.isArray(bankAccounts)) {
            thirdPartyData.bankAccounts = bankAccounts;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des comptes bancaires du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les comptes bancaires
        }
        
        try {
          // Récupérer les catégories client du tiers
          const customerCategories = await DolibarrService.getThirdPartyCustomerCategories(thirdPartyId);
          if (customerCategories && Array.isArray(customerCategories)) {
            thirdPartyData.customerCategories = customerCategories;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des catégories client du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les catégories client
        }
        
        try {
          // Récupérer les catégories fournisseur du tiers
          const supplierCategories = await DolibarrService.getThirdPartySupplierCategories(thirdPartyId);
          if (supplierCategories && Array.isArray(supplierCategories)) {
            thirdPartyData.supplierCategories = supplierCategories;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des catégories fournisseur du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les catégories fournisseur
        }
        
        try {
          // Récupérer les factures impayées du tiers
          const outstandingInvoices = await DolibarrService.getThirdPartyOutstandingInvoices(thirdPartyId);
          if (outstandingInvoices) {
            thirdPartyData.outstandingInvoices = outstandingInvoices;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des factures impayées du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les factures impayées
        }
        
        try {
          // Récupérer les commandes impayées du tiers
          const outstandingOrders = await DolibarrService.getThirdPartyOutstandingOrders(thirdPartyId);
          if (outstandingOrders) {
            thirdPartyData.outstandingOrders = outstandingOrders;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des commandes impayées du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les commandes impayées
        }
        
        try {
          // Récupérer les propositions commerciales impayées du tiers
          const outstandingProposals = await DolibarrService.getThirdPartyOutstandingProposals(thirdPartyId);
          if (outstandingProposals) {
            thirdPartyData.outstandingProposals = outstandingProposals;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des propositions impayées du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les propositions impayées
        }
        
        try {
          // Récupérer les représentants du tiers
          const representatives = await DolibarrService.getThirdPartyRepresentatives(thirdPartyId);
          if (representatives && Array.isArray(representatives)) {
            thirdPartyData.representatives = representatives;
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des représentants du tiers ${thirdPartyId}:`, error);
          // On continue même si on n'a pas pu récupérer les représentants
        }
      }
      
      // Ajouter ou mettre à jour le tiers dans Firestore
      await thirdPartiesRef.doc(thirdPartyId).set(thirdPartyData, { merge: true });
      
      return {
        success: true,
        id: thirdPartyId,
        message: `Tiers ${thirdPartyId} synchronisé avec succès`
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation du tiers avec détails:', error);
      throw error;
    }
  },
};

export default FirestoreThirdPartyService;
