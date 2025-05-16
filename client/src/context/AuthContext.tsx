import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUserAsync,
  loginWithEmail as firebaseLogin,
  logout as firebaseLogout,
  registerWithEmail,
  ensureServerSession,
} from "../services/firebase-auth";
import { authEvents, AUTH_EVENTS } from '../utils/auth-events';
import { authStorage, AUTH_STORAGE_KEYS } from '../utils/auth-storage';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { getApiUrl } from '../config/api';

// User interface that matches what the backend returns
interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isFirstTimeUser?: boolean;
}

// Login request body interface
interface LoginCredentials {
  username: string;
  password: string;
}

// Registration request body interface
interface RegisterCredentials {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isFirstTimeUser: boolean;
  authLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Listen for session creation events from FirebaseAuthContext
    const sessionCreatedUnsubscribe = authEvents.on(
      AUTH_EVENTS.SESSION_CREATED,
      ({ user }) => {
        setUser(user);
        setIsAuthenticated(true);
        setIsFirstTimeUser(!!user.isFirstTimeUser);
      }
    );
    // Listen for logout events
    const logoutInitiatedUnsubscribe = authEvents.on(
      AUTH_EVENTS.LOGOUT_INITIATED,
      () => {
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
      }
    );
    return () => {
      sessionCreatedUnsubscribe();
      logoutInitiatedUnsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);
        // Try to get Firebase user first to ensure it's initialized
        const firebaseUser = await getCurrentUserAsync();
        if (firebaseUser) {
          await ensureServerSession();
        }
        let headers = {};
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          headers = { Authorization: `Bearer ${token}` };
        }
        const response = await fetch(getApiUrl("/api/auth/me"), {
          headers,
          credentials: "include",
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("[DEBUG] User data received:", userData);
          setUser(userData);
          setIsAuthenticated(true);
          setIsFirstTimeUser(!!userData.isFirstTimeUser);
        } else {
          console.log("[DEBUG] Auth check failed:", response.status);
          setUser(null);
          setIsAuthenticated(false);
          setIsFirstTimeUser(false);
        }
      } catch (error) {
        console.error("[DEBUG] Auth check error:", error);
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
      } finally {
        setAuthLoading(false);
        setHydrated(true);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // Use Firebase to login first
      const firebaseUser = await firebaseLogin(
        credentials.username,
        credentials.password
      );

      // Get the Firebase token
      const token = await firebaseUser.getIdToken();

      // Then authenticate with our server using the token
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const userData = await response.json();

      // Ensure server session and DB user creation
      await ensureServerSession();

      setUser(userData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!userData.isFirstTimeUser);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signup = async (credentials: RegisterCredentials) => {
    try {
      // Register with Firebase first
      const firebaseUser = await registerWithEmail(
        credentials.email || "",
        credentials.password,
        credentials.firstName || ""
      );

      // Get the Firebase token
      const token = await firebaseUser.getIdToken();

      // Then register with our server using the token
      const response = await fetch(getApiUrl("/api/users/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Important for cookies
      });

      // Get the response body whether the request succeeded or failed
      const responseData = await response.json();

      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage =
          responseData.message || responseData.details || "Registration failed";
        console.error("Server returned error:", responseData);
        throw new Error(errorMessage);
      }

      // Ensure server session and DB user creation
      await ensureServerSession();

      // Use the successful response data
      setUser(responseData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true); // New users are always first-time users
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Delegate to FirebaseAuth for actual logout (which will trigger LOGOUT_INITIATED)
      await firebaseLogout();
    } catch (error) {
      window.location.href = "/";
    }
  };

  const completeOnboarding = async () => {
    try {
      if (user) {
        // Get Firebase token for authentication
        const firebaseUser = await getCurrentUserAsync();
        let headers = {};

        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
        }

        const response = await fetch(getApiUrl("/api/users/complete-onboarding"), {
          method: "POST",
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to update onboarding status");
        }

        const data = await response.json();

        if (data.success && data.user) {
          setIsFirstTimeUser(false);
          setUser({
            ...data.user,
            isFirstTimeUser: false,
          });
        } else {
          throw new Error(data.message || "Failed to update onboarding status");
        }
      }
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      throw error;
    }
  };

  console.log("[DEBUG] Auth context state:", { user, isAuthenticated, isFirstTimeUser, authLoading });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isFirstTimeUser,
        authLoading,
        login,
        signup,
        logout,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export interfaces for use in other files
export type { User, LoginCredentials, RegisterCredentials, AuthContextType };
