import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const stockMovementsCollection = db.collection('stock_movements');

export const FirestoreStockMovementService = {
  /**
   * Récupérer tous les mouvements de stock
   * @returns {Promise<Array>} - Liste des mouvements de stock
   */
  getAllStockMovements: async () => {
    try {
      const snapshot = await stockMovementsCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock:', error);
      throw error;
    }
  },

  /**
   * Récupérer un mouvement de stock par son ID
   * @param {string} id - ID du mouvement de stock
   * @returns {Promise<Object|null>} - Mouvement de stock ou null si non trouvé
   */
  getStockMovementById: async (id) => {
    try {
      const doc = await stockMovementsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération du mouvement de stock ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les mouvements de stock par produit
   * @param {string} productId - ID du produit
   * @returns {Promise<Array>} - Liste des mouvements de stock pour ce produit
   */
  getStockMovementsByProduct: async (productId) => {
    try {
      const snapshot = await stockMovementsCollection.where('fk_product', '==', productId).get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`Erreur lors de la récupération des mouvements de stock pour le produit ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les mouvements de stock par entrepôt
   * @param {string} warehouseId - ID de l'entrepôt
   * @returns {Promise<Array>} - Liste des mouvements de stock pour cet entrepôt
   */
  getStockMovementsByWarehouse: async (warehouseId) => {
    try {
      const snapshot = await stockMovementsCollection.where('fk_entrepot', '==', warehouseId).get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`Erreur lors de la récupération des mouvements de stock pour l'entrepôt ${warehouseId}:`, error);
      throw error;
    }
  },

  /**
   * Synchroniser un mouvement de stock
   * @param {Object} stockMovement - Mouvement de stock à synchroniser
   * @returns {Promise<Object>} - Résultat de la synchronisation
   */
  syncStockMovement: async (stockMovement) => {
    try {
      if (!stockMovement || !stockMovement.id) {
        console.error('Impossible de synchroniser un mouvement de stock sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un mouvement de stock sans ID'
        };
      }

      // Ajouter un timestamp de dernière synchronisation
      const stockMovementWithTimestamp = {
        ...stockMovement,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await stockMovementsCollection.doc(stockMovement.id).set(stockMovementWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Mouvement de stock ${stockMovement.id} synchronisé avec succès`,
        stockMovement: stockMovementWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du mouvement de stock ${stockMovement?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  /**
   * Supprimer un mouvement de stock
   * @param {string} id - ID du mouvement de stock à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteStockMovement: async (id) => {
    try {
      await stockMovementsCollection.doc(id).delete();
      return {
        success: true,
        message: `Mouvement de stock ${id} supprimé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du mouvement de stock ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  },

  /**
   * Récupérer les statistiques des mouvements de stock
   * @returns {Promise<Object>} - Statistiques des mouvements de stock
   */
  getStockMovementsStats: async () => {
    try {
      const snapshot = await stockMovementsCollection.get();
      const movements = snapshot.docs.map(doc => doc.data());
      
      if (movements.length === 0) {
        return {
          success: false,
          message: 'Aucun mouvement de stock trouvé dans Firestore'
        };
      }
      
      // Calculer les statistiques
      const stats = {
        total: movements.length,
        byType: {},
        byProduct: {},
        byWarehouse: {}
      };
      
      // Grouper par type (entrée/sortie)
      movements.forEach(movement => {
        // Type de mouvement (0: correction, 1: sortie, 2: entrée, 3: mouvement facture...)
        const type = movement.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Grouper par produit
        const productId = movement.product_id || 'unknown';
        if (!stats.byProduct[productId]) {
          stats.byProduct[productId] = { count: 0, quantity: 0 };
        }
        stats.byProduct[productId].count += 1;
        stats.byProduct[productId].quantity += parseFloat(movement.qty) || 0;
        
        // Grouper par entrepôt
        const warehouseId = movement.warehouse_id || 'unknown';
        if (!stats.byWarehouse[warehouseId]) {
          stats.byWarehouse[warehouseId] = { count: 0, quantity: 0 };
        }
        stats.byWarehouse[warehouseId].count += 1;
        stats.byWarehouse[warehouseId].quantity += parseFloat(movement.qty) || 0;
      });
      
      return {
        success: true,
        stats: stats
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des mouvements de stock:', error);
      return {
        success: false,
        message: `Erreur lors du calcul des statistiques: ${error.message}`,
        error: error.message
      };
    }
  }
};

export default FirestoreStockMovementService;
