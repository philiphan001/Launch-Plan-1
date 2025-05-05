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

      // Store the user data and token in localStorage for persistence
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("authToken", token);

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
      if (!currentUser) {
        console.log("[DEBUG] No user to refresh token for");
        return null;
      }

      console.log("[DEBUG] Getting fresh ID token");
      const token = await currentUser.getIdToken(true);
      console.log("[DEBUG] Token refreshed successfully");

      // Update the stored token
      localStorage.setItem("authToken", token);

      // Also refresh the server session
      try {
        await createServerSession(currentUser);
      } catch (err) {
        console.error("[DEBUG] Error refreshing server session:", err);
      }

      return token;
    } catch (err) {
      console.error("[DEBUG] Token refresh error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to refresh authentication"
      );
      return null;
    }
  };

  // Get fresh token from the service
  const getFreshToken = async (): Promise<string | null> => {
    try {
      return await authService.getFreshToken();
    } catch (err) {
      console.error("[DEBUG] Error getting fresh token:", err);
      return null;
    }
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
      await authService.logout();

      // Clear local storage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("authToken");

      // Also logout from the server
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (logoutErr) {
        console.error("[DEBUG] Error during server logout:", logoutErr);
      }
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
