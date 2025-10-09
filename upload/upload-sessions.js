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

// Function to parse different date formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle different date formats
  // Format 1: "2/25/2024" (MM/DD/YYYY)
  // Format 2: "2/9/2025 9:00:00" (MM/DD/YYYY HH:MM:SS)
  // Format 3: Unix timestamp like "1748595457138"
  
  // Check if it's a Unix timestamp (all digits and very large number)
  if (/^\d{13}$/.test(dateStr)) {
    return new Date(parseInt(dateStr));
  }
  
  // Try to parse as regular date
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return null;
}

// Function to find a track
async function findTrack(db, trackName, userId) {
  if (!trackName) {
    throw new Error('Track name is required');
  }
  
  try {
    // Try to find existing track
    const tracksSnapshot = await db.collection('tracks')
      .where('userId', '==', userId)
      .where('name', '==', trackName)
      .get();
    
    if (!tracksSnapshot.empty) {
      return tracksSnapshot.docs[0].id;
    }
    
    throw new Error(`Track '${trackName}' not found`);
  } catch (error) {
    throw new Error(`Failed to find track '${trackName}': ${error.message}`);
  }
}

// Function to find a tyre
async function findTyre(db, tyreName, userId) {
  if (!tyreName) {
    throw new Error('Tyre name is required');
  }
  
  try {
    // Try to find existing tyre
    const tyresSnapshot = await db.collection('tyres')
      .where('userId', '==', userId)
      .where('name', '==', tyreName)
      .get();
    
    if (!tyresSnapshot.empty) {
      return tyresSnapshot.docs[0].id;
    }
    
    throw new Error(`Tyre '${tyreName}' not found`);
  } catch (error) {
    throw new Error(`Failed to find tyre '${tyreName}': ${error.message}`);
  }
}

// Function to find an engine
async function findEngine(db, engineName, userId) {
  if (!engineName) {
    throw new Error('Engine name is required');
  }
  
  try {
    // Try to find existing engine
    const enginesSnapshot = await db.collection('engines')
      .where('userId', '==', userId)
      .where('name', '==', engineName)
      .get();
    
    if (!enginesSnapshot.empty) {
      return enginesSnapshot.docs[0].id;
    }
    
    throw new Error(`Engine '${engineName}' not found`);
  } catch (error) {
    throw new Error(`Failed to find engine '${engineName}': ${error.message}`);
  }
}

// Function to convert CSV data to Firestore session format
async function convertToSessionFormat(csvRecord, userId, db) {
  // Parse the date
  const sessionDate = parseDate(csvRecord.Date);
  
  // Get foreign key references - these will throw errors if they fail
  const circuitId = await findTrack(db, csvRecord.Circuit, userId);
  const tyreId = await findTyre(db, csvRecord.Tyres, userId);
  const engineId = await findEngine(db, csvRecord.Engine, userId);
  
  // Parse numeric values safely
  const parseFloat_ = (value) => {
    if (!value || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };
  
  const parseInt_ = (value) => {
    if (!value || value === '') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };

  return {
    userId: userId,
    
    // Session information
    date: sessionDate,
    circuitId: circuitId,
    temp: parseFloat_(csvRecord.Temp),
    condition: csvRecord.Condition || '',
    session: csvRecord.Session || '',
    
    // Equipment setup
    tyreId: tyreId,
    engineId: engineId,
    
    // Kart setup
    rearSprocket: parseInt_(csvRecord['Rear Sprocket']),
    frontSprocket: parseInt_(csvRecord['Front Sprocket']),
    caster: csvRecord.Caster || '',
    rideHeight: csvRecord['Ride Height'] || '',
    jet: parseInt_(csvRecord.Jet),
    rearInner: parseFloat_(csvRecord['Rear inner']),
    rearOuter: parseFloat_(csvRecord['Rear outer']),
    frontInner: parseFloat_(csvRecord['Front inner']),
    frontOuter: parseFloat_(csvRecord['Front outer']),
    
    // Session results
    laps: parseInt_(csvRecord.Laps),
    fastest: parseFloat_(csvRecord.Fastest),
    
    // Race information (optional)
    isRace: csvRecord.Race === 'Y',
    entries: parseInt_(csvRecord.Entries),
    startPos: parseInt_(csvRecord['Start Pos']),
    endPos: parseInt_(csvRecord['End Pos']),
    penalties: csvRecord.Penalities || null, // Note: CSV has typo "Penalities"
    notes: csvRecord.Notes || null,
    
    // Import metadata
    importedFrom: 'csv',
    importedAt: new Date(),
    csvId: csvRecord.ID,
    createdAt: new Date()
  };
}

async function uploadSessions() {
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
    const csvPath = join(__dirname, 'Logbook - Log.csv');
    const csvContent = readFileSync(csvPath, 'utf8');
    
    console.log('Parsing CSV data...');
    const csvData = parseCSV(csvContent);
    console.log(`Found ${csvData.length} records`);

    // You'll need to specify the user ID for whom to import the sessions
    const userId = process.argv[2];
    
    if (!userId) {
      console.error('Please provide a user ID as the first argument:');
      console.error('node upload-sessions.js YOUR_USER_ID');
      process.exit(1);
    }

    console.log(`Converting data for user: ${userId}`);
    
    // Convert sessions one by one to handle async operations for foreign keys
    const sessions = [];
    const skippedRecords = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const record = csvData[i];
      console.log(`Processing session ${i + 1}/${csvData.length}: ${record.Session} at ${record.Circuit}`);
      
      try {
        const sessionData = await convertToSessionFormat(record, userId, db);
        sessions.push(sessionData);
      } catch (error) {
        console.error(`❌ SKIPPING ROW ${i + 1} (ID: ${record.ID}): ${error.message}`);
        console.error(`   Session: ${record.Session} at ${record.Circuit}`);
        console.error(`   Tyres: ${record.Tyres}, Engine: ${record.Engine}`);
        
        skippedRecords.push({
          rowNumber: i + 1,
          csvId: record.ID,
          session: record.Session,
          circuit: record.Circuit,
          tyres: record.Tyres,
          engine: record.Engine,
          error: error.message
        });
        
        // Continue with other records
      }
    }

    console.log(`Successfully processed ${sessions.length} sessions`);
    if (skippedRecords.length > 0) {
      console.log(`⚠️  Skipped ${skippedRecords.length} sessions due to errors`);
    }
    console.log('Uploading to Firestore...');
    
    // Upload in batches (Firestore batch limit is 500)
    const batchSize = 500;
    let uploadedCount = 0;
    
    for (let i = 0; i < sessions.length; i += batchSize) {
      const batch = db.batch();
      const batchSessions = sessions.slice(i, i + batchSize);
      
      batchSessions.forEach(session => {
        const docRef = db.collection('sessions').doc();
        batch.set(docRef, session);
      });

      await batch.commit();
      uploadedCount += batchSessions.length;
      console.log(`Uploaded batch: ${uploadedCount}/${sessions.length} sessions`);
    }

    console.log(`Successfully uploaded ${uploadedCount} sessions!`);
    
    // Display summary
    console.log('\n--- Upload Summary ---');
    console.log(`Total sessions processed: ${csvData.length}`);
    console.log(`Sessions uploaded: ${sessions.length}`);
    console.log(`Sessions skipped: ${skippedRecords.length}`);
    console.log(`Race sessions: ${sessions.filter(s => s.isRace).length}`);
    console.log(`Practice sessions: ${sessions.filter(s => !s.isRace).length}`);
    
    // Show circuits
    const circuits = [...new Set(sessions.map(s => s.circuitId).filter(Boolean))];
    console.log(`Circuits used: ${circuits.length}`);
    
    // Show date range
    const dates = sessions.map(s => s.date).filter(Boolean);
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      console.log(`Date range: ${minDate.toDateString()} to ${maxDate.toDateString()}`);
    }
    
    // Show skipped records details
    if (skippedRecords.length > 0) {
      console.log('\n--- Skipped Records ---');
      skippedRecords.forEach(record => {
        console.log(`Row ${record.rowNumber} (ID: ${record.csvId}): ${record.error}`);
        console.log(`  Session: ${record.session} at ${record.circuit}`);
        console.log(`  Tyres: ${record.tyres}, Engine: ${record.engine}`);
      });
    }

  } catch (error) {
    console.error('Error uploading sessions:', error);
    process.exit(1);
  }
}

// Run the upload
uploadSessions();