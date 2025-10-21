#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Firebase Admin SDK imports
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
console.log('Initializing Firebase Admin...');
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'service-account-key.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Function to fetch historical weather data from Open-Meteo API
async function fetchHistoricalWeather(latitude, longitude, date) {
  try {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Open-Meteo Historical Weather API
    // Using hourly data to get the closest weather conditions to the session time
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dateStr}&end_date=${dateStr}&hourly=weather_code,temperature_2m&timezone=auto`;
    
    console.log(`  Fetching weather for ${dateStr} at (${latitude}, ${longitude})...`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.hourly || !data.hourly.weather_code || data.hourly.weather_code.length === 0) {
      console.warn(`  No weather data available for ${dateStr}`);
      return null;
    }
    
    // Find the closest hour to the session time
    const sessionHour = date.getHours();
    const weatherCode = data.hourly.weather_code[sessionHour] || data.hourly.weather_code[0];
    const temperature = data.hourly.temperature_2m[sessionHour] || data.hourly.temperature_2m[0];
    
    return {
      weatherCode,
      temperature
    };
  } catch (error) {
    console.error(`  Error fetching weather: ${error.message}`);
    return null;
  }
}

// Function to get track details
async function getTrack(db, trackId) {
  try {
    const trackDoc = await db.collection('tracks').doc(trackId).get();
    if (!trackDoc.exists) {
      throw new Error(`Track ${trackId} not found`);
    }
    return trackDoc.data();
  } catch (error) {
    throw new Error(`Failed to get track: ${error.message}`);
  }
}

// Function to update session with weather data
async function updateSessionWeather(db, sessionId, weatherCode, temperature) {
  try {
    await db.collection('sessions').doc(sessionId).update({
      weatherCode: weatherCode,
      temp: temperature,
      updatedAt: new Date()
    });
    console.log(`  ✓ Updated session ${sessionId} with weather code ${weatherCode}`);
  } catch (error) {
    console.error(`  ✗ Failed to update session ${sessionId}: ${error.message}`);
  }
}

// Main function
async function updateAllSessions() {
  console.log('\n=== Starting Session Weather Update ===\n');
  
  try {
    // Get all sessions
    console.log('Fetching all sessions...');
    const sessionsSnapshot = await db.collection('sessions').get();
    console.log(`Found ${sessionsSnapshot.size} sessions\n`);
    
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    
    // Track cache to avoid fetching the same track multiple times
    const trackCache = new Map();
    
    for (const sessionDoc of sessionsSnapshot.docs) {
      const sessionId = sessionDoc.id;
      const session = sessionDoc.data();
      
      console.log(`\nProcessing session ${sessionId}...`);
      
      // Skip if no date or circuitId
      if (!session.date || !session.circuitId) {
        console.log('  ⊗ Skipping: Missing date or circuit ID');
        skipped++;
        continue;
      }
      
      // Skip if already has weatherCode
      if (session.weatherCode !== null && session.weatherCode !== undefined) {
        console.log(`  ⊗ Skipping: Already has weather code ${session.weatherCode}`);
        skipped++;
        continue;
      }
      
      try {
        // Get track details (use cache if available)
        let track;
        if (trackCache.has(session.circuitId)) {
          track = trackCache.get(session.circuitId);
          console.log(`  Using cached track data for ${session.circuitId}`);
        } else {
          track = await getTrack(db, session.circuitId);
          trackCache.set(session.circuitId, track);
          console.log(`  Track: ${track.name}`);
        }
        
        // Check if track has location data
        if (!track.latitude || !track.longitude) {
          console.log('  ⊗ Skipping: Track has no location data');
          skipped++;
          continue;
        }
        
        // Convert Firestore Timestamp to Date if needed
        const sessionDate = session.date.toDate ? session.date.toDate() : new Date(session.date);
        console.log(`  Session date: ${sessionDate.toISOString()}`);
        
        // Fetch historical weather
        const weather = await fetchHistoricalWeather(
          track.latitude,
          track.longitude,
          sessionDate
        );
        
        if (weather && weather.weatherCode !== null && weather.weatherCode !== undefined) {
          // Update session with weather data
          await updateSessionWeather(db, sessionId, weather.weatherCode, weather.temperature);
          updated++;
          
          // Add a small delay to avoid rate limiting (600 calls per minute = ~100ms per call)
          await new Promise(resolve => setTimeout(resolve, 150));
        } else {
          console.log('  ⊗ Skipping: No weather data available');
          failed++;
        }
      } catch (error) {
        console.error(`  ✗ Error processing session: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n=== Update Complete ===');
    console.log(`Total sessions: ${sessionsSnapshot.size}`);
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateAllSessions()
  .then(() => {
    console.log('\nScript completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
