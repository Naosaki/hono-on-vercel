import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const bankAccountsCollection = db.collection('bank_accounts');
const bankAccountLinesCollection = db.collection('bank_account_lines');

export const FirestoreBankAccountService = {
  getAllBankAccounts: async () => {
    try {
      const snapshot = await bankAccountsCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes bancaires:', error);
      throw error;
    }
  },

  getBankAccountById: async (id) => {
    try {
      const doc = await bankAccountsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte bancaire ${id}:`, error);
      throw error;
    }
  },

  getBankAccountLines: async (accountId) => {
    try {
      const snapshot = await bankAccountLinesCollection
        .where('account_id', '==', accountId)
        .get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error(`Erreur lors de la récupération des lignes du compte bancaire ${accountId}:`, error);
      throw error;
    }
  },

  getBankAccountLineById: async (lineId) => {
    try {
      const doc = await bankAccountLinesCollection.doc(lineId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la récupération de la ligne ${lineId}:`, error);
      throw error;
    }
  },

  syncBankAccount: async (account) => {
    try {
      if (!account || !account.id) {
        console.error('Impossible de synchroniser un compte bancaire sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un compte bancaire sans ID'
        };
      }

      // Ajouter un timestamp de dernière synchronisation
      const accountWithTimestamp = {
        ...account,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await bankAccountsCollection.doc(account.id).set(accountWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Compte bancaire ${account.id} synchronisé avec succès`,
        account: accountWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du compte bancaire ${account?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  syncBankAccountLine: async (line, accountId) => {
    try {
      if (!line || !line.id) {
        console.error('Impossible de synchroniser une ligne de compte bancaire sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser une ligne de compte bancaire sans ID'
        };
      }

      // Ajouter un timestamp de dernière synchronisation et l'ID du compte
      const lineWithTimestamp = {
        ...line,
        account_id: accountId,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await bankAccountLinesCollection.doc(line.id).set(lineWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Ligne ${line.id} du compte bancaire ${accountId} synchronisée avec succès`,
        line: lineWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de la ligne ${line?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteBankAccount: async (id) => {
    try {
      await bankAccountsCollection.doc(id).delete();
      return {
        success: true,
        message: `Compte bancaire ${id} supprimé avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du compte bancaire ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteBankAccountLine: async (lineId) => {
    try {
      await bankAccountLinesCollection.doc(lineId).delete();
      return {
        success: true,
        message: `Ligne ${lineId} supprimée avec succès`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la ligne ${lineId}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  }
};

export default FirestoreBankAccountService;
