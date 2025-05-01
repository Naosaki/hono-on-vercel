import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { DolibarrService } from './services/dolibarrService.js'
import { SyncService } from './services/syncService.js'
import { FirestoreThirdPartyService } from './services/firebase/thirdPartyService.js'
import { FirestoreInvoiceService } from './services/firebase/invoiceService.js'
import { FirestoreProductService } from './services/firebase/productService.js'
import { FirestoreStorageService } from './services/firebase/storageService.js'

const app = new Hono().basePath('/api')

// Route de base
app.get('/', (c) => {
  return c.json({ message: "Congrats! You've deployed Hono to Vercel" })
})

// Routes pour l'API Dolibarr

// Tiers (clients/prospects)
app.get('/thirdparties', async (c) => {
  try {
    const thirdParties = await DolibarrService.getThirdParties();
    return c.json(thirdParties);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const thirdParty = await DolibarrService.getThirdPartyById(id);
    return c.json(thirdParty);
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

// Routes additionnelles pour les tiers
app.get('/thirdparties/:id/bankaccounts', async (c) => {
  try {
    const id = c.req.param('id');
    const bankAccounts = await DolibarrService.getThirdPartyBankAccounts(id);
    return c.json(bankAccounts);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/categories', async (c) => {
  try {
    const id = c.req.param('id');
    const categories = await DolibarrService.getThirdPartyCustomerCategories(id);
    return c.json(categories);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/supplier_categories', async (c) => {
  try {
    const id = c.req.param('id');
    const categories = await DolibarrService.getThirdPartySupplierCategories(id);
    return c.json(categories);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/outstandinginvoices', async (c) => {
  try {
    const id = c.req.param('id');
    const invoices = await DolibarrService.getThirdPartyOutstandingInvoices(id);
    return c.json(invoices);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/outstandingorders', async (c) => {
  try {
    const id = c.req.param('id');
    const orders = await DolibarrService.getThirdPartyOutstandingOrders(id);
    return c.json(orders);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/outstandingproposals', async (c) => {
  try {
    const id = c.req.param('id');
    const proposals = await DolibarrService.getThirdPartyOutstandingProposals(id);
    return c.json(proposals);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/representatives', async (c) => {
  try {
    const id = c.req.param('id');
    const representatives = await DolibarrService.getThirdPartyRepresentatives(id);
    return c.json(representatives);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/email/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const thirdParty = await DolibarrService.getThirdPartyByEmail(email);
    return c.json(thirdParty);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/barcode/:barcode', async (c) => {
  try {
    const barcode = c.req.param('barcode');
    const thirdParty = await DolibarrService.getThirdPartyByBarcode(barcode);
    return c.json(thirdParty);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Factures
app.get('/invoices', async (c) => {
  try {
    const invoices = await DolibarrService.getInvoices();
    return c.json(invoices);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const invoice = await DolibarrService.getInvoiceById(id);
    return c.json(invoice);
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

// Routes additionnelles pour les factures
app.get('/invoices/:id/lines', async (c) => {
  try {
    const id = c.req.param('id');
    const lines = await DolibarrService.getInvoiceLines(id);
    return c.json(lines);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id/discount', async (c) => {
  try {
    const id = c.req.param('id');
    const discounts = await DolibarrService.getInvoiceDiscounts(id);
    return c.json(discounts);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id/payments', async (c) => {
  try {
    const id = c.req.param('id');
    const payments = await DolibarrService.getInvoicePayments(id);
    return c.json(payments);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/ref/:ref', async (c) => {
  try {
    const ref = c.req.param('ref');
    const invoice = await DolibarrService.getInvoiceByRef(ref);
    return c.json(invoice);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/ref_ext/:refExt', async (c) => {
  try {
    const refExt = c.req.param('refExt');
    const invoice = await DolibarrService.getInvoiceByRefExt(refExt);
    return c.json(invoice);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/templates/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const template = await DolibarrService.getInvoiceTemplate(id);
    return c.json(template);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour les PDFs des factures
app.get('/invoices/:id/pdf', async (c) => {
  try {
    const id = c.req.param('id');
    const pdfData = await DolibarrService.getInvoicePdf(id);
    
    // Renvoyer le PDF directement
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    return c.body(pdfData);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id/pdf/store', async (c) => {
  try {
    const id = c.req.param('id');
    
    // 1. Récupérer le PDF depuis Dolibarr
    const pdfData = await DolibarrService.getInvoicePdf(id);
    
    // 2. Stocker le PDF dans Firebase Storage
    const result = await FirestoreStorageService.uploadInvoicePdf(id, pdfData);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/invoices/:id/pdf/url', async (c) => {
  try {
    const id = c.req.param('id');
    const url = await FirestoreStorageService.getInvoicePdfUrl(id);
    
    return c.json({ success: true, url });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.delete('/invoices/:id/pdf', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreStorageService.deleteInvoicePdf(id);
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Produits
app.get('/products', async (c) => {
  try {
    const products = await DolibarrService.getProducts();
    return c.json(products);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/products/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const product = await DolibarrService.getProductById(id);
    return c.json(product);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour la synchronisation avec Firebase

// Synchronisation des tiers (clients/prospects)
app.get('/sync/thirdparties', async (c) => {
  try {
    const details = c.req.query('details') === 'false' ? false : true;
    const result = await SyncService.syncAllThirdParties(details);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/thirdparties/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const details = c.req.query('details') === 'false' ? false : true;
    const result = await SyncService.syncThirdParty(id, details);
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

// Routes pour accéder directement aux données Firestore des tiers
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

// Synchronisation des factures
app.get('/sync/invoices', async (c) => {
  try {
    const details = c.req.query('details') === 'false' ? false : true;
    const pdf = c.req.query('pdf') === 'true' ? true : false;
    
    let result;
    if (pdf) {
      result = await SyncService.syncAllInvoicesWithPdf(details, pdf);
    } else {
      result = await SyncService.syncAllInvoices(details);
    }
    
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/invoices/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const details = c.req.query('details') === 'false' ? false : true;
    const pdf = c.req.query('pdf') === 'true' ? true : false;
    
    let result;
    if (pdf) {
      result = await SyncService.syncInvoiceWithPdf(id, details, pdf);
    } else {
      result = await SyncService.syncInvoice(id, details);
    }
    
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

// Routes pour accéder aux PDF des factures
app.get('/firebase/invoices/:id/pdf', async (c) => {
  try {
    const id = c.req.param('id');
    const pdfUrl = await FirestoreStorageService.getInvoicePdfUrl(id);
    return c.json({ success: true, pdf_url: pdfUrl });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
})

app.get('/sync/invoices/:id/pdf', async (c) => {
  try {
    const id = c.req.param('id');
    // Récupérer le PDF depuis Dolibarr
    const pdfData = await DolibarrService.getInvoicePdf(id);
    // Télécharger le PDF dans Firebase Storage
    const result = await FirestoreStorageService.uploadInvoicePdf(id, pdfData);
    // Mettre à jour la facture dans Firestore avec l'URL du PDF
    if (result.success) {
      await FirestoreInvoiceService.updateInvoice(id, { pdf_url: result.url });
    }
    return c.json(result);
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
})

// Route pour synchroniser toutes les factures avec leurs PDFs
app.get('/sync/invoices/pdfs', async (c) => {
  try {
    console.log('Début de la synchronisation de toutes les factures avec leurs PDFs...');
    
    // 1. Récupérer toutes les factures depuis Dolibarr
    const invoices = await DolibarrService.getInvoices();
    console.log(`${invoices.length} factures récupérées depuis Dolibarr`);
    
    // 2. Synchroniser chaque facture avec son PDF
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      try {
        console.log(`Synchronisation de la facture ${invoice.id} (${i+1}/${invoices.length})...`);
        
        // Récupérer le PDF de la facture
        const pdfData = await DolibarrService.getInvoicePdf(invoice.id);
        
        // Stocker le PDF dans Firebase Storage
        const pdfResult = await FirestoreStorageService.uploadInvoicePdf(invoice.id, pdfData);
        
        // Mettre à jour la facture dans Firestore avec l'URL du PDF
        if (pdfResult.success) {
          const db = getFirestore();
          const invoiceRef = db.collection('invoices').doc(invoice.id.toString());
          
          await invoiceRef.set({
            pdfUrl: pdfResult.url,
            pdfPath: pdfResult.path,
            pdfSize: pdfResult.size,
            lastPdfSyncedAt: Date.now()
          }, { merge: true });
          
          results.push({
            id: invoice.id,
            ref: invoice.ref,
            success: true,
            url: pdfResult.url
          });
          
          successCount++;
        } else {
          results.push({
            id: invoice.id,
            ref: invoice.ref,
            success: false,
            error: 'Erreur lors du stockage du PDF'
          });
          
          errorCount++;
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de la facture ${invoice.id}:`, error);
        
        results.push({
          id: invoice.id,
          ref: invoice.ref || `Facture ${invoice.id}`,
          success: false,
          error: error.message
        });
        
        errorCount++;
      }
    }
    
    return c.json({
      success: true,
      total: invoices.length,
      successCount,
      errorCount,
      results
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation des factures avec PDFs:', error);
    return c.json({ 
      success: false, 
      error: error.message 
    }, 500);
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
export const PUT = handler;
export const DELETE = handler;