import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { FtpService } from '../ftpService.js';

const db = getFirestore();
const storage = getStorage();
const proposalsCollection = db.collection('proposals');

export const FirestoreProposalService = {
  getAllProposals: async () => {
    try {
      const snapshot = await proposalsCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la récupération des propositions commerciales:', error);
      throw error;
    }
  },

  getProposalById: async (id) => {
    try {
      const doc = await proposalsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  getProposalByRef: async (ref) => {
    try {
      const snapshot = await proposalsCollection.where('ref', '==', ref).get();
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale par référence ${ref}:`, error);
      throw error;
    }
  },

  getProposalByRefExt: async (refExt) => {
    try {
      const snapshot = await proposalsCollection.where('ref_ext', '==', refExt).get();
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la proposition commerciale par référence externe ${refExt}:`, error);
      throw error;
    }
  },

  getProposalsByThirdPartyId: async (thirdPartyId) => {
    try {
      const snapshot = await proposalsCollection.where('socid', '==', thirdPartyId).get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`Erreur lors de la récupération des propositions commerciales du tiers ${thirdPartyId}:`, error);
      throw error;
    }
  },

  syncProposal: async (proposal) => {
    try {
      if (!proposal || !proposal.id) {
        console.error('Impossible de synchroniser une proposition commerciale sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser une proposition commerciale sans ID'
        };
      }

      // Ajouter un timestamp de dernière synchronisation
      const proposalWithTimestamp = {
        ...proposal,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await proposalsCollection.doc(proposal.id).set(proposalWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Proposition commerciale ${proposal.id} (${proposal.ref}) synchronisée avec succès`,
        proposal: proposalWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la proposition commerciale ${proposal?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  syncProposalWithLines: async (proposal, lines) => {
    try {
      if (!proposal || !proposal.id) {
        console.error('Impossible de synchroniser une proposition commerciale sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser une proposition commerciale sans ID'
        };
      }

      // Ajouter les lignes à la proposition commerciale
      const proposalWithLines = {
        ...proposal,
        lines: lines || [],
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await proposalsCollection.doc(proposal.id).set(proposalWithLines, { merge: true });

      return {
        success: true,
        message: `Proposition commerciale ${proposal.id} (${proposal.ref}) synchronisée avec ses lignes avec succès`,
        proposal: proposalWithLines
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la proposition commerciale ${proposal?.id} avec ses lignes:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteProposal: async (id) => {
    try {
      await proposalsCollection.doc(id).delete();
      return {
        success: true,
        message: `Proposition commerciale ${id} supprimée avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la proposition commerciale ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  },

  /**
   * Synchronise une proposition commerciale avec ses détails, ses lignes et son PDF via FTP
   * @param {Object} proposal - Proposition commerciale à synchroniser
   * @param {Array} lines - Lignes de la proposition commerciale
   * @returns {Promise<Object>} - Résultat de la synchronisation
   */
  syncProposalWithDetailsAndPdf: async (proposal, lines) => {
    try {
      if (!proposal || !proposal.id) {
        console.error('Impossible de synchroniser une proposition commerciale sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser une proposition commerciale sans ID'
        };
      }

      // Déterminer la référence de la proposition commerciale
      let proposalRef = '';

      // Si la référence existe et n'est pas une référence provisoire
      if (proposal.ref && !proposal.ref.includes('(PROV')) {
        proposalRef = proposal.ref;
      } else {
        // Pour les propositions provisoires ou sans référence, utiliser un format standard
        const prefix = 'PR';
        // Ajouter des zéros pour avoir un format cohérent (ex: PR2504-0001)
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear().toString().substr(2);
        const paddedId = proposal.id.toString().padStart(4, '0');
        proposalRef = `${prefix}${year}${month.toString().padStart(2, '0')}-${paddedId}`;
      }

      console.log(`Synchronisation de la proposition commerciale ${proposal.id} (ref: ${proposalRef}) avec son PDF via FTP`);

      // Ajouter les lignes à la proposition commerciale
      const proposalWithLines = {
        ...proposal,
        lines: lines || [],
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      // Vérifier si le PDF existe sur le serveur FTP
      const pdfExists = await FtpService.checkProposalPdfExists(proposalRef);

      if (pdfExists) {
        try {
          // Récupérer le PDF depuis le serveur FTP
          const pdfData = await FtpService.getProposalPdf(proposalRef);

          // Stocker le PDF dans Firebase Storage
          const bucket = storage.bucket();
          const file = bucket.file(`proposals/PR${proposal.id}.pdf`);

          await file.save(pdfData, {
            metadata: {
              contentType: 'application/pdf',
              metadata: {
                source: 'dolibarr',
                proposalId: proposal.id,
                proposalRef: proposalRef,
                syncDate: new Date().toISOString()
              }
            }
          });

          // Obtenir l'URL publique du fichier
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500' // Date d'expiration très lointaine
          });

          // Ajouter les informations du PDF à la proposition commerciale
          proposalWithLines.pdf_url = url;
          proposalWithLines.pdf_path = `proposals/PR${proposal.id}.pdf`;
          proposalWithLines.pdf_size = pdfData.length;
          proposalWithLines.pdf_last_sync = FieldValue.serverTimestamp();

          console.log(`PDF de la proposition commerciale ${proposal.id} (ref: ${proposalRef}) stocké avec succès dans Firebase Storage`);
        } catch (pdfError) {
          console.error(`Erreur lors de la récupération ou du stockage du PDF de la proposition commerciale ${proposal.id} (ref: ${proposalRef}):`, pdfError);
          // Ne pas échouer la synchronisation complète si le PDF échoue
          proposalWithLines.pdf_error = pdfError.message;
        }
      } else {
        console.log(`Aucun PDF trouvé pour la proposition commerciale ${proposal.id} (ref: ${proposalRef}) sur le serveur FTP`);
        proposalWithLines.pdf_error = 'PDF non trouvé sur le serveur FTP';
      }

      // Enregistrer la proposition commerciale dans Firestore
      await proposalsCollection.doc(proposal.id).set(proposalWithLines, { merge: true });

      return {
        success: true,
        message: `Proposition commerciale ${proposal.id} (${proposalRef}) synchronisée avec succès`,
        proposal: proposalWithLines,
        pdf_url: proposalWithLines.pdf_url
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la proposition commerciale ${proposal?.id} avec son PDF:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  /**
   * Récupère l'URL du PDF d'une proposition commerciale depuis Firebase Storage
   * @param {string} id - ID de la proposition commerciale
   * @returns {Promise<string|null>} - URL du PDF ou null si non trouvé
   */
  getProposalPdfUrl: async (id) => {
    try {
      const doc = await proposalsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      
      const proposal = doc.data();
      if (!proposal.pdf_url) {
        return null;
      }
      
      return proposal.pdf_url;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL du PDF de la proposition commerciale ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime le PDF d'une proposition commerciale de Firebase Storage
   * @param {string} id - ID de la proposition commerciale
   * @returns {Promise<Object>} - Résultat de la suppression
   */
  deleteProposalPdf: async (id) => {
    try {
      const doc = await proposalsCollection.doc(id).get();
      if (!doc.exists) {
        return {
          success: false,
          message: `Proposition commerciale ${id} non trouvée`
        };
      }
      
      const proposal = doc.data();
      if (!proposal.pdf_path) {
        return {
          success: false,
          message: `Aucun PDF trouvé pour la proposition commerciale ${id}`
        };
      }
      
      // Supprimer le fichier de Firebase Storage
      const bucket = storage.bucket();
      const file = bucket.file(proposal.pdf_path);
      await file.delete();
      
      // Mettre à jour le document dans Firestore
      await proposalsCollection.doc(id).update({
        pdf_url: FieldValue.delete(),
        pdf_path: FieldValue.delete(),
        pdf_size: FieldValue.delete(),
        pdf_last_sync: FieldValue.delete(),
        pdf_error: FieldValue.delete()
      });
      
      return {
        success: true,
        message: `PDF de la proposition commerciale ${id} supprimé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du PDF de la proposition commerciale ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  },

  // Méthodes pour les statistiques et rapports
  getProposalCountByStatus: async () => {
    try {
      const snapshot = await proposalsCollection.get();
      const proposals = snapshot.docs.map(doc => doc.data());
      
      const statusCount = proposals.reduce((acc, proposal) => {
        const status = proposal.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return statusCount;
    } catch (error) {
      console.error('Erreur lors du comptage des propositions commerciales par statut:', error);
      throw error;
    }
  },

  getProposalTotalByMonth: async (year) => {
    try {
      const snapshot = await proposalsCollection.get();
      const proposals = snapshot.docs.map(doc => doc.data());
      
      // Filtrer par année si spécifiée
      const filteredProposals = year 
        ? proposals.filter(p => {
            const date = new Date(p.datec * 1000); // Convertir timestamp Unix en Date
            return date.getFullYear() === parseInt(year);
          })
        : proposals;
      
      // Grouper par mois
      const monthlyTotals = filteredProposals.reduce((acc, proposal) => {
        const date = new Date(proposal.datec * 1000);
        const month = date.getMonth(); // 0-11
        
        // Utiliser le montant total si disponible, sinon calculer à partir des lignes
        const total = proposal.total_ttc || 
          (proposal.lines ? proposal.lines.reduce((sum, line) => sum + (parseFloat(line.total_ttc) || 0), 0) : 0);
        
        acc[month] = (acc[month] || 0) + total;
        return acc;
      }, {});
      
      // Convertir en tableau pour faciliter l'utilisation
      const result = Array(12).fill(0).map((_, i) => ({
        month: i + 1,
        total: monthlyTotals[i] || 0
      }));
      
      return result;
    } catch (error) {
      console.error(`Erreur lors du calcul des totaux mensuels des propositions commerciales pour l'année ${year}:`, error);
      throw error;
    }
  }
};

export default FirestoreProposalService;
