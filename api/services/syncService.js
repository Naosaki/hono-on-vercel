import { DolibarrService } from './dolibarrService.js';
import { FirestoreThirdPartyService } from './firebase/thirdPartyService.js';
import { FirestoreInvoiceService } from './firebase/invoiceService.js';
import { FirestoreProductService } from './firebase/productService.js';
import { FirestoreStorageService } from './firebase/storageService.js';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';

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
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const results = [];
      const batchSize = 5; // Traiter les factures par lots de 5 (les PDFs peuvent u00eatre volumineux)
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en su00e9quentiel pour u00e9viter de surcharger l'API
        for (const invoice of batch) {
          try {
            // Vu00e9rifier si la facture a une ru00e9fu00e9rence valide
            if (!invoice.ref || invoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${invoice.id} n'a pas de ru00e9fu00e9rence valide (${invoice.ref || 'non du00e9finie'}), impossible de ru00e9cupu00e9rer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: invoice.id,
                ref: invoice.ref || 'non du00e9finie',
                error: 'Ru00e9fu00e9rence manquante ou provisoire'
              });
              
              // Synchroniser quand mu00eame la facture sans PDF
              await FirestoreInvoiceService.syncInvoiceWithDetails(invoice, includeDetails);
              
              continue;
            }
            
            // Synchroniser la facture avec son PDF
            const result = await FirestoreInvoiceService.syncInvoiceWithDetailsAndPdf(invoice, includeDetails, includePdf);
            count++;
            
            if (result.pdf && result.pdf.success) {
              successCount++;
              results.push({
                id: invoice.id,
                ref: invoice.ref,
                success: true,
                url: result.pdf.url
              });
              console.log(`Facture ${invoice.id} (${invoice.ref}) synchronisu00e9e avec succu00e8s (${count}/${invoices.length})`);
            } else {
              errorCount++;
              const errorMessage = result.pdf ? result.pdf.error : 'Erreur inconnue';
              errors.push({
                id: invoice.id,
                ref: invoice.ref,
                error: errorMessage
              });
              console.warn(`Erreur lors de la synchronisation du PDF de la facture ${invoice.id} (${invoice.ref}): ${errorMessage}`);
            }
          } catch (error) {
            console.error(`Erreur lors de la synchronisation de la facture ${invoice.id}:`, error.message);
            count++;
            errorCount++;
            errors.push({
              id: invoice.id,
              ref: invoice.ref || `Facture ${invoice.id}`,
              error: error.message
            });
          }
        }
      }
      
      return {
        success: true,
        message: `${successCount} factures synchronisu00e9es avec succu00e8s, ${errorCount} u00e9checs`,
        totalCount: invoices.length,
        successCount,
        errorCount,
        results,
        errors: errors.length > 0 ? errors : undefined
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
  },
  
  /**
   * Synchronise toutes les factures de Firestore avec leurs PDFs depuis Dolibarr
   * @param {boolean} updateDetails - Si true, met u00e0 jour les du00e9tails des factures depuis Dolibarr
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllInvoicePdfsFromFirestore: async (updateDetails = true) => {
    try {
      console.log('Du00e9marrage de la synchronisation des PDFs des factures depuis Firestore...');
      
      // 1. Ru00e9cupu00e9rer toutes les factures depuis Firestore
      const db = getFirestore();
      const invoicesSnapshot = await db.collection('invoices').get();
      
      if (invoicesSnapshot.empty) {
        return {
          success: false,
          message: 'Aucune facture trouvu00e9e dans Firestore',
        };
      }
      
      const invoices = [];
      invoicesSnapshot.forEach(doc => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`${invoices.length} factures ru00e9cupu00e9ru00e9es depuis Firestore`);
      
      // 2. Synchroniser avec Firebase Storage
      let count = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const results = [];
      const batchSize = 5; // Traiter les factures par lots de 5 (les PDFs peuvent u00eatre volumineux)
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en su00e9quentiel pour u00e9viter de surcharger l'API
        for (const invoice of batch) {
          try {
            // Si updateDetails est true, ru00e9cupu00e9rer les du00e9tails de la facture depuis Dolibarr
            let updatedInvoice = invoice;
            let dolibarrInvoice = null;
            
            if (updateDetails) {
              try {
                console.log(`Ru00e9cupu00e9ration des du00e9tails de la facture ${invoice.id} depuis Dolibarr...`);
                dolibarrInvoice = await DolibarrService.getInvoiceById(invoice.id);
                
                // Mettre u00e0 jour les du00e9tails de la facture dans Firestore
                if (dolibarrInvoice && dolibarrInvoice.id) {
                  const invoiceRef = db.collection('invoices').doc(invoice.id.toString());
                  
                  // Filtrer les valeurs undefined
                  const filteredInvoice = {};
                  for (const [key, value] of Object.entries(dolibarrInvoice)) {
                    if (value !== undefined) {
                      filteredInvoice[key] = value;
                    }
                  }
                  
                  // Ajouter un champ lastSyncedAt
                  filteredInvoice.lastSyncedAt = Date.now();
                  
                  await invoiceRef.update(filteredInvoice);
                  console.log(`Du00e9tails de la facture ${invoice.id} mis u00e0 jour dans Firestore`);
                  
                  // Utiliser les du00e9tails mis u00e0 jour pour la suite
                  updatedInvoice = {
                    ...invoice,
                    ...filteredInvoice
                  };
                }
              } catch (detailsError) {
                console.warn(`Erreur lors de la ru00e9cupu00e9ration des du00e9tails de la facture ${invoice.id}:`, detailsError.message);
                // Continuer avec les donnu00e9es existantes
              }
            }
            
            // Vu00e9rifier si la facture a une ru00e9fu00e9rence valide
            if (!updatedInvoice.ref || updatedInvoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${updatedInvoice.id} n'a pas de ru00e9fu00e9rence valide (${updatedInvoice.ref || 'non du00e9finie'}), impossible de ru00e9cupu00e9rer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref || 'non du00e9finie',
                error: 'Ru00e9fu00e9rence manquante ou provisoire'
              });
              
              // Synchroniser quand mu00eame la facture sans PDF
              await FirestoreInvoiceService.syncInvoiceWithDetails(updatedInvoice, includeDetails);
              
              continue;
            }
            
            // Ru00e9cupu00e9rer le PDF de la facture en utilisant la ru00e9fu00e9rence
            console.log(`Ru00e9cupu00e9ration du PDF pour la facture ${updatedInvoice.id} avec la ru00e9fu00e9rence ${updatedInvoice.ref}...`);
            
            // Construire les paramu00e8tres pour la requ00eate
            const url = `${process.env.DOLIBARR_API_URL}/documents/download`;
            const params = {
              modulepart: 'invoice',
              original_file: `${updatedInvoice.ref}/${updatedInvoice.ref}.pdf`
            };
            
            console.log(`URL: ${url}?modulepart=${params.modulepart}&original_file=${encodeURIComponent(params.original_file)}`);
            
            const response = await axios({
              method: 'GET',
              url: url,
              params: params,
              headers: {
                'Accept': 'application/json',
                'DOLAPIKEY': process.env.DOLIBARR_API_KEY
              },
              responseType: 'arraybuffer' // Important pour ru00e9cupu00e9rer les donnu00e9es binaires
            });
            
            // Stocker le PDF dans Firebase Storage
            const pdfData = response.data;
            const pdfResult = await FirestoreStorageService.uploadInvoicePdf(updatedInvoice.id, pdfData);
            
            // Mettre u00e0 jour la facture dans Firestore avec l'URL du PDF
            if (pdfResult.success) {
              const invoiceRef = db.collection('invoices').doc(updatedInvoice.id.toString());
              
              await invoiceRef.update({
                pdfUrl: pdfResult.url,
                pdfPath: pdfResult.path,
                pdfSize: pdfResult.size,
                lastPdfSyncedAt: Date.now()
              });
              
              successCount++;
              results.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref,
                ref_client: updatedInvoice.ref_client || null,
                success: true,
                url: pdfResult.url,
                detailsUpdated: updateDetails
              });
              console.log(`PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref}) synchronisu00e9 avec succu00e8s (${count + 1}/${invoices.length})`);
            } else {
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref,
                error: 'Erreur lors du stockage du PDF'
              });
              console.warn(`Erreur lors du stockage du PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref})`);
            }
            
            count++;
          } catch (error) {
            console.error(`Erreur lors de la synchronisation du PDF de la facture ${invoice.id}:`, error.message);
            count++;
            errorCount++;
            errors.push({
              id: invoice.id,
              ref: invoice.ref || `Facture ${invoice.id}`,
              error: error.message
            });
          }
        }
      }
      
      return {
        success: true,
        message: `${successCount} PDFs de factures synchronisu00e9s avec succu00e8s, ${errorCount} u00e9checs`,
        totalCount: invoices.length,
        successCount,
        errorCount,
        detailsUpdated: updateDetails,
        results,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des PDFs des factures depuis Firestore:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Synchronise toutes les factures de Firestore avec leurs PDFs depuis le serveur FTP
   * @param {boolean} updateDetails - Si true, met u00e0 jour les du00e9tails des factures depuis Dolibarr
   * @returns {Promise} - Promesse contenant le ru00e9sultat de l'opu00e9ration
   */
  syncAllInvoicePdfsFromFtp: async (updateDetails = true) => {
    try {
      console.log('Du00e9marrage de la synchronisation des PDFs des factures depuis FTP...');
      
      // 1. Ru00e9cupu00e9rer toutes les factures depuis Firestore
      const db = getFirestore();
      const invoicesSnapshot = await db.collection('invoices').get();
      
      if (invoicesSnapshot.empty) {
        return {
          success: false,
          message: 'Aucune facture trouvu00e9e dans Firestore',
        };
      }
      
      const invoices = [];
      invoicesSnapshot.forEach(doc => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`${invoices.length} factures ru00e9cupu00e9ru00e9es depuis Firestore`);
      
      // 2. Synchroniser avec Firebase Storage
      let count = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const results = [];
      const batchSize = 5; // Traiter les factures par lots de 5
      
      // Importer le service FTP
      const FtpService = (await import('./ftpService.js')).default;
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en su00e9quentiel pour u00e9viter de surcharger le serveur FTP
        for (const invoice of batch) {
          try {
            // Si updateDetails est true, ru00e9cupu00e9rer les du00e9tails de la facture depuis Dolibarr
            let updatedInvoice = invoice;
            let dolibarrInvoice = null;
            
            if (updateDetails) {
              try {
                console.log(`Ru00e9cupu00e9ration des du00e9tails de la facture ${invoice.id} depuis Dolibarr...`);
                dolibarrInvoice = await DolibarrService.getInvoiceById(invoice.id);
                
                // Mettre u00e0 jour les du00e9tails de la facture dans Firestore
                if (dolibarrInvoice && dolibarrInvoice.id) {
                  const invoiceRef = db.collection('invoices').doc(invoice.id.toString());
                  
                  // Filtrer les valeurs undefined
                  const filteredInvoice = {};
                  for (const [key, value] of Object.entries(dolibarrInvoice)) {
                    if (value !== undefined) {
                      filteredInvoice[key] = value;
                    }
                  }
                  
                  // Ajouter un champ lastSyncedAt
                  filteredInvoice.lastSyncedAt = Date.now();
                  
                  await invoiceRef.update(filteredInvoice);
                  console.log(`Du00e9tails de la facture ${invoice.id} mis u00e0 jour dans Firestore`);
                  
                  // Utiliser les du00e9tails mis u00e0 jour pour la suite
                  updatedInvoice = {
                    ...invoice,
                    ...filteredInvoice
                  };
                }
              } catch (detailsError) {
                console.warn(`Erreur lors de la ru00e9cupu00e9ration des du00e9tails de la facture ${invoice.id}:`, detailsError.message);
                // Continuer avec les donnu00e9es existantes
              }
            }
            
            // Vu00e9rifier si la facture a une ru00e9fu00e9rence valide
            if (!updatedInvoice.ref || updatedInvoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${updatedInvoice.id} n'a pas de ru00e9fu00e9rence valide (${updatedInvoice.ref || 'non du00e9finie'}), impossible de ru00e9cupu00e9rer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref || 'non du00e9finie',
                error: 'Ru00e9fu00e9rence manquante ou provisoire'
              });
              continue;
            }
            
            // Ru00e9cupu00e9rer le PDF de la facture depuis FTP en utilisant la ru00e9fu00e9rence
            console.log(`Ru00e9cupu00e9ration du PDF pour la facture ${updatedInvoice.id} avec la ru00e9fu00e9rence ${updatedInvoice.ref} depuis FTP...`);
            
            try {
              // Vu00e9rifier d'abord si le PDF existe sur le serveur FTP
              const pdfExists = await FtpService.checkInvoicePdfExists(updatedInvoice.ref);
              
              if (!pdfExists) {
                console.warn(`Le PDF de la facture ${updatedInvoice.ref} n'existe pas sur le serveur FTP`);
                count++;
                errorCount++;
                errors.push({
                  id: updatedInvoice.id,
                  ref: updatedInvoice.ref,
                  error: 'PDF non trouvu00e9 sur le serveur FTP'
                });
                continue;
              }
              
              // Ru00e9cupu00e9rer le PDF depuis FTP
              const pdfData = await FtpService.getInvoicePdf(updatedInvoice.ref);
              
              // Stocker le PDF dans Firebase Storage
              const pdfResult = await FirestoreStorageService.uploadInvoicePdf(updatedInvoice.id, pdfData);
              
              // Mettre u00e0 jour la facture dans Firestore avec l'URL du PDF
              if (pdfResult.success) {
                const invoiceRef = db.collection('invoices').doc(updatedInvoice.id.toString());
                
                await invoiceRef.update({
                  pdfUrl: pdfResult.url,
                  pdfPath: pdfResult.path,
                  pdfSize: pdfResult.size,
                  lastPdfSyncedAt: Date.now()
                });
                
                successCount++;
                results.push({
                  id: updatedInvoice.id,
                  ref: updatedInvoice.ref,
                  ref_client: updatedInvoice.ref_client || null,
                  success: true,
                  url: pdfResult.url,
                  detailsUpdated: updateDetails
                });
                console.log(`PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref}) synchronisu00e9 avec succu00e8s (${count + 1}/${invoices.length})`);
              } else {
                errorCount++;
                errors.push({
                  id: updatedInvoice.id,
                  ref: updatedInvoice.ref,
                  error: 'Erreur lors du stockage du PDF'
                });
                console.warn(`Erreur lors du stockage du PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref})`);
              }
            } catch (ftpError) {
              console.error(`Erreur lors de la ru00e9cupu00e9ration du PDF de la facture ${updatedInvoice.ref} depuis FTP:`, ftpError.message);
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref,
                error: `Erreur FTP: ${ftpError.message}`
              });
            }
            
            count++;
          } catch (error) {
            console.error(`Erreur lors de la synchronisation du PDF de la facture ${invoice.id}:`, error.message);
            count++;
            errorCount++;
            errors.push({
              id: invoice.id,
              ref: invoice.ref || `Facture ${invoice.id}`,
              error: error.message
            });
          }
        }
      }
      
      return {
        success: true,
        message: `${successCount} PDFs de factures synchronisu00e9s avec succu00e8s, ${errorCount} u00e9checs`,
        totalCount: invoices.length,
        successCount,
        errorCount,
        detailsUpdated: updateDetails,
        results,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des PDFs des factures depuis FTP:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
};

export default SyncService;
