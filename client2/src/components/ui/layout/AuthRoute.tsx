import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

interface AuthRouteProps {
  children: React.ReactNode;
}

/**
 * AuthRoute is a component that handles protected routes and redirects based on user authentication state.
 * - Redirects unauthenticated users to the login page
 * - Redirects first-time users who try to access dashboard to pathways
 * - Redirects returning users who try to access root to dashboard
 */
const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
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
  }, [location, isAuthenticated, isFirstTimeUser, setLocation]);

  return <>{children}</>;
};

export default AuthRoute;