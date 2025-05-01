import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
  username?: string;
  email?: string;
  firebaseUid?: string;
  [key: string]: any; // Allow additional properties
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION || "86400", 10);

/**
 * Generate a JWT token for a user
 * @param payload The data to include in the token
 * @param expiresIn Override default expiration time (in seconds)
 * @returns The generated JWT token
 */
export function generateToken(
  payload: JWTPayload,
  expiresIn = JWT_EXPIRATION
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Create an authentication middleware that uses JWT
 */
export function jwtAuth(req: any, res: any, next: any) {
  // Check for token in Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  // Attach the decoded user information to the request
  req.user = decoded;
  next();
}
