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
   * Récupérer tous les mouvements de stock
   * @param {Object} options - Options de filtrage (limit, sortfield, sortorder, product_id, warehouse_id, type)
   * @returns {Promise<Array>} - Liste des mouvements de stock
   */
  getStockMovements: async (options = {}) => {
    try {
      const queryParams = new URLSearchParams({
        limit: options.limit || 100,
        sortfield: options.sortfield || 'm.rowid',
        sortorder: options.sortorder || 'DESC',
        ...options
      });

      const response = await dolibarrAPI.get('/stockmovements', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock:', error);
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
  }
};

export default DolibarrService;
