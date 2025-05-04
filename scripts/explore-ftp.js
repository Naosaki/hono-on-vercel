import { Client } from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

async function exploreFTP() {
  const client = new Client();
  client.ftp.verbose = true;
  
  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST,
      port: parseInt(process.env.FTP_PORT),
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE === 'true'
    });
    
    // Navigate to a specific invoice directory (FA2504-0009)
    console.log('\nNavigating to /facture/FA2504-0009...');
    await client.cd('/facture/FA2504-0009');
    const invoiceFiles = await client.list();
    console.log('FA2504-0009 directory contents:');
    invoiceFiles.forEach(item => {
      console.log(`${item.type} ${item.name}`);
    });
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.close();
    console.log('FTP connection closed');
  }
}

exploreFTP();
