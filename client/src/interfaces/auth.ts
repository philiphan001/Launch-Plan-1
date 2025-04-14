export interface User {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  zipCode?: string;
  birthYear?: number;
  createdAt?: string;
  isFirstTimeUser?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  zipCode?: string;
  birthYear?: number;
}

export interface AuthProps {
  user: User | null;
  isAuthenticated: boolean;
  isFirstTimeUser: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
}