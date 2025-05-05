import express from "express";
import { db } from "../db-config";
import { verifyFirebaseToken } from "../middleware/firebase-auth";
import { sql } from "drizzle-orm";

const router = express.Router();

// Get career insights
router.get("/insights", verifyFirebaseToken, async (req, res) => {
  try {
    const { careerId } = req.query;

    if (!careerId) {
      return res.status(400).json({ message: "Career ID is required" });
    }

    const result = await db.execute(
      sql`SELECT 
            c.title,
            c.description,
            c.salary_median,
            c.growth_rate,
            c.education_required,
            c.skills_required,
            c.work_environment,
            c.work_life_balance,
            c.job_satisfaction,
            c.stress_level,
            c.work_environment_score,
            c.work_life_balance_score,
            c.job_satisfaction_score,
            c.stress_level_score
          FROM careers c
          WHERE c.id = ${careerId}`
    );

    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Career not found" });
    }

    const career = rows[0];
    return res.json({
      title: career.title,
      description: career.description,
      salary: career.salary_median,
      growthRate: career.growth_rate,
      educationRequired: career.education_required,
      skillsRequired: career.skills_required,
      workEnvironment: career.work_environment,
      workLifeBalance: career.work_life_balance,
      jobSatisfaction: career.job_satisfaction,
      stressLevel: career.stress_level,
      workEnvironmentScore: career.work_environment_score,
      workLifeBalanceScore: career.work_life_balance_score,
      jobSatisfactionScore: career.job_satisfaction_score,
      stressLevelScore: career.stress_level_score
    });
  } catch (error) {
    console.error("Error fetching career insights:", error);
    return res.status(500).json({ message: "Failed to fetch career insights" });
  }
});

// Get career timeline
router.get("/timeline", verifyFirebaseToken, async (req, res) => {
  try {
    const { careerId } = req.query;

    if (!careerId) {
      return res.status(400).json({ message: "Career ID is required" });
    }

    const result = await db.execute(
      sql`SELECT 
            c.title,
            c.education_required,
            c.salary_median,
            c.growth_rate,
            c.work_environment,
            c.work_life_balance,
            c.job_satisfaction,
            c.stress_level
          FROM careers c
          WHERE c.id = ${careerId}`
    );

    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Career not found" });
    }

    const career = rows[0];
    return res.json({
      title: career.title,
      educationRequired: career.education_required,
      salary: career.salary_median,
      growthRate: career.growth_rate,
      workEnvironment: career.work_environment,
      workLifeBalance: career.work_life_balance,
      jobSatisfaction: career.job_satisfaction,
      stressLevel: career.stress_level
    });
  } catch (error) {
    console.error("Error fetching career timeline:", error);
    return res.status(500).json({ message: "Failed to fetch career timeline" });
  }
});

// Get career calculations
router.get("/calculations", verifyFirebaseToken, async (req, res) => {
  try {
    const { careerId } = req.query;

    if (!careerId) {
      return res.status(400).json({ message: "Career ID is required" });
    }

    const result = await db.execute(
      sql`SELECT 
            c.title,
            c.salary_median,
            c.growth_rate,
            c.work_environment_score,
            c.work_life_balance_score,
            c.job_satisfaction_score,
            c.stress_level_score
          FROM careers c
          WHERE c.id = ${careerId}`
    );

    const rows = Array.isArray(result) ? result : [];
    if (rows.length === 0) {
      return res.status(404).json({ message: "Career not found" });
    }

    const career = rows[0];
    return res.json({
      title: career.title,
      salary: career.salary_median,
      growthRate: career.growth_rate,
      workEnvironmentScore: career.work_environment_score,
      workLifeBalanceScore: career.work_life_balance_score,
      jobSatisfactionScore: career.job_satisfaction_score,
      stressLevelScore: career.stress_level_score
    });
  } catch (error) {
    console.error("Error fetching career calculations:", error);
    return res.status(500).json({ message: "Failed to fetch career calculations" });
  }
});

export default router; 