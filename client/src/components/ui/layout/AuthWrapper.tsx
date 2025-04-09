import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

/**
 * AuthWrapper is a component that wraps the entire application
 * and handles routing based on authentication state:
 * - Redirects first-time users who try to access dashboard to pathways
 * - Redirects returning users who try to access root to dashboard
 */
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isFirstTimeUser } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If at root path '/' and logged in, redirect appropriately
    if (location === '/') {
      if (isAuthenticated) {
        // First-time users go to Pathways, returning users go to Dashboard
        setLocation(isFirstTimeUser ? '/pathways' : '/dashboard');
      }
    } 
    // If trying to access dashboard as first-time user, redirect to pathways
    else if (location === '/dashboard' && isAuthenticated && isFirstTimeUser) {
      setLocation('/pathways');
    }
    // If trying to access private routes without authentication
    else if (!isAuthenticated && !["/", "/login", "/signup"].includes(location)) {
      setLocation('/login');
    }
  }, [location, isAuthenticated, isFirstTimeUser, setLocation]);

  return <>{children}</>;
};

export default AuthWrapper;