import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();
const usersCollection = db.collection('doli_users');
const groupsCollection = db.collection('groups');

export const FirestoreUserService = {
  getAllUsers: async () => {
    try {
      const snapshot = await usersCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la ru00e9cupu00e9ration des utilisateurs:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const doc = await usersCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'utilisateur ${id}:`, error);
      throw error;
    }
  },

  getUserByLogin: async (login) => {
    try {
      const snapshot = await usersCollection.where('login', '==', login).get();
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'utilisateur par login ${login}:`, error);
      throw error;
    }
  },

  getUserByEmail: async (email) => {
    try {
      const snapshot = await usersCollection.where('email', '==', email).get();
      if (snapshot.empty) {
        return null;
      }
      return snapshot.docs[0].data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration de l'utilisateur par email ${email}:`, error);
      throw error;
    }
  },

  getAllGroups: async () => {
    try {
      const snapshot = await groupsCollection.get();
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Erreur lors de la ru00e9cupu00e9ration des groupes:', error);
      throw error;
    }
  },

  getGroupById: async (id) => {
    try {
      const doc = await groupsCollection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration du groupe ${id}:`, error);
      throw error;
    }
  },

  getUserGroups: async (userId) => {
    try {
      const userDoc = await usersCollection.doc(userId).get();
      if (!userDoc.exists) {
        return [];
      }
      
      const userData = userDoc.data();
      if (!userData.groups || !Array.isArray(userData.groups)) {
        return [];
      }
      
      const groupIds = userData.groups;
      const groupPromises = groupIds.map(id => groupsCollection.doc(id).get());
      const groupDocs = await Promise.all(groupPromises);
      
      return groupDocs
        .filter(doc => doc.exists)
        .map(doc => doc.data());
    } catch (error) {
      console.error(`Erreur lors de la ru00e9cupu00e9ration des groupes de l'utilisateur ${userId}:`, error);
      throw error;
    }
  },

  syncUser: async (user) => {
    try {
      if (!user || !user.id) {
        console.error('Impossible de synchroniser un utilisateur sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un utilisateur sans ID'
        };
      }

      // Ajouter un timestamp de derniu00e8re synchronisation
      const userWithTimestamp = {
        ...user,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await usersCollection.doc(user.id).set(userWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Utilisateur ${user.id} (${user.login}) synchronisu00e9 avec succu00e8s`,
        user: userWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'utilisateur ${user?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  syncUserWithGroups: async (user, groups) => {
    try {
      if (!user || !user.id) {
        console.error('Impossible de synchroniser un utilisateur sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un utilisateur sans ID'
        };
      }

      // Synchroniser les groupes d'abord
      if (groups && Array.isArray(groups)) {
        const groupPromises = groups.map(group => {
          if (group && group.id) {
            const groupWithTimestamp = {
              ...group,
              last_sync: FieldValue.serverTimestamp(),
              sync_source: 'dolibarr'
            };
            return groupsCollection.doc(group.id).set(groupWithTimestamp, { merge: true });
          }
          return Promise.resolve();
        });
        await Promise.all(groupPromises);
      }

      // Ajouter les groupes u00e0 l'utilisateur
      const userWithGroups = {
        ...user,
        groups: groups ? groups.map(group => group.id) : [],
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await usersCollection.doc(user.id).set(userWithGroups, { merge: true });

      return {
        success: true,
        message: `Utilisateur ${user.id} (${user.login}) synchronisu00e9 avec ses groupes avec succu00e8s`,
        user: userWithGroups
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation de l'utilisateur ${user?.id} avec ses groupes:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  syncGroup: async (group) => {
    try {
      if (!group || !group.id) {
        console.error('Impossible de synchroniser un groupe sans ID');
        return {
          success: false,
          message: 'Impossible de synchroniser un groupe sans ID'
        };
      }

      // Ajouter un timestamp de derniu00e8re synchronisation
      const groupWithTimestamp = {
        ...group,
        last_sync: FieldValue.serverTimestamp(),
        sync_source: 'dolibarr'
      };

      await groupsCollection.doc(group.id).set(groupWithTimestamp, { merge: true });

      return {
        success: true,
        message: `Groupe ${group.id} (${group.nom || group.name}) synchronisu00e9 avec succu00e8s`,
        group: groupWithTimestamp
      };
    } catch (error) {
      console.error(`Erreur lors de la synchronisation du groupe ${group?.id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la synchronisation: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteUser: async (id) => {
    try {
      await usersCollection.doc(id).delete();
      return {
        success: true,
        message: `Utilisateur ${id} supprimu00e9 avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  },

  deleteGroup: async (id) => {
    try {
      await groupsCollection.doc(id).delete();
      return {
        success: true,
        message: `Groupe ${id} supprimu00e9 avec succu00e8s`
      };
    } catch (error) {
      console.error(`Erreur lors de la suppression du groupe ${id}:`, error);
      return {
        success: false,
        message: `Erreur lors de la suppression: ${error.message}`,
        error: error.message
      };
    }
  }
};

export default FirestoreUserService;
