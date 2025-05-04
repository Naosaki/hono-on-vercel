import { getStorage } from 'firebase-admin/storage';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { FtpService } from '../ftpService.js';

const storage = getStorage();
const db = getFirestore();
const logosCollection = db.collection('company_assets');

export const FirestoreLogoService = {
  /**
   * Synchronise tous les logos depuis le serveur FTP vers Firebase Storage
   * @returns {Promise<Object>} - Résultat de la synchronisation
   */
  syncAllLogos: async () => {
    try {
      console.log('Synchronisation de tous les logos depuis le serveur FTP...');
      
      // Récupérer la liste des logos disponibles sur le serveur FTP
      const logosList = await FtpService.getLogosList();
      
      if (!logosList || logosList.length === 0) {
        return {
          success: false,
          message: 'Aucun logo trouvé sur le serveur FTP'
        };
      }
      
      console.log(`${logosList.length} logos trouvés sur le serveur FTP`);
      
      // Synchroniser chaque logo
      const results = [];
      let successCount = 0;
      let errorCount = 0;
      
      for (const logo of logosList) {
        try {
          // Récupérer le logo depuis le serveur FTP
          const logoData = await FtpService.getLogo(logo.name);
          
          // Stocker le logo dans Firebase Storage
          const bucket = storage.bucket();
          const file = bucket.file(`company_assets/logos/${logo.name}`);
          
          // Déterminer le type MIME en fonction de l'extension du fichier
          let contentType = 'application/octet-stream';
          if (logo.name.toLowerCase().endsWith('.png')) {
            contentType = 'image/png';
          } else if (logo.name.toLowerCase().endsWith('.jpg') || logo.name.toLowerCase().endsWith('.jpeg')) {
            contentType = 'image/jpeg';
          } else if (logo.name.toLowerCase().endsWith('.gif')) {
            contentType = 'image/gif';
          } else if (logo.name.toLowerCase().endsWith('.svg')) {
            contentType = 'image/svg+xml';
          }
          
          await file.save(logoData, {
            metadata: {
              contentType,
              metadata: {
                source: 'dolibarr_ftp',
                originalName: logo.name,
                syncDate: new Date().toISOString()
              }
            }
          });
          
          // Obtenir l'URL publique du fichier
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500' // Date d'expiration très lointaine
          });
          
          // Enregistrer les métadonnées du logo dans Firestore
          const logoDoc = {
            name: logo.name,
            original_name: logo.name,
            storage_path: `company_assets/logos/${logo.name}`,
            url: url,
            size: logoData.length,
            content_type: contentType,
            source: 'dolibarr_ftp',
            last_sync: new Date().toISOString() // Utiliser une chaîne ISO au lieu de FieldValue.serverTimestamp()
          };
          
          // Récupérer le document actuel
          const docRef = logosCollection.doc('logos');
          const doc = await docRef.get();
          
          if (doc.exists) {
            // Si le document existe, mettre à jour le tableau des logos
            const data = doc.data();
            const items = data.items || [];
            
            // Vérifier si le logo existe déjà
            const existingIndex = items.findIndex(item => item.name === logo.name);
            
            if (existingIndex !== -1) {
              // Mettre à jour le logo existant
              items[existingIndex] = logoDoc;
            } else {
              // Ajouter le nouveau logo
              items.push(logoDoc);
            }
            
            // Mettre à jour le document
            await docRef.update({ items: items });
          } else {
            // Si le document n'existe pas, le créer
            await docRef.set({ items: [logoDoc] });
          }
          
          results.push({
            name: logo.name,
            success: true,
            url,
            size: logoData.length
          });
          
          successCount++;
          console.log(`Logo ${logo.name} synchronisé avec succès`);
        } catch (error) {
          console.error(`Erreur lors de la synchronisation du logo ${logo.name}:`, error);
          results.push({
            name: logo.name,
            success: false,
            error: error.message
          });
          errorCount++;
        }
      }
      
      return {
        success: true,
        message: `${successCount} logos synchronisés avec succès, ${errorCount} échecs`,
        totalCount: logosList.length,
        successCount,
        errorCount,
        results
      };
    } catch (error) {
      console.error('Erreur lors de la synchronisation des logos:', error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },
  
  /**
   * Récupère tous les logos stockés dans Firebase
   * @returns {Promise<Array>} - Liste des logos
   */
  getAllLogos: async () => {
    try {
      const doc = await logosCollection.doc('logos').get();
      if (!doc.exists) {
        return [];
      }
      
      const data = doc.data();
      return data.items || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des logos:', error);
      throw error;
    }
  },
  
  /**
   * Supprime un logo de Firebase Storage et Firestore
   * @param {string} logoName - Nom du logo à supprimer
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteLogo: async (logoName) => {
    try {
      // Récupérer les logos existants
      const doc = await logosCollection.doc('logos').get();
      if (!doc.exists) {
        return {
          success: false,
          message: 'Aucun logo trouvé'
        };
      }
      
      const data = doc.data();
      const logos = data.items || [];
      
      // Trouver le logo à supprimer
      const logoIndex = logos.findIndex(logo => logo.name === logoName);
      if (logoIndex === -1) {
        return {
          success: false,
          message: `Logo ${logoName} non trouvé`
        };
      }
      
      const logo = logos[logoIndex];
      
      // Supprimer le fichier de Firebase Storage
      const bucket = storage.bucket();
      const file = bucket.file(logo.storage_path);
      await file.delete();
      
      // Mettre à jour la liste des logos dans Firestore
      const updatedLogos = [...logos];
      updatedLogos.splice(logoIndex, 1);
      
      await logosCollection.doc('logos').set({
        items: updatedLogos
      });
      
      return {
        success: true,
        message: `Logo ${logoName} supprimé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du logo ${logoName}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  }
};

export default FirestoreLogoService;
