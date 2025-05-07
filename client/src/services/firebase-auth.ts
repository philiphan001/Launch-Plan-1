import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile as fbUpdateProfile,
  updateEmail as fbUpdateEmail,
  updatePassword as fbUpdatePassword,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  User,
  UserCredential,
  browserPopupRedirectResolver,
  getIdToken,
} from "firebase/auth";

// Initialize Firebase app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Token refresh mechanism
let refreshTokenInterval: number | null = null;

// Function to setup token refresh
export const setupTokenRefresh = (user: User | null) => {
  // Clear any existing refresh interval
  if (refreshTokenInterval) {
    window.clearInterval(refreshTokenInterval);
    refreshTokenInterval = null;
  }

  // If no user, don't set up refresh
  if (!user) {
    console.log("[DEBUG] No user to setup token refresh for");
    return;
  }

  // Setup interval to refresh token every 30 minutes (1,800,000 ms)
  // This is less than Firebase's default expiration of 1 hour
  refreshTokenInterval = window.setInterval(async () => {
    try {
      console.log("[DEBUG] Refreshing Firebase token");
      const freshToken = await user.getIdToken(true); // Force token refresh
      localStorage.setItem("authToken", freshToken);
      await createSessionWithFirebaseToken(freshToken); // Update server session
      console.log("[DEBUG] Token refreshed successfully");
    } catch (error) {
      console.error("[DEBUG] Failed to refresh token:", error);
    }
  }, 1800000); // 30 minutes

  // Also refresh immediately on setup
  getIdToken(user, true)
    .then(async (freshToken) => {
      localStorage.setItem("authToken", freshToken);
      await createSessionWithFirebaseToken(freshToken);
      console.log("[DEBUG] Initial token refresh completed");
    })
    .catch((error) => {
      console.error("[DEBUG] Initial token refresh failed:", error);
    });
};

// Add scopes that we need
googleProvider.addScope("email");
googleProvider.addScope("profile");

// Force account selection dialog every time
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Register a new user with email and password
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Update the user profile with display name
  await fbUpdateProfile(userCredential.user, { displayName });

  // Create server session
  await createSessionWithFirebaseToken(await userCredential.user.getIdToken());

  // Setup token refresh
  setupTokenRefresh(userCredential.user);

  return userCredential.user;
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  // Create server session
  await createSessionWithFirebaseToken(await userCredential.user.getIdToken());

  // Setup token refresh
  setupTokenRefresh(userCredential.user);

  return userCredential.user;
};

/**
 * Login with Google
 * Returns both Firebase user and server session data
 * Uses popup with fallback to redirect
 */
export const loginWithGoogle = async (): Promise<{
  user: User;
  serverData: any;
}> => {
  try {
    console.log("[DEBUG] Attempting Google sign-in with popup");

    // Try with popup first (most user-friendly)
    const userCredential = await signInWithPopup(
      auth,
      googleProvider,
      browserPopupRedirectResolver
    );
    console.log("[DEBUG] Popup authentication successful");

    // Create server session
    const token = await userCredential.user.getIdToken();
    console.log("[DEBUG] Got Firebase token, creating server session");

    // IMPORTANT: Save the token to localStorage for later use
    localStorage.setItem("authToken", token);

    const serverData = await createSessionWithFirebaseToken(token);

    // Setup token refresh
    setupTokenRefresh(userCredential.user);

    return {
      user: userCredential.user,
      serverData,
    };
  } catch (error: any) {
    // If popup is blocked, fall back to redirect
    console.error("[DEBUG] Popup authentication failed:", error.message);

    if (
      error.code === "auth/popup-blocked" ||
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      console.log("[DEBUG] Popup was blocked, falling back to redirect");

      // Store a flag to indicate we're using redirect flow
      sessionStorage.setItem("usingGoogleRedirect", "true");

      // Use redirect method instead
      await signInWithRedirect(auth, googleProvider);

      // This won't be reached immediately as the page will redirect
      return {} as any;
    }

    // For any other errors, rethrow
    throw error;
  }
};

/**
 * Handle the redirect result from Google sign-in
 * Call this on component mount if needed
 */
export const handleGoogleRedirect = async (): Promise<{
  user: User | null;
  serverData: any | null;
}> => {
  try {
    // Check if we're returning from a redirect
    if (sessionStorage.getItem("usingGoogleRedirect") !== "true") {
      return { user: null, serverData: null };
    }

    // Clear the redirect flag
    sessionStorage.removeItem("usingGoogleRedirect");

    console.log("[DEBUG] Handling Google redirect result");
    const result = await getRedirectResult(auth);

    if (!result) {
      console.log("[DEBUG] No redirect result");
      return { user: null, serverData: null };
    }

    console.log("[DEBUG] Google redirect authentication successful");

    // Create server session
    const token = await result.user.getIdToken();
    localStorage.setItem("authToken", token);
    const serverData = await createSessionWithFirebaseToken(token);

    // Setup token refresh
    setupTokenRefresh(result.user);

    return {
      user: result.user,
      serverData,
    };
  } catch (error) {
    console.error("[DEBUG] Error handling Google redirect:", error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    console.log("[DEBUG] Starting Firebase logout process...");

    // Clear token refresh interval
    if (refreshTokenInterval) {
      window.clearInterval(refreshTokenInterval);
      refreshTokenInterval = null;
      console.log("[DEBUG] Cleared refresh token interval");
    }

    // Clear all auth-related items from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("isFirstTimeUser");

    console.log("[DEBUG] Cleared local storage auth data");

    try {
      // First, destroy the server session
      console.log("[DEBUG] Sending server logout request...");
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        console.log("[DEBUG] Server logout successful");
      } else {
        console.warn(
          "[DEBUG] Server logout failed with status:",
          response.status
        );
      }
    } catch (serverError) {
      console.error("[DEBUG] Error during server logout:", serverError);
      // Continue with Firebase logout even if server logout fails
    }

    // Then sign out from Firebase
    console.log("[DEBUG] Signing out from Firebase...");
    await signOut(auth);
    console.log("[DEBUG] Firebase logout successful");

    // Use a short delay to ensure all operations are complete before redirecting
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Force reload the page to ensure clean state
    console.log("[DEBUG] Redirecting to home page...");
    window.location.href = "/";
  } catch (error) {
    console.error("[DEBUG] Logout error:", error);
    // Wait a moment before forcing reload if there was an error
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("[DEBUG] Redirecting to home page after error...");
    window.location.href = "/";
  }
};

/**
 * Listen for authentication state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    // Setup token refresh when auth state changes
    setupTokenRefresh(user);
    callback(user);
  });
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (displayName: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  await fbUpdateProfile(user, { displayName });
};

/**
 * Update user email
 */
export const updateUserEmail = async (email: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  await fbUpdateEmail(user, email);
};

/**
 * Update user password
 */
export const updateUserPassword = async (password: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  await fbUpdatePassword(user, password);
};

/**
 * Create a server session with Firebase ID token
 */
const createSessionWithFirebaseToken = async (token: string): Promise<any> => {
  try {
    console.log("[DEBUG] Creating server session with token");
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[DEBUG] Failed to create server session: ${response.status}, Response: ${errorText}`
      );
      throw new Error("Failed to create server session");
    }

    const data = await response.json();
    console.log("[DEBUG] Server session created successfully:", data);

    // Save the authenticated user data and token for persistence
    if (data && data.user) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");
    }

    return data;
  } catch (error) {
    console.error("[DEBUG] Error in createSessionWithFirebaseToken:", error);
    throw error;
  }
};

/**
 * Get a fresh token from Firebase and return it
 * This is useful for making authenticated API calls from components
 * @param forceRefresh - If true, forces a token refresh even if the current token is still valid
 */
export const getFreshToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("[DEBUG] No user logged in to get fresh token");
      return null;
    }

    const token = await user.getIdToken(forceRefresh); // Force token refresh if requested
    localStorage.setItem("authToken", token);
    return token;
  } catch (error) {
    console.error("[DEBUG] Error getting fresh token:", error);
    return null;
  }
};

// Get the current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Get the current user with improved handling for auth initialization
export const getCurrentUserAsync = (): Promise<User | null> => {
  return new Promise((resolve) => {
    // If we already have a user, resolve immediately
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    // Otherwise, set up a one-time listener for auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Remove the listener once we get a response
      resolve(user); // Resolve with the user (might be null if not logged in)
    });
  });
};

// Utility to ensure server session and user creation after login
export const ensureServerSession = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;
  const token = await user.getIdToken();
  await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
};
