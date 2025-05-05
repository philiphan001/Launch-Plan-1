import { Request, Response, NextFunction } from "express";
import type { AuthenticatedUser } from "../middleware/firebase-auth";

// Helper function for authorization check
export const checkUserAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestedUserId = parseInt(req.params.userId || req.params.id, 10);
  const authenticatedUser = req.user as AuthenticatedUser | undefined;
  const authenticatedUserId = authenticatedUser?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (isNaN(requestedUserId)) {
    return res
      .status(400)
      .json({ message: "Invalid user ID format in URL parameter" });
  }

  if (authenticatedUserId !== requestedUserId) {
    console.warn(
      `Authorization Failed: User ${authenticatedUserId} attempted to access resource for user ${requestedUserId}`
    );
    return res.status(403).json({
      message: "Forbidden: You do not have permission to access this resource",
    });
  }
  next();
};
