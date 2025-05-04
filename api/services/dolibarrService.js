import axios from 'axios';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const DOLIBARR_API_URL = process.env.DOLIBARR_API_URL;
const DOLIBARR_API_KEY = process.env.DOLIBARR_API_KEY;

// Configuration de base pour axios
const dolibarrAPI = axios.create({
  baseURL: DOLIBARR_API_URL,
  headers: {
    'DOLAPIKEY': DOLIBARR_API_KEY,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * Service pour interagir avec l'API Dolibarr
 */
export const DolibarrService = {
  /**
   * Récupérer la liste des tiers (clients/prospects)
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise} - Promesse contenant les résultats
   */
  getThirdParties: async (params = {}) => {
    try {
      // Utiliser une limite plus élevée pour récupérer tous les tiers en une seule requête
      const queryParams = { 
        ...params,
        limit: params.limit || 500,  // Limite par défaut à 500
        sortfield: params.sortfield || 't.rowid',
        sortorder: params.sortorder || 'ASC'
      };
      
      console.log(`Récupération des tiers avec limit=${queryParams.limit}`);
      const response = await dolibarrAPI.get('/thirdparties', { params: queryParams });
      const thirdParties = response.data;
      
      console.log(`Total de ${thirdParties.length} tiers récupérés depuis Dolibarr`);
      return thirdParties;
    } catch (error) {
      console.error('Erreur lors de la récupération des tiers:', error);
      throw error;
    }
  },

  /**
   * Récupérer les détails d'un tiers par son ID
   * @param {number} id - ID du tiers
   * @returns {Promise} - Promesse contenant les résultats
   */
  getThirdPartyById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les comptes bancaires d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Array>} - Liste des comptes bancaires
   */
  getThirdPartyBankAccounts: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/bankaccounts`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des comptes bancaires du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les catégories client d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Array>} - Liste des catégories client
   */
  getThirdPartyCustomerCategories: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/categories`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories client du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les catégories fournisseur d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Array>} - Liste des catégories fournisseur
   */
  getThirdPartySupplierCategories: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/supplier_categories`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des catégories fournisseur du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les factures impayées d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Object>} - Informations sur les factures impayées
   */
  getThirdPartyOutstandingInvoices: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/outstandinginvoices`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des factures impayées du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les commandes impayées d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Object>} - Informations sur les commandes impayées
   */
  getThirdPartyOutstandingOrders: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/outstandingorders`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des commandes impayées du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les propositions commerciales impayées d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Object>} - Informations sur les propositions impayées
   */
  getThirdPartyOutstandingProposals: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/outstandingproposals`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des propositions impayées du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les représentants d'un tiers
   * @param {string} id - ID du tiers
   * @returns {Promise<Array>} - Liste des représentants
   */
  getThirdPartyRepresentatives: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${id}/representatives`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des représentants du tiers ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un tiers par son adresse email
   * @param {string} email - Adresse email du tiers
   * @returns {Promise<Object>} - Données du tiers
   */
  getThirdPartyByEmail: async (email) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tiers avec l'email ${email}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un tiers par son code-barres
   * @param {string} barcode - Code-barres du tiers
   * @returns {Promise<Object>} - Données du tiers
   */
  getThirdPartyByBarcode: async (barcode) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du tiers avec le code-barres ${barcode}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer la liste des factures
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise} - Promesse contenant les résultats
   */
  getInvoices: async (params = {}) => {
    try {
      const response = await dolibarrAPI.get('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      throw error;
    }
  },

  /**
   * Récupérer les détails d'une facture par son ID
   * @param {number} id - ID de la facture
   * @returns {Promise} - Promesse contenant les résultats
   */
  getInvoiceById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les lignes d'une facture
   * @param {string} id - ID de la facture
   * @returns {Promise<Array>} - Liste des lignes de la facture
   */
  getInvoiceLines: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/${id}/lines`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des lignes de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les remises d'une facture
   * @param {string} id - ID de la facture
   * @returns {Promise<Array>} - Liste des remises de la facture
   */
  getInvoiceDiscounts: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/${id}/discount`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des remises de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les paiements d'une facture
   * @param {string} id - ID de la facture
   * @returns {Promise<Array>} - Liste des paiements de la facture
   */
  getInvoicePayments: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/${id}/payments`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des paiements de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer une facture par sa référence
   * @param {string} ref - Référence de la facture
   * @returns {Promise<Object>} - Données de la facture
   */
  getInvoiceByRef: async (ref) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/ref/${ref}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture avec la référence ${ref}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer une facture par sa référence externe
   * @param {string} refExt - Référence externe de la facture
   * @returns {Promise<Object>} - Données de la facture
   */
  getInvoiceByRefExt: async (refExt) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/ref_ext/${refExt}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la facture avec la référence externe ${refExt}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un modèle de facture
   * @param {string} id - ID du modèle de facture
   * @returns {Promise<Object>} - Données du modèle de facture
   */
  getInvoiceTemplate: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/invoices/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du modèle de facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer le PDF d'une facture spécifique depuis Dolibarr
   * @param {string} id - ID de la facture dont on veut récupérer le PDF
   * @returns {Promise<Buffer>} - Données binaires du PDF
   */
  getInvoicePdf: async (id) => {
    try {
      // D'abord, récupérer les détails de la facture pour obtenir la référence
      const invoice = await DolibarrService.getInvoiceById(id);
      
      // Vérifier si la facture existe
      if (!invoice || !invoice.id) {
        throw new Error(`Facture avec l'ID ${id} non trouvée`);
      }
      
      // Déterminer la référence de la facture
      let invoiceRef = '';
      
      // Si la référence existe et n'est pas une référence provisoire
      if (invoice.ref && !invoice.ref.includes('(PROV')) {
        invoiceRef = invoice.ref;
      } else {
        // Pour les factures provisoires ou sans référence, utiliser un format standard
        const prefix = 'FA';
        // Ajouter des zéros pour avoir un format cohérent (ex: FA2504-0001)
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear().toString().substr(2);
        const paddedId = id.toString().padStart(4, '0');
        invoiceRef = `${prefix}${year}${month.toString().padStart(2, '0')}-${paddedId}`;
      }
      
      console.log(`Récupération du PDF pour la facture ${id} (ref: ${invoiceRef})`);
      
      // Utiliser l'endpoint officiel de l'API pour télécharger des documents
      // en se basant sur la requête curl qui fonctionne
      const url = `${DOLIBARR_API_URL}/documents/download`;
      const params = {
        modulepart: 'invoice',
        original_file: `${invoiceRef}/${invoiceRef}.pdf`
      };
      
      console.log(`URL: ${url}?modulepart=${params.modulepart}&original_file=${encodeURIComponent(params.original_file)}`);
      
      // Essayer d'abord avec Accept: application/pdf pour obtenir directement le PDF binaire
      try {
        const response = await axios({
          method: 'GET',
          url: url,
          params: params,
          headers: {
            'Accept': 'application/pdf',
            'DOLAPIKEY': DOLIBARR_API_KEY
          },
          responseType: 'arraybuffer' // Important pour récupérer les données binaires
        });
        
        // Vérifier si nous avons bien reçu un PDF (vérifier le Content-Type)
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/pdf')) {
          console.log(`PDF récupéré avec succès pour la facture ${id}, taille: ${response.data.length} octets`);
          return response.data; // Retourner directement les données binaires
        } else {
          console.warn(`Réponse reçue mais pas au format PDF (${contentType}), essai avec Accept: application/json...`);
          // Continuer avec la méthode alternative ci-dessous
        }
      } catch (pdfError) {
        console.warn(`Erreur lors de la récupération directe du PDF: ${pdfError.message}, essai avec Accept: application/json...`);
        // Continuer avec la méthode alternative ci-dessous
      }
      
      // Méthode alternative: demander le PDF en JSON (base64) puis le convertir
      const response = await axios({
        method: 'GET',
        url: url,
        params: params,
        headers: {
          'Accept': 'application/json',
          'DOLAPIKEY': DOLIBARR_API_KEY
        },
        responseType: 'arraybuffer' // Important pour récupérer les données binaires
      });
      
      // Vérifier si la réponse est en JSON ou directement en binaire
      let pdfData = response.data;
      const contentType = response.headers['content-type'];
      
      if (contentType && contentType.includes('application/json')) {
        // Si c'est du JSON, essayer de l'interpréter et d'extraire les données binaires
        try {
          // Convertir ArrayBuffer en chaîne pour pouvoir parser le JSON
          const jsonStr = Buffer.from(response.data).toString('utf-8');
          const jsonData = JSON.parse(jsonStr);
          
          // Si le JSON contient des données en base64, les convertir en Buffer
          if (jsonData && jsonData.content) {
            pdfData = Buffer.from(jsonData.content, 'base64');
            console.log(`PDF extrait du JSON pour la facture ${id}, taille: ${pdfData.length} octets`);
          } else {
            throw new Error('Format JSON inattendu, pas de champ content');
          }
        } catch (jsonError) {
          console.error(`Erreur lors du parsing JSON: ${jsonError.message}`);
          // Continuer avec les données binaires brutes
        }
      } else if (contentType && contentType.includes('application/pdf')) {
        // Si c'est directement un PDF, utiliser les données telles quelles
        console.log(`PDF récupéré directement pour la facture ${id}, taille: ${pdfData.length} octets`);
      } else {
        console.warn(`Type de contenu inattendu: ${contentType}, tentative de traitement comme PDF binaire`);
      }
      
      return pdfData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du PDF de la facture ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer la liste des produits/services
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise} - Promesse contenant les résultats
   */
  getProducts: async (params = {}) => {
    try {
      const response = await dolibarrAPI.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau tiers
   * @param {Object} thirdPartyData - Données du tiers à créer
   * @returns {Promise} - Promesse contenant le résultat
   */
  createThirdParty: async (thirdPartyData) => {
    try {
      const response = await dolibarrAPI.post('/thirdparties', thirdPartyData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du tiers:', error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle facture
   * @param {Object} invoiceData - Données de la facture à créer
   * @returns {Promise} - Promesse contenant le résultat
   */
  createInvoice: async (invoiceData) => {
    try {
      const response = await dolibarrAPI.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      throw error;
    }
  },

  /**
   * Fonction utilitaire pour effectuer des appels API avec retry
   * @param {Function} apiCall - Fonction qui effectue l'appel API
   * @param {number} maxRetries - Nombre maximum de tentatives
   * @param {number} initialDelay - Délai initial entre les tentatives (en ms)
   * @param {Function} onRetry - Fonction appelée à chaque nouvelle tentative
   * @returns {Promise} - Résultat de l'appel API
   */
  retryApiCall: async (apiCall, maxRetries = 3, initialDelay = 1000, onRetry = null) => {
    let lastError;
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        
        // Si c'est la dernière tentative, on abandonne
        if (attempt === maxRetries) {
          break;
        }

        // Si l'erreur n'est pas 503 ou 429, on abandonne
        if (error.response && ![503, 429].includes(error.response.status)) {
          break;
        }

        // Calculer le délai avec backoff exponentiel
        delay = initialDelay * Math.pow(2, attempt);
        
        // Ajouter un peu de jitter pour éviter les collisions
        const jitter = Math.random() * 200;
        delay += jitter;

        console.log(`Tentative ${attempt + 1}/${maxRetries} échouée. Nouvelle tentative dans ${Math.round(delay/1000)}s...`);
        
        if (onRetry) {
          onRetry(attempt, delay, error);
        }

        // Attendre avant la prochaine tentative
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  },

  /**
   * Récupérer tous les mouvements de stock
   * @param {Object} options - Options de filtrage (limit, sortfield, sortorder, product_id, warehouse_id, type)
   * @returns {Promise<Array>} - Liste des mouvements de stock
   */
  getStockMovements: async (options = {}) => {
    const queryParams = new URLSearchParams({
      limit: options.limit || 100,
      sortfield: options.sortfield || 'm.rowid',
      sortorder: options.sortorder || 'DESC',
      ...options
    });

    try {
      // Utiliser le mécanisme de retry
      return await DolibarrService.retryApiCall(
        async () => {
          const response = await dolibarrAPI.get('/stockmovements', { params: queryParams });
          return response.data;
        },
        3, // maxRetries
        1000, // initialDelay
        (attempt, delay, error) => {
          console.log(`Erreur ${error.response?.status || 'inconnue'} lors de la récupération des mouvements de stock. Tentative ${attempt + 1}.`);
        }
      );
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock après plusieurs tentatives:', error);
      
      // Si toutes les tentatives échouent, essayer une approche alternative
      if (options.useAlternativeMethod !== false) {
        console.log('Tentative de récupération des mouvements de stock via une méthode alternative...');
        return await DolibarrService.getStockMovementsAlternative(options);
      }
      
      throw error;
    }
  },

  /**
   * Méthode alternative pour récupérer les mouvements de stock
   * Cette méthode récupère les mouvements de stock produit par produit
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} - Liste des mouvements de stock
   */
  getStockMovementsAlternative: async (options = {}) => {
    try {
      // 1. Récupérer tous les produits
      const products = await DolibarrService.getProducts({ limit: 1000 });
      console.log(`Récupération des mouvements de stock pour ${products.length} produits...`);
      
      // 2. Récupérer les mouvements de stock pour chaque produit
      let allStockMovements = [];
      
      for (const product of products) {
        try {
          // Utiliser le mécanisme de retry pour chaque produit
          const productStockMovements = await DolibarrService.retryApiCall(
            async () => {
              const response = await dolibarrAPI.get(`/products/${product.id}/stockmovements`);
              return response.data;
            },
            2, // maxRetries
            500, // initialDelay
            (attempt, delay, error) => {
              console.log(`Erreur lors de la récupération des mouvements de stock pour le produit ${product.id}. Tentative ${attempt + 1}.`);
            }
          );
          
          if (Array.isArray(productStockMovements) && productStockMovements.length > 0) {
            allStockMovements = [...allStockMovements, ...productStockMovements];
          }
        } catch (error) {
          console.warn(`Impossible de récupérer les mouvements de stock pour le produit ${product.id}:`, error.message);
          // Continuer avec le produit suivant
          continue;
        }
      }
      
      // 3. Trier et limiter les résultats selon les options
      allStockMovements.sort((a, b) => {
        const dateA = new Date(a.datem || 0);
        const dateB = new Date(b.datem || 0);
        return options.sortorder === 'ASC' ? dateA - dateB : dateB - dateA;
      });
      
      if (options.limit && allStockMovements.length > options.limit) {
        allStockMovements = allStockMovements.slice(0, options.limit);
      }
      
      return allStockMovements;
    } catch (error) {
      console.error('Erreur lors de la récupération alternative des mouvements de stock:', error);
      throw error;
    }
  },

  /**
   * Récupérer un mouvement de stock par son ID
   * @param {string} id - ID du mouvement de stock
   * @returns {Promise<Object>} - Détails du mouvement de stock
   */
  getStockMovementById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/stockmovements/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du mouvement de stock ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau mouvement de stock
   * @param {Object} stockMovement - Données du mouvement de stock
   * @returns {Promise<Object>} - Résultat de la création
   */
  createStockMovement: async (stockMovement) => {
    try {
      const response = await dolibarrAPI.post('/stockmovements', stockMovement);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du mouvement de stock:', error);
      throw error;
    }
  },

  /**
   * Récupérer les mouvements de stock d'un produit
   * @param {string} productId - ID du produit
   * @returns {Promise<Array>} - Liste des mouvements de stock du produit
   */
  getProductStockMovements: async (productId) => {
    try {
      const response = await dolibarrAPI.get(`/products/${productId}/stockmovements`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des mouvements de stock du produit ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les mouvements de stock d'un entrepôt
   * @param {string} warehouseId - ID de l'entrepôt
   * @returns {Promise<Array>} - Liste des mouvements de stock de l'entrepôt
   */
  getWarehouseStockMovements: async (warehouseId) => {
    try {
      const response = await dolibarrAPI.get(`/warehouses/${warehouseId}/stockmovements`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des mouvements de stock de l'entrepôt ${warehouseId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les entrepôts
   * @returns {Promise<Array>} - Liste des entrepôts
   */
  getWarehouses: async () => {
    try {
      const response = await dolibarrAPI.get('/warehouses');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des entrepôts:', error);
      throw error;
    }
  },

  /**
   * Récupérer un entrepôt par son ID
   * @param {string} id - ID de l'entrepôt
   * @returns {Promise<Object>} - Détails de l'entrepôt
   */
  getWarehouseById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/warehouses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'entrepôt ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer tous les contacts depuis Dolibarr
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Array>} - Liste des contacts
   */
  getContacts: async (params = {}) => {
    try {
      // Utiliser une limite plus élevée pour récupérer tous les contacts en une seule requête
      const defaultParams = { limit: 1000, sortfield: 't.rowid', sortorder: 'ASC' };
      const mergedParams = { ...defaultParams, ...params };
      
      const response = await dolibarrAPI.get('/contacts', { params: mergedParams });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      throw error;
    }
  },

  /**
   * Récupérer un contact par son ID depuis Dolibarr
   * @param {string} id - ID du contact
   * @returns {Promise<Object>} - Données du contact
   */
  getContactById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du contact ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les contacts d'un tiers spécifique depuis Dolibarr
   * @param {string} thirdPartyId - ID du tiers
   * @returns {Promise<Array>} - Liste des contacts du tiers
   */
  getThirdPartyContacts: async (thirdPartyId) => {
    try {
      const response = await dolibarrAPI.get(`/thirdparties/${thirdPartyId}/contacts`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des contacts du tiers ${thirdPartyId}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau contact dans Dolibarr
   * @param {Object} contactData - Données du contact à créer
   * @returns {Promise<Object>} - Résultat de la création
   */
  createContact: async (contactData) => {
    try {
      const response = await dolibarrAPI.post('/contacts', contactData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du contact:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un contact dans Dolibarr
   * @param {string} id - ID du contact à mettre à jour
   * @param {Object} contactData - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateContact: async (id, contactData) => {
    try {
      const response = await dolibarrAPI.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du contact ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un contact dans Dolibarr
   * @param {string} id - ID du contact à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteContact: async (id) => {
    try {
      const response = await dolibarrAPI.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du contact ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer tous les tickets depuis Dolibarr
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Array>} - Liste des tickets
   */
  getTickets: async (params = {}) => {
    try {
      // Utiliser une limite plus élevée pour récupérer tous les tickets en une seule requête
      const defaultParams = { limit: 1000, sortfield: 't.rowid', sortorder: 'ASC' };
      const mergedParams = { ...defaultParams, ...params };
      
      const response = await dolibarrAPI.get('/tickets', { params: mergedParams });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tickets:', error);
      throw error;
    }
  },

  /**
   * Récupérer un ticket par son ID depuis Dolibarr
   * @param {string} id - ID du ticket
   * @returns {Promise<Object>} - Données du ticket
   */
  getTicketById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les messages d'un ticket depuis Dolibarr
   * @param {string} id - ID du ticket
   * @returns {Promise<Array>} - Liste des messages du ticket
   */
  getTicketMessages: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/tickets/${id}/messages`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages du ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les tickets d'un tiers spécifique depuis Dolibarr
   * @param {string} thirdPartyId - ID du tiers
   * @returns {Promise<Array>} - Liste des tickets du tiers
   */
  getThirdPartyTickets: async (thirdPartyId) => {
    try {
      const response = await dolibarrAPI.get(`/tickets`, { params: { fk_soc: thirdPartyId } });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des tickets du tiers ${thirdPartyId}:`, error);
      throw error;
    }
  },

  /**
   * Créer un nouveau ticket dans Dolibarr
   * @param {Object} ticketData - Données du ticket à créer
   * @returns {Promise<Object>} - Résultat de la création
   */
  createTicket: async (ticketData) => {
    try {
      const response = await dolibarrAPI.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un ticket dans Dolibarr
   * @param {string} id - ID du ticket à mettre à jour
   * @param {Object} ticketData - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateTicket: async (id, ticketData) => {
    try {
      const response = await dolibarrAPI.put(`/tickets/${id}`, ticketData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un message à un ticket dans Dolibarr
   * @param {string} id - ID du ticket
   * @param {Object} messageData - Données du message
   * @returns {Promise<Object>} - Résultat de l'ajout du message
   */
  addTicketMessage: async (id, messageData) => {
    try {
      const response = await dolibarrAPI.post(`/tickets/${id}/messages`, messageData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un message au ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un ticket dans Dolibarr
   * @param {string} id - ID du ticket à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteTicket: async (id) => {
    try {
      const response = await dolibarrAPI.delete(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du ticket ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer la liste des propositions commerciales depuis Dolibarr
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Array>} - Liste des propositions commerciales
   */
  getProposals: async (params = {}) => {
    try {
      // Utiliser une limite plus élevée pour récupérer toutes les propositions en une seule requête
      const queryParams = { 
        ...params,
        limit: params.limit || 500,  // Limite par défaut à 500
        sortfield: params.sortfield || 't.rowid',
        sortorder: params.sortorder || 'ASC'
      };
      
      console.log(`Récupération des propositions commerciales avec limit=${queryParams.limit}`);
      const response = await dolibarrAPI.get('/proposals', { params: queryParams });
      const proposals = response.data;
      
      console.log(`Total de ${proposals.length} propositions commerciales récupérées depuis Dolibarr`);
      return proposals;
    } catch (error) {
      console.error('Erreur lors de la récupération des propositions commerciales:', error);
      throw error;
    }
  },

  /**
   * Récupérer une proposition commerciale par son ID depuis Dolibarr
   * @param {string} id - ID de la proposition commerciale
   * @returns {Promise<Object>} - Données de la proposition commerciale
   */
  getProposalById: async (id) => {
    try {
      console.log(`Récupération de la proposition commerciale ${id} depuis Dolibarr`);
      const response = await dolibarrAPI.get(`/proposals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les lignes d'une proposition commerciale depuis Dolibarr
   * @param {string} id - ID de la proposition commerciale
   * @returns {Promise<Array>} - Liste des lignes de la proposition commerciale
   */
  getProposalLines: async (id) => {
    try {
      console.log(`Récupération des lignes de la proposition commerciale ${id} depuis Dolibarr`);
      const response = await dolibarrAPI.get(`/proposals/${id}/lines`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des lignes de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer une proposition commerciale par sa référence depuis Dolibarr
   * @param {string} ref - Référence de la proposition commerciale
   * @returns {Promise<Object>} - Données de la proposition commerciale
   */
  getProposalByRef: async (ref) => {
    try {
      console.log(`Récupération de la proposition commerciale avec la référence ${ref} depuis Dolibarr`);
      const response = await dolibarrAPI.get(`/proposals/ref/${ref}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale avec la référence ${ref}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer une proposition commerciale par sa référence externe depuis Dolibarr
   * @param {string} refExt - Référence externe de la proposition commerciale
   * @returns {Promise<Object>} - Données de la proposition commerciale
   */
  getProposalByRefExt: async (refExt) => {
    try {
      console.log(`Récupération de la proposition commerciale avec la référence externe ${refExt} depuis Dolibarr`);
      const response = await dolibarrAPI.get(`/proposals/ref_ext/${refExt}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale avec la référence externe ${refExt}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer le PDF d'une proposition commerciale depuis Dolibarr
   * @param {string} id - ID de la proposition commerciale
   * @returns {Promise<Buffer>} - Données binaires du PDF
   */
  getProposalPdf: async (id) => {
    try {
      console.log(`Récupération du PDF de la proposition commerciale ${id} depuis Dolibarr`);
      const response = await dolibarrAPI.get(`/proposals/${id}/document`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du PDF de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle proposition commerciale dans Dolibarr
   * @param {Object} proposalData - Données de la proposition commerciale à créer
   * @returns {Promise<Object>} - Résultat de la création
   */
  createProposal: async (proposalData) => {
    try {
      console.log(`Création d'une nouvelle proposition commerciale dans Dolibarr`);
      const response = await dolibarrAPI.post('/proposals', proposalData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création de la proposition commerciale:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour une proposition commerciale dans Dolibarr
   * @param {string} id - ID de la proposition commerciale à mettre à jour
   * @param {Object} proposalData - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateProposal: async (id, proposalData) => {
    try {
      console.log(`Mise à jour de la proposition commerciale ${id} dans Dolibarr`);
      const response = await dolibarrAPI.put(`/proposals/${id}`, proposalData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une proposition commerciale dans Dolibarr
   * @param {string} id - ID de la proposition commerciale à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteProposal: async (id) => {
    try {
      console.log(`Suppression de la proposition commerciale ${id} dans Dolibarr`);
      const response = await dolibarrAPI.delete(`/proposals/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer la liste des utilisateurs depuis Dolibarr
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} - Liste des utilisateurs
   */
  getUsers: async (options = {}) => {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 100,
        page: options.page || 0,
        sortfield: options.sortfield || 'login',
        sortorder: options.sortorder || 'ASC',
        ...options
      });

      const response = await dolibarrAPI.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupérer un utilisateur spécifique depuis Dolibarr
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object>} - Détails de l'utilisateur
   */
  getUserById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les groupes d'un utilisateur spécifique depuis Dolibarr
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Array>} - Liste des groupes de l'utilisateur
   */
  getUserGroups: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/users/${id}/groups`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des groupes de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer tous les groupes d'utilisateurs depuis Dolibarr
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} - Liste des groupes
   */
  getUserGroupsList: async (options = {}) => {
    try {
      const params = new URLSearchParams({
        limit: options.limit || 100,
        page: options.page || 0,
        sortfield: options.sortfield || 'nom',
        sortorder: options.sortorder || 'ASC',
        ...options
      });

      const response = await dolibarrAPI.get('/usergroups', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes d\'utilisateurs:', error);
      throw error;
    }
  },

  /**
   * Récupérer un groupe d'utilisateurs spécifique depuis Dolibarr
   * @param {string} id - ID du groupe
   * @returns {Promise<Object>} - Détails du groupe
   */
  getUserGroupById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/usergroups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du groupe d'utilisateurs ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un utilisateur par son email depuis Dolibarr
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<Object>} - Données de l'utilisateur
   */
  getUserByEmail: async (email) => {
    try {
      const response = await dolibarrAPI.get(`/users/email/${email}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur avec l'email ${email}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer un utilisateur par son login depuis Dolibarr
   * @param {string} login - Login de l'utilisateur
   * @returns {Promise<Object>} - Données de l'utilisateur
   */
  getUserByLogin: async (login) => {
    try {
      const response = await dolibarrAPI.get(`/users/login/${login}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur avec le login ${login}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer des informations supplémentaires sur l'utilisateur actuel depuis Dolibarr
   * @returns {Promise<Object>} - Informations supplémentaires sur l'utilisateur
   */
  getUserInfo: async () => {
    try {
      const response = await dolibarrAPI.get('/users/info');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations supplémentaires de l\'utilisateur:', error);
      throw error;
    }
  },

  /**
   * Créer un nouvel utilisateur dans Dolibarr
   * @param {Object} userData - Données de l'utilisateur à créer
   * @returns {Promise<Object>} - Résultat de la création
   */
  createUser: async (userData) => {
    try {
      const response = await dolibarrAPI.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un utilisateur existant dans Dolibarr
   * @param {string} id - ID de l'utilisateur
   * @param {Object} userData - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateUser: async (id, userData) => {
    try {
      const response = await dolibarrAPI.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un utilisateur dans Dolibarr
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteUser: async (id) => {
    try {
      const response = await dolibarrAPI.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un utilisateur à un groupe dans Dolibarr
   * @param {string} userId - ID de l'utilisateur
   * @param {string} groupId - ID du groupe
   * @returns {Promise<Object>} - Résultat de l'ajout
   */
  addUserToGroup: async (userId, groupId) => {
    try {
      const response = await dolibarrAPI.get(`/users/${userId}/setGroup/${groupId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout de l'utilisateur ${userId} au groupe ${groupId}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour le mot de passe d'un utilisateur dans Dolibarr
   * @param {string} id - ID de l'utilisateur
   * @param {Object} passwordData - Données du mot de passe
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateUserPassword: async (id, passwordData) => {
    try {
      const response = await dolibarrAPI.get(`/users/${id}/setPassword`, { params: passwordData });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du mot de passe de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer tous les comptes bancaires depuis Dolibarr
   * @param {Object} params - Paramètres de filtrage
   * @returns {Promise<Array>} - Liste des comptes bancaires
   */
  getBankAccounts: async (params = {}) => {
    try {
      // Paramètres par défaut pour la pagination et le tri
      const defaultParams = {
        limit: 100,
        sortfield: 't.rowid',
        sortorder: 'ASC'
      };
      
      // Fusionner les paramètres par défaut avec les paramètres fournis
      const queryParams = { ...defaultParams, ...params };
      
      const response = await dolibarrAPI.get('/bankaccounts', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes bancaires:', error);
      throw error;
    }
  },

  /**
   * Récupérer un compte bancaire par son ID depuis Dolibarr
   * @param {string} id - ID du compte bancaire
   * @returns {Promise<Object>} - Détails du compte bancaire
   */
  getBankAccountById: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/bankaccounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer le solde actuel d'un compte bancaire par son ID
   * @param {string} id - ID du compte bancaire
   * @returns {Promise<Object>} - Solde du compte bancaire
   */
  getBankAccountBalance: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/bankaccounts/${id}/balance`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du solde du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les lignes d'un compte bancaire depuis Dolibarr
   * @param {string} id - ID du compte bancaire
   * @returns {Promise<Array>} - Liste des lignes du compte bancaire
   */
  getBankAccountLines: async (id) => {
    try {
      const response = await dolibarrAPI.get(`/bankaccounts/${id}/lines`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des lignes du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les liens d'une ligne de compte bancaire
   * @param {string} accountId - ID du compte bancaire
   * @param {string} lineId - ID de la ligne
   * @returns {Promise<Array>} - Liste des liens de la ligne
   */
  getBankAccountLineLinks: async (accountId, lineId) => {
    try {
      const response = await dolibarrAPI.get(`/bankaccounts/${accountId}/lines/${lineId}/links`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des liens de la ligne ${lineId} du compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Créer un compte bancaire dans Dolibarr
   * @param {Object} bankAccountData - Données du compte bancaire à créer
   * @returns {Promise<Object>} - Résultat de la création
   */
  createBankAccount: async (bankAccountData) => {
    try {
      const response = await dolibarrAPI.post('/bankaccounts', bankAccountData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du compte bancaire:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un compte bancaire dans Dolibarr
   * @param {string} id - ID du compte bancaire à mettre à jour
   * @param {Object} bankAccountData - Données à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateBankAccount: async (id, bankAccountData) => {
    try {
      const response = await dolibarrAPI.put(`/bankaccounts/${id}`, bankAccountData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer un compte bancaire dans Dolibarr
   * @param {string} id - ID du compte bancaire à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteBankAccount: async (id) => {
    try {
      const response = await dolibarrAPI.delete(`/bankaccounts/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter une ligne à un compte bancaire
   * @param {string} accountId - ID du compte bancaire
   * @param {Object} lineData - Données de la ligne à ajouter
   * @returns {Promise<Object>} - Résultat de l'ajout
   */
  addBankAccountLine: async (accountId, lineData) => {
    try {
      const response = await dolibarrAPI.post(`/bankaccounts/${accountId}/lines`, lineData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'une ligne au compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Mettre à jour une ligne de compte bancaire
   * @param {string} accountId - ID du compte bancaire
   * @param {string} lineId - ID de la ligne à mettre à jour
   * @param {Object} lineData - Données de la ligne à mettre à jour
   * @returns {Promise<Object>} - Résultat de la mise à jour
   */
  updateBankAccountLine: async (accountId, lineId, lineData) => {
    try {
      const response = await dolibarrAPI.put(`/bankaccounts/${accountId}/lines/${lineId}`, lineData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la ligne ${lineId} du compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Supprimer une ligne de compte bancaire
   * @param {string} accountId - ID du compte bancaire
   * @param {string} lineId - ID de la ligne à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteBankAccountLine: async (accountId, lineId) => {
    try {
      const response = await dolibarrAPI.delete(`/bankaccounts/${accountId}/lines/${lineId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de la ligne ${lineId} du compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un lien à une ligne de compte bancaire
   * @param {string} accountId - ID du compte bancaire
   * @param {string} lineId - ID de la ligne
   * @param {Object} linkData - Données du lien à ajouter
   * @returns {Promise<Object>} - Résultat de l'ajout
   */
  addBankAccountLineLink: async (accountId, lineId, linkData) => {
    try {
      const response = await dolibarrAPI.post(`/bankaccounts/${accountId}/lines/${lineId}/links`, linkData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'un lien à la ligne ${lineId} du compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  /**
   * Créer un virement interne entre deux comptes bancaires
   * @param {Object} transferData - Données du virement
   * @returns {Promise<Object>} - Résultat du virement
   */
  createBankTransfer: async (transferData) => {
    try {
      const response = await dolibarrAPI.post('/bankaccounts/transfer', transferData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du virement bancaire:', error);
      throw error;
    }
  },
};

export default DolibarrService;
