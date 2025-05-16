import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AuthProps } from "@/interfaces/auth";
// Import just what we need directly from firebase-auth.ts
import * as firebaseAuthService from "@/services/firebase-auth";

interface LoginPageProps extends Partial<AuthProps> {}

export default function LoginPage(props: LoginPageProps) {
  const { user, isAuthenticated, isFirstTimeUser, login } = props;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  // Check for Google redirect result on component mount
  useEffect(() => {
    async function checkRedirectResult() {
      try {
        console.log("[DEBUG] Checking for Google redirect result");
        const result = await firebaseAuthService.handleGoogleRedirect();

        if (result && result.user) {
          console.log("[DEBUG] Successfully signed in via redirect");
          toast({
            title: "Login successful!",
            description: "Welcome to Launch Plan.",
          });
          setLocation("/dashboard");
        }
      } catch (error) {
        console.error("[DEBUG] Error handling redirect:", error);
        toast({
          title: "Google login failed",
          description: "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsCheckingRedirect(false);
      }
    }

    checkRedirectResult();
    setIsCheckingRedirect(false); // Ensure we don't get stuck on redirect check
  }, [toast, setLocation]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("[DEBUG] Attempting login with email/password");

      // Use direct service call instead of hook
      await firebaseAuthService.loginWithEmail(
        formData.username,
        formData.password
      );

      toast({
        title: "Login successful!",
        description: "Welcome back to Launch Plan.",
      });

      // Navigate to dashboard after successful login
      setLocation("/dashboard");
    } catch (error) {
      console.error("[DEBUG] Firebase login failed:", error);

      // Try using the prop-based login as fallback
      if (login) {
        try {
          console.log("[DEBUG] Attempting login with props.login");
          await login({
            username: formData.username,
            password: formData.password,
          });

          toast({
            title: "Login successful!",
            description: "Welcome back to Launch Plan.",
          });

          setLocation("/dashboard");
          return;
        } catch (loginError) {
          console.error("[DEBUG] Props login failed:", loginError);
        }
      }

      // Both methods failed
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use the direct firebase service for Google login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log("[DEBUG] Starting Google login process...");

      // Call the service directly instead of using hooks
      const result = await firebaseAuthService.loginWithGoogle();

      console.log(
        "[DEBUG] Google sign-in result:",
        result && result.user ? "Success" : "Failed"
      );

      if (result && result.user) {
        toast({
          title: "Login successful!",
          description: "Welcome to Launch Plan.",
        });

        // Navigate to dashboard after successful login
        setLocation("/dashboard");
      }
    } catch (error: any) {
      // Only show an error if it's not a redirect (redirects aren't errors)
      if (!sessionStorage.getItem("usingGoogleRedirect")) {
        console.error("[DEBUG] Google login error:", error);
        toast({
          title: "Google login failed",
          description:
            error.message || "Unable to sign in with Google. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Show loading state while checking for redirect
  if (isCheckingRedirect) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-white">Checking authentication status...</div>
      </div>
    );
  }

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
            Sign in
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="rememberMe" className="text-gray-300 text-sm">
                Remember me for 30 days
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-800 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
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
                {isGoogleLoading ? "Signing in..." : "Continue with Google"}
              </span>
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-green-500 hover:text-green-400 font-medium"
            >
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
