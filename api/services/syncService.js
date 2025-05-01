import { DolibarrService } from './dolibarrService.js';
import { FirestoreThirdPartyService } from './firebase/thirdPartyService.js';
import { FirestoreInvoiceService } from './firebase/invoiceService.js';
import { FirestoreProductService } from './firebase/productService.js';

/**
 * Service pour synchroniser les donnu00e9es entre Dolibarr et Firestore
 */
export const SyncService = {
  /**
   * Synchronise tous les tiers (clients/prospects) de Dolibarr vers Firestore
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllThirdParties: async () => {
    try {
      console.log('Du00e9marrage de la synchronisation des tiers...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const thirdParties = await DolibarrService.getThirdParties();
      console.log(`${thirdParties.length} tiers ru00e9cupu00e9ru00e9s depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreThirdPartyService.syncAllThirdParties(thirdParties);
      
      return {
        success: true,
        message: `${result.count} tiers synchronisu00e9s avec succu00e8s`,
        count: result.count
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des tiers:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Synchronise un tiers spu00e9cifique de Dolibarr vers Firestore
   * @param {string} id - ID du tiers u00e0 synchroniser
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncThirdParty: async (id) => {
    try {
      console.log(`Du00e9marrage de la synchronisation du tiers ${id}...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const thirdParty = await DolibarrService.getThirdPartyById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreThirdPartyService.syncThirdParty(thirdParty);
      
      return {
        success: true,
        message: `Tiers ${id} synchronisu00e9 avec succu00e8s`,
        id: result.id
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du tiers ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation du tiers ${id}: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Compare les donnu00e9es entre Dolibarr et Firestore pour un tiers spu00e9cifique
   * @param {string} id - ID du tiers u00e0 comparer
   * @returns {Promise} - Promesse contenant le ru00e9sultat de la comparaison
   */
  compareThirdParty: async (id) => {
    try {
      // Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const dolibarrData = await DolibarrService.getThirdPartyById(id);
      
      // Ru00e9cupu00e9rer les donnu00e9es depuis Firestore
      let firestoreData;
      try {
        firestoreData = await FirestoreThirdPartyService.getThirdPartyById(id);
      } catch (error) {
        // Si le tiers n'existe pas dans Firestore
        return {
          exists: {
            dolibarr: true,
            firestore: false
          },
          dolibarrData,
          firestoreData: null,
          differences: ['Le tiers n\'existe pas dans Firestore']
        };
      }
      
      // Comparer les donnu00e9es
      const differences = [];
      const keysToCompare = [
        'name', 'email', 'phone', 'status', 'address', 'zip', 'town',
        'country_code', 'date_modification'
      ];
      
      for (const key of keysToCompare) {
        if (dolibarrData[key] !== firestoreData[key]) {
          differences.push({
            field: key,
            dolibarr: dolibarrData[key],
            firestore: firestoreData[key]
          });
        }
      }
      
      return {
        exists: {
          dolibarr: true,
          firestore: true
        },
        dolibarrData,
        firestoreData,
        differences,
        needsSync: differences.length > 0
      };
    } catch (error) {
      console.error(`Erreur lors de la comparaison du tiers ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise toutes les factures de Dolibarr vers Firestore
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllInvoices: async () => {
    try {
      console.log('Du00e9marrage de la synchronisation des factures...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoices = await DolibarrService.getInvoices();
      console.log(`${invoices.length} factures ru00e9cupu00e9ru00e9es depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreInvoiceService.syncAllInvoices(invoices);
      
      return {
        success: true,
        message: `${result.count} factures synchronisu00e9es avec succu00e8s`,
        count: result.count
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des factures:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Synchronise une facture spu00e9cifique de Dolibarr vers Firestore
   * @param {string} id - ID de la facture u00e0 synchroniser
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncInvoice: async (id) => {
    try {
      console.log(`Du00e9marrage de la synchronisation de la facture ${id}...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoice = await DolibarrService.getInvoiceById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreInvoiceService.syncInvoice(invoice);
      
      return {
        success: true,
        message: `Facture ${id} synchronisu00e9e avec succu00e8s`,
        id: result.id
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la facture ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation de la facture ${id}: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Compare les donnu00e9es entre Dolibarr et Firestore pour une facture spu00e9cifique
   * @param {string} id - ID de la facture u00e0 comparer
   * @returns {Promise} - Promesse contenant le ru00e9sultat de la comparaison
   */
  compareInvoice: async (id) => {
    try {
      // Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const dolibarrData = await DolibarrService.getInvoiceById(id);
      
      // Ru00e9cupu00e9rer les donnu00e9es depuis Firestore
      let firestoreData;
      try {
        firestoreData = await FirestoreInvoiceService.getInvoiceById(id);
      } catch (error) {
        // Si la facture n'existe pas dans Firestore
        return {
          exists: {
            dolibarr: true,
            firestore: false
          },
          dolibarrData,
          firestoreData: null,
          differences: ['La facture n\'existe pas dans Firestore']
        };
      }
      
      // Comparer les donnu00e9es
      const differences = [];
      const keysToCompare = [
        'ref', 'total_ht', 'total_ttc', 'total_tva', 'paye', 'fk_statut',
        'datef', 'date_lim_reglement'
      ];
      
      for (const key of keysToCompare) {
        if (dolibarrData[key] !== firestoreData[key]) {
          differences.push({
            field: key,
            dolibarr: dolibarrData[key],
            firestore: firestoreData[key]
          });
        }
      }
      
      return {
        exists: {
          dolibarr: true,
          firestore: true
        },
        dolibarrData,
        firestoreData,
        differences,
        needsSync: differences.length > 0
      };
    } catch (error) {
      console.error(`Erreur lors de la comparaison de la facture ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise tous les produits de Dolibarr vers Firestore
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllProducts: async () => {
    try {
      console.log('Du00e9marrage de la synchronisation des produits...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const products = await DolibarrService.getProducts();
      console.log(`${products.length} produits ru00e9cupu00e9ru00e9s depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreProductService.syncAllProducts(products);
      
      return {
        success: true,
        message: `${result.count} produits synchronisu00e9s avec succu00e8s`,
        count: result.count
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des produits:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Synchronise un produit spu00e9cifique de Dolibarr vers Firestore
   * @param {string} id - ID du produit u00e0 synchroniser
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncProduct: async (id) => {
    try {
      console.log(`Du00e9marrage de la synchronisation du produit ${id}...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const product = await DolibarrService.getProductById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreProductService.syncProduct(product);
      
      return {
        success: true,
        message: `Produit ${id} synchronisu00e9 avec succu00e8s`,
        id: result.id
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du produit ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation du produit ${id}: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Compare les donnu00e9es entre Dolibarr et Firestore pour un produit spu00e9cifique
   * @param {string} id - ID du produit u00e0 comparer
   * @returns {Promise} - Promesse contenant le ru00e9sultat de la comparaison
   */
  compareProduct: async (id) => {
    try {
      // Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const dolibarrData = await DolibarrService.getProductById(id);
      
      // Ru00e9cupu00e9rer les donnu00e9es depuis Firestore
      let firestoreData;
      try {
        firestoreData = await FirestoreProductService.getProductById(id);
      } catch (error) {
        // Si le produit n'existe pas dans Firestore
        return {
          exists: {
            dolibarr: true,
            firestore: false
          },
          dolibarrData,
          firestoreData: null,
          differences: ['Le produit n\'existe pas dans Firestore']
        };
      }
      
      // Comparer les donnu00e9es
      const differences = [];
      const keysToCompare = [
        'ref', 'label', 'description', 'price', 'price_ttc', 'tva_tx',
        'status', 'status_buy', 'stock_reel'
      ];
      
      for (const key of keysToCompare) {
        if (dolibarrData[key] !== firestoreData[key]) {
          differences.push({
            field: key,
            dolibarr: dolibarrData[key],
            firestore: firestoreData[key]
          });
        }
      }
      
      return {
        exists: {
          dolibarr: true,
          firestore: true
        },
        dolibarrData,
        firestoreData,
        differences,
        needsSync: differences.length > 0
      };
    } catch (error) {
      console.error(`Erreur lors de la comparaison du produit ${id}:`, error);
      throw error;
    }
  }
};

export default SyncService;
