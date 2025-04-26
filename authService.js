// authService.js
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { auth } from './firebase';

// Google sign-in
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Monitor auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};