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
      const response = await dolibarrAPI.get('/thirdparties', { params });
      return response.data;
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
  }
};

export default DolibarrService;
