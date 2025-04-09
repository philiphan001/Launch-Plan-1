import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  isFirstTimeUser: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isFirstTimeUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // On component mount, check localStorage for saved user data
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(parsedUser.isFirstTimeUser);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call - in a real app, this would be an actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll create a mock user
      const mockUser: User = {
        id: 1,
        name: email.split('@')[0], // Just use the username part of the email
        email,
        isFirstTimeUser: false // Returning users aren't first-time users
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(false);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  
  const signup = async (name: string, email: string, password: string) => {
    try {
      // Simulate API call - in a real app, this would be an actual backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll create a mock user
      const mockUser: User = {
        id: Date.now(), // Use timestamp as a unique ID
        name,
        email,
        isFirstTimeUser: true // New users are first-time users
      };
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsFirstTimeUser(true);
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsFirstTimeUser(false);
    localStorage.removeItem('user');
  };
  
  const completeOnboarding = () => {
    if (user) {
      const updatedUser = {
        ...user,
        isFirstTimeUser: false
      };
      setUser(updatedUser);
      setIsFirstTimeUser(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        isFirstTimeUser,
        login, 
        signup, 
        logout,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};