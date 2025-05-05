// authService.js
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { auth, getCurrentUser } from "./firebase";

// Google sign-in
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // Format user data to include id property for consistency
    return formatUserData(result.user);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Monitor auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    // Format user data to include id property for consistency
    callback(user ? formatUserData(user) : null);
  });
};

// Get current user with formatted data
export const getCurrentAuthUser = async () => {
  try {
    const user = await getCurrentUser();
    return user ? formatUserData(user) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Format Firebase user to include id property (mapping uid → id)
const formatUserData = (firebaseUser) => {
  if (!firebaseUser) return null;

  return {
    ...firebaseUser,
    id: firebaseUser.uid, // Map Firebase uid to id for consistency across the app
  };
};
