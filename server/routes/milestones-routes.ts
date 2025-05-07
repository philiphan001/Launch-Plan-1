import { Router, Request, Response, NextFunction } from "express";
import { pgStorage } from "../pg-storage";
import { verifyFirebaseToken, AuthenticatedUser } from "../middleware/firebase-auth";
import { validateRequest } from "../../shared/middleware";
import { insertMilestoneSchema } from "../../shared/schema";

const router = Router();

// Helper: Check user access
const checkUserAccess = (req: Request, res: Response, next: NextFunction) => {
  const requestedUserId = parseInt(req.params.userId || req.body.userId, 10);
  const authenticatedUser = req.user as AuthenticatedUser | undefined;
  const authenticatedUserId = authenticatedUser?.id;

  if (!authenticatedUserId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (isNaN(requestedUserId)) {
    return res.status(400).json({ message: "Invalid user ID format in URL parameter" });
  }
  if (authenticatedUserId !== requestedUserId) {
    return res.status(403).json({ message: "Forbidden: You do not have permission to access this resource" });
  }
  next();
};

// Create milestone
router.post(
  "/",
  verifyFirebaseToken,
  validateRequest({ body: insertMilestoneSchema }),
  checkUserAccess,
  async (req: Request, res: Response) => {
    try {
      const milestone = await pgStorage.createMilestone(req.body);
      res.status(201).json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Failed to create milestone" });
    }
  }
);

// Get all milestones for a user
router.get(
  "/user/:userId",
  verifyFirebaseToken,
  checkUserAccess,
  async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const milestones = await pgStorage.getMilestonesByUserId(userId);
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Failed to get milestones" });
    }
  }
);

// Update milestone
router.patch(
  "/:id",
  verifyFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const milestone = await pgStorage.getMilestone(id);
      const authenticatedUser = req.user as AuthenticatedUser | undefined;
      if (!milestone) return res.status(404).json({ message: "Milestone not found" });
      if (!authenticatedUser || milestone.userId !== authenticatedUser.id) {
        return res.status(403).json({ message: "Forbidden: You do not own this milestone" });
      }
      const updated = await pgStorage.updateMilestone(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update milestone" });
    }
  }
);

// Delete milestone
router.delete(
  "/:id",
  verifyFirebaseToken,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const milestone = await pgStorage.getMilestone(id);
      const authenticatedUser = req.user as AuthenticatedUser | undefined;
      if (!milestone) return res.status(404).json({ message: "Milestone not found" });
      if (!authenticatedUser || milestone.userId !== authenticatedUser.id) {
        return res.status(403).json({ message: "Forbidden: You do not own this milestone" });
      }
      await pgStorage.deleteMilestone(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  }
);

export default router; 