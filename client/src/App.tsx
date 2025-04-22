import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
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
import ParallelSearchTestPage from "@/pages/test/parallel-search";
import FourYearPathTestPage from "@/pages/test/four-year-path";
import TwoYearPathTestPage from "@/pages/test/two-year-path";
import { FourYearCollegePath } from './components/pathways/FourYearCollegePath';
import TwoYearCollegePath from './components/pathways/TwoYearCollegePath';

import { User, AuthProps, RegisterCredentials } from "@/interfaces/auth";

// Create an Apollo Client instance
const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

function App() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // On mount, check if user is authenticated with the server
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...");
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          console.log("Not authenticated, status:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const userData = await response.json();
        if (!userData || typeof userData !== 'object') {
          throw new Error('Invalid user data received');
        }
        
        console.log("Authentication successful, user:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsFirstTimeUser(!!userData.isFirstTimeUser);
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
  
  // Auth context values and functions with improved error handling
  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log("Attempting login with username:", credentials.username);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });
      
      let responseData: any = null;
      
      try {
        // Try to parse the response as JSON, but handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // If not JSON, get text response
          const textData = await response.text();
          responseData = { message: textData || 'Unknown error' };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        responseData = { message: 'Failed to parse server response' };
      }
      
      if (!response.ok) {
        console.error('Login failed with status:', response.status, responseData);
        throw new Error(responseData.message || `Login failed with status ${response.status}`);
      }
      
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid user data received from server');
      }
      
      console.log("Login successful, user:", responseData);
      setUser(responseData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!responseData.isFirstTimeUser);
      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const signup = async (credentials: RegisterCredentials) => {
    try {
      console.log("Attempting signup with username:", credentials.username);
      
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });
      
      let responseData: any = null;
      
      try {
        // Try to parse the response as JSON, but handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          responseData = await response.json();
        } else {
          // If not JSON, get text response
          const textData = await response.text();
          responseData = { message: textData || 'Unknown error' };
        }
      } catch (parseError) {
        console.error('Error parsing signup response:', parseError);
        responseData = { message: 'Failed to parse server response' };
      }
      
      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage = responseData.message || responseData.details || `Registration failed with status ${response.status}`;
        console.error('Server returned error:', responseData);
        throw new Error(errorMessage);
      }
      
      if (!responseData || typeof responseData !== 'object') {
        throw new Error('Invalid user data received from server');
      }
      
      // Use the successful response data
      console.log("Signup successful, user:", responseData);
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
        console.error('Error completing onboarding:', error);
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

  // Handle navigation based on auth status with improved logic to prevent infinite redirects
  useEffect(() => {
    console.log(
      "Navigation effect triggered - Location:", location, 
      "Auth:", isAuthenticated, 
      "FirstTime:", isFirstTimeUser,
      "HasProjections:", hasSavedProjections
    );
    
    // Extract path and query parameters
    const hasQueryParams = window.location.search !== '';
    
    // PUBLIC ROUTES: Accessible to everyone
    const publicRoutes = ["/", "/login", "/signup"];
    
    // SEMI-PUBLIC ROUTES: Accessible to non-authenticated users in specific cases
    const semiPublicRoutes = ["/coffee-calculator"]; // Add more routes that should be accessible without login
    const projectionWithQueryParams = location === '/projections' && window.location.search.includes('id=');
    
    // For non-authenticated users
    if (!isAuthenticated) {
      // Allow access to public routes and semi-public routes
      if (publicRoutes.includes(location) || semiPublicRoutes.includes(location) || projectionWithQueryParams) {
        // No redirection needed
        return;
      } else {
        // Redirect to login for all other routes
        console.log("Redirecting to login from:", location, "Auth status:", isAuthenticated);
        setLocation('/login');
        return;
      }
    }
    
    // For authenticated users
    
    // Redirect from login/signup to appropriate page when already authenticated
    if (["/login", "/signup"].includes(location)) {
      console.log("User is authenticated but on login/signup page, redirecting to appropriate page");
      setLocation(isFirstTimeUser ? '/pathways' : '/dashboard');
      return;
    }
    
    // Only handle root path redirects for authenticated users (no query params)
    if (location === '/' && !hasQueryParams) {
      // Logic for redirection:
      // 1. First-time users go to Pathways
      // 2. Users with saved projections or returning users go to Dashboard
      const destination = (isFirstTimeUser && !hasSavedProjections) ? '/pathways' : '/dashboard';
      console.log(`Redirecting from / to ${destination} based on user status`);
      setLocation(destination);
      return;
    }
    
    // For all other paths, no redirection needed
  }, [location, isAuthenticated, isFirstTimeUser, hasSavedProjections, setLocation]);
  
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
  
  // Check if the current route should be displayed without the AppShell layout
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
  
  // Special case for semi-public routes - add AppShell but don't require authentication
  // This allows non-authenticated users to access these routes with proper navigation
  if (!isAuthenticated && ["/coffee-calculator", "/test/parallel-search", "/test/four-year-path"].includes(location)) {
    return (
      <AppShell 
        logout={logout} 
        user={null}
        isAuthenticated={false}
        isFirstTimeUser={false}
        login={login}
        signup={signup}
        completeOnboarding={completeOnboarding}
      >
        <Switch>
          <Route path="/coffee-calculator">
            {() => <CoffeeCalculator {...authProps} />}
          </Route>
          <Route path="/test/parallel-search">
            {() => <ParallelSearchTestPage />}
          </Route>
          <Route path="/test/four-year-path">
            {() => <FourYearPathTestPage />}
          </Route>
        </Switch>
      </AppShell>
    );
  }
  
  // Routes that should be displayed within the AppShell layout
  return (
    <ApolloProvider client={client}>
      <AppShell
        logout={logout}
        user={user}
        isAuthenticated={isAuthenticated}
        isFirstTimeUser={isFirstTimeUser}
        login={login}
        signup={signup}
        completeOnboarding={completeOnboarding}
      >
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
          <Route path="/test/parallel-search">
            {() => <ParallelSearchTestPage />}
          </Route>
          <Route path="/test/four-year-path">
            {() => <FourYearPathTestPage />}
          </Route>
          <Route path="/test/two-year-path">
            {() => <TwoYearPathTestPage />}
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
    </ApolloProvider>
  );
}

export default App;
