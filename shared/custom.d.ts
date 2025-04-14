import { User } from './schema';

declare global {
  namespace Express {
    interface User extends Omit<User, 'password'> {}
    
    interface Request {
      user?: User;
      isAuthenticated(): boolean;
      isUnauthenticated(): boolean;
      login(user: User, callback: (err: any) => void): void;
      login(user: User, options: any, callback: (err: any) => void): void;
      logout(callback: (err: any) => void): void;
      logOut(callback: (err: any) => void): void;
    }
  }
}