import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import FinancialProjections from "@/pages/FinancialProjections";
import CareerExploration from "@/pages/CareerExploration";
import CareerBuilder from "@/pages/CareerBuilder";
import CollegeDiscovery from "@/pages/CollegeDiscovery";
import NetPriceCalculator from "@/pages/NetPriceCalculator";
import Pathways from "@/pages/Pathways";
import CoffeeCalculator from "@/pages/CoffeeCalculator";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/ui/layout/AppShell";

import { User, AuthProps, RegisterCredentials } from "@/interfaces/auth";

function App() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // On mount, check if user is authenticated with the server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAuthenticated(true);
          setIsFirstTimeUser(!!userData.isFirstTimeUser);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
        // If there's an error, ensure user is logged out
        setUser(null);
        setIsAuthenticated(false);
        setIsFirstTimeUser(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Auth context values and functions
  const login = async (credentials: { username: string; password: string }) => {
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
      
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!userData.isFirstTimeUser);
      return userData;
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
      setUser(responseData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true); // New users are always first-time users
      return responseData;
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
      // Even if the server request fails, clean up the frontend state
      setUser(null);
      setIsAuthenticated(false);
      setIsFirstTimeUser(false);
      setLocation('/');
    }
  };
  
  const completeOnboarding = async () => {
    if (user) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isFirstTimeUser: false }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to update user profile');
        }
        
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsFirstTimeUser(false);
        return true;
      } catch (error) {
        console.error('Error updating onboarding status:', error);
        // Fallback to local update if server update fails
        setIsFirstTimeUser(false);
        return false;
      }
    }
    return false;
  };
  
  // Check if user has any saved financial projections
  const [hasSavedProjections, setHasSavedProjections] = useState(false);
  
  // Check for saved projections when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Fetch saved projections to determine if user has any
      fetch(`/api/financial-projections/${user.id}`)
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          return [];
        })
        .then(projections => {
          const hasProjections = Array.isArray(projections) && projections.length > 0;
          setHasSavedProjections(hasProjections);
          console.log("User has saved projections:", hasProjections);
        })
        .catch(error => {
          console.error("Error checking for projections:", error);
          setHasSavedProjections(false);
        });
    } else {
      setHasSavedProjections(false);
    }
  }, [isAuthenticated, user]);

  // Handle navigation based on auth status
  useEffect(() => {
    console.log(
      "Navigation effect triggered - Location:", location, 
      "Auth:", isAuthenticated, 
      "FirstTime:", isFirstTimeUser,
      "HasProjections:", hasSavedProjections
    );
    
    // Check if we're navigating with query parameters (like projections?id=123)
    const hasQueryParams = window.location.search !== '';
    
    // If at root path '/' and logged in, redirect appropriately, but only if there are no query parameters
    if (location === '/' && !hasQueryParams) {
      if (isAuthenticated) {
        // Logic for redirection:
        // 1. First-time users go to Pathways
        // 2. Users with saved projections go to Dashboard
        // 3. Returning users without saved projections go to Dashboard
        let destination = '/dashboard';
        
        if (isFirstTimeUser && !hasSavedProjections) {
          destination = '/pathways';
        }
        
        console.log(`Redirecting from / to ${destination} based on user status`);
        setLocation(destination);
      }
    } 
    // Allow users to access dashboard even if they're first-time users
    // This was previously redirecting first-time users away from dashboard, which was causing issues
    else if (location === '/dashboard' && isAuthenticated) {
      console.log("User accessing dashboard, allowing access regardless of first-time status");
      // No redirection needed, allow access to dashboard
    }
    // If trying to access protected routes while not authenticated
    else if (!isAuthenticated && 
        !["/", "/login", "/signup"].includes(location) &&
        !(location === '/projections' && window.location.search.includes('id='))) {
      console.log("Redirecting to login from:", location, "Auth status:", isAuthenticated);
      setLocation('/login');
    }
    // After signup or login, we should be authenticated but might get bounced by the redirection logic
    else if (isAuthenticated && ["/login", "/signup"].includes(location)) {
      console.log("User is authenticated but on login/signup page, redirecting to appropriate page");
      setLocation(isFirstTimeUser ? '/pathways' : '/dashboard');
    }
  }, [location, isAuthenticated, isFirstTimeUser, setLocation]);
  
  // Special handling for the projections route with query parameters
  const hasQueryParams = window.location.search !== '';
  if (hasQueryParams && window.location.pathname === '/') {
    const params = new URLSearchParams(window.location.search);
    if (params.has('id')) {
      console.log("Detected projection ID in query parameters:", params.get('id'));
      // Force navigation to projections page
      setLocation(`/projections${window.location.search}`);
    }
  }
  
  // Create auth props object to pass to components that still use prop-based auth
  const authProps: AuthProps = {
    user,
    isAuthenticated,
    isFirstTimeUser,
    login: login,
    signup: signup,
    logout: logout,
    completeOnboarding: completeOnboarding
  };
  
  // Check if the current route should be displayed within the AppShell
  const isPublicRoute = ["/", "/login", "/signup"].includes(location);
  
  // Routes that should be displayed without the AppShell layout
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/">
          {() => <LandingPage {...authProps} />}
        </Route>
        <Route path="/login">
          {() => <LoginPage {...authProps} />}
        </Route>
        <Route path="/signup">
          {() => <SignupPage {...authProps} />}
        </Route>
      </Switch>
    );
  }
  
  // Routes that should be displayed within the AppShell layout
  return (
    <AppShell logout={logout} user={user}>
      <Switch>
        <Route path="/dashboard">
          {() => {
            console.log("Dashboard route rendering", { 
              auth: isAuthenticated, 
              firstTime: isFirstTimeUser,
              user: user
            });
            return <Dashboard {...authProps} />;
          }}
        </Route>
        <Route path="/projections">
          {() => {
            // Get projection ID from URL query parameters
            const params = new URLSearchParams(window.location.search);
            const projectionId = params.get('id');
            const timestamp = params.get('t') || Date.now().toString();
            
            // Log the projection ID detection during routing
            if (projectionId) {
              console.log("App.tsx: Creating new FinancialProjections with ID:", projectionId, "timestamp:", timestamp);
              
              // Always create a completely new component instance on every render with a unique key
              // This forces React to unmount and remount the component, clearing all state
              return <FinancialProjections 
                {...authProps} 
                key={`projection-${projectionId}-${timestamp}`}
                initialProjectionId={Number(projectionId)}
              />;
            }
            
            // For new projections without ID
            console.log("App.tsx: Creating new blank FinancialProjections");
            return <FinancialProjections 
              {...authProps} 
              key={`new-projection-${timestamp}`}
              initialProjectionId={undefined}
            />;
          }}
        </Route>
        <Route path="/careers">
          {() => <CareerExploration {...authProps} />}
        </Route>
        <Route path="/career-builder">
          {() => <CareerBuilder {...authProps} />}
        </Route>
        <Route path="/colleges">
          {() => <CollegeDiscovery {...authProps} />}
        </Route>
        <Route path="/calculator">
          {() => <NetPriceCalculator {...authProps} />}
        </Route>
        <Route path="/pathways">
          {() => <Pathways {...authProps} />}
        </Route>
        <Route path="/coffee-calculator">
          {() => <CoffeeCalculator {...authProps} />}
        </Route>
        <Route path="/profile">
          {() => <Profile user={user} />}
        </Route>
        <Route path="/settings">
          {() => <Settings {...authProps} />}
        </Route>
        <Route path="/explore">
          {() => <Pathways {...authProps} />}
        </Route>
        
        {/* Redirect /assumptions to /settings with assumptions tab */}
        <Route path="/assumptions">
          {() => {
            window.location.href = "/settings#assumptions";
            return null;
          }}
        </Route>
        <Route>
          {() => <NotFound />}
        </Route>
      </Switch>
    </AppShell>
  );
}

export default App;
