import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Secret key for signing JWT tokens
// In production, this should be set via environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret-key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d"; // Default expiry: 7 days

// Interface for JWT payload
interface JwtPayload {
  userId: number;
  username: string;
  email?: string;
  firebaseUid?: string;
  [key: string]: any; // Allow additional properties
}

/**
 * Generate a JWT token for a user
 * @param payload - The data to encode in the token
 * @returns The generated JWT token
 */
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });
};

/**
 * Verify a JWT token and return the decoded payload
 * @param token - The token to verify
 * @returns The decoded token payload or null if verification fails
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
};

/**
 * Express middleware to authenticate requests using JWT
 */
export const jwtAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return;
  }

  // Attach user info to request object
  (req as any).user = decoded;

  next();
};
