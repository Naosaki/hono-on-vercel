import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const warehousesCollection = db.collection('warehouses');

export const FirestoreWarehouseService = {
  getAllWarehouses: async () => {
    try {
      const snapshot = await warehousesCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la ru00e9cupu00e9ration des entrepu00f4ts:', error);
      throw error;
    }
  },

  getWarehouseById: async (id) => {
    try {
      const doc = await warehousesCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'entrepu00f4t ${id}:`, error);
      throw error;
    }
  },

  getWarehouseByRef: async (ref) => {
    try {
      const snapshot = await warehousesCollection.where('ref', '==', ref).get();
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'entrepu00f4t par ru00e9fu00e9rence ${ref}:`, error);
      throw error;
    }
  },

  syncWarehouse: async (warehouse) => {
    try {
      if (!warehouse || !warehouse.id) {
        console.error('Impossible de synchroniser un entrepu00f4t sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un entrepu00f4t sans ID'
        };
      }

      // Ajouter un timestamp de derniu00e8re synchronisation
      const warehouseWithTimestamp = {
        ...warehouse,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await warehousesCollection.doc(warehouse.id).set(warehouseWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Entrepu00f4t ${warehouse.id} (${warehouse.label || warehouse.ref}) synchronisu00e9 avec succu00e8s`,
        warehouse: warehouseWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'entrepu00f4t ${warehouse?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteWarehouse: async (id) => {
    try {
      await warehousesCollection.doc(id).delete();
      return {
        success: true,
        message: `Entrepu00f4t ${id} supprimu00e9 avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'entrepu00f4t ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  }
};

export default FirestoreWarehouseService;
