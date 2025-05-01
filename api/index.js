import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { DolibarrService } from './services/dolibarrService.js'
import { SyncService } from './services/syncService.js'
import { FirestoreThirdPartyService } from './services/firebase/thirdPartyService.js'
import { FirestoreInvoiceService } from './services/firebase/invoiceService.js'
import { FirestoreProductService } from './services/firebase/productService.js'

const app = new Hono().basePath('/api')

// Route de base
app.get('/', (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" })
})

// Routes pour l'API Dolibarr

// Tiers (Clients/Prospects)
app.get('/thirdparties', async (c) => {
  try {
    const result = await DolibarrService.getThirdParties();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await DolibarrService.getThirdPartyById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.post('/thirdparties', async (c) => {
  try {
    const body = await c.req.json();
    const result = await DolibarrService.createThirdParty(body);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Factures
app.get('/invoices', async (c) => {
  try {
    const result = await DolibarrService.getInvoices();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await DolibarrService.getInvoiceById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.post('/invoices', async (c) => {
  try {
    const body = await c.req.json();
    const result = await DolibarrService.createInvoice(body);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Produits
app.get('/products', async (c) => {
  try {
    const result = await DolibarrService.getProducts();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour la synchronisation avec Firebase

// Synchronisation des tiers (clients/prospects)
app.get('/sync/thirdparties', async (c) => {
  try {
    const result = await SyncService.syncAllThirdParties();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.syncThirdParty(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/compare/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.compareThirdParty(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour la synchronisation des factures
app.get('/sync/invoices', async (c) => {
  try {
    const result = await SyncService.syncAllInvoices();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.syncInvoice(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/compare/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.compareInvoice(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour accéder directement aux données Firestore des factures
app.get('/firebase/invoices', async (c) => {
  try {
    const result = await FirestoreInvoiceService.getAllInvoices();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreInvoiceService.getInvoiceById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/invoices/client/:clientId', async (c) => {
  try {
    const clientId = c.req.param('clientId');
    const result = await FirestoreInvoiceService.getInvoicesByClientId(clientId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour accéder directement aux données Firestore
app.get('/firebase/thirdparties', async (c) => {
  try {
    const result = await FirestoreThirdPartyService.getAllThirdParties();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreThirdPartyService.getThirdPartyById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour la synchronisation des produits
app.get('/sync/products', async (c) => {
  try {
    const result = await SyncService.syncAllProducts();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.syncProduct(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/compare/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.compareProduct(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour accéder directement aux données Firestore des produits
app.get('/firebase/products', async (c) => {
  try {
    const result = await FirestoreProductService.getAllProducts();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreProductService.getProductById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/products/search/:keyword', async (c) => {
  try {
    const keyword = c.req.param('keyword');
    const result = await FirestoreProductService.searchProducts(keyword);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;