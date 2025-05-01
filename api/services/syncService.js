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
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllThirdParties: async (includeDetails = true) => {
    try {
      console.log('Du00e9marrage de la synchronisation des tiers...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const thirdParties = await DolibarrService.getThirdParties();
      console.log(`${thirdParties.length} tiers ru00e9cupu00e9ru00e9s depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      const batchSize = 10; // Traiter les tiers par lots de 10
      
      for (let i = 0; i < thirdParties.length; i += batchSize) {
        const batch = thirdParties.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(thirdParties.length / batchSize)}...`);
        
        // Traiter les tiers en parrallu00e8le
        const promises = batch.map(thirdParty => {
          if (includeDetails) {
            return FirestoreThirdPartyService.syncThirdPartyWithDetails(thirdParty, includeDetails);
          } else {
            return FirestoreThirdPartyService.syncThirdParty(thirdParty);
          }
        });
        
        const results = await Promise.all(promises);
        count += results.filter(result => result.success).length;
      }
      
      return {
        success: true,
        message: `${count} tiers synchronisu00e9s avec succu00e8s`,
        count
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
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncThirdParty: async (id, includeDetails = true) => {
    try {
      console.log(`Du00e9marrage de la synchronisation du tiers ${id}...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const thirdParty = await DolibarrService.getThirdPartyById(id);
      
      // 2. Synchroniser avec Firestore
      let result;
      if (includeDetails) {
        result = await FirestoreThirdPartyService.syncThirdPartyWithDetails(thirdParty, includeDetails);
      } else {
        result = await FirestoreThirdPartyService.syncThirdParty(thirdParty);
      }
      
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
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllInvoices: async (includeDetails = true) => {
    try {
      console.log('Du00e9marrage de la synchronisation des factures...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoices = await DolibarrService.getInvoices();
      console.log(`${invoices.length} factures ru00e9cupu00e9ru00e9es depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      const batchSize = 10; // Traiter les factures par lots de 10
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en parrallu00e8le
        const promises = batch.map(invoice => {
          if (includeDetails) {
            return FirestoreInvoiceService.syncInvoiceWithDetails(invoice, includeDetails);
          } else {
            return FirestoreInvoiceService.syncInvoice(invoice);
          }
        });
        
        const results = await Promise.all(promises);
        count += results.filter(result => result.success).length;
      }
      
      return {
        success: true,
        message: `${count} factures synchronisu00e9es avec succu00e8s`,
        count
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
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncInvoice: async (id, includeDetails = true) => {
    try {
      console.log(`Du00e9marrage de la synchronisation de la facture ${id}...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoice = await DolibarrService.getInvoiceById(id);
      
      // 2. Synchroniser avec Firestore
      let result;
      if (includeDetails) {
        result = await FirestoreInvoiceService.syncInvoiceWithDetails(invoice, includeDetails);
      } else {
        result = await FirestoreInvoiceService.syncInvoice(invoice);
      }
      
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
   * Synchronise toutes les factures de Dolibarr vers Firestore avec leurs PDFs
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @param {boolean} includePdf - Si true, tu00e9lu00e9charge et stocke les PDFs des factures
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllInvoicesWithPdf: async (includeDetails = true, includePdf = true) => {
    try {
      console.log('Du00e9marrage de la synchronisation des factures avec PDFs...');
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoices = await DolibarrService.getInvoices();
      console.log(`${invoices.length} factures ru00e9cupu00e9ru00e9es depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      const batchSize = 5; // Traiter les factures par lots de 5 (les PDFs peuvent u00eatre volumineux)
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en su00e9quentiel pour u00e9viter de surcharger l'API
        for (const invoice of batch) {
          try {
            await FirestoreInvoiceService.syncInvoiceWithDetailsAndPdf(invoice, includeDetails, includePdf);
            count++;
            console.log(`Facture ${invoice.id} synchronisu00e9e avec succu00e8s (${count}/${invoices.length})`);
          } catch (error) {
            console.error(`Erreur lors de la synchronisation de la facture ${invoice.id}:`, error);
          }
        }
      }
      
      return {
        success: true,
        message: `${count} factures synchronisu00e9es avec succu00e8s`,
        count
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des factures avec PDFs:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Synchronise une facture spu00e9cifique de Dolibarr vers Firestore avec son PDF
   * @param {string} id - ID de la facture u00e0 synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations suppu00e9mentaires
   * @param {boolean} includePdf - Si true, tu00e9lu00e9charge et stocke le PDF de la facture
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncInvoiceWithPdf: async (id, includeDetails = true, includePdf = true) => {
    try {
      console.log(`Du00e9marrage de la synchronisation de la facture ${id} avec PDF...`);
      
      // 1. Ru00e9cupu00e9rer les donnu00e9es depuis Dolibarr
      const invoice = await DolibarrService.getInvoiceById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreInvoiceService.syncInvoiceWithDetailsAndPdf(invoice, includeDetails, includePdf);
      
      return {
        success: true,
        message: `Facture ${id} synchronisu00e9e avec succu00e8s${includePdf ? ' (avec PDF)' : ''}`,
        id: result.id,
        pdf: result.pdf
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la facture ${id} avec PDF:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation de la facture ${id}: ${error.message}`,
        error: error.message
      };
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
