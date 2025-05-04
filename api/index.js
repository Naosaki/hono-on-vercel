import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { DolibarrService } from './services/dolibarrService.js'
import { SyncService } from './services/syncService.js'
import { FirestoreThirdPartyService } from './services/firebase/thirdPartyService.js'
import { FirestoreInvoiceService } from './services/firebase/invoiceService.js'
import { FirestoreProductService } from './services/firebase/productService.js'
import { FirestoreStorageService } from './services/firebase/storageService.js'
import { FirestoreContactService } from './services/firebase/contactService.js'
import { FtpService } from './services/ftpService.js'
import { FirestoreStockMovementService } from './services/firebase/stockMovementService.js'

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
    
    // Utiliser le service de synchronisation qui gère correctement les références de factures
    const result = await SyncService.syncAllInvoicesWithPdf(true, true);
    
    return c.json(result);
  } catch (error) {
    console.error('Erreur lors de la synchronisation des factures avec PDFs:', error);
    return c.json({ 
      success: false, 
      message: `Erreur lors de la synchronisation de la facture pdfs: ${error.message}`,
      error: error.message 
    }, 500);
  }
})

// Route pour synchroniser toutes les factures avec leurs PDFs depuis Firestore
app.get('/sync/invoices/pdfs/from-firestore', async (c) => {
  try {
    console.log('Début de la synchronisation des PDFs des factures depuis Firestore...');
    
    // Récupérer le paramètre updateDetails (par défaut à true)
    const updateDetails = c.req.query('updateDetails') !== 'false';
    
    // Utiliser le service de synchronisation qui récupère les références depuis Firestore
    const result = await SyncService.syncAllInvoicePdfsFromFirestore(updateDetails);
    
    return c.json(result);
  } catch (error) {
    console.error('Erreur lors de la synchronisation des PDFs des factures depuis Firestore:', error);
    return c.json({ 
      success: false, 
      message: `Erreur lors de la synchronisation des PDFs depuis Firestore: ${error.message}`,
      error: error.message 
    }, 500);
  }
})

// Route pour synchroniser toutes les factures avec leurs PDFs depuis FTP
app.get('/sync/invoices/pdfs/from-ftp', async (c) => {
  try {
    console.log('Début de la synchronisation des PDFs des factures depuis FTP...');
    
    // Récupérer le paramètre updateDetails (par défaut à true)
    const updateDetails = c.req.query('updateDetails') !== 'false';
    
    // Utiliser le service de synchronisation qui récupère les PDFs depuis FTP
    const result = await SyncService.syncAllInvoicePdfsFromFtp(updateDetails);
    
    return c.json(result);
  } catch (error) {
    console.error('Erreur lors de la synchronisation des PDFs des factures depuis FTP:', error);
    return c.json({ 
      success: false, 
      message: `Erreur lors de la synchronisation des PDFs depuis FTP: ${error.message}`,
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

// Routes pour les mouvements de stock
app.get('/stockmovements', async (c) => {
  try {
    const limit = c.req.query('limit') || '100';
    const sortfield = c.req.query('sortfield') || 'm.rowid';
    const sortorder = c.req.query('sortorder') || 'DESC';
    const product_id = c.req.query('product_id');
    const warehouse_id = c.req.query('warehouse_id');
    const type = c.req.query('type');
    
    const options = { limit, sortfield, sortorder };
    if (product_id) options.product_id = product_id;
    if (warehouse_id) options.warehouse_id = warehouse_id;
    if (type) options.type = type;
    
    const stockMovements = await DolibarrService.getStockMovements(options);
    return c.json(stockMovements);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/stockmovements/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const stockMovement = await DolibarrService.getStockMovementById(id);
    return c.json(stockMovement);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.post('/stockmovements', async (c) => {
  try {
    const body = await c.req.json();
    const result = await DolibarrService.createStockMovement(body);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour les mouvements de stock par produit et entrepôt
app.get('/products/:id/stockmovements', async (c) => {
  try {
    const id = c.req.param('id');
    const stockMovements = await DolibarrService.getProductStockMovements(id);
    return c.json(stockMovements);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/warehouses/:id/stockmovements', async (c) => {
  try {
    const id = c.req.param('id');
    const stockMovements = await DolibarrService.getWarehouseStockMovements(id);
    return c.json(stockMovements);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour les entrepôts
app.get('/warehouses', async (c) => {
  try {
    const warehouses = await DolibarrService.getWarehouses();
    return c.json(warehouses);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/warehouses/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const warehouse = await DolibarrService.getWarehouseById(id);
    return c.json(warehouse);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour les fiches de stock
app.get('/warehouse/stock-sheets', async (c) => {
  try {
    // Récupérer tous les dossiers d'entrepôts
    const warehouseFolders = await FtpService.getWarehouseFolders();
    
    // Pour chaque dossier, récupérer les fiches de stock
    const results = [];
    
    for (const folder of warehouseFolders) {
      try {
        const stockSheets = await FtpService.getWarehouseStockSheets(folder.name);
        results.push({
          folder: folder.name,
          stockSheets: stockSheets
        });
      } catch (error) {
        console.error(`Erreur lors de la récupération des fiches de stock pour le dossier ${folder.name}:`, error);
        results.push({
          folder: folder.name,
          error: error.message
        });
      }
    }
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/warehouse/:id/stock-sheets', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer l'entrepôt depuis Dolibarr
    const warehouse = await DolibarrService.getWarehouseById(id);
    
    if (!warehouse) {
      return c.json({ error: `Entrepôt ${id} non trouvé` }, 404);
    }
    
    // Récupérer les dossiers d'entrepôts depuis le FTP
    const warehouseFolders = await FtpService.getWarehouseFolders();
    
    // Trouver le dossier correspondant à l'entrepôt
    const warehouseFolder = warehouseFolders.find(folder => 
      folder.name.toUpperCase() === warehouse.ref.toUpperCase() || 
      folder.name.toUpperCase() === warehouse.label.toUpperCase()
    );
    
    if (!warehouseFolder) {
      return c.json({ error: `Dossier FTP pour l'entrepôt ${id} (${warehouse.ref}) non trouvé` }, 404);
    }
    
    // Récupérer les fiches de stock pour cet entrepôt
    const stockSheets = await FtpService.getWarehouseStockSheets(warehouseFolder.name);
    
    return c.json({
      warehouseId: id,
      warehouseRef: warehouse.ref,
      warehouseLabel: warehouse.label,
      folder: warehouseFolder.name,
      stockSheets: stockSheets
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/warehouse/:id/stock-sheets/:fileName', async (c) => {
  try {
    const id = c.req.param('id');
    const fileName = c.req.param('fileName');
    
    // Récupérer l'entrepôt depuis Dolibarr
    const warehouse = await DolibarrService.getWarehouseById(id);
    
    if (!warehouse) {
      return c.json({ error: `Entrepôt ${id} non trouvé` }, 404);
    }
    
    // Récupérer les dossiers d'entrepôts depuis le FTP
    const warehouseFolders = await FtpService.getWarehouseFolders();
    
    // Trouver le dossier correspondant à l'entrepôt
    const warehouseFolder = warehouseFolders.find(folder => 
      folder.name.toUpperCase() === warehouse.ref.toUpperCase() || 
      folder.name.toUpperCase() === warehouse.label.toUpperCase()
    );
    
    if (!warehouseFolder) {
      return c.json({ error: `Dossier FTP pour l'entrepôt ${id} (${warehouse.ref}) non trouvé` }, 404);
    }
    
    // Récupérer la fiche de stock
    const stockSheetContent = await FtpService.getWarehouseStockSheet(warehouseFolder.name, fileName);
    
    // Créer un en-tête pour le téléchargement du PDF
    c.header('Content-Type', 'application/pdf');
    c.header('Content-Disposition', `attachment; filename="${fileName}"`);
    
    return c.body(stockSheetContent);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.delete('/warehouse/:id/stock-sheets/:fileName', async (c) => {
  try {
    const id = c.req.param('id');
    const fileName = c.req.param('fileName');
    
    // Vérifier si le fichier existe dans Firebase Storage
    const fileKey = `${id}_${fileName}`;
    const deleted = await FirestoreStorageService.deleteWarehouseStockSheet(fileKey);
    
    if (deleted) {
      return c.json({
        success: true,
        message: `Fiche de stock ${fileName} supprimée avec succès`
      });
    } else {
      return c.json({
        success: false,
        message: `Fiche de stock ${fileName} non trouvée ou déjà supprimée`
      }, 404);
    }
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour la synchronisation des fiches de stock
app.get('/sync/warehouse/stock-sheets', async (c) => {
  try {
    // Récupérer la liste des entrepôts depuis Dolibarr
    const warehouses = await DolibarrService.getWarehouses();
    
    // Récupérer les dossiers d'entrepôts depuis le FTP
    const warehouseFolders = await FtpService.getWarehouseFolders();
    
    // Synchroniser les fiches de stock pour chaque entrepôt
    const results = {
      success: true,
      totalProcessed: 0,
      totalSynced: 0,
      errors: [],
      warehouses: []
    };
    
    for (const warehouse of warehouses) {
      // Trouver le dossier correspondant à l'entrepôt
      const warehouseFolder = warehouseFolders.find(folder => 
        folder.name.toUpperCase() === warehouse.ref.toUpperCase() || 
        folder.name.toUpperCase() === warehouse.label.toUpperCase()
      );
      
      if (!warehouseFolder) {
        results.errors.push(`Dossier FTP pour l'entrepôt ${warehouse.id} (${warehouse.ref}) non trouvé`);
        results.warehouses.push({
          id: warehouse.id,
          folder: null,
          processed: 0,
          synced: 0,
          errors: [`Dossier FTP non trouvé`]
        });
        continue;
      }
      
      try {
        // Récupérer les fiches de stock pour cet entrepôt
        const stockSheets = await FtpService.getWarehouseStockSheets(warehouseFolder.name);
        
        const warehouseResult = {
          id: warehouse.id,
          folder: warehouseFolder.name,
          processed: stockSheets.length,
          synced: 0,
          errors: []
        };
        
        results.totalProcessed += stockSheets.length;
        
        // Synchroniser chaque fiche de stock
        for (const stockSheet of stockSheets) {
          try {
            // Récupérer le contenu de la fiche de stock
            const stockSheetContent = await FtpService.getWarehouseStockSheet(warehouseFolder.name, stockSheet.name);
            
            // Générer un nom de fichier unique pour Firebase Storage
            const fileName = `${warehouse.id}_${stockSheet.name}`;
            
            // Uploader la fiche de stock dans Firebase Storage
            const uploadResult = await FirestoreStorageService.uploadWarehouseStockSheet(fileName, stockSheetContent, {
              warehouseId: warehouse.id,
              warehouseRef: warehouse.ref,
              warehouseLabel: warehouse.label,
              originalFilename: stockSheet.name,
              originalDate: stockSheet.date ? new Date(stockSheet.date).toISOString() : new Date().toISOString()
            });
            
            if (uploadResult.success) {
              warehouseResult.synced++;
              results.totalSynced++;
            } else {
              warehouseResult.errors.push(`Erreur lors de l'upload de ${stockSheet.name}: ${uploadResult.message}`);
            }
          } catch (error) {
            console.error(`Erreur lors de la synchronisation de la fiche ${stockSheet.name} pour l'entrepôt ${warehouse.id}:`, error);
            warehouseResult.errors.push(`Erreur lors de la synchronisation de ${stockSheet.name}: ${error.message}`);
          }
        }
        
        results.warehouses.push(warehouseResult);
      } catch (error) {
        console.error(`Erreur lors de la synchronisation des fiches de stock pour l'entrepôt ${warehouse.id}:`, error);
        results.errors.push(`Erreur lors de la synchronisation des fiches de stock pour l'entrepôt ${warehouse.id}: ${error.message}`);
        results.warehouses.push({
          id: warehouse.id,
          folder: warehouseFolder.name,
          processed: 0,
          synced: 0,
          errors: [error.message]
        });
      }
    }
    
    // Mettre à jour le statut global
    if (results.totalSynced === 0 && results.totalProcessed > 0) {
      results.success = false;
      results.message = 'Aucune fiche de stock n\'a pu être synchronisée';
    } else {
      results.message = `${results.totalSynced}/${results.totalProcessed} fiches de stock synchronisées avec succès`;
    }
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/sync/warehouse/:id/stock-sheets', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer l'entrepôt depuis Dolibarr
    const warehouse = await DolibarrService.getWarehouseById(id);
    
    if (!warehouse) {
      return c.json({ error: `Entrepôt ${id} non trouvé` }, 404);
    }
    
    // Récupérer les dossiers d'entrepôts depuis le FTP
    const warehouseFolders = await FtpService.getWarehouseFolders();
    
    // Trouver le dossier correspondant à l'entrepôt
    const warehouseFolder = warehouseFolders.find(folder => 
      folder.name.toUpperCase() === warehouse.ref.toUpperCase() || 
      folder.name.toUpperCase() === warehouse.label.toUpperCase()
    );
    
    if (!warehouseFolder) {
      return c.json({
        success: false,
        message: `Dossier FTP pour l'entrepôt ${id} (${warehouse.ref}) non trouvé`
      }, 404);
    }
    
    // Récupérer les fiches de stock pour cet entrepôt
    const stockSheets = await FtpService.getWarehouseStockSheets(warehouseFolder.name);
    
    const results = {
      success: true,
      warehouseId: id,
      warehouseRef: warehouse.ref,
      warehouseLabel: warehouse.label,
      folder: warehouseFolder.name,
      totalProcessed: stockSheets.length,
      totalSynced: 0,
      errors: [],
      stockSheets: []
    };
    
    // Synchroniser chaque fiche de stock
    for (const stockSheet of stockSheets) {
      try {
        // Récupérer le contenu de la fiche de stock
        const stockSheetContent = await FtpService.getWarehouseStockSheet(warehouseFolder.name, stockSheet.name);
        
        // Générer un nom de fichier unique pour Firebase Storage
        const fileName = `${warehouse.id}_${stockSheet.name}`;
        
        // Uploader la fiche de stock dans Firebase Storage
        const uploadResult = await FirestoreStorageService.uploadWarehouseStockSheet(fileName, stockSheetContent, {
          warehouseId: warehouse.id,
          warehouseRef: warehouse.ref,
          warehouseLabel: warehouse.label,
          originalFilename: stockSheet.name,
          originalDate: stockSheet.date ? new Date(stockSheet.date).toISOString() : new Date().toISOString()
        });
        
        if (uploadResult.success) {
          results.totalSynced++;
          results.stockSheets.push({
            name: stockSheet.name,
            synced: true,
            url: uploadResult.url
          });
        } else {
          results.errors.push(`Erreur lors de l'upload de ${stockSheet.name}: ${uploadResult.message}`);
          results.stockSheets.push({
            name: stockSheet.name,
            synced: false,
            error: uploadResult.message
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation de la fiche ${stockSheet.name}:`, error);
        results.errors.push(`Erreur lors de la synchronisation de ${stockSheet.name}: ${error.message}`);
        results.stockSheets.push({
          name: stockSheet.name,
          synced: false,
          error: error.message
        });
      }
    }
    
    // Mettre à jour le statut global
    if (results.totalSynced === 0 && results.totalProcessed > 0) {
      results.success = false;
      results.message = `Aucune fiche de stock n'a pu être synchronisée pour l'entrepôt ${warehouse.ref}`;
    } else {
      results.message = `${results.totalSynced}/${results.totalProcessed} fiches de stock synchronisées avec succès pour l'entrepôt ${warehouse.ref}`;
    }
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour la synchronisation des mouvements de stock
app.get('/sync/stockmovements', async (c) => {
  try {
    const includeDetails = c.req.query('details') === 'false' ? false : true;
    
    // Récupérer tous les mouvements de stock depuis Dolibarr
    const stockMovements = await DolibarrService.getStockMovements({ limit: 1000 });
    
    console.log(`${stockMovements.length} mouvements de stock récupérés depuis Dolibarr`);
    
    // Synchroniser chaque mouvement de stock
    const results = {
      success: true,
      totalProcessed: stockMovements.length,
      totalSynced: 0,
      errors: [],
      stockMovements: []
    };
    
    for (const stockMovement of stockMovements) {
      try {
        // Si includeDetails est true, récupérer les détails du mouvement de stock
        let detailedStockMovement = stockMovement;
        
        if (includeDetails) {
          detailedStockMovement = await DolibarrService.getStockMovementById(stockMovement.id);
        }
        
        // Synchroniser le mouvement de stock avec Firestore
        const syncResult = await FirestoreStockMovementService.syncStockMovement(detailedStockMovement);
        
        if (syncResult.success) {
          results.totalSynced++;
          results.stockMovements.push({
            id: detailedStockMovement.id,
            synced: true
          });
        } else {
          results.errors.push(`Erreur lors de la synchronisation du mouvement de stock ${detailedStockMovement.id}: ${syncResult.message}`);
          results.stockMovements.push({
            id: detailedStockMovement.id,
            synced: false,
            error: syncResult.message
          });
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation du mouvement de stock ${stockMovement.id}:`, error);
        results.errors.push(`Erreur lors de la synchronisation du mouvement de stock ${stockMovement.id}: ${error.message}`);
        results.stockMovements.push({
          id: stockMovement.id,
          synced: false,
          error: error.message
        });
      }
    }
    
    // Mettre à jour le statut global
    if (results.totalSynced === 0 && results.totalProcessed > 0) {
      results.success = false;
      results.message = 'Aucun mouvement de stock n\'a pu être synchronisé';
    } else {
      results.message = `${results.totalSynced}/${results.totalProcessed} mouvements de stock synchronisés avec succès`;
    }
    
    return c.json(results);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/sync/stockmovements/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Récupérer le mouvement de stock depuis Dolibarr
    const stockMovement = await DolibarrService.getStockMovementById(id);
    
    // Synchroniser le mouvement de stock avec Firestore
    const syncResult = await FirestoreStockMovementService.syncStockMovement(stockMovement);
    
    return c.json({
      success: syncResult.success,
      message: syncResult.message,
      stockMovement: syncResult.stockMovement
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour accéder directement aux mouvements de stock dans Firestore
app.get('/firebase/stockmovements', async (c) => {
  try {
    const result = await FirestoreStockMovementService.getAllStockMovements();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/firebase/stockmovements/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreStockMovementService.getStockMovementById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/firebase/stockmovements/product/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');
    const result = await FirestoreStockMovementService.getStockMovementsByProduct(productId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/firebase/stockmovements/warehouse/:warehouseId', async (c) => {
  try {
    const warehouseId = c.req.param('warehouseId');
    const result = await FirestoreStockMovementService.getStockMovementsByWarehouse(warehouseId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

app.get('/firebase/stockmovements/stats', async (c) => {
  try {
    const result = await FirestoreStockMovementService.getStockMovementsStats();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Routes pour les contacts via Dolibarr
app.get('/contacts', async (c) => {
  try {
    const contacts = await DolibarrService.getContacts();
    return c.json(contacts);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const contact = await DolibarrService.getContactById(id);
    return c.json(contact);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/thirdparties/:id/contacts', async (c) => {
  try {
    const id = c.req.param('id');
    const contacts = await DolibarrService.getThirdPartyContacts(id);
    return c.json(contacts);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.post('/contacts', async (c) => {
  try {
    const body = await c.req.json();
    const result = await DolibarrService.createContact(body);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.put('/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = await DolibarrService.updateContact(id, body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.delete('/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await DolibarrService.deleteContact(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour les contacts via Firestore
app.get('/firebase/contacts', async (c) => {
  try {
    const result = await FirestoreContactService.getAllContacts();
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreContactService.getContactById(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/firebase/thirdparties/:id/contacts', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreContactService.getContactsByThirdPartyId(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.put('/firebase/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const result = await FirestoreContactService.updateContact(id, body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.delete('/firebase/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await FirestoreContactService.deleteContact(id);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

// Routes pour la synchronisation des contacts
app.get('/sync/contacts', async (c) => {
  try {
    const details = c.req.query('details') === 'false' ? false : true;
    const result = await SyncService.syncAllContacts(details);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const details = c.req.query('details') === 'false' ? false : true;
    const result = await SyncService.syncContact(id, details);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/sync/thirdparties/:id/contacts', async (c) => {
  try {
    const id = c.req.param('id');
    const details = c.req.query('details') === 'false' ? false : true;
    const result = await SyncService.syncThirdPartyContacts(id, details);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
})

app.get('/compare/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await SyncService.compareContact(id);
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