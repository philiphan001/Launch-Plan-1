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
  GoogleAuthProvider,
  User,
  UserCredential,
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

// Debug Firebase configuration in development
if (import.meta.env.DEV) {
  console.log("Firebase config:", {
    apiKey: firebaseConfig.apiKey?.substring(0, 5) + "...",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    // Hiding full values but showing if they're defined
    storageBucketDefined: !!firebaseConfig.storageBucket,
    messagingSenderIdDefined: !!firebaseConfig.messagingSenderId,
    appIdDefined: !!firebaseConfig.appId,
  });
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add additional scopes if needed
googleProvider.addScope("email");
googleProvider.addScope("profile");
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

  return userCredential.user;
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (): Promise<User> => {
  try {
    console.log("Starting Google sign-in process...");

    // Sign in with Google popup
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful, user:", userCredential.user.email);

    try {
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      console.log("Got Firebase ID token, creating server session...");

      // Create server session
      await createSessionWithFirebaseToken(idToken);
      console.log("Server session created successfully");

      return userCredential.user;
    } catch (sessionError) {
      console.error("Failed to create server session:", sessionError);

      // Show more details about the error in the console for debugging
      if (sessionError instanceof Error) {
        console.error("Session Error Details:", {
          name: sessionError.name,
          message: sessionError.message,
          stack: sessionError.stack,
        });
      }

      // We're throwing the error now instead of silently returning the user
      // This will ensure the UI can handle the session creation failure
      throw new Error(
        `Server session creation failed: ${sessionError.message || "Unknown error"}`
      );
    }
  } catch (googleAuthError) {
    console.error("Google authentication failed:", googleAuthError);
    throw new Error(
      `Google sign-in failed: ${googleAuthError.message || "Unknown error"}`
    );
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    // First, destroy the server session
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // Then sign out from Firebase
    await signOut(auth);
    console.log("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    // Continue with signOut even if server logout fails
    await signOut(auth);
  }
};

/**
 * Listen for authentication state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
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
    console.log("Sending token to server to create session...");

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = "";
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = `Status: ${response.status} ${response.statusText}`;
      }

      throw new Error(`Failed to create server session: ${errorDetails}`);
    }

    const sessionData = await response.json();
    console.log("Server session created successfully");
    return sessionData;
  } catch (error) {
    console.error("Session creation error:", error);
    throw error;
  }
};

// Get the current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
