import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import * as authService from "../services/firebase-auth";

interface FirebaseAuthContextType {
  currentUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<FirebaseUser>;
  loginWithEmail: (email: string, password: string) => Promise<FirebaseUser>;
  loginWithGoogle: () => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(
  undefined
);

export function FirebaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes when the component mounts
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Register with email and password
  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setError(null);
    try {
      return await authService.registerWithEmail(email, password, displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  };

  // Login with email and password
  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      return await authService.loginWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setError(null);
    try {
      return await authService.loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    }
  };

  // Send password reset email
  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      await authService.sendPasswordReset(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset failed");
      throw err;
    }
  };

  // Update profile
  const updateProfile = async (displayName: string) => {
    setError(null);
    try {
      await authService.updateUserProfile(displayName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profile update failed");
      throw err;
    }
  };

  // Update email
  const updateEmail = async (email: string) => {
    setError(null);
    try {
      await authService.updateUserEmail(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email update failed");
      throw err;
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    setError(null);
    try {
      await authService.updateUserPassword(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed");
      throw err;
    }
  };

  const value = {
    currentUser,
    isLoading,
    error,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updateProfile,
    updateEmail,
    updatePassword,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider"
    );
  }
  return context;
}
