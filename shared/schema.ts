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
  usNewsTop150: integer("us_news_top_150"), // Ranking or identifier in US News Top 150
  bestLiberalArtsColleges: integer("best_liberal_arts_colleges"), // Ranking or identifier for best liberal arts colleges
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
  usNewsTop150: true,
  bestLiberalArtsColleges: true,
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
  alias1: text("alias1"),
  alias2: text("alias2"),
  alias3: text("alias3"),
  alias4: text("alias4"),
  alias5: text("alias5"),
  salaryPct10: integer("salary_pct_10"),
  salaryPct25: integer("salary_pct_25"),
  salaryMedian: integer("salary_median"),
  salaryPct75: integer("salary_pct_75"),
  salaryPct90: integer("salary_pct_90"),
});

export const insertCareerSchema = createInsertSchema(careers).pick({
  title: true,
  description: true,
  salary: true,
  growthRate: true,
  education: true,
  category: true,
  alias1: true,
  alias2: true,
  alias3: true,
  alias4: true,
  alias5: true,
  salaryPct10: true,
  salaryPct25: true,
  salaryMedian: true,
  salaryPct75: true,
  salaryPct90: true,
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

// Career paths table
export const careerPaths = pgTable("career_paths", {
  id: serial("id").primaryKey(),
  field_of_study: text("field_of_study"),
  career_title: text("career_title").notNull(),
  option_rank: integer("option_rank"), // The position/rank of the career option for the field
});

export const insertCareerPathSchema = createInsertSchema(careerPaths).pick({
  field_of_study: true,
  career_title: true,
  option_rank: true,
});

export type CareerPath = typeof careerPaths.$inferSelect;
export type InsertCareerPath = z.infer<typeof insertCareerPathSchema>;

// Location Cost of Living table
export const locationCostOfLiving = pgTable("location_cost_of_living", {
  id: serial("id").primaryKey(),
  zip_code: text("zip_code").notNull(),
  city: text("city"),
  state: text("state"),
  housing: integer("housing"), // Monthly housing cost
  transportation: integer("transportation"), // Monthly transportation cost
  food: integer("food"), // Monthly food cost
  healthcare: integer("healthcare"), // Monthly healthcare cost
  personal_insurance: integer("personal_insurance"), // Monthly personal insurance cost
  apparel: integer("apparel"), // Monthly apparel cost
  services: integer("services"), // Monthly services cost
  entertainment: integer("entertainment"), // Monthly entertainment cost
  other: integer("other"), // Monthly other expenses
  monthly_expense: integer("monthly_expense"), // Total monthly expense
  income_adjustment_factor: real("income_adjustment_factor"), // Income adjustment factor based on cost of living
});

export const insertLocationCostOfLivingSchema = createInsertSchema(locationCostOfLiving).pick({
  zip_code: true,
  city: true,
  state: true,
  housing: true,
  transportation: true,
  food: true,
  healthcare: true,
  personal_insurance: true,
  apparel: true,
  services: true,
  entertainment: true,
  other: true,
  monthly_expense: true,
  income_adjustment_factor: true,
});

export type LocationCostOfLiving = typeof locationCostOfLiving.$inferSelect;
export type InsertLocationCostOfLiving = z.infer<typeof insertLocationCostOfLivingSchema>;

// Zip Code Income table
export const zipCodeIncome = pgTable("zip_code_income", {
  id: serial("id").primaryKey(),
  state: text("state"),
  zip_code: text("zip_code").notNull(),
  mean_income: integer("mean_income"), // Mean income for the zip code
  estimated_investments: integer("estimated_investments"), // Estimated investments
  home_value: integer("home_value"), // Average home value in the zip code
});

export const insertZipCodeIncomeSchema = createInsertSchema(zipCodeIncome).pick({
  state: true,
  zip_code: true,
  mean_income: true,
  estimated_investments: true,
  home_value: true,
});

export type ZipCodeIncome = typeof zipCodeIncome.$inferSelect;
export type InsertZipCodeIncome = z.infer<typeof insertZipCodeIncomeSchema>;

// College net price calculation results table
export const collegeCalculations = pgTable("college_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  collegeId: integer("college_id").references(() => colleges.id).notNull(),
  netPrice: integer("net_price").notNull(),
  inState: boolean("in_state").default(true),
  familyContribution: integer("family_contribution"),
  workStudy: integer("work_study"),
  studentLoanAmount: integer("student_loan_amount"),
  financialAid: integer("financial_aid"),
  householdIncome: integer("household_income"),
  householdSize: integer("household_size"),
  zip: text("zip"),
  tuitionUsed: integer("tuition_used"), // The actual tuition value used in the calculation
  roomAndBoardUsed: integer("room_and_board_used"),
  onCampusHousing: boolean("on_campus_housing").default(true),
  totalCost: integer("total_cost"),
  calculationDate: timestamp("calculation_date").defaultNow(),
  notes: text("notes"),
  includedInProjection: boolean("included_in_projection").default(false),
});

export const insertCollegeCalculationSchema = createInsertSchema(collegeCalculations).pick({
  userId: true,
  collegeId: true,
  netPrice: true,
  inState: true,
  familyContribution: true,
  workStudy: true,
  studentLoanAmount: true,
  financialAid: true,
  householdIncome: true,
  householdSize: true,
  zip: true,
  tuitionUsed: true,
  roomAndBoardUsed: true,
  onCampusHousing: true,
  totalCost: true,
  notes: true,
  includedInProjection: true,
});

export type CollegeCalculation = typeof collegeCalculations.$inferSelect;
export type InsertCollegeCalculation = z.infer<typeof insertCollegeCalculationSchema>;

// Career calculations table for financial projections
export const careerCalculations = pgTable("career_calculations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  careerId: integer("career_id").references(() => careers.id).notNull(),
  projectedSalary: integer("projected_salary").notNull(),
  startYear: integer("start_year"),
  education: text("education"),
  entryLevelSalary: integer("entry_level_salary"),
  midCareerSalary: integer("mid_career_salary"),
  experiencedSalary: integer("experienced_salary"),
  additionalNotes: text("additional_notes"),
  calculationDate: timestamp("calculation_date").defaultNow(),
  includedInProjection: boolean("included_in_projection").default(false),
  locationZip: text("location_zip"),
  adjustedForLocation: boolean("adjusted_for_location").default(false),
});

export const insertCareerCalculationSchema = createInsertSchema(careerCalculations).pick({
  userId: true,
  careerId: true,
  projectedSalary: true,
  startYear: true,
  education: true,
  entryLevelSalary: true,
  midCareerSalary: true,
  experiencedSalary: true,
  additionalNotes: true,
  includedInProjection: true,
  locationZip: true,
  adjustedForLocation: true,
});

export type CareerCalculation = typeof careerCalculations.$inferSelect;
export type InsertCareerCalculation = z.infer<typeof insertCareerCalculationSchema>;
