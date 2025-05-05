import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { app } from '../firebase/config';
import { 
  authenticateWithBackend, 
  logoutFromBackend,
  getCurrentUser as getBackendUser
} from '../services/authBridge';

// Create the auth context
const AuthContext = createContext();

// Create a hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [backendUser, setBackendUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  // Signup function
  async function signup(email, password) {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Authenticate with backend
      await authenticateWithBackend(userCredential.user);
      
      // Get user info from backend
      const backendUserData = await getBackendUser();
      setBackendUser(backendUserData);
      
      return userCredential;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      // Login with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Authenticate with backend
      await authenticateWithBackend(userCredential.user);
      
      // Get user info from backend
      const backendUserData = await getBackendUser();
      setBackendUser(backendUserData);
      
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      // Logout from backend first
      await logoutFromBackend();
      
      // Then logout from Firebase
      await signOut(auth);
      
      // Clear backend user
      setBackendUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Reset password function
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update user profile
  function updateUserProfile(user, data) {
    return updateProfile(user, data);
  }

  // Google sign in
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      
      // Sign in with Google via Firebase
      const userCredential = await signInWithPopup(auth, provider);
      
      // Authenticate with backend
      await authenticateWithBackend(userCredential.user);
      
      // Get user info from backend
      const backendUserData = await getBackendUser();
      setBackendUser(backendUserData);
      
      return userCredential;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Authenticate with backend on page refresh or initial load
          await authenticateWithBackend(user);
          
          // Get user info from backend
          const backendUserData = await getBackendUser();
          setBackendUser(backendUserData);
        } catch (error) {
          console.error("Error authenticating with backend:", error);
        }
      } else {
        setBackendUser(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [auth]);

  // Context value
  const value = {
    currentUser,
    backendUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}