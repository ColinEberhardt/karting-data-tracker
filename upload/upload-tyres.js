#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Firebase Admin SDK imports
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CSV parsing function
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    return obj;
  });
}

// Function to convert CSV data to Firestore tyre format
function convertToTyreFormat(csvRecord, userId) {
  // Convert retired field from Y/N to boolean
  const retired = csvRecord.retired?.toUpperCase() === 'Y';

  return {
    userId: userId,
    name: csvRecord.ID || 'Unknown',
    make: csvRecord.Make || '',
    type: csvRecord.Type || '',
    description: csvRecord.Description || '',
    retired: retired,
    createdAt: new Date(),
    // Add import metadata
    importedFrom: 'csv',
    importedAt: new Date()
  };
}

async function uploadTyres() {
  try {
    console.log('Initializing Firebase Admin...');
    
    // Load service account credentials
    const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'karting-tracker-59e58'
    });
    
    const db = getFirestore(app);

    console.log('Reading CSV file...');
    const csvPath = join(__dirname, 'Logbook - Tyres.csv');
    const csvContent = readFileSync(csvPath, 'utf8');
    
    console.log('Parsing CSV data...');
    const csvData = parseCSV(csvContent);
    console.log(`Found ${csvData.length} records`);

    // You'll need to specify the user ID for whom to import the tyres
    // This could be passed as a command line argument or hardcoded for your use
    const userId = process.argv[2];
    
    if (!userId) {
      console.error('Please provide a user ID as the first argument:');
      console.error('node upload-tyres.js YOUR_USER_ID');
      process.exit(1);
    }

    console.log(`Converting data for user: ${userId}`);
    const tyres = csvData.map(record => convertToTyreFormat(record, userId));

    console.log('Uploading to Firestore...');
    const batch = db.batch();
    
    tyres.forEach(tyre => {
      const docRef = db.collection('tyres').doc();
      batch.set(docRef, tyre);
    });

    await batch.commit();
    console.log(`Successfully uploaded ${tyres.length} tyres!`);
    
    // Display summary
    console.log('\n--- Upload Summary ---');
    console.log(`Total tyres: ${tyres.length}`);
    console.log(`Retired tyres: ${tyres.filter(t => t.retired).length}`);
    console.log(`Active tyres: ${tyres.filter(t => !t.retired).length}`);
    
    // Show makes and types
    const makes = [...new Set(tyres.map(t => t.make))];
    const types = [...new Set(tyres.map(t => t.type))];
    console.log(`Makes: ${makes.join(', ')}`);
    console.log(`Types: ${types.join(', ')}`);

  } catch (error) {
    console.error('Error uploading tyres:', error);
    process.exit(1);
  }
}

// Run the upload
uploadTyres();