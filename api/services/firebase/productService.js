import { adminDb } from './adminConfig.js';

/**
 * Fonction utilitaire pour filtrer les valeurs undefined d'un objet
 * @param {Object} obj - Objet à filtrer
 * @returns {Object} - Objet sans valeurs undefined
 */
const filterUndefinedValues = (obj) => {
  const filteredObj = {};
  
  for (const key in obj) {
    if (obj[key] !== undefined) {
      filteredObj[key] = obj[key];
    }
  }
  
  return filteredObj;
};

/**
 * Service pour gérer les produits dans Firestore
 */
export const FirestoreProductService = {
  /**
   * Synchronise un produit de Dolibarr vers Firestore
   * @param {Object} product - Données du produit provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncProduct: async (product) => {
    try {
      // Utiliser l'ID de Dolibarr comme identifiant dans Firestore
      const productRef = adminDb.collection('products').doc(product.id.toString());
      
      // Préparer les données à stocker dans Firestore
      const productData = {
        id: product.id,
        ref: product.ref,
        ref_ext: product.ref_ext,
        type: product.type,  // 0=produit, 1=service
        label: product.label,  // Libellé du produit
        description: product.description,  // Description
        note: product.note,  // Note
        note_private: product.note_private,  // Note privée
        note_public: product.note_public,  // Note publique
        entity: product.entity,  // ID de l'entité
        price: product.price,  // Prix
        price_ttc: product.price_ttc,  // Prix TTC
        price_min: product.price_min,  // Prix minimum
        price_min_ttc: product.price_min_ttc,  // Prix minimum TTC
        tva_tx: product.tva_tx,  // Taux de TVA
        tva_npr: product.tva_npr,  // TVA NPR
        localtax1_tx: product.localtax1_tx,  // Taux de taxe locale 1
        localtax2_tx: product.localtax2_tx,  // Taux de taxe locale 2
        status: product.status,  // Statut
        status_buy: product.status_buy,  // Statut d'achat
        stock_reel: product.stock_reel,  // Stock réel
        stock_theorique: product.stock_theorique,  // Stock théorique
        pmp: product.pmp,  // Prix moyen pondéré
        cost_price: product.cost_price,  // Prix de revient
        weight: product.weight,  // Poids
        weight_units: product.weight_units,  // Unité de poids
        length: product.length,  // Longueur
        length_units: product.length_units,  // Unité de longueur
        width: product.width,  // Largeur
        width_units: product.width_units,  // Unité de largeur
        height: product.height,  // Hauteur
        height_units: product.height_units,  // Unité de hauteur
        surface: product.surface,  // Surface
        surface_units: product.surface_units,  // Unité de surface
        volume: product.volume,  // Volume
        volume_units: product.volume_units,  // Unité de volume
        barcode: product.barcode,  // Code-barres
        barcode_type: product.barcode_type,  // Type de code-barres
        country_id: product.country_id,  // ID du pays
        country_code: product.country_code,  // Code du pays
        customcode: product.customcode,  // Code personnalisé
        fk_unit: product.fk_unit,  // Unité
        url: product.url,  // URL
        accountancy_code_sell: product.accountancy_code_sell,  // Code comptable de vente
        accountancy_code_sell_intra: product.accountancy_code_sell_intra,  // Code comptable de vente intra-communautaire
        accountancy_code_sell_export: product.accountancy_code_sell_export,  // Code comptable de vente export
        accountancy_code_buy: product.accountancy_code_buy,  // Code comptable d'achat
        accountancy_code_buy_intra: product.accountancy_code_buy_intra,  // Code comptable d'achat intra-communautaire
        accountancy_code_buy_export: product.accountancy_code_buy_export,  // Code comptable d'achat export
        date_creation: product.date_creation,  // Date de création
        date_modification: product.date_modification,  // Date de modification
        fk_default_warehouse: product.fk_default_warehouse,  // Entrepôt par défaut
        canvas: product.canvas,  // Canvas
        import_key: product.import_key,  // Clé d'import
        model_pdf: product.model_pdf,  // Modèle PDF
        // Métadonnées
        lastSyncedAt: Date.now(),
        source: 'dolibarr'
      };
      
      // Filtrer les valeurs undefined
      const filteredProductData = filterUndefinedValues(productData);
      
      // Enregistrer dans Firestore
      await productRef.set(filteredProductData, { merge: true });
      console.log(`Produit ${product.id} (${product.ref}) synchronisé avec succès`);
      
      return { success: true, id: product.id };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du produit ${product.id}:`, error);
      throw error;
    }
  },
  
  /**
   * Synchronise tous les produits de Dolibarr vers Firestore
   * @param {Array} products - Liste des produits provenant de Dolibarr
   * @returns {Promise} - Promesse contenant le résultat de l'opération
   */
  syncAllProducts: async (products) => {
    try {
      const batch = adminDb.batch();
      let count = 0;
      let batchCount = 0;
      
      // Traiter chaque produit par lots pour optimiser les performances
      for (const product of products) {
        const productRef = adminDb.collection('products').doc(product.id.toString());
        
        // Préparer les données à stocker
        const productData = {
          id: product.id,
          ref: product.ref,
          ref_ext: product.ref_ext,
          type: product.type,
          label: product.label,
          description: product.description,
          note: product.note,
          note_private: product.note_private,
          note_public: product.note_public,
          entity: product.entity,
          price: product.price,
          price_ttc: product.price_ttc,
          price_min: product.price_min,
          price_min_ttc: product.price_min_ttc,
          tva_tx: product.tva_tx,
          tva_npr: product.tva_npr,
          localtax1_tx: product.localtax1_tx,
          localtax2_tx: product.localtax2_tx,
          status: product.status,
          status_buy: product.status_buy,
          stock_reel: product.stock_reel,
          stock_theorique: product.stock_theorique,
          pmp: product.pmp,
          cost_price: product.cost_price,
          weight: product.weight,
          weight_units: product.weight_units,
          length: product.length,
          length_units: product.length_units,
          width: product.width,
          width_units: product.width_units,
          height: product.height,
          height_units: product.height_units,
          surface: product.surface,
          surface_units: product.surface_units,
          volume: product.volume,
          volume_units: product.volume_units,
          barcode: product.barcode,
          barcode_type: product.barcode_type,
          country_id: product.country_id,
          country_code: product.country_code,
          customcode: product.customcode,
          fk_unit: product.fk_unit,
          url: product.url,
          accountancy_code_sell: product.accountancy_code_sell,
          accountancy_code_sell_intra: product.accountancy_code_sell_intra,
          accountancy_code_sell_export: product.accountancy_code_sell_export,
          accountancy_code_buy: product.accountancy_code_buy,
          accountancy_code_buy_intra: product.accountancy_code_buy_intra,
          accountancy_code_buy_export: product.accountancy_code_buy_export,
          date_creation: product.date_creation,
          date_modification: product.date_modification,
          fk_default_warehouse: product.fk_default_warehouse,
          canvas: product.canvas,
          import_key: product.import_key,
          model_pdf: product.model_pdf,
          // Métadonnées
          lastSyncedAt: Date.now(),
          source: 'dolibarr'
        };
        
        // Filtrer les valeurs undefined
        const filteredProductData = filterUndefinedValues(productData);
        
        batch.set(productRef, filteredProductData, { merge: true });
        count++;
        batchCount++;
        
        // Firestore a une limite de 500 opérations par lot
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`Lot de ${batchCount} produits synchronisés`);
          batch = adminDb.batch();
          batchCount = 0;
        }
      }
      
      // Envoyer le dernier lot s'il reste des opérations
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Dernier lot de ${batchCount} produits synchronisés`);
      }
      
      return { success: true, count: products.length };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des produits:', error);
      throw error;
    }
  },
  
  /**
   * Récupère tous les produits depuis Firestore
   * @returns {Promise} - Promesse contenant les résultats
   */
  getAllProducts: async () => {
    try {
      const snapshot = await adminDb.collection('products').get();
      const products = [];
      
      snapshot.forEach(doc => {
        products.push(doc.data());
      });
      
      return products;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits depuis Firestore:', error);
      throw error;
    }
  },
  
  /**
   * Récupère un produit par son ID depuis Firestore
   * @param {string} id - ID du produit
   * @returns {Promise} - Promesse contenant les résultats
   */
  getProductById: async (id) => {
    try {
      const doc = await adminDb.collection('products').doc(id.toString()).get();
      
      if (!doc.exists) {
        throw new Error(`Produit avec ID ${id} non trouvé dans Firestore`);
      }
      
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id} depuis Firestore:`, error);
      throw error;
    }
  },
  
  /**
   * Recherche des produits par mot-clé dans le libellé ou la référence
   * @param {string} keyword - Mot-clé à rechercher
   * @returns {Promise} - Promesse contenant les résultats
   */
  searchProducts: async (keyword) => {
    try {
      // Firestore ne supporte pas les recherches de texte complètes natives
      // Nous devons donc récupérer tous les produits et filtrer côté client
      const snapshot = await adminDb.collection('products').get();
      const products = [];
      
      const lowerKeyword = keyword.toLowerCase();
      
      snapshot.forEach(doc => {
        const product = doc.data();
        // Recherche dans le libellé et la référence
        if (
          (product.label && product.label.toLowerCase().includes(lowerKeyword)) ||
          (product.ref && product.ref.toLowerCase().includes(lowerKeyword)) ||
          (product.description && product.description.toLowerCase().includes(lowerKeyword))
        ) {
          products.push(product);
        }
      });
      
      return products;
    } catch (error) {
      console.error(`Erreur lors de la recherche de produits avec le mot-clé "${keyword}":`, error);
      throw error;
    }
  }
};

export default FirestoreProductService;
