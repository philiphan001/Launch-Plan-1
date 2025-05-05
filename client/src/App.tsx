import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
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
import ParallelSearchTestPage from "@/pages/test/parallel-search";
import FourYearPathTestPage from "@/pages/test/four-year-path";
import TwoYearPathTestPage from "@/pages/test/two-year-path";
import { FourYearCollegePath } from "./components/pathways/FourYearCollegePath";
import TwoYearCollegePath from "./components/pathways/TwoYearCollegePath";
import VocationalPathPage from "@/pages/test/vocational-path";
import SwipeCardsTest from "@/pages/test/swipe-cards";
// Import the getCurrentUser function
import { getCurrentUser } from "@/services/firebase-auth";

import { User, AuthProps, RegisterCredentials } from "@/interfaces/auth";

// Create an Apollo Client instance
const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = localStorage.getItem("token");
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Updated function to check auth with better token handling
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[DEBUG] Checking authentication status...");

        // First check if we have user data and token in localStorage
        const storedUser = localStorage.getItem("currentUser");
        const isAuthenticatedInStorage =
          localStorage.getItem("isAuthenticated") === "true";
        const authToken = localStorage.getItem("authToken");

        if (isAuthenticatedInStorage && storedUser) {
          console.log("[DEBUG] Found authenticated user in localStorage");
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setIsAuthenticated(true);
            setIsFirstTimeUser(!!userData.isFirstTimeUser);

            // Always verify with the backend using the JWT token if available
            if (authToken) {
              await fetchAuthStatusWithToken(authToken);
            } else {
              // Only fall back to cookie-based auth if no token is present
              await fetchAuthStatus();
            }
          } catch (parseError) {
            console.error(
              "[DEBUG] Error parsing stored user data:",
              parseError
            );
            // Continue with normal authentication if storage data is invalid
            await fetchAuthStatus();
          }
        } else {
          // Standard API authentication check
          await fetchAuthStatus();
        }
      } catch (error) {
        console.error("[DEBUG] Failed to check authentication status:", error);
        // If there's an error, ensure user is logged out
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    // Function to fetch authentication status from the server using JWT token
    const fetchAuthStatusWithToken = async (token: string) => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
            Authorization: `Bearer ${token}`, // Use JWT token for authentication
          },
        });

        console.log(
          "[DEBUG] Auth response status with token:",
          response.status
        );

        if (!response.ok) {
          console.log(
            "[DEBUG] Authentication failed with token, status:",
            response.status
          );

          // If the token is expired or invalid, try refreshing it through Firebase
          if (response.status === 401) {
            console.log(
              "[DEBUG] Attempting to refresh Firebase token and retry"
            );

            const firebaseUser = getCurrentUser();
            if (firebaseUser) {
              try {
                // Force token refresh
                const newToken = await firebaseUser.getIdToken(true);
                console.log("[DEBUG] Got fresh token, retrying authentication");

                // Save the new token
                localStorage.setItem("authToken", newToken);

                // Retry with the new token
                const retryResponse = await fetch("/api/auth/me", {
                  credentials: "include",
                  headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                    Expires: "0",
                    Authorization: `Bearer ${newToken}`,
                  },
                });

                if (retryResponse.ok) {
                  const userData = await retryResponse.json();
                  setUser(userData);
                  setIsAuthenticated(true);
                  setIsFirstTimeUser(!!userData.isFirstTimeUser);

                  // Update localStorage with fresh data
                  localStorage.setItem("currentUser", JSON.stringify(userData));
                  localStorage.setItem("isAuthenticated", "true");
                  return;
                }
              } catch (refreshError) {
                console.error("[DEBUG] Token refresh failed:", refreshError);
              }
            }
          }

          clearAuthState();
          return;
        }

        const userData = await response.json();
        console.log("[DEBUG] User data from API with token:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsFirstTimeUser(!!userData.isFirstTimeUser);

        // Update localStorage with fresh data
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");
      } catch (error) {
        console.error("[DEBUG] API auth check with token failed:", error);
        clearAuthState();
      }
    };

    // Function to fetch authentication status from the server without token
    const fetchAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        console.log(
          "[DEBUG] Auth response status without token:",
          response.status
        );

        if (!response.ok) {
          console.log("[DEBUG] Not authenticated without token");
          clearAuthState();
          return;
        }

        const userData = await response.json();
        console.log("[DEBUG] User data from API without token:", userData);
        setUser(userData);
        setIsAuthenticated(true);
        setIsFirstTimeUser(!!userData.isFirstTimeUser);

        // Update localStorage with fresh data
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("isAuthenticated", "true");
      } catch (error) {
        console.error("[DEBUG] API auth check without token failed:", error);
        clearAuthState();
      }
    };

    // Function to clear authentication state
    const clearAuthState = () => {
      console.log("[DEBUG] Clearing authentication state");
      setUser(null);
      setIsAuthenticated(false);
      setIsFirstTimeUser(false);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("isFirstTimeUser");
      localStorage.removeItem("authToken");
    };

    checkAuth();
  }, []);

  // Auth context values and functions with improved error handling
  const login = async (credentials: { username: string; password: string }) => {
    try {
      console.log(
        "[DEBUG] Attempting login with username:",
        credentials.username
      );

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Important for cookies
      });

      console.log("[DEBUG] Login response status:", response.status);

      let responseData: any = null;

      try {
        // Try to parse the response as JSON, but handle non-JSON responses
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          // If not JSON, get text response
          const textData = await response.text();
          console.log("[DEBUG] Non-JSON response:", textData);
          responseData = { message: textData || "Unknown error" };
        }
      } catch (parseError) {
        console.error("[DEBUG] Error parsing response:", parseError);
        responseData = { message: "Failed to parse server response" };
      }

      if (!response.ok) {
        console.error(
          "[DEBUG] Login failed with status:",
          response.status,
          responseData
        );
        throw new Error(
          responseData.message || `Login failed with status ${response.status}`
        );
      }

      if (!responseData || typeof responseData !== "object") {
        throw new Error("Invalid user data received from server");
      }

      console.log("[DEBUG] Login successful, user:", responseData);
      setUser(responseData);
      setIsAuthenticated(true);
      setIsFirstTimeUser(!!responseData.isFirstTimeUser);

      // Store in localStorage
      localStorage.setItem("currentUser", JSON.stringify(responseData));
      localStorage.setItem("isAuthenticated", "true");

      return responseData;
    } catch (error) {
      console.error("[DEBUG] Login error:", error);
      throw error;
    }
  };

  // Check if user has any saved financial projections
  const [hasSavedProjections, setHasSavedProjections] = useState(false);

  // Check for saved projections when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("[DEBUG] Checking for saved projections for user:", user.id);

      // Fetch saved projections to determine if user has any
      fetch(`/api/financial-projections/${user.id}`)
        .then((response) => {
          console.log("[DEBUG] Projections response status:", response.status);
          if (response.ok) {
            return response.json();
          }
          return [];
        })
        .then((projections) => {
          const hasProjections =
            Array.isArray(projections) && projections.length > 0;
          setHasSavedProjections(hasProjections);
          console.log("[DEBUG] User has saved projections:", hasProjections);
        })
        .catch((error) => {
          console.error("[DEBUG] Error checking for projections:", error);
          setHasSavedProjections(false);
        });
    } else {
      setHasSavedProjections(false);
    }
  }, [isAuthenticated, user]);

  // If still loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  // Create auth props object to pass to components
  const authProps: AuthProps = {
    user,
    isAuthenticated,
    isFirstTimeUser,
    login,
    signup: async () => {}, // Implement if needed
    logout: async () => {}, // Implement if needed
    completeOnboarding: async () => false, // Implement if needed
  };

  // Check if the current route should be displayed without the AppShell layout
  const isPublicRoute = ["/", "/login", "/signup"].includes(location);

  // Routes that should be displayed without the AppShell layout
  if (isPublicRoute) {
    return (
      <Switch>
        <Route path="/">{() => <LandingPage {...authProps} />}</Route>
        <Route path="/login">{() => <LoginPage {...authProps} />}</Route>
        <Route path="/signup">{() => <SignupPage {...authProps} />}</Route>
      </Switch>
    );
  }

  // Routes that should be displayed within the AppShell layout
  return (
    <ApolloProvider client={client}>
      <AppShell
        logout={async () => {}} // Implement if needed
        user={user}
        isAuthenticated={isAuthenticated}
        isFirstTimeUser={isFirstTimeUser}
        login={login}
        signup={async () => {}} // Implement if needed
        completeOnboarding={async () => false} // Implement if needed
      >
        <Switch>
          <Route path="/dashboard">{() => <Dashboard {...authProps} />}</Route>
          <Route path="/projections">
            {() => <FinancialProjections {...authProps} />}
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
          <Route path="/pathways">{() => <Pathways {...authProps} />}</Route>
          <Route path="/coffee-calculator">
            {() => <CoffeeCalculator {...authProps} />}
          </Route>
          <Route path="/profile">{() => <Profile user={user} />}</Route>
          <Route path="/settings">{() => <Settings {...authProps} />}</Route>
          <Route path="/explore">{() => <Pathways {...authProps} />}</Route>
          <Route path="/test/parallel-search">
            {() => <ParallelSearchTestPage />}
          </Route>
          <Route path="/test/four-year-path">
            {() => <FourYearPathTestPage />}
          </Route>
          <Route path="/test/two-year-path">
            {() => <TwoYearPathTestPage />}
          </Route>
          <Route path="/test/vocational-path">
            {() => <VocationalPathPage />}
          </Route>
          <Route path="/test/swipe-cards">{() => <SwipeCardsTest />}</Route>
          <Route>{() => <NotFound />}</Route>
        </Switch>
      </AppShell>
    </ApolloProvider>
  );
}

export default App;
