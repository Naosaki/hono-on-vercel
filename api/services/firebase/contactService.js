import { getFirestore } from 'firebase-admin/firestore';

/**
 * Service pour gérer les contacts dans Firestore
 */
export const FirestoreContactService = {
  /**
   * Récupérer tous les contacts depuis Firestore
   * @returns {Promise<Array>} - Liste des contacts
   */
  getAllContacts: async () => {
    try {
      const db = getFirestore();
      const contactsRef = db.collection('contacts');
      const snapshot = await contactsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts depuis Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer un contact par son ID depuis Firestore
   * @param {string} id - ID du contact
   * @returns {Promise<Object>} - Données du contact
   */
  getContactById: async (id) => {
    try {
      const db = getFirestore();
      const contactRef = db.collection('contacts').doc(id);
      const doc = await contactRef.get();
      
      if (!doc.exists) {
        throw new Error(`Contact avec l'ID ${id} non trouvé dans Firestore`);
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du contact ${id} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Récupérer les contacts liés à un tiers spécifique
   * @param {string} thirdPartyId - ID du tiers
   * @returns {Promise<Array>} - Liste des contacts du tiers
   */
  getContactsByThirdPartyId: async (thirdPartyId) => {
    try {
      const db = getFirestore();
      const contactsRef = db.collection('contacts');
      const snapshot = await contactsRef.where('fk_soc', '==', thirdPartyId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erreur lors de la récupération des contacts du tiers ${thirdPartyId}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchroniser un contact avec Firestore
   * @param {Object} contact - Données du contact à synchroniser
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  syncContact: async (contact) => {
    try {
      const db = getFirestore();
      const contactRef = db.collection('contacts').doc(contact.id.toString());
      
      // Préparer les données à enregistrer
      const contactData = {
        ...contact,
        last_sync: new Date(),
        sync_source: 'dolibarr'
      };
      
      // Enregistrer dans Firestore
      await contactRef.set(contactData, { merge: true });
      
      return {
        success: true,
        id: contact.id,
        message: `Contact ${contact.id} synchronisé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du contact ${contact.id}:`, error);
      return {
        success: false,
        id: contact.id,
        error: error.message
      };
    }
  },
  
  /**
   * Mettre à jour un contact dans Firestore
   * @param {string} id - ID du contact à mettre à jour
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  updateContact: async (id, data) => {
    try {
      const db = getFirestore();
      const contactRef = db.collection('contacts').doc(id.toString());
      
      // Vérifier si le contact existe
      const doc = await contactRef.get();
      if (!doc.exists) {
        throw new Error(`Contact avec l'ID ${id} non trouvé dans Firestore`);
      }
      
      // Mettre à jour les données
      await contactRef.update({
        ...data,
        last_update: new Date()
      });
      
      return {
        success: true,
        id: id,
        message: `Contact ${id} mis à jour avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du contact ${id}:`, error);
      return {
        success: false,
        id: id,
        error: error.message
      };
    }
  },
  
  /**
   * Supprimer un contact de Firestore
   * @param {string} id - ID du contact à supprimer
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  deleteContact: async (id) => {
    try {
      const db = getFirestore();
      const contactRef = db.collection('contacts').doc(id.toString());
      
      // Vérifier si le contact existe
      const doc = await contactRef.get();
      if (!doc.exists) {
        throw new Error(`Contact avec l'ID ${id} non trouvé dans Firestore`);
      }
      
      // Supprimer le contact
      await contactRef.delete();
      
      return {
        success: true,
        id: id,
        message: `Contact ${id} supprimé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du contact ${id}:`, error);
      return {
        success: false,
        id: id,
        error: error.message
      };
    }
  }
};

export default FirestoreContactService;
