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
  birthYear: integer("birth_year"),
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
  birthYear: true,
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
  financialImpact: integer("financial_impact"),
  spouseOccupation: text("spouse_occupation"),
  spouseIncome: integer("spouse_income"),
  spouseAssets: integer("spouse_assets"),
  spouseLiabilities: integer("spouse_liabilities"),
  homeValue: integer("home_value"),
  homeDownPayment: integer("home_down_payment"),
  homeMonthlyPayment: integer("home_monthly_payment"),
  carValue: integer("car_value"),
  carDownPayment: integer("car_down_payment"),
  carMonthlyPayment: integer("car_monthly_payment"),
  educationCost: integer("education_cost"),
  educationType: text("education_type"),
  educationYears: integer("education_years"),
  educationAnnualCost: integer("education_annual_cost"),
  educationAnnualLoan: integer("education_annual_loan"),
  targetOccupation: text("target_occupation"),
  workStatus: text("work_status"),
  partTimeIncome: integer("part_time_income"),
  returnToSameProfession: boolean("return_to_same_profession"),
  childrenCount: integer("children_count"),
  childrenExpensePerYear: integer("children_expense_per_year"),
  active: boolean("active").default(true),
  completed: boolean("completed").default(false),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  userId: true,
  type: true,
  title: true,
  date: true,
  yearsAway: true,
  financialImpact: true,
  spouseOccupation: true,
  spouseIncome: true,
  spouseAssets: true,
  spouseLiabilities: true,
  homeValue: true,
  homeDownPayment: true,
  homeMonthlyPayment: true,
  carValue: true,
  carDownPayment: true,
  carMonthlyPayment: true,
  educationCost: true,
  educationType: true,
  educationYears: true,
  educationAnnualCost: true,
  educationAnnualLoan: true,
  targetOccupation: true,
  workStatus: true, 
  partTimeIncome: true,
  returnToSameProfession: true,
  childrenCount: true,
  childrenExpensePerYear: true,
  active: true,
  completed: true,
  details: true,
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

// Define categories for assumptions
export const assumptionCategoryEnum = z.enum([
  "marriage",
  "housing",
  "car",
  "children",
  "education",
  "general",
]);

export type AssumptionCategory = z.infer<typeof assumptionCategoryEnum>;

// Assumptions table
export const assumptions = pgTable("assumptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  key: text("key").notNull(),
  label: text("label").notNull(),
  description: text("description"),
  value: real("value").notNull(),
  defaultValue: real("default_value").notNull(),
  minValue: real("min_value").notNull(),
  maxValue: real("max_value").notNull(),
  stepValue: real("step_value").notNull().default(1),
  unit: text("unit").default(""),
  isEnabled: boolean("is_enabled").notNull().default(true),
});

// Zod schema for inserting assumption
export const insertAssumptionSchema = createInsertSchema(assumptions).omit({
  id: true,
});

// Types for TypeScript
export type Assumption = typeof assumptions.$inferSelect;
export type InsertAssumption = z.infer<typeof insertAssumptionSchema>;

// Default assumptions to be used when first creating a user profile
export const defaultAssumptions: Omit<InsertAssumption, "userId">[] = [
  {
    category: "general",
    key: "personal-loan-term",
    label: "Personal Loan Term",
    description: "Length of personal loans created when milestone expenses exceed available savings",
    value: 5,
    defaultValue: 5,
    minValue: 1,
    maxValue: 10,
    stepValue: 1,
    unit: "years",
    isEnabled: true
  },
  {
    category: "general",
    key: "personal-loan-rate",
    label: "Personal Loan Interest Rate",
    description: "Annual interest rate for personal loans",
    value: 8.0,
    defaultValue: 8.0,
    minValue: 3.0,
    maxValue: 15.0,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "general",
    key: "retirement-growth-rate",
    label: "Retirement Account Growth Rate",
    description: "Annual investment growth rate for retirement accounts",
    value: 6.0,
    defaultValue: 6.0,
    minValue: 0.0,
    maxValue: 12.0,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "general",
    key: "retirement-contribution-rate",
    label: "Retirement Contribution Rate",
    description: "Percentage of income contributed to retirement accounts annually",
    value: 10.0,
    defaultValue: 10.0,
    minValue: 0.0,
    maxValue: 25.0,
    stepValue: 0.5,
    unit: "%",
    isEnabled: true
  },
  {
    category: "marriage",
    key: "spouse-loan-term",
    label: "Spouse Loan Repayment Term",
    description: "Number of years to repay spouse's liabilities",
    value: 10,
    defaultValue: 10,
    minValue: 5,
    maxValue: 30,
    stepValue: 1,
    unit: "years",
    isEnabled: true
  },
  {
    category: "marriage",
    key: "spouse-loan-rate",
    label: "Spouse Loan Interest Rate",
    description: "Annual interest rate for spouse's liabilities",
    value: 5.0,
    defaultValue: 5.0,
    minValue: 0,
    maxValue: 15,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "marriage",
    key: "spouse-asset-growth",
    label: "Spouse Asset Growth Rate",
    description: "Annual growth rate for spouse's assets",
    value: 3.0,
    defaultValue: 3.0,
    minValue: 0,
    maxValue: 10,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "housing",
    key: "home-appreciation",
    label: "Home Appreciation Rate",
    description: "Annual rate at which your home value increases",
    value: 3.0,
    defaultValue: 3.0,
    minValue: 0,
    maxValue: 10,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "housing",
    key: "mortgage-rate",
    label: "Mortgage Interest Rate",
    description: "Annual interest rate for home loans",
    value: 6.0,
    defaultValue: 6.0,
    minValue: 2,
    maxValue: 10,
    stepValue: 0.125,
    unit: "%",
    isEnabled: true
  },
  {
    category: "car",
    key: "car-depreciation",
    label: "Car Depreciation Rate",
    description: "Annual rate at which your car loses value",
    value: 15.0,
    defaultValue: 15.0,
    minValue: 5,
    maxValue: 30,
    stepValue: 1,
    unit: "%",
    isEnabled: true
  },
  {
    category: "car",
    key: "car-loan-rate",
    label: "Car Loan Interest Rate",
    description: "Annual interest rate for car loans",
    value: 5.0,
    defaultValue: 5.0,
    minValue: 0,
    maxValue: 15,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "education",
    key: "education-loan-rate",
    label: "Education Loan Interest Rate",
    description: "Annual interest rate for education loans",
    value: 5.0,
    defaultValue: 5.0,
    minValue: 0,
    maxValue: 12,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "education",
    key: "education-loan-term",
    label: "Education Loan Term",
    description: "Number of years to repay education loans",
    value: 10,
    defaultValue: 10,
    minValue: 5,
    maxValue: 30,
    stepValue: 1,
    unit: "years",
    isEnabled: true
  },
  {
    category: "student-loans",
    key: "student-loan-rate",
    label: "Student Loan Interest Rate",
    description: "Annual interest rate for existing student loans",
    value: 5.0,
    defaultValue: 5.0,
    minValue: 0,
    maxValue: 12,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    category: "student-loans",
    key: "student-loan-term",
    label: "Student Loan Term",
    description: "Number of years to repay existing student loans",
    value: 10,
    defaultValue: 10,
    minValue: 5,
    maxValue: 30,
    stepValue: 1,
    unit: "years",
    isEnabled: true
  }
];
