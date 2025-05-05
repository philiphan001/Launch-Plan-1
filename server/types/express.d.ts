import { User } from "../../shared/schema";
import * as admin from "firebase-admin";

// Create a more explicit type for authenticated user without passwordHash
export interface AuthenticatedUser extends Omit<User, "passwordHash"> {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  location?: string | null;
  zipCode?: string | null;
  birthYear?: number | null;
  onboardingCompleted: boolean;
  firebaseUid?: string | null;
  createdAt?: Date | null;
  lastLogin?: Date | null;
}

declare global {
  namespace Express {
    // Extend Request interface
    interface Request {
      firebaseUser?: admin.auth.DecodedIdToken;
      user?: AuthenticatedUser;
    }
  }
}

// Ensure this file is treated as a module with exports
export {};
