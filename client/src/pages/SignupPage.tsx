import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

import { User, AuthProps } from "@/interfaces/auth";

interface SignupPageProps extends AuthProps {}

export default function SignupPage({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}: SignupPageProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signup(formData.name, formData.email, formData.password);
      
      toast({
        title: "Account created!",
        description: "Welcome to Launch Plan. Your account has been created successfully.",
      });
      
      console.log("SignupPage: User authenticated, redirecting to pathways");
      // First time users go to pathways
      setLocation('/pathways');
    } catch (error) {
      toast({
        title: "Error creating account",
        description: "There was a problem creating your account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to home
            </Button>
          </div>
          <CardTitle className="text-2xl text-white font-bold">Create an account</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your information below to create your Launch Plan account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
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
              <Label htmlFor="password" className="text-white">Password</Label>
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
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
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
            <Link href="/login" className="text-green-500 hover:text-green-400 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}