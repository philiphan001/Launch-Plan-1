import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/firebase-auth';

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
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [firebaseLoading, setFirebaseLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // Listen to Firebase auth state changes directly
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setFirebaseUser(currentUser);
      setFirebaseLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // On component mount, check if user is authenticated with the server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If there's a token in localStorage, use it
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
          
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
            setIsFirstTimeUser(!!userData.isFirstTimeUser);
            return;
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            setToken(null);
          }
        }
        
        // No valid token, default to not authenticated
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        // If there's an error, ensure user is logged out
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
        localStorage.removeItem('authToken');
        setToken(null);
      }
    };
    
    checkAuth();
  }, []);
  
  // When Firebase auth state changes, connect it to our backend
  useEffect(() => {
    const syncFirebaseAuth = async () => {
      if (firebaseLoading) return;
      
      // If Firebase has a user but we don't have a session, create one
      if (firebaseUser && !isAuthenticated) {
        try {
          // Get ID token from Firebase
          const idToken = await firebaseUser.getIdToken();
          
          // Send to our backend to create/validate session
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              setUser(data.user);
              setIsAuthenticated(true);
              setIsFirstTimeUser(!!data.user.isFirstTimeUser);
              
              // Store token for future requests
              localStorage.setItem('authToken', data.token);
              setToken(data.token);
            }
          } else {
            console.error('Failed to create session with Firebase token');
          }
        } catch (error) {
          console.error('Error syncing Firebase auth with backend:', error);
        }
      }
    };
    
    syncFirebaseAuth();
  }, [firebaseUser, firebaseLoading, isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!data.user.isFirstTimeUser);
      
      // Store token
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const signup = async (credentials: RegisterCredentials) => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });
      
      // Get the response body whether the request succeeded or failed
      const responseData = await response.json();
      
      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage = responseData.message || responseData.details || 'Registration failed';
        console.error('Server returned error:', responseData);
        throw new Error(errorMessage);
      }
      
      // Use the successful response data
      setUser(responseData.user);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true); // New users are always first-time users
      
      // Store token
      if (responseData.token) {
        localStorage.setItem('authToken', responseData.token);
        setToken(responseData.token);
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state, even if server request fails
      setUser(null);
      setIsAuthenticated(false);
      setIsFirstTimeUser(false);
      localStorage.removeItem('authToken');
      setToken(null);
    }
  };
  
  const completeOnboarding = async () => {
    try {
      if (user) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/users/complete-onboarding', {
          method: 'POST',
          headers,
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update onboarding status');
        }

        const data = await response.json();
        
        if (data.success && data.user) {
          setIsFirstTimeUser(false);
          setUser({
            ...data.user,
            isFirstTimeUser: false
          });
        } else {
          throw new Error(data.message || 'Failed to update onboarding status');
        }
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isFirstTimeUser,
        login, 
        signup, 
        logout,
        completeOnboarding
      }}
    >
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
export type { User, LoginCredentials, RegisterCredentials, AuthContextType };