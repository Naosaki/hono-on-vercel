import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { DolibarrService } from './services/dolibarrService.js'

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

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;