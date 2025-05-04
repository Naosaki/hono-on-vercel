import { DolibarrService } from './dolibarrService.js';
import { FirestoreThirdPartyService } from './firebase/thirdPartyService.js';
import { FirestoreInvoiceService } from './firebase/invoiceService.js';
import { FirestoreProductService } from './firebase/productService.js';
import { FirestoreStorageService } from './firebase/storageService.js';
import axios from 'axios';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Service pour synchroniser les données entre Dolibarr et Firestore
 */
export const SyncService = {
  /**
   * Synchronise tous les tiers (clients/prospects) de Dolibarr vers Firestore
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllThirdParties: async (includeDetails = true) => {
    try {
      console.log('Démarrage de la synchronisation des tiers...');
      
      // 1. Récupérer les données depuis Dolibarr
      // Utiliser la méthode améliorée qui gère la pagination
      const thirdParties = await DolibarrService.getThirdParties();
      console.log(`${thirdParties.length} tiers récupérés depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      const batchSize = 20; // Augmenter la taille du lot pour plus d'efficacité
      const totalBatches = Math.ceil(thirdParties.length / batchSize);
      
      for (let i = 0; i < thirdParties.length; i += batchSize) {
        const batch = thirdParties.slice(i, i + batchSize);
        console.log(`Traitement du lot ${Math.floor(i / batchSize) + 1}/${totalBatches} (${batch.length} tiers)...`);
        
        // Traiter les tiers en parallèle
        const promises = batch.map(thirdParty => {
          if (includeDetails) {
            return FirestoreThirdPartyService.syncThirdPartyWithDetails(thirdParty, includeDetails);
          } else {
            return FirestoreThirdPartyService.syncThirdParty(thirdParty);
          }
        });
        
        const results = await Promise.all(promises);
        count += results.filter(result => result.success).length;
        
        // Ajouter un petit délai entre les lots pour éviter de surcharger l'API
        if (i + batchSize < thirdParties.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      return {
        success: true,
        message: `${count} tiers synchronisés avec succès sur ${thirdParties.length} récupérés`,
        count,
        total: thirdParties.length
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
   * Synchronise un tiers spécifique de Dolibarr vers Firestore
   * @param {string} id - ID du tiers à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncThirdParty: async (id, includeDetails = true) => {
    try {
      console.log(`Démarrage de la synchronisation du tiers ${id}...`);
      
      // 1. Récupérer les données depuis Dolibarr
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
        message: `Tiers ${id} synchronisé avec succès`,
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
   * Compare les données entre Dolibarr et Firestore pour un tiers spécifique
   * @param {string} id - ID du tiers à comparer
   * @returns {Promise} - Promesse contenant le résultat de la comparaison
   */
  compareThirdParty: async (id) => {
    try {
      // Récupérer les données depuis Dolibarr
      const dolibarrData = await DolibarrService.getThirdPartyById(id);
      
      // Récupérer les données depuis Firestore
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
      
      // Comparer les données
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
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllInvoices: async (includeDetails = true) => {
    try {
      console.log('Démarrage de la synchronisation des factures...');
      
      // 1. Récupérer les données depuis Dolibarr
      const invoices = await DolibarrService.getInvoices();
      console.log(`${invoices.length} factures récupérées depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      const batchSize = 10; // Traiter les factures par lots de 10
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en parallèle
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
        message: `${count} factures synchronisées avec succès`,
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
   * Synchronise une facture spécifique de Dolibarr vers Firestore
   * @param {string} id - ID de la facture à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncInvoice: async (id, includeDetails = true) => {
    try {
      console.log(`Démarrage de la synchronisation de la facture ${id}...`);
      
      // 1. Récupérer les données depuis Dolibarr
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
        message: `Facture ${id} synchronisée avec succès`,
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
   * Compare les données entre Dolibarr et Firestore pour une facture spécifique
   * @param {string} id - ID de la facture à comparer
   * @returns {Promise} - Promesse contenant le résultat de la comparaison
   */
  compareInvoice: async (id) => {
    try {
      // Récupérer les données depuis Dolibarr
      const dolibarrData = await DolibarrService.getInvoiceById(id);
      
      // Récupérer les données depuis Firestore
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
      
      // Comparer les données
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
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @param {boolean} includePdf - Si true, télécharge et stocke les PDFs des factures
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllInvoicesWithPdf: async (includeDetails = true, includePdf = true) => {
    try {
      console.log('Démarrage de la synchronisation des factures avec PDFs...');
      
      // 1. Récupérer les données depuis Dolibarr
      const invoices = await DolibarrService.getInvoices();
      console.log(`${invoices.length} factures récupérées depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      let count = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const results = [];
      const batchSize = 5; // Traiter les factures par lots de 5 (les PDFs peuvent être volumineux)
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en séquentiel pour éviter de surcharger l'API
        for (const invoice of batch) {
          try {
            // Vérifier si la facture a une référence valide
            if (!invoice.ref || invoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${invoice.id} n'a pas de référence valide (${invoice.ref || 'non définie'}), impossible de récupérer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: invoice.id,
                ref: invoice.ref || 'non définie',
                error: 'Référence manquante ou provisoire'
              });
              
              // Synchroniser quand même la facture sans PDF
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
              console.log(`Facture ${invoice.id} (${invoice.ref}) synchronisée avec succès (${count}/${invoices.length})`);
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
        message: `${successCount} factures synchronisées avec succès, ${errorCount} échecs`,
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
   * Synchronise une facture spécifique de Dolibarr vers Firestore avec son PDF
   * @param {string} id - ID de la facture à synchroniser
   * @param {boolean} includeDetails - Si true, inclut les informations supplémentaires
   * @param {boolean} includePdf - Si true, télécharge et stocke le PDF de la facture
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncInvoiceWithPdf: async (id, includeDetails = true, includePdf = true) => {
    try {
      console.log(`Démarrage de la synchronisation de la facture ${id} avec PDF...`);
      
      // 1. Récupérer les données depuis Dolibarr
      const invoice = await DolibarrService.getInvoiceById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreInvoiceService.syncInvoiceWithDetailsAndPdf(invoice, includeDetails, includePdf);
      
      return {
        success: true,
        message: `Facture ${id} synchronisée avec succès${includePdf ? ' (avec PDF)' : ''}`,
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
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllProducts: async () => {
    try {
      console.log('Démarrage de la synchronisation des produits...');
      
      // 1. Récupérer les données depuis Dolibarr
      const products = await DolibarrService.getProducts();
      console.log(`${products.length} produits récupérés depuis Dolibarr`);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreProductService.syncAllProducts(products);
      
      return {
        success: true,
        message: `${result.count} produits synchronisés avec succès`,
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
   * Synchronise un produit spécifique de Dolibarr vers Firestore
   * @param {string} id - ID du produit à synchroniser
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncProduct: async (id) => {
    try {
      console.log(`Démarrage de la synchronisation du produit ${id}...`);
      
      // 1. Récupérer les données depuis Dolibarr
      const product = await DolibarrService.getProductById(id);
      
      // 2. Synchroniser avec Firestore
      const result = await FirestoreProductService.syncProduct(product);
      
      return {
        success: true,
        message: `Produit ${id} synchronisé avec succès`,
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
   * Compare les données entre Dolibarr et Firestore pour un produit spécifique
   * @param {string} id - ID du produit à comparer
   * @returns {Promise} - Promesse contenant le résultat de la comparaison
   */
  compareProduct: async (id) => {
    try {
      // Récupérer les données depuis Dolibarr
      const dolibarrData = await DolibarrService.getProductById(id);
      
      // Récupérer les données depuis Firestore
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
      
      // Comparer les données
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
   * @param {boolean} updateDetails - Si true, met à jour les détails des factures depuis Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllInvoicePdfsFromFirestore: async (updateDetails = true) => {
    try {
      console.log('Démarrage de la synchronisation des PDFs des factures depuis Firestore...');
      
      // 1. Récupérer toutes les factures depuis Firestore
      const db = getFirestore();
      const invoicesSnapshot = await db.collection('invoices').get();
      
      if (invoicesSnapshot.empty) {
        return {
          success: false,
          message: 'Aucune facture trouvée dans Firestore',
        };
      }
      
      const invoices = [];
      invoicesSnapshot.forEach(doc => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`${invoices.length} factures récupérées depuis Firestore`);
      
      // 2. Synchroniser avec Firebase Storage
      let count = 0;
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      const results = [];
      const batchSize = 5; // Traiter les factures par lots de 5 (les PDFs peuvent être volumineux)
      
      for (let i = 0; i < invoices.length; i += batchSize) {
        const batch = invoices.slice(i, i + batchSize);
        console.log(`Traitement du lot ${i / batchSize + 1}/${Math.ceil(invoices.length / batchSize)}...`);
        
        // Traiter les factures en séquentiel pour éviter de surcharger l'API
        for (const invoice of batch) {
          try {
            // Si updateDetails est true, récupérer les détails de la facture depuis Dolibarr
            let updatedInvoice = invoice;
            let dolibarrInvoice = null;
            
            if (updateDetails) {
              try {
                console.log(`Récupération des détails de la facture ${invoice.id} depuis Dolibarr...`);
                dolibarrInvoice = await DolibarrService.getInvoiceById(invoice.id);
                
                // Mettre à jour les détails de la facture dans Firestore
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
                  console.log(`Détails de la facture ${invoice.id} mis à jour dans Firestore`);
                  
                  // Utiliser les détails mis à jour pour la suite
                  updatedInvoice = {
                    ...invoice,
                    ...filteredInvoice
                  };
                }
              } catch (detailsError) {
                console.warn(`Erreur lors de la récupération des détails de la facture ${invoice.id}:`, detailsError.message);
                // Continuer avec les données existantes
              }
            }
            
            // Vérifier si la facture a une référence valide
            if (!updatedInvoice.ref || updatedInvoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${updatedInvoice.id} n'a pas de référence valide (${updatedInvoice.ref || 'non définie'}), impossible de récupérer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref || 'non définie',
                error: 'Référence manquante ou provisoire'
              });
              
              // Synchroniser quand même la facture sans PDF
              await FirestoreInvoiceService.syncInvoiceWithDetails(updatedInvoice, includeDetails);
              
              continue;
            }
            
            // Récupérer le PDF de la facture en utilisant la référence
            console.log(`Récupération du PDF pour la facture ${updatedInvoice.id} avec la référence ${updatedInvoice.ref}...`);
            
            // Construire les paramètres pour la requête
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
              responseType: 'arraybuffer' // Important pour récupérer les données binaires
            });
            
            // Stocker le PDF dans Firebase Storage
            const pdfData = response.data;
            const pdfResult = await FirestoreStorageService.uploadInvoicePdf(updatedInvoice.id, pdfData);
            
            // Mettre à jour la facture dans Firestore avec l'URL du PDF
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
              console.log(`PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref}) synchronisé avec succès (${count + 1}/${invoices.length})`);
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
        message: `${successCount} PDFs de factures synchronisés avec succès, ${errorCount} échecs`,
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
   * @param {boolean} updateDetails - Si true, met à jour les détails des factures depuis Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllInvoicePdfsFromFtp: async (updateDetails = true) => {
    try {
      console.log('Démarrage de la synchronisation des PDFs des factures depuis FTP...');
      
      // 1. Récupérer toutes les factures depuis Firestore
      const db = getFirestore();
      const invoicesSnapshot = await db.collection('invoices').get();
      
      if (invoicesSnapshot.empty) {
        return {
          success: false,
          message: 'Aucune facture trouvée dans Firestore',
        };
      }
      
      const invoices = [];
      invoicesSnapshot.forEach(doc => {
        invoices.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`${invoices.length} factures récupérées depuis Firestore`);
      
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
        
        // Traiter les factures en séquentiel pour éviter de surcharger le serveur FTP
        for (const invoice of batch) {
          try {
            // Si updateDetails est true, récupérer les détails de la facture depuis Dolibarr
            let updatedInvoice = invoice;
            let dolibarrInvoice = null;
            
            if (updateDetails) {
              try {
                console.log(`Récupération des détails de la facture ${invoice.id} depuis Dolibarr...`);
                dolibarrInvoice = await DolibarrService.getInvoiceById(invoice.id);
                
                // Mettre à jour les détails de la facture dans Firestore
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
                  console.log(`Détails de la facture ${invoice.id} mis à jour dans Firestore`);
                  
                  // Utiliser les détails mis à jour pour la suite
                  updatedInvoice = {
                    ...invoice,
                    ...filteredInvoice
                  };
                }
              } catch (detailsError) {
                console.warn(`Erreur lors de la récupération des détails de la facture ${invoice.id}:`, detailsError.message);
                // Continuer avec les données existantes
              }
            }
            
            // Vérifier si la facture a une référence valide
            if (!updatedInvoice.ref || updatedInvoice.ref.includes('(PROV)')) {
              console.warn(`La facture ${updatedInvoice.id} n'a pas de référence valide (${updatedInvoice.ref || 'non définie'}), impossible de récupérer son PDF`);
              count++;
              errorCount++;
              errors.push({
                id: updatedInvoice.id,
                ref: updatedInvoice.ref || 'non définie',
                error: 'Référence manquante ou provisoire'
              });
              continue;
            }
            
            // Récupérer le PDF de la facture depuis FTP en utilisant la référence
            console.log(`Récupération du PDF pour la facture ${updatedInvoice.id} avec la référence ${updatedInvoice.ref} depuis FTP...`);
            
            try {
              // Vérifier d'abord si le PDF existe sur le serveur FTP
              const pdfExists = await FtpService.checkInvoicePdfExists(updatedInvoice.ref);
              
              if (!pdfExists) {
                console.warn(`Le PDF de la facture ${updatedInvoice.ref} n'existe pas sur le serveur FTP`);
                count++;
                errorCount++;
                errors.push({
                  id: updatedInvoice.id,
                  ref: updatedInvoice.ref,
                  error: 'PDF non trouvé sur le serveur FTP'
                });
                continue;
              }
              
              // Récupérer le PDF depuis FTP
              const pdfData = await FtpService.getInvoicePdf(updatedInvoice.ref);
              
              // Stocker le PDF dans Firebase Storage
              const pdfResult = await FirestoreStorageService.uploadInvoicePdf(updatedInvoice.id, pdfData);
              
              // Mettre à jour la facture dans Firestore avec l'URL du PDF
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
                console.log(`PDF de la facture ${updatedInvoice.id} (${updatedInvoice.ref}) synchronisé avec succès (${count + 1}/${invoices.length})`);
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
              console.error(`Erreur lors de la récupération du PDF de la facture ${updatedInvoice.ref} depuis FTP:`, ftpError.message);
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
        message: `${successCount} PDFs de factures synchronisés avec succès, ${errorCount} échecs`,
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
