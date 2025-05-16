import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import * as firebaseAuthService from "@/services/firebase-auth";

import { User, AuthProps, RegisterCredentials } from "@/interfaces/auth";

interface SignupPageProps extends AuthProps {}

export default function SignupPage({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding,
}: SignupPageProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  type FormData = {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    zipCode: string;
  };

  const [formData, setFormData] = useState<FormData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    zipCode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.zipCode || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const credentials: RegisterCredentials = {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        zipCode: formData.zipCode,
      };

      await signup(credentials);

      toast({
        title: "Account created!",
        description:
          "Welcome to Launch Plan. Your account has been created successfully.",
      });

      console.log("SignupPage: User authenticated, redirecting to pathways");
      // First time users go to pathways
      setLocation("/pathways");
    } catch (error) {
      console.error("Signup error:", error);

      // Extract meaningful error messages from the response
      let errorMessage =
        "There was a problem creating your account. Please try again.";

      if (error instanceof Error) {
        // If it's a standard Error object, use its message
        errorMessage = error.message;
      } else if (error && typeof error === "object" && "message" in error) {
        // If it's an object with a message property (like from fetch response)
        errorMessage = String(error.message);
      }

      // Check for common error messages and provide user-friendly alternatives
      if (
        errorMessage.includes("username already exists") ||
        errorMessage.includes("unique constraint")
      ) {
        errorMessage =
          "This username is already taken. Please choose a different one.";
      }

      toast({
        title: "Error creating account",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google authentication
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      // Get Firebase user from Google login
      const result = await firebaseAuthService.loginWithGoogle();
      const { user: firebaseUser, serverData } = result;

      console.log(
        "Firebase authentication successful:",
        firebaseUser.displayName
      );

      // Store user data and JWT token in localStorage
      if (serverData && serverData.user) {
        localStorage.setItem("currentUser", JSON.stringify(serverData.user));
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "isFirstTimeUser",
          String(!!serverData.user.isFirstTimeUser)
        );
      }

      // Store the JWT token for authenticated API requests
      if (serverData && serverData.token) {
        localStorage.setItem("authToken", serverData.token);
        console.log("JWT token stored successfully");
      }

      toast({
        title: "Account created!",
        description:
          "Welcome to Launch Plan. Your account has been created with Google.",
      });

      // Now we can safely navigate to the pathways page
      window.location.href = "/pathways";
    } catch (error) {
      console.error("Google signup error:", error);
      toast({
        title: "Google signup failed",
        description: "Unable to sign up with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white p-0"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Button>
          </div>
          <CardTitle className="text-2xl text-white font-bold">
            Create an account
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your information below to create your Launch Plan account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading}
              className="w-full border-gray-300 bg-white text-gray-800 hover:bg-gray-100 flex items-center justify-center gap-2 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
                className="h-4 w-4"
              >
                <path
                  fill="#4285F4"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                />
              </svg>
              <span className="font-medium text-gray-800">
                {isGoogleLoading ? "Signing up..." : "Continue with Google"}
              </span>
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-800 text-gray-400">
                Or sign up with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-white">
                Home Zip Code
              </Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="Enter your home zip code"
                value={formData.zipCode}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-500 hover:text-green-400 font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
