<<<<<<< HEAD
# Dolibarr to Firestore Sync API

Cette API permet de synchroniser les données d'une instance Dolibarr vers une base de données Firebase Firestore. Elle est construite avec Hono.js et déployable sur Vercel.

## Fonctionnalités
=======
# Hono sur Vercel avec intégration Dolibarr API

Ce projet est une API construite avec Hono.js et déployée sur Vercel, qui sert d'interface pour communiquer avec l'API Dolibarr.

## Configuration

1. Clonez ce dépôt
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :
   ```
   DOLIBARR_API_URL=https://votre-instance-dolibarr.com/api/index.php
   DOLIBARR_API_KEY=votre_api_key
   ```

## Développement local

Pour démarrer le serveur de développement :
>>>>>>> 327ccac6c82da123689796d27b897f585c671f8d

- Synchronisation des tiers (clients/prospects) de Dolibarr vers Firestore
- Synchronisation des factures de Dolibarr vers Firestore
- Synchronisation des produits de Dolibarr vers Firestore
- API RESTful pour accéder aux données synchronisées
- Déploiement facile sur Vercel

## Prérequis

- Node.js 18+
- Une instance Dolibarr avec accès API
- Un projet Firebase avec Firestore activé

## Installation

1. Cloner le dépôt
```bash
<<<<<<< HEAD
git clone https://github.com/votre-username/dolibarr-firestore-sync.git
cd dolibarr-firestore-sync
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Modifier le fichier .env avec vos propres valeurs
```

4. Démarrer le serveur de développement
```bash
npm start
```

## Endpoints API

### Clients (Tiers)
- `GET /api/sync/thirdparties` - Synchroniser tous les clients
- `GET /api/sync/thirdparties/:id` - Synchroniser un client spécifique
- `GET /api/compare/thirdparties/:id` - Comparer les données d'un client
- `GET /api/firebase/thirdparties` - Obtenir tous les clients depuis Firebase
- `GET /api/firebase/thirdparties/:id` - Obtenir un client spécifique depuis Firebase

### Factures
- `GET /api/sync/invoices` - Synchroniser toutes les factures
- `GET /api/sync/invoices/:id` - Synchroniser une facture spécifique
- `GET /api/compare/invoices/:id` - Comparer les données d'une facture
- `GET /api/firebase/invoices` - Obtenir toutes les factures depuis Firebase
- `GET /api/firebase/invoices/:id` - Obtenir une facture spécifique depuis Firebase
- `GET /api/firebase/invoices/client/:clientId` - Obtenir toutes les factures d'un client spécifique

### Produits
- `GET /api/sync/products` - Synchroniser tous les produits
- `GET /api/sync/products/:id` - Synchroniser un produit spécifique
- `GET /api/compare/products/:id` - Comparer les données d'un produit
- `GET /api/firebase/products` - Obtenir tous les produits depuis Firebase
- `GET /api/firebase/products/:id` - Obtenir un produit spécifique depuis Firebase
- `GET /api/firebase/products/search/:keyword` - Rechercher des produits par mot-clé

## Déploiement sur Vercel

1. Configurer les variables d'environnement sur Vercel
   - Ajouter toutes les variables du fichier `.env` dans les paramètres du projet Vercel
   - Pour la variable `FIREBASE_SERVICE_ACCOUNT`, ajouter le contenu complet du fichier JSON de compte de service Firebase

2. Déployer sur Vercel
```bash
vercel
```

## Structure du projet

```
├── api/
│   ├── index.js                    # Point d'entrée de l'API
│   └── services/                   # Services métier
│       ├── dolibarrService.js      # Service pour communiquer avec l'API Dolibarr
│       ├── syncService.js          # Service de synchronisation
│       └── firebase/               # Services Firebase
│           ├── adminConfig.js      # Configuration Firebase Admin
│           ├── config.js           # Configuration Firebase Client
│           ├── thirdPartyService.js # Service pour les tiers dans Firestore
│           ├── invoiceService.js   # Service pour les factures dans Firestore
│           └── productService.js   # Service pour les produits dans Firestore
├── .env                           # Variables d'environnement
├── .env.example                   # Exemple de variables d'environnement
└── package.json                   # Dépendances et scripts
```

## Licence

MIT
=======
npm start
```

Le serveur sera accessible à l'adresse http://localhost:3000/api

## Déploiement

Pour déployer sur Vercel :

```bash
npm run deploy
```

## Endpoints API Dolibarr disponibles

### Tiers (Clients/Prospects)

- `GET /api/thirdparties` - Récupérer tous les tiers
- `GET /api/thirdparties/:id` - Récupérer un tiers par son ID
- `POST /api/thirdparties` - Créer un nouveau tiers

### Factures

- `GET /api/invoices` - Récupérer toutes les factures
- `GET /api/invoices/:id` - Récupérer une facture par son ID
- `POST /api/invoices` - Créer une nouvelle facture

### Produits

- `GET /api/products` - Récupérer tous les produits

## Exemple d'utilisation

### Créer un tiers

```javascript
fetch('/api/thirdparties', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Nouveau Client',
    name_alias: 'Client',
    client: 1,
    code_client: 'AUTO',
    address: '123 Rue Exemple',
    zip: '75000',
    town: 'Paris',
    country_id: 1,
    phone: '0123456789',
    email: 'contact@nouveauclient.com'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));
```

### Récupérer les factures

```javascript
fetch('/api/invoices')
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erreur:', error));
```

## Sécurité

Assurez-vous de ne jamais exposer votre clé API Dolibarr. Utilisez toujours des variables d'environnement pour stocker les informations sensibles.
>>>>>>> 327ccac6c82da123689796d27b897f585c671f8d
