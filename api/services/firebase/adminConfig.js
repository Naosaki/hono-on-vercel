import admin from 'firebase-admin';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// Charger les variables d'environnement
dotenv.config();

// Initialiser l'application Firebase Admin si elle n'est pas déjà initialisée
let adminApp;
let adminDb;
let credential;

/**
 * Récupérer l'instance de Firebase Admin, l'initialise si nécessaire
 * @returns {Object} - Instance de Firebase Admin
 */
export function getFirebaseAdmin() {
  try {
    // Vérifier si Firebase Admin est déjà initialisé
    return admin.app();
  } catch (error) {
    // Déterminer la méthode d'authentification en fonction de l'environnement
    if (process.env.FIREBASE_SERVICE_ACCOUNT_TYPE) {
      // En production (Vercel), utiliser les variables d'environnement séparées
      const serviceAccount = {
        type: process.env.FIREBASE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
        private_key_id: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
        client_email: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
        auth_uri: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
        token_uri: process.env.FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
        universe_domain: process.env.FIREBASE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN
      };
      credential = admin.credential.cert(serviceAccount);
      console.log('Firebase Admin initialisé avec le compte de service depuis les variables d\'environnement séparées');
    } else {
      // En local, utiliser le fichier
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const serviceAccountPath = join(__dirname, '../../../config/naocrm-cde53-firebase-adminsdk-fbsvc-2ede9e2cec.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        credential = admin.credential.cert(serviceAccountPath);
        console.log('Firebase Admin initialisé avec le compte de service depuis le fichier local');
      } else {
        throw new Error('Fichier de compte de service Firebase introuvable');
      }
    }

    // Initialiser Firebase Admin
    adminApp = admin.initializeApp({
      credential: credential,
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
      storageBucket: `${process.env.FIREBASE_STORAGE_BUCKET}`
    });
    console.log('Firebase Admin initialisé avec succès');
    
    return adminApp;
  }
}

// Initialiser Firebase Admin
try {
  // Vérifier si Firebase Admin est déjà initialisé
  adminApp = admin.app();
} catch (error) {
  adminApp = getFirebaseAdmin();
}

// Obtenir une instance de Firestore
adminDb = admin.firestore();

export { adminApp, adminDb };
