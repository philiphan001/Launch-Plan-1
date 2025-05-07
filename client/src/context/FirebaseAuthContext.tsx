import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import * as authService from "../services/firebase-auth";
import { authEvents, AUTH_EVENTS } from '../utils/auth-events';
import { authStorage, AUTH_STORAGE_KEYS } from '../utils/auth-storage';
import { tokenService } from '../utils/token-service';

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
  refreshToken: () => Promise<string | null>;
  getFreshToken: () => Promise<string | null>;
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
    console.log("[DEBUG] Setting up Firebase auth state listener");
    const unsubscribe = authService.onAuthStateChange((user) => {
      console.log(
        "[DEBUG] Firebase auth state changed:",
        user ? "User authenticated" : "No user"
      );
      setCurrentUser(user);
      setIsLoading(false);

      // If we have a user, immediately create a session with the server
      if (user) {
        createServerSession(user).catch((err) => {
          console.error("[DEBUG] Error creating server session:", err);
        });
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Helper to create a session with our server after Firebase authentication
  const createServerSession = async (user: FirebaseUser) => {
    try {
      console.log("[DEBUG] Creating server session for user");
      // Get a fresh token
      const token = await user.getIdToken(true);

      // Create a session with our server
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to create server session: ${response.status}`);
      }

      const data = await response.json();
      console.log("[DEBUG] Server session created successfully:", data.success);

      // Use centralized storage
      authStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, data.user);
      authStorage.setItem(AUTH_STORAGE_KEYS.IS_AUTHENTICATED, true);
      authStorage.setItem(AUTH_STORAGE_KEYS.AUTH_TOKEN, token);
      // Emit event for AuthContext
      authEvents.emit(AUTH_EVENTS.SESSION_CREATED, { user: data.user, token });

      return data;
    } catch (error) {
      console.error("[DEBUG] Failed to create server session:", error);
      throw error;
    }
  };

  // Function to refresh the Firebase token
  const refreshToken = async (): Promise<string | null> => {
    setError(null);
    try {
      return await tokenService.getToken(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh authentication");
      return null;
    }
  };

  // Get fresh token from the service
  const getFreshToken = async (): Promise<string | null> => {
    return tokenService.getToken(false);
  };

  // Register with email and password
  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setError(null);
    try {
      const user = await authService.registerWithEmail(
        email,
        password,
        displayName
      );

      // Create a session with our server after Firebase authentication
      if (user) {
        await createServerSession(user);
      }

      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  };

  // Login with email and password
  const loginWithEmail = async (email: string, password: string) => {
    setError(null);
    try {
      const user = await authService.loginWithEmail(email, password);

      // Create a session with our server after Firebase authentication
      if (user) {
        await createServerSession(user);
      }

      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await authService.loginWithGoogle();

      // The server session will be created by the auth state change listener
      return result.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      // Emit event so AuthContext can respond
      authEvents.emit(AUTH_EVENTS.LOGOUT_INITIATED);
      await authService.logout();
      authStorage.clear();
      tokenService.clearToken();
      authEvents.emit(AUTH_EVENTS.LOGOUT_COMPLETED);
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
    refreshToken,
    getFreshToken,
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
