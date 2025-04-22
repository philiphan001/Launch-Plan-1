import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { AuthProps } from "@/interfaces/auth";

interface LoginPageProps extends Partial<AuthProps> {}

export default function LoginPage(props: LoginPageProps) {
  const { user, isAuthenticated, isFirstTimeUser, login } = props;
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if login is provided via props
      if (login) {
        await login({
          username: formData.username,
          password: formData.password
        });
        
        toast({
          title: "Login successful!",
          description: "Welcome back to Launch Plan.",
        });
        
        // Returning users go to dashboard
        setLocation('/dashboard');
      } else {
        // Fallback - direct API call if login function not provided
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Login failed');
        }
        
        toast({
          title: "Login successful!",
          description: "Welcome back to Launch Plan.",
        });
        
        // Refresh the page to trigger auth check
        window.location.href = '/dashboard';
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
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
          <CardTitle className="text-2xl text-white font-bold">Sign in</CardTitle>
          <CardDescription className="text-gray-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
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
                <Label htmlFor="password" className="text-white">Password</Label>
                <Link href="/forgot-password" className="text-sm text-green-500 hover:text-green-400">
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
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-green-500 hover:text-green-400 font-medium">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}