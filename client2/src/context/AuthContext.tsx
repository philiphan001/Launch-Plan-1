import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

// User interface that matches what the backend returns
export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isFirstTimeUser?: boolean;
}

// Login request body interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Registration request body interface
export interface RegisterCredentials {
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
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: RegisterCredentials) => Promise<User>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<boolean>;
  updateUser: (data: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [_, setLocation] = useLocation();

  // Helper function to handle API errors
  const handleApiError = async (response: Response) => {
    let errorMessage = 'An error occurred';
    try {
      const data = await response.json();
      errorMessage = data.message || data.details || errorMessage;
    } catch {
      errorMessage = await response.text() || errorMessage;
    }
    throw new Error(errorMessage);
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          setIsFirstTimeUser(!!userData.isFirstTimeUser);
        } else {
          throw await handleApiError(response);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!userData.isFirstTimeUser);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (credentials: RegisterCredentials): Promise<User> => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true); // New users are always first-time users
      return userData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsFirstTimeUser(false);
      setLocation('/');
    }
  }, [setLocation]);

  const completeOnboarding = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      const data = await response.json();
      if (data.success && data.user) {
        setUser(data.user);
        setIsFirstTimeUser(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  }, [user]);

  const updateUser = useCallback(async (data: Partial<User>): Promise<User> => {
    if (!user) throw new Error('Not authenticated');

    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        throw await handleApiError(response);
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isFirstTimeUser,
    isLoading,
    login,
    signup,
    logout,
    completeOnboarding,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export interfaces for use in other files
export type { AuthContextType };