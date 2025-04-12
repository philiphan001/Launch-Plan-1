import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import Dashboard from "@/pages/Dashboard";
import FinancialProjections from "@/pages/FinancialProjections";
import CareerExploration from "@/pages/CareerExploration";
import CareerBuilder from "@/pages/CareerBuilder";
import CollegeDiscovery from "@/pages/CollegeDiscovery";
import NetPriceCalculator from "@/pages/NetPriceCalculator";
import Pathways from "@/pages/Pathways";
import Assumptions from "@/pages/Assumptions";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import NotFound from "@/pages/not-found";
import AppShell from "@/components/ui/layout/AppShell";

import { User, AuthProps } from "@/interfaces/auth";

function App() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  
  // On mount, check localStorage for user data
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(parsedUser.isFirstTimeUser);
    }
  }, []);
  
  // Handle navigation based on auth status
  useEffect(() => {
    console.log("Navigation effect triggered - Location:", location, "Auth:", isAuthenticated, "FirstTime:", isFirstTimeUser);
    
    // Check if we're navigating with query parameters (like projections?id=123)
    const hasQueryParams = window.location.search !== '';
    
    // If at root path '/' and logged in, redirect appropriately, but only if there are no query parameters
    if (location === '/' && !hasQueryParams) {
      if (isAuthenticated) {
        // First-time users go to Pathways, returning users go to Dashboard
        const destination = isFirstTimeUser ? '/pathways' : '/dashboard';
        console.log(`Redirecting from / to ${destination} based on first-time status`);
        setLocation(destination);
      }
    } 
    // If trying to access dashboard as first-time user, redirect to pathways
    else if (location === '/dashboard' && isAuthenticated && isFirstTimeUser) {
      console.log("First-time user trying to access dashboard, redirecting to pathways");
      setLocation('/pathways');
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
  
  // Auth context values and functions
  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser: User = {
        id: 1,
        name: email.split('@')[0],
        email,
        isFirstTimeUser: false // Returning users aren't first-time users
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(false);
      
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const signup = async (name: string, email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser: User = {
        id: Date.now(),
        name,
        email,
        isFirstTimeUser: true // New users are first-time users
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true);
      
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsFirstTimeUser(false);
    localStorage.removeItem('user');
    setLocation('/');
  };
  
  const completeOnboarding = () => {
    if (user) {
      const updatedUser = {
        ...user,
        isFirstTimeUser: false
      };
      setUser(updatedUser);
      setIsFirstTimeUser(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  // Provide auth values to pages via props
  const authProps = {
    user,
    isAuthenticated,
    isFirstTimeUser,
    login,
    signup,
    logout,
    completeOnboarding
  };
  
  // Check if the current route should be displayed within the AppShell
  // Path handling with query parameters
  const isPublicRoute = ["/", "/login", "/signup"].includes(location);
  
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
          {() => <Dashboard {...authProps} />}
        </Route>
        <Route path="/projections">
          {() => {
            // Get projection ID from URL query parameters
            const params = new URLSearchParams(window.location.search);
            const projectionId = params.get('id');
            
            // Log the projection ID detection during routing
            if (projectionId) {
              console.log("Loading FinancialProjections with ID:", projectionId);
            }
            
            return <FinancialProjections 
              {...authProps} 
              initialProjectionId={projectionId ? Number(projectionId) : undefined}
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
        <Route path="/profile">
          {() => <Profile {...authProps} />}
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
