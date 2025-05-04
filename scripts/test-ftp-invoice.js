import { FtpService } from '../api/services/ftpService.js';
import { FirestoreStorageService } from '../api/services/firebase/storageService.js';
import fs from 'fs';
import path from 'path';

async function testFtpInvoicePdf() {
  try {
    // Référence de facture à tester (basée sur notre exploration précédente)
    const invoiceRef = 'FA2504-0009';
    
    console.log(`Test de récupération du PDF pour la facture ${invoiceRef} via FTP...`);
    
    // Récupérer le PDF via FTP
    const pdfData = await FtpService.getInvoicePdf(invoiceRef);
    
    console.log(`PDF récupéré avec succès, taille: ${pdfData.length} octets`);
    
    // Créer un dossier temporaire pour sauvegarder le PDF localement pour vérification
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Sauvegarder le PDF localement
    const localPath = path.join(tempDir, `${invoiceRef}-test.pdf`);
    fs.writeFileSync(localPath, pdfData);
    console.log(`PDF sauvegardé localement à: ${localPath}`);
    
    // Tester le téléchargement vers Firebase Storage
    console.log('Test de téléchargement vers Firebase Storage...');
    const uploadResult = await FirestoreStorageService.uploadInvoicePdf(invoiceRef, pdfData);
    
    console.log('Résultat du téléchargement:', uploadResult);
    
    return {
      success: true,
      message: `PDF récupéré et téléchargé avec succès`,
      localPath,
      uploadResult
    };
  } catch (error) {
    console.error('Erreur lors du test FTP:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exécuter le test
testFtpInvoicePdf()
  .then(result => console.log('Résultat final:', result))
  .catch(error => console.error('Erreur non gérée:', error));
