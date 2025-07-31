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

// Add a new tyre
export const addTyre = async (brand, description) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to add tyres');
  }

  try {
    await addDoc(collection(db, 'tyres'), {
      userId: auth.currentUser.uid,
      brand,
      description,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding tyre:', error);
    throw error;
  }
};

// Get user's tyres
export const getUserTyres = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to view tyres');
  }

  try {
    const q = query(
      collection(db, 'tyres'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting tyres:', error);
    throw error;
  }
};

// Get all tyres (admin only)
export const getAllTyres = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in');
  }

  try {
    const q = query(collection(db, 'tyres'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all tyres:', error);
    throw error;
  }
};

// Update a tyre
export const updateTyre = async (tyreId, brand, description) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update tyres');
  }

  try {
    const tyreRef = doc(db, 'tyres', tyreId);
    await updateDoc(tyreRef, {
      brand,
      description,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating tyre:', error);
    throw error;
  }
};

// Delete a tyre
export const deleteTyre = async (tyreId) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to delete tyres');
  }

  try {
    await deleteDoc(doc(db, 'tyres', tyreId));
  } catch (error) {
    console.error('Error deleting tyre:', error);
    throw error;
  }
};
