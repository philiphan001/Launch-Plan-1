export interface User {
  id: number;
  name: string;
  email: string;
  isFirstTimeUser: boolean;
}

export interface AuthProps {
  user: User | null;
  isAuthenticated: boolean;
  isFirstTimeUser: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}