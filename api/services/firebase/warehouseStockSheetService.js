import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { FtpService } from '../ftpService.js';

const storage = getStorage();
const bucket = storage.bucket();
const db = getFirestore();
const warehousesCollection = db.collection('warehouses');

export const FirestoreWarehouseStockSheetService = {
  /**
   * Récupérer la liste des fiches de stock disponibles dans Firebase Storage
   * @returns {Promise<Array>} - Liste des fiches de stock
   */
  getAllStockSheets: async () => {
    try {
      // Lister tous les fichiers dans le dossier 'stock_sheets'
      const [files] = await bucket.getFiles({
        prefix: 'stock_sheets/'
      });
      
      // Formater les résultats
      const stockSheets = await Promise.all(files.map(async file => {
        const [metadata] = await file.getMetadata();
        const pathParts = file.name.split('/');
        const warehouseFolder = pathParts[1]; // stock_sheets/warehouseFolder/fileName
        const fileName = pathParts[2];
        
        return {
          name: fileName,
          path: file.name,
          warehouse: warehouseFolder,
          contentType: metadata.contentType,
          size: parseInt(metadata.size, 10),
          updated: metadata.updated,
          downloadUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`
        };
      }));
      
      return stockSheets;
    } catch (error) {
      console.error('Erreur lors de la récupération des fiches de stock:', error);
      throw error;
    }
  },

  /**
   * Récupérer les fiches de stock pour un entrepôt spécifique
   * @param {string} warehouseId - ID de l'entrepôt
   * @returns {Promise<Array>} - Liste des fiches de stock pour cet entrepôt
   */
  getStockSheetsByWarehouse: async (warehouseId) => {
    try {
      // Récupérer les informations de l'entrepôt pour obtenir le nom du dossier
      const warehouseDoc = await warehousesCollection.doc(warehouseId).get();
      if (!warehouseDoc.exists) {
        throw new Error(`Entrepôt avec l'ID ${warehouseId} non trouvé dans Firestore`);
      }
      
      const warehouse = warehouseDoc.data();
      const warehouseFolder = warehouse.ref || `warehouse_${warehouseId}`;
      
      // Lister tous les fichiers dans le dossier de l'entrepôt
      const [files] = await bucket.getFiles({
        prefix: `stock_sheets/${warehouseFolder}/`
      });
      
      // Formater les résultats
      const stockSheets = await Promise.all(files.map(async file => {
        const [metadata] = await file.getMetadata();
        const fileName = file.name.split('/').pop();
        
        return {
          name: fileName,
          path: file.name,
          warehouse: warehouseFolder,
          contentType: metadata.contentType,
          size: parseInt(metadata.size, 10),
          updated: metadata.updated,
          downloadUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`
        };
      }));
      
      return stockSheets;
    } catch (error) {
      console.error(`Erreur lors de la récupération des fiches de stock pour l'entrepôt ${warehouseId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer une fiche de stock spécifique
   * @param {string} warehouseId - ID de l'entrepôt
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<Object>} - Informations sur la fiche de stock
   */
  getStockSheet: async (warehouseId, fileName) => {
    try {
      // Récupérer les informations de l'entrepôt pour obtenir le nom du dossier
      const warehouseDoc = await warehousesCollection.doc(warehouseId).get();
      if (!warehouseDoc.exists) {
        throw new Error(`Entrepôt avec l'ID ${warehouseId} non trouvé dans Firestore`);
      }
      
      const warehouse = warehouseDoc.data();
      const warehouseFolder = warehouse.ref || `warehouse_${warehouseId}`;
      
      // Vérifier si le fichier existe
      const filePath = `stock_sheets/${warehouseFolder}/${fileName}`;
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error(`La fiche de stock ${fileName} n'existe pas pour l'entrepôt ${warehouseId}`);
      }
      
      // Récupérer les métadonnées du fichier
      const [metadata] = await file.getMetadata();
      
      return {
        name: fileName,
        path: filePath,
        warehouse: warehouseFolder,
        contentType: metadata.contentType,
        size: parseInt(metadata.size, 10),
        updated: metadata.updated,
        downloadUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la fiche de stock ${fileName} pour l'entrepôt ${warehouseId}:`, error);
      throw error;
    }
  },

  /**
   * Synchroniser les fiches de stock depuis le FTP vers Firebase Storage
   * @param {string} warehouseId - ID de l'entrepôt (optionnel, si non fourni, synchronise tous les entrepôts)
   * @returns {Promise<Object>} - Résultat de la synchronisation
   */
  syncStockSheets: async (warehouseId = null) => {
    try {
      let warehouseFolders = [];
      
      if (warehouseId) {
        // Synchroniser un entrepôt spécifique
        const warehouseDoc = await warehousesCollection.doc(warehouseId).get();
        if (!warehouseDoc.exists) {
          throw new Error(`Entrepôt avec l'ID ${warehouseId} non trouvé dans Firestore`);
        }
        
        const warehouse = warehouseDoc.data();
        const warehouseFolder = warehouse.ref || `warehouse_${warehouseId}`;
        warehouseFolders = [{ id: warehouseId, folder: warehouseFolder }];
      } else {
        // Synchroniser tous les entrepôts
        const warehousesSnapshot = await warehousesCollection.get();
        warehouseFolders = warehousesSnapshot.docs.map(doc => ({
          id: doc.id,
          folder: doc.data().ref || `warehouse_${doc.id}`
        }));
      }
      
      // Récupérer la liste des dossiers d'entrepôts sur le FTP
      const ftpFolders = await FtpService.getWarehouseFolders();
      
      // Résultats de la synchronisation
      const results = {
        success: true,
        totalProcessed: 0,
        totalSynced: 0,
        errors: [],
        warehouses: []
      };
      
      // Pour chaque entrepôt
      for (const warehouse of warehouseFolders) {
        try {
          // Trouver le dossier FTP correspondant
          const ftpFolder = ftpFolders.find(folder => folder.name === warehouse.folder);
          
          if (!ftpFolder) {
            results.errors.push(`Dossier FTP pour l'entrepôt ${warehouse.id} (${warehouse.folder}) non trouvé`);
            continue;
          }
          
          // Récupérer la liste des fiches de stock sur le FTP
          const ftpStockSheets = await FtpService.getWarehouseStockSheets(warehouse.folder);
          
          // Résultats pour cet entrepôt
          const warehouseResult = {
            id: warehouse.id,
            folder: warehouse.folder,
            processed: ftpStockSheets.length,
            synced: 0,
            errors: []
          };
          
          // Pour chaque fiche de stock
          for (const stockSheet of ftpStockSheets) {
            try {
              // Vérifier si la fiche existe déjà dans Firebase Storage
              const filePath = `stock_sheets/${warehouse.folder}/${stockSheet.name}`;
              const file = bucket.file(filePath);
              const [exists] = await file.exists();
              
              // Si la fiche n'existe pas ou si elle est plus récente sur le FTP
              if (!exists || new Date(stockSheet.date) > new Date(file.metadata?.updated || 0)) {
                // Récupérer le contenu de la fiche depuis le FTP
                const fileContent = await FtpService.getWarehouseStockSheet(warehouse.folder, stockSheet.name);
                
                // Enregistrer la fiche dans Firebase Storage
                await file.save(fileContent, {
                  metadata: {
                    contentType: 'application/pdf',
                    metadata: {
                      source: 'ftp',
                      warehouseId: warehouse.id,
                      warehouseFolder: warehouse.folder,
                      originalName: stockSheet.name,
                      originalDate: stockSheet.date ? new Date(stockSheet.date).toISOString() : new Date().toISOString()
                    }
                  }
                });
                
                // Mettre à jour les résultats
                warehouseResult.synced++;
              }
            } catch (error) {
              console.error(`Erreur lors de la synchronisation de la fiche ${stockSheet.name} pour l'entrepôt ${warehouse.id}:`, error);
              warehouseResult.errors.push({
                file: stockSheet.name,
                error: error.message
              });
            }
          }
          
          // Ajouter les résultats de cet entrepôt aux résultats globaux
          results.totalProcessed += warehouseResult.processed;
          results.totalSynced += warehouseResult.synced;
          results.warehouses.push(warehouseResult);
          
          // Mettre à jour l'entrepôt dans Firestore avec la date de dernière synchronisation
          await warehousesCollection.doc(warehouse.id).update({
            lastStockSheetSync: FieldValue.serverTimestamp()
          });
        } catch (error) {
          console.error(`Erreur lors de la synchronisation des fiches de stock pour l'entrepôt ${warehouse.id}:`, error);
          results.errors.push(`Erreur pour l'entrepôt ${warehouse.id}: ${error.message}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des fiches de stock:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Supprimer une fiche de stock
   * @param {string} warehouseId - ID de l'entrepôt
   * @param {string} fileName - Nom du fichier
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteStockSheet: async (warehouseId, fileName) => {
    try {
      // Récupérer les informations de l'entrepôt pour obtenir le nom du dossier
      const warehouseDoc = await warehousesCollection.doc(warehouseId).get();
      if (!warehouseDoc.exists) {
        throw new Error(`Entrepôt avec l'ID ${warehouseId} non trouvé dans Firestore`);
      }
      
      const warehouse = warehouseDoc.data();
      const warehouseFolder = warehouse.ref || `warehouse_${warehouseId}`;
      
      // Vérifier si le fichier existe
      const filePath = `stock_sheets/${warehouseFolder}/${fileName}`;
      const file = bucket.file(filePath);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error(`La fiche de stock ${fileName} n'existe pas pour l'entrepôt ${warehouseId}`);
      }
      
      // Supprimer le fichier
      await file.delete();
      
      return {
        success: true,
        message: `La fiche de stock ${fileName} a été supprimée avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la fiche de stock ${fileName} pour l'entrepôt ${warehouseId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default FirestoreWarehouseStockSheetService;
