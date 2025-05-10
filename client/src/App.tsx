import React from "react";
import { Switch, Route, useLocation, Router } from "wouter";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
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
import { useAuth } from "@/context/AuthContext";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { User, LoginCredentials, RegisterCredentials, AuthProps } from "@/interfaces/auth";
import CityExploration from "@/pages/city-exploration";
import NumberPlayground from "@/pages/NumberPlayground";
import CelebrityProfiles from './pages/CelebrityProfiles';
import { AvatarProvider } from '@/contexts/AvatarContext';

function createApolloClient(getFreshToken: () => Promise<string | null>) {
  const httpLink = createHttpLink({ uri: "/graphql" });
  const authLink = setContext(async (_, { headers }) => {
    const token = await getFreshToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}

function App() {
  const [location] = useLocation();
  const {
    user,
    isAuthenticated,
    isFirstTimeUser,
    authLoading,
    login,
    signup,
    logout,
    completeOnboarding,
  } = useAuth();
  const { getFreshToken } = useFirebaseAuth();
  const client = createApolloClient(getFreshToken);

  // Map AuthContext functions to AppShellProps signatures
  const appShellLogin = async (credentials: { username: string; password: string }): Promise<User> => {
    await login(credentials);
    // After login, user state should be updated
    if (!user) throw new Error("No user after login");
    return user;
  };

  const appShellSignup = async (credentials: RegisterCredentials): Promise<User> => {
    await signup(credentials);
    if (!user) throw new Error("No user after signup");
    return user;
  };

  const appShellLogout = () => {
    logout();
  };

  const appShellCompleteOnboarding = async (): Promise<boolean> => {
    await completeOnboarding();
    return true;
  };

  if (authLoading) {
    console.log("[DEBUG] App is waiting for auth to load");
    return (
      <div className="flex h-screen w-full items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  console.log("[DEBUG] App auth state:", { user, isAuthenticated, isFirstTimeUser, authLoading });

  const isPublicRoute = ["/", "/login", "/signup"].includes(location);

  if (isPublicRoute) {
    console.log("[DEBUG] Rendering public route:", location);
    return (
      <Router>
        <Switch>
          <Route path="/">{() => {
            const authProps: AuthProps = {
              user,
              isAuthenticated,
              isFirstTimeUser,
              login,
              signup,
              logout,
              completeOnboarding
            };
            return <LandingPage {...authProps} />;
          }}</Route>
          <Route path="/login">{() => {
            const authProps: AuthProps = {
              user,
              isAuthenticated,
              isFirstTimeUser,
              login,
              signup,
              logout,
              completeOnboarding
            };
            return <LoginPage {...authProps} />;
          }}</Route>
          <Route path="/signup">{() => {
            const authProps: AuthProps = {
              user,
              isAuthenticated,
              isFirstTimeUser,
              login,
              signup,
              logout,
              completeOnboarding
            };
            return <SignupPage {...authProps} />;
          }}</Route>
        </Switch>
      </Router>
    );
  }

  console.log("[DEBUG] Rendering protected route:", location);
  return (
    <ApolloProvider client={client}>
      <Router>
        <AvatarProvider>
          <AppShell
            user={user}
            isAuthenticated={isAuthenticated}
            isFirstTimeUser={isFirstTimeUser}
            login={appShellLogin}
            signup={appShellSignup}
            logout={appShellLogout}
            completeOnboarding={appShellCompleteOnboarding}
          >
            <Switch>
              <Route path="/dashboard">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <Dashboard {...authProps} />;
              }}</Route>
              <Route path="/projections">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <FinancialProjections {...authProps} />;
              }}</Route>
              <Route path="/career-exploration">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <CareerExploration {...authProps} />;
              }}</Route>
              <Route path="/career-builder">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <CareerBuilder {...authProps} />;
              }}</Route>
              <Route path="/college-discovery">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <CollegeDiscovery {...authProps} />;
              }}</Route>
              <Route path="/city-exploration">{() => <CityExploration />}</Route>
              <Route path="/colleges">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <CollegeDiscovery {...authProps} />;
              }}</Route>
              <Route path="/net-price-calculator">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <NetPriceCalculator {...authProps} />;
              }}</Route>
              <Route path="/pathways">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <Pathways {...authProps} />;
              }}</Route>
              <Route path="/celebrity-profiles">{() => <CelebrityProfiles />}</Route>
              <Route path="/number-playground">{() => <NumberPlayground />}</Route>
              <Route path="/coffee-calculator">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <CoffeeCalculator {...authProps} />;
              }}</Route>
              <Route path="/profile">{() => <Profile user={user} />}</Route>
              <Route path="/settings">{() => {
                const authProps: AuthProps = {
                  user,
                  isAuthenticated,
                  isFirstTimeUser,
                  login,
                  signup,
                  logout,
                  completeOnboarding
                };
                return <Settings {...authProps} />;
              }}</Route>
              {/*
              <Route path="/test/parallel-search">{() => <ParallelSearchTestPage />}</Route>
              <Route path="/test/four-year-path">{() => <FourYearPathTestPage />}</Route>
              <Route path="/test/two-year-path">{() => <TwoYearPathTestPage />}</Route>
              <Route path="/test/vocational-path">{() => <VocationalPathPage />}</Route>
              <Route path="/test/swipe-cards">{() => <SwipeCardsTest />}</Route>
              */}
              <Route>{() => <NotFound />}</Route>
            </Switch>
          </AppShell>
        </AvatarProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
