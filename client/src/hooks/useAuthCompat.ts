// This file provides a compatibility layer between our prop-based and context-based auth systems
import { useContext } from 'react';
import { AuthContext, type AuthContextType, type User } from '../context/AuthContext';

// This hook will first try to use the auth context 
// If that fails, it will return a default "not logged in" state
export function useAuthCompat(): AuthContextType {
  try {
    // Try to get context if available
    const context = useContext(AuthContext);
    if (context) {
      return context;
    }
  } catch (e) {
    console.warn('Auth context not available, using default state');
  }
  
  // Default state when context is unavailable
  return {
    user: null,
    isAuthenticated: false,
    isFirstTimeUser: false,
    login: async () => { 
      console.warn('Auth system not initialized'); 
      throw new Error('Auth system not initialized');
    },
    signup: async () => { 
      console.warn('Auth system not initialized'); 
      throw new Error('Auth system not initialized');
    },
    logout: async () => { 
      console.warn('Auth system not initialized');
    },
    completeOnboarding: async () => { 
      console.warn('Auth system not initialized');
    }
  };
}

// Export the same types as from AuthContext for convenience
export type { User, AuthContextType };