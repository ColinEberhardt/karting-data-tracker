import { writable } from 'svelte/store';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Create a writable store for the current user
export const user = writable(null);
export const loading = writable(true);

// Listen for authentication state changes
onAuthStateChanged(auth, (currentUser) => {
  user.set(currentUser);
  loading.set(false);
});

// Helper function to check if user is admin
export const isAdmin = (user) => {
  return user?.email === 'admin@example.com' || user?.customClaims?.admin === true;
};
