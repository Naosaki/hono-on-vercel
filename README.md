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

```bash
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