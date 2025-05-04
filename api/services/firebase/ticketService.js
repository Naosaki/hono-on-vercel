import { getFirestore } from 'firebase-admin/firestore';

/**
 * Service pour gu00e9rer les tickets dans Firestore
 */
export const FirestoreTicketService = {
  /**
   * Ru00e9cupu00e9rer tous les tickets depuis Firestore
   * @returns {Promise<Array>} - Liste des tickets
   */
  getAllTickets: async () => {
    try {
      const db = getFirestore();
      const ticketsRef = db.collection('tickets');
      const snapshot = await ticketsRef.get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la ru00e9cupu00e9ration des tickets depuis Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Ru00e9cupu00e9rer un ticket par son ID depuis Firestore
   * @param {string} id - ID du ticket
   * @returns {Promise<Object>} - Donnu00e9es du ticket
   */
  getTicketById: async (id) => {
    try {
      const db = getFirestore();
      const ticketRef = db.collection('tickets').doc(id);
      const doc = await ticketRef.get();
      
      if (!doc.exists) {
        throw new Error(`Ticket avec l'ID ${id} non trouvu00e9 dans Firestore`);
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration du ticket ${id} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Ru00e9cupu00e9rer un ticket par sa ru00e9fu00e9rence depuis Firestore
   * @param {string} ref - Ru00e9fu00e9rence du ticket
   * @returns {Promise<Object>} - Donnu00e9es du ticket
   */
  getTicketByRef: async (ref) => {
    try {
      const db = getFirestore();
      const ticketsRef = db.collection('tickets');
      const snapshot = await ticketsRef.where('ref', '==', ref).get();
      
      if (snapshot.empty) {
        throw new Error(`Ticket avec la ru00e9fu00e9rence ${ref} non trouvu00e9 dans Firestore`);
      }
      
      // Il ne devrait y avoir qu'un seul ru00e9sultat
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration du ticket avec la ru00e9fu00e9rence ${ref}:`, error);
      throw error;
    }
  },
  
  /**
   * Ru00e9cupu00e9rer un ticket par son track_id depuis Firestore
   * @param {string} trackId - Track ID du ticket
   * @returns {Promise<Object>} - Donnu00e9es du ticket
   */
  getTicketByTrackId: async (trackId) => {
    try {
      const db = getFirestore();
      const ticketsRef = db.collection('tickets');
      const snapshot = await ticketsRef.where('track_id', '==', trackId).get();
      
      if (snapshot.empty) {
        throw new Error(`Ticket avec le track_id ${trackId} non trouvu00e9 dans Firestore`);
      }
      
      // Il ne devrait y avoir qu'un seul ru00e9sultat
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration du ticket avec le track_id ${trackId}:`, error);
      throw error;
    }
  },
  
  /**
   * Ru00e9cupu00e9rer les tickets liu00e9s u00e0 un tiers spu00e9cifique
   * @param {string} thirdPartyId - ID du tiers
   * @returns {Promise<Array>} - Liste des tickets du tiers
   */
  getTicketsByThirdPartyId: async (thirdPartyId) => {
    try {
      const db = getFirestore();
      const ticketsRef = db.collection('tickets');
      const snapshot = await ticketsRef.where('fk_soc', '==', thirdPartyId).get();
      
      if (snapshot.empty) {
        return [];
      }
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration des tickets du tiers ${thirdPartyId}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchroniser un ticket avec Firestore
   * @param {Object} ticket - Donnu00e9es du ticket u00e0 synchroniser
   * @returns {Promise<Object>} - Ru00e9sultat de l'opu00e9ration
   */
  syncTicket: async (ticket) => {
    try {
      const db = getFirestore();
      const ticketRef = db.collection('tickets').doc(ticket.id.toString());
      
      // Pru00e9parer les donnu00e9es u00e0 enregistrer
      const ticketData = {
        ...ticket,
        last_sync: new Date(),
        sync_source: 'dolibarr'
      };
      
      // Enregistrer dans Firestore
      await ticketRef.set(ticketData, { merge: true });
      
      return {
        success: true,
        id: ticket.id,
        message: `Ticket ${ticket.id} synchronisu00e9 avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du ticket ${ticket.id}:`, error);
      return {
        success: false,
        id: ticket.id,
        error: error.message
      };
    }
  },
  
  /**
   * Mettre u00e0 jour un ticket dans Firestore
   * @param {string} id - ID du ticket u00e0 mettre u00e0 jour
   * @param {Object} data - Donnu00e9es u00e0 mettre u00e0 jour
   * @returns {Promise<Object>} - Ru00e9sultat de l'opu00e9ration
   */
  updateTicket: async (id, data) => {
    try {
      const db = getFirestore();
      const ticketRef = db.collection('tickets').doc(id.toString());
      
      // Vu00e9rifier si le ticket existe
      const doc = await ticketRef.get();
      if (!doc.exists) {
        throw new Error(`Ticket avec l'ID ${id} non trouvu00e9 dans Firestore`);
      }
      
      // Mettre u00e0 jour les donnu00e9es
      await ticketRef.update({
        ...data,
        last_update: new Date()
      });
      
      return {
        success: true,
        id: id,
        message: `Ticket ${id} mis u00e0 jour avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la mise u00e0 jour du ticket ${id}:`, error);
      return {
        success: false,
        id: id,
        error: error.message
      };
    }
  },
  
  /**
   * Supprimer un ticket de Firestore
   * @param {string} id - ID du ticket u00e0 supprimer
   * @returns {Promise<Object>} - Ru00e9sultat de l'opu00e9ration
   */
  deleteTicket: async (id) => {
    try {
      const db = getFirestore();
      const ticketRef = db.collection('tickets').doc(id.toString());
      
      // Vu00e9rifier si le ticket existe
      const doc = await ticketRef.get();
      if (!doc.exists) {
        throw new Error(`Ticket avec l'ID ${id} non trouvu00e9 dans Firestore`);
      }
      
      // Supprimer le ticket
      await ticketRef.delete();
      
      return {
        success: true,
        id: id,
        message: `Ticket ${id} supprimu00e9 avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du ticket ${id}:`, error);
      return {
        success: false,
        id: id,
        error: error.message
      };
    }
  },
  
  /**
   * Ajouter un message u00e0 un ticket dans Firestore
   * @param {string} id - ID du ticket
   * @param {Object} messageData - Donnu00e9es du message
   * @returns {Promise<Object>} - Ru00e9sultat de l'opu00e9ration
   */
  addTicketMessage: async (id, messageData) => {
    try {
      const db = getFirestore();
      const ticketRef = db.collection('tickets').doc(id.toString());
      
      // Vu00e9rifier si le ticket existe
      const doc = await ticketRef.get();
      if (!doc.exists) {
        throw new Error(`Ticket avec l'ID ${id} non trouvu00e9 dans Firestore`);
      }
      
      // Ru00e9cupu00e9rer les donnu00e9es actuelles
      const ticketData = doc.data();
      
      // Pru00e9parer le nouveau message
      const message = {
        ...messageData,
        date_creation: new Date(),
        id: Date.now().toString() // Gu00e9nu00e9rer un ID unique pour le message
      };
      
      // Ajouter le message u00e0 la liste des messages
      const messages = ticketData.messages || [];
      messages.push(message);
      
      // Mettre u00e0 jour le ticket
      await ticketRef.update({
        messages,
        last_update: new Date()
      });
      
      return {
        success: true,
        id: id,
        message_id: message.id,
        message: `Message ajoutu00e9 au ticket ${id} avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un message au ticket ${id}:`, error);
      return {
        success: false,
        id: id,
        error: error.message
      };
    }
  }
};

export default FirestoreTicketService;
