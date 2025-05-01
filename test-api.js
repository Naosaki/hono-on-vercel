// Script de test pour l'API Dolibarr
import fetch from 'node-fetch';

// URL de base de l'API (ajustée au port 3007)
const BASE_URL = 'http://localhost:3007/api';

// Fonction pour tester l'API
async function testAPI() {
  try {
    // Test de la route de base
    console.log('\n--- Test de la route de base ---');
    const baseResponse = await fetch(`${BASE_URL}/`);
    const baseData = await baseResponse.json();
    console.log('Réponse:', baseData);

    // Test de récupération des tiers
    console.log('\n--- Test de récupération des tiers ---');
    const thirdPartiesResponse = await fetch(`${BASE_URL}/thirdparties`);
    const thirdPartiesData = await thirdPartiesResponse.json();
    console.log('Statut:', thirdPartiesResponse.status);
    console.log('Nombre de tiers récupérés:', Array.isArray(thirdPartiesData) ? thirdPartiesData.length : 'N/A');
    console.log('Premier tiers (si disponible):', Array.isArray(thirdPartiesData) && thirdPartiesData.length > 0 ? thirdPartiesData[0] : 'Aucun');

    // Test de récupération des factures
    console.log('\n--- Test de récupération des factures ---');
    const invoicesResponse = await fetch(`${BASE_URL}/invoices`);
    const invoicesData = await invoicesResponse.json();
    console.log('Statut:', invoicesResponse.status);
    console.log('Nombre de factures récupérées:', Array.isArray(invoicesData) ? invoicesData.length : 'N/A');
    console.log('Première facture (si disponible):', Array.isArray(invoicesData) && invoicesData.length > 0 ? invoicesData[0] : 'Aucune');

    // Test de récupération des produits
    console.log('\n--- Test de récupération des produits ---');
    const productsResponse = await fetch(`${BASE_URL}/products`);
    const productsData = await productsResponse.json();
    console.log('Statut:', productsResponse.status);
    console.log('Nombre de produits récupérés:', Array.isArray(productsData) ? productsData.length : 'N/A');
    console.log('Premier produit (si disponible):', Array.isArray(productsData) && productsData.length > 0 ? productsData[0] : 'Aucun');

  } catch (error) {
    console.error('Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testAPI();
