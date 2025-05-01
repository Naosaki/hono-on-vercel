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

try {
  // Vérifier si Firebase Admin est déjà initialisé
  adminApp = admin.app();
} catch (error) {
  // Déterminer la méthode d'authentification en fonction de l'environnement
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // En production (Vercel), utiliser la variable d'environnement
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
    console.log('Firebase Admin initialisé avec le compte de service depuis la variable d\'environnement');
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
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
  });
  console.log('Firebase Admin initialisé avec succès');
}

// Obtenir une instance de Firestore
adminDb = admin.firestore();

export { adminApp, adminDb };
