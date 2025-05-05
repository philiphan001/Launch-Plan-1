import React, { useState } from "react";
import { useFirebaseAuth } from "../../context/FirebaseAuthContext";

interface FirebaseLoginFormProps {
  onSuccess?: (user: any) => void;
}

export default function FirebaseLoginForm({
  onSuccess,
}: FirebaseLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    error: authError,
  } = useFirebaseAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      let user;

      if (isRegistering) {
        // Registration flow
        if (!displayName) {
          setFormError("Please enter a display name");
          setIsLoading(false);
          return;
        }
        user = await registerWithEmail(email, password, displayName);
      } else {
        // Login flow
        user = await loginWithEmail(email, password);
      }

      // Call the success callback if provided
      if (onSuccess && user) {
        onSuccess(user);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setFormError(
        err instanceof Error ? err.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setFormError(null);
    setIsLoading(true);

    try {
      const user = await loginWithGoogle();
      if (onSuccess && user) {
        onSuccess(user);
      }
    } catch (err) {
      console.error("Google authentication error:", err);
      setFormError(
        err instanceof Error ? err.message : "Google authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setFormError(null);
  };

  // Format Firebase error messages to be more user-friendly
  const formatErrorMessage = (error: string) => {
    if (error.includes("auth/invalid-email")) {
      return "The email address is invalid";
    } else if (error.includes("auth/user-disabled")) {
      return "This account has been disabled";
    } else if (error.includes("auth/user-not-found")) {
      return "No account found with this email";
    } else if (error.includes("auth/wrong-password")) {
      return "Incorrect password";
    } else if (error.includes("auth/email-already-in-use")) {
      return "This email is already in use";
    } else if (error.includes("auth/weak-password")) {
      return "Password should be at least 6 characters";
    } else {
      return error;
    }
  };

  const displayError = formError || authError;

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isRegistering ? "Create an Account" : "Sign In"}
        </h2>
        <p className="mt-2 text-gray-600">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            type="button"
            onClick={toggleAuthMode}
            className="ml-1 text-blue-600 hover:text-blue-800"
          >
            {isRegistering ? "Sign In" : "Register"}
          </button>
        </p>
      </div>

      {displayError && (
        <div className="p-3 text-sm text-red-600 bg-red-100 rounded">
          {formatErrorMessage(displayError)}
        </div>
      )}

      <form onSubmit={handleEmailAuth} className="space-y-6">
        {isRegistering && (
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required={isRegistering}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading
              ? "Processing..."
              : isRegistering
              ? "Register"
              : "Sign In"}
          </button>
        </div>
      </form>

      <div className="flex items-center justify-center">
        <span className="text-gray-400">or</span>
      </div>

      <div>
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M5.266 9.765C6.089 7.996 7.889 6.904 9.931 6.904c1.266 0 2.4.456 3.278 1.196l2.468-2.468C14.098 4.277 12.144 3.5 9.931 3.5c-3.316 0-6.135 2.015-7.421 4.868L5.266 9.765z"
            />
            <path
              fill="#FBBC05"
              d="M9.931 19.5c1.108 0 2.159-.157 3.157-.469l-2.357-2.357c-1.376.705-3.212.705-4.588 0l-2.357 2.357C5.799 19.343 7.823 19.5 9.931 19.5z"
            />
            <path
              fill="#4285F4"
              d="M20.34 12.077c0-.772-.066-1.511-.189-2.205H9.931v4.2h5.796a4.94 4.94 0 0 1-2.145 3.234l2.357 2.357C18.97 16.935 20.34 14.553 20.34 12.077z"
            />
            <path
              fill="#34A853"
              d="M15.785 17.466L13.397 15.1c-2.039 1.376-4.977 1.376-7.016 0L3.766 17.466C5.547 19.354 7.611 20.5 9.931 20.5c2.32 0 4.384-1.146 6.164-3.034z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
