import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  location: text("location"),
  zipCode: text("zip_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  location: true,
  zipCode: true,
});

// Financial profiles table
export const financialProfiles = pgTable("financial_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  householdIncome: integer("household_income"),
  householdSize: integer("household_size"),
  savingsAmount: integer("savings_amount"),
  studentLoanAmount: integer("student_loan_amount"),
  otherDebtAmount: integer("other_debt_amount"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFinancialProfileSchema = createInsertSchema(financialProfiles).pick({
  userId: true,
  householdIncome: true,
  householdSize: true,
  savingsAmount: true,
  studentLoanAmount: true,
  otherDebtAmount: true,
});

// Colleges table
export const colleges = pgTable("colleges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  state: text("state"),
  type: text("type"),
  tuition: integer("tuition"),
  roomAndBoard: integer("room_and_board"),
  acceptanceRate: real("acceptance_rate"),
  rating: real("rating"),
  size: text("size"),
  rank: integer("rank"),
  feesByIncome: jsonb("fees_by_income"),
});

export const insertCollegeSchema = createInsertSchema(colleges).pick({
  name: true,
  location: true,
  state: true,
  type: true,
  tuition: true,
  roomAndBoard: true,
  acceptanceRate: true,
  rating: true,
  size: true,
  rank: true,
  feesByIncome: true,
});

// Careers table
export const careers = pgTable("careers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  salary: integer("salary"),
  growthRate: text("growth_rate"),
  education: text("education"),
  category: text("category"),
});

export const insertCareerSchema = createInsertSchema(careers).pick({
  title: true,
  description: true,
  salary: true,
  growthRate: true,
  education: true,
  category: true,
});

// Favorites tables
export const favoriteColleges = pgTable("favorite_colleges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  collegeId: integer("college_id").references(() => colleges.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteCollegeSchema = createInsertSchema(favoriteColleges).pick({
  userId: true,
  collegeId: true,
});

export const favoriteCareers = pgTable("favorite_careers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  careerId: integer("career_id").references(() => careers.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteCareerSchema = createInsertSchema(favoriteCareers).pick({
  userId: true,
  careerId: true,
});

// Financial projections table
export const financialProjections = pgTable("financial_projections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  projectionData: jsonb("projection_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialProjectionSchema = createInsertSchema(financialProjections).pick({
  userId: true,
  name: true,
  projectionData: true,
});

// Notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emailNotifications: boolean("email_notifications").default(true),
  financialAlerts: boolean("financial_alerts").default(true),
  careerUpdates: boolean("career_updates").default(true),
  scholarshipAlerts: boolean("scholarship_alerts").default(true),
  dataCollection: boolean("data_collection").default(true),
  shareAnonymousData: boolean("share_anonymous_data").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).pick({
  userId: true,
  emailNotifications: true,
  financialAlerts: true,
  careerUpdates: true,
  scholarshipAlerts: true,
  dataCollection: true,
  shareAnonymousData: true,
});

// Milestones table
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  date: text("date"),
  yearsAway: integer("years_away"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  userId: true,
  type: true,
  title: true,
  date: true,
  yearsAway: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FinancialProfile = typeof financialProfiles.$inferSelect;
export type InsertFinancialProfile = z.infer<typeof insertFinancialProfileSchema>;

export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;

export type Career = typeof careers.$inferSelect;
export type InsertCareer = z.infer<typeof insertCareerSchema>;

export type FavoriteCollege = typeof favoriteColleges.$inferSelect;
export type InsertFavoriteCollege = z.infer<typeof insertFavoriteCollegeSchema>;

export type FavoriteCareer = typeof favoriteCareers.$inferSelect;
export type InsertFavoriteCareer = z.infer<typeof insertFavoriteCareerSchema>;

export type FinancialProjection = typeof financialProjections.$inferSelect;
export type InsertFinancialProjection = z.infer<typeof insertFinancialProjectionSchema>;

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferencesSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
