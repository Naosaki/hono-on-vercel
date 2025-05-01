import { adminDb } from './adminConfig.js';

/**
 * Service pour gérer les tiers (clients/prospects) dans Firestore
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
      const thirdPartyRef = adminDb.collection('thirdParties').doc(thirdParty.id.toString());
      
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
        const thirdPartyRef = adminDb.collection('thirdParties').doc(thirdParty.id.toString());
        
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
      const snapshot = await adminDb.collection('thirdParties').get();
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
      const doc = await adminDb.collection('thirdParties').doc(id.toString()).get();
      
      if (!doc.exists) {
        throw new Error(`Tiers avec ID ${id} non trouvé dans Firestore`);
      }
      
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération du tiers ${id} depuis Firestore:`, error);
      throw error;
    }
  }
};

export default FirestoreThirdPartyService;
