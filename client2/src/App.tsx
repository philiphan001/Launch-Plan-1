import React from "react";
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
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Create an Apollo Client instance
const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
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

function AppContent() {
  const { 
    user, 
    isAuthenticated, 
    isFirstTimeUser, 
    isLoading,
    login, 
    logout, 
    signup, 
    completeOnboarding 
  } = useAuth();
  const [_, setLocation] = useLocation();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Public routes that don't need AppShell
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/">
          {() => <LandingPage />}
        </Route>
        <Route path="/login">
          {() => <LoginPage />}
        </Route>
        <Route path="/signup">
          {() => <SignupPage />}
        </Route>
        <Route path="/coffee-calculator">
          {() => (
            <AppShell 
              user={null}
              isAuthenticated={false}
              isFirstTimeUser={false}
              login={login}
              signup={signup}
              logout={logout}
              completeOnboarding={completeOnboarding}
            >
              <CoffeeCalculator />
            </AppShell>
          )}
        </Route>
        <Route>
          {() => <NotFound />}
        </Route>
      </Switch>
    );
  }

  // Protected routes with AppShell
  return (
    <AppShell 
      user={user}
      isAuthenticated={isAuthenticated}
      isFirstTimeUser={isFirstTimeUser}
      login={login}
      signup={signup}
      logout={logout}
      completeOnboarding={completeOnboarding}
    >
      <Switch>
        <Route path="/">
          {() => {
            // Redirect to dashboard or pathways based on isFirstTimeUser
            setLocation(isFirstTimeUser ? '/pathways' : '/dashboard');
            return null;
          }}
        </Route>
        <Route path="/dashboard">
          {() => <Dashboard 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/financial-projections">
          {() => <FinancialProjections 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/career-exploration">
          {() => <CareerExploration 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/career-builder">
          {() => <CareerBuilder 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/college-discovery">
          {() => <CollegeDiscovery 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/net-price-calculator">
          {() => <NetPriceCalculator 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/pathways">
          {() => <Pathways 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/coffee-calculator">
          {() => <CoffeeCalculator 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/profile">
          {() => <Profile 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route path="/settings">
          {() => <Settings 
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={login}
            signup={signup}
            logout={logout}
            completeOnboarding={completeOnboarding}
          />}
        </Route>
        <Route>
          {() => <NotFound />}
        </Route>
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
