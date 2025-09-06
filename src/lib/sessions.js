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
export const addSession = async (dateTime, rearSprocket, frontSprocket, tyreId) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to add sessions');
  }

  try {
    await addDoc(collection(db, 'sessions'), {
      userId: auth.currentUser.uid,
      dateTime: new Date(dateTime),
      rearSprocket: parseInt(rearSprocket),
      frontSprocket: parseInt(frontSprocket),
      tyreId,
      createdAt: new Date()
    });
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
      orderBy('dateTime', 'desc')
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
export const updateSession = async (sessionId, dateTime, rearSprocket, frontSprocket, tyreId) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update sessions');
  }

  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, {
      dateTime: new Date(dateTime),
      rearSprocket: parseInt(rearSprocket),
      frontSprocket: parseInt(frontSprocket),
      tyreId,
      updatedAt: new Date()
    });
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
