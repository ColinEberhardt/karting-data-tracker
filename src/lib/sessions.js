import { db, auth } from './firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// Add a new session
export const addSession = async (sessionData) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to add sessions');
  }

  try {
    const processedData = {
      userId: auth.currentUser.uid,
      // Session information
      date: new Date(sessionData.date),
      circuitId: sessionData.circuitId,
      temp: parseFloat(sessionData.temp),
      condition: sessionData.condition,
      session: sessionData.session,
      
      // Equipment setup
      tyreId: sessionData.tyreId,
      engineId: sessionData.engineId,
      
      // Kart setup
      rearSprocket: parseInt(sessionData.rearSprocket),
      frontSprocket: parseInt(sessionData.frontSprocket),
      caster: sessionData.caster,
      rideHeight: sessionData.rideHeight,
      jet: parseInt(sessionData.jet),
      rearInner: parseFloat(sessionData.rearInner),
      rearOuter: parseFloat(sessionData.rearOuter),
      frontInner: parseFloat(sessionData.frontInner),
      frontOuter: parseFloat(sessionData.frontOuter),
      
      // Session results
      laps: parseInt(sessionData.laps),
      fastest: sessionData.fastest ? parseFloat(sessionData.fastest) : null,
      
      // Race information (optional)
      isRace: sessionData.isRace || false,
      entries: sessionData.entries ? parseInt(sessionData.entries) : null,
      startPos: sessionData.startPos ? parseInt(sessionData.startPos) : null,
      endPos: sessionData.endPos ? parseInt(sessionData.endPos) : null,
      penalties: sessionData.penalties || null,
      notes: sessionData.notes || null,
      
      createdAt: new Date()
    };

    await addDoc(collection(db, 'sessions'), processedData);
  } catch (error) {
    console.error('Error adding session:', error);
    throw error;
  }
};

// Get user's sessions
export const getUserSessions = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to view sessions');
  }

  try {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting sessions:', error);
    throw error;
  }
};

// Update a session
export const updateSession = async (sessionId, sessionData) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update sessions');
  }

  try {
    const processedData = {
      // Session information
      date: new Date(sessionData.date),
      circuitId: sessionData.circuitId,
      temp: parseFloat(sessionData.temp),
      condition: sessionData.condition,
      session: sessionData.session,
      
      // Equipment setup
      tyreId: sessionData.tyreId,
      engineId: sessionData.engineId,
      
      // Kart setup
      rearSprocket: parseInt(sessionData.rearSprocket),
      frontSprocket: parseInt(sessionData.frontSprocket),
      caster: sessionData.caster,
      rideHeight: sessionData.rideHeight,
      jet: parseInt(sessionData.jet),
      rearInner: parseFloat(sessionData.rearInner),
      rearOuter: parseFloat(sessionData.rearOuter),
      frontInner: parseFloat(sessionData.frontInner),
      frontOuter: parseFloat(sessionData.frontOuter),
      
      // Session results
      laps: parseInt(sessionData.laps),
      fastest: sessionData.fastest ? parseFloat(sessionData.fastest) : null,
      
      // Race information (optional)
      isRace: sessionData.isRace || false,
      entries: sessionData.entries ? parseInt(sessionData.entries) : null,
      startPos: sessionData.startPos ? parseInt(sessionData.startPos) : null,
      endPos: sessionData.endPos ? parseInt(sessionData.endPos) : null,
      penalties: sessionData.penalties || null,
      notes: sessionData.notes || null,
      
      updatedAt: new Date()
    };

    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, processedData);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
};

// Delete a session
export const deleteSession = async (sessionId) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to delete sessions');
  }

  try {
    await deleteDoc(doc(db, 'sessions', sessionId));
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};
