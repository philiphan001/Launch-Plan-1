import { pgTable, text, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define filing status enum
export const filingStatusEnum = z.enum([
  "single",
  "married_joint",
  "married_separate",
  "head_of_household",
]);

export type FilingStatus = z.infer<typeof filingStatusEnum>;

// Define tax year table
export const taxYears = pgTable("tax_years", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull().unique(),
  standardDeductionSingle: integer("standard_deduction_single").notNull(),
  standardDeductionMarriedJoint: integer("standard_deduction_married_joint").notNull(),
  standardDeductionMarriedSeparate: integer("standard_deduction_married_separate").notNull(),
  standardDeductionHeadOfHousehold: integer("standard_deduction_head_of_household").notNull(),
  personalExemption: integer("personal_exemption"),
  socialSecurityWageBase: integer("social_security_wage_base").notNull(),
  medicareAdditionalRateThreshold: integer("medicare_additional_rate_threshold"),
  isCurrent: boolean("is_current").default(false),
});

export const insertTaxYearSchema = createInsertSchema(taxYears).omit({
  id: true,
});

export type TaxYear = typeof taxYears.$inferSelect;
export type InsertTaxYear = z.infer<typeof insertTaxYearSchema>;

// Define federal tax bracket table
export const federalTaxBrackets = pgTable("federal_tax_brackets", {
  id: serial("id").primaryKey(),
  taxYearId: integer("tax_year_id").notNull(),
  filingStatus: text("filing_status").notNull(),
  bracketIndex: integer("bracket_index").notNull(), // 0-based index for ordering
  lowerBound: integer("lower_bound").notNull(),
  upperBound: integer("upper_bound"),
  rate: real("rate").notNull(), // Stored as decimal (e.g., 0.22 for 22%)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFederalTaxBracketSchema = createInsertSchema(federalTaxBrackets).omit({
  id: true,
  createdAt: true,
});

export type FederalTaxBracket = typeof federalTaxBrackets.$inferSelect;
export type InsertFederalTaxBracket = z.infer<typeof insertFederalTaxBracketSchema>;

// Define states table for tax purposes
export const taxStates = pgTable("tax_states", {
  id: serial("id").primaryKey(),
  stateCode: text("state_code").notNull().unique(), // Two-letter code (e.g., CA, NY)
  name: text("name").notNull(),
  hasFlatTax: boolean("has_flat_tax").default(false),
  flatTaxRate: real("flat_tax_rate"), // Only used if hasFlatTax is true
  hasIncomeTax: boolean("has_income_tax").default(true),
  specialRules: text("special_rules"), // Text description of any special rules
  standardDeductionSingle: integer("standard_deduction_single"),
  standardDeductionMarriedJoint: integer("standard_deduction_married_joint"),
  standardDeductionMarriedSeparate: integer("standard_deduction_married_separate"),
  standardDeductionHeadOfHousehold: integer("standard_deduction_head_of_household"),
  personalExemption: integer("personal_exemption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaxStateSchema = createInsertSchema(taxStates).omit({
  id: true,
  createdAt: true,
});

export type TaxState = typeof taxStates.$inferSelect;
export type InsertTaxState = z.infer<typeof insertTaxStateSchema>;

// Define state tax bracket table
export const stateTaxBrackets = pgTable("state_tax_brackets", {
  id: serial("id").primaryKey(),
  stateId: integer("state_id").notNull(),
  taxYearId: integer("tax_year_id").notNull(),
  filingStatus: text("filing_status").notNull(),
  bracketIndex: integer("bracket_index").notNull(), // 0-based index for ordering
  lowerBound: integer("lower_bound").notNull(),
  upperBound: integer("upper_bound"),
  rate: real("rate").notNull(), // Stored as decimal (e.g., 0.22 for 22%)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStateTaxBracketSchema = createInsertSchema(stateTaxBrackets).omit({
  id: true,
  createdAt: true,
});

export type StateTaxBracket = typeof stateTaxBrackets.$inferSelect;
export type InsertStateTaxBracket = z.infer<typeof insertStateTaxBracketSchema>;

// Define payroll tax rates table
export const payrollTaxRates = pgTable("payroll_tax_rates", {
  id: serial("id").primaryKey(),
  taxYearId: integer("tax_year_id").notNull(),
  name: text("name").notNull(), // e.g., "Social Security", "Medicare"
  employeeRate: real("employee_rate").notNull(), // Employee portion
  employerRate: real("employer_rate").notNull(), // Employer portion
  selfEmploymentRate: real("self_employment_rate"), // Self-employment rate if applicable
  wageBase: integer("wage_base"), // Wage base limit, NULL for unlimited
  additionalRate: real("additional_rate"), // Additional rate for high earners
  additionalRateThreshold: integer("additional_rate_threshold"), // Threshold for additional rate
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPayrollTaxRateSchema = createInsertSchema(payrollTaxRates).omit({
  id: true,
  createdAt: true,
});

export type PayrollTaxRate = typeof payrollTaxRates.$inferSelect;
export type InsertPayrollTaxRate = z.infer<typeof insertPayrollTaxRateSchema>;

// Define tax credits table
export const taxCredits = pgTable("tax_credits", {
  id: serial("id").primaryKey(),
  taxYearId: integer("tax_year_id").notNull(),
  name: text("name").notNull(), // e.g., "Child Tax Credit"
  description: text("description"),
  maxAmount: integer("max_amount").notNull(),
  phaseOutStart: integer("phase_out_start"), // Income level where phase-out begins
  phaseOutEnd: integer("phase_out_end"), // Income level where credit is fully phased out
  refundable: boolean("refundable").default(false), // Whether the credit is refundable
  eligibilityCriteria: text("eligibility_criteria"), // Text description of eligibility requirements
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTaxCreditSchema = createInsertSchema(taxCredits).omit({
  id: true,
  createdAt: true,
});

export type TaxCredit = typeof taxCredits.$inferSelect;
export type InsertTaxCredit = z.infer<typeof insertTaxCreditSchema>;

// Define user tax settings table
export const userTaxSettings = pgTable("user_tax_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filingStatus: text("filing_status").notNull().default("single"),
  stateCode: text("state_code"), // State for state income tax calculation
  dependents: integer("dependents").default(0),
  itemizeDeductions: boolean("itemize_deductions").default(false),
  estimatedItemizedDeductions: integer("estimated_itemized_deductions"),
  estimatedTaxCredits: integer("estimated_tax_credits"),
  additionalWithholding: integer("additional_withholding").default(0),
  selfEmployed: boolean("self_employed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserTaxSettingsSchema = createInsertSchema(userTaxSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserTaxSettings = typeof userTaxSettings.$inferSelect;
export type InsertUserTaxSettings = z.infer<typeof insertUserTaxSettingsSchema>;