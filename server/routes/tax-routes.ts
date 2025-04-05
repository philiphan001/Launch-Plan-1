import { Express, Request, Response } from "express";
import { z } from "zod";
import { validateRequest } from "../../shared/middleware";

// Tax calculation schema
const taxCalculationSchema = z.object({
  income: z.number().positive("Income must be a positive number"),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
  stateCode: z.string().max(2).optional(),
});

// Paycheck calculation schema
const paycheckCalculationSchema = z.object({
  annualIncome: z.number().positive("Annual income must be a positive number"),
  payFrequency: z.enum(["weekly", "biweekly", "semimonthly", "monthly"], {
    required_error: "Pay frequency is required",
  }),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
  stateCode: z.string().max(2).optional(),
});

// State comparison schema
const stateComparisonSchema = z.object({
  income: z.number().positive("Income must be a positive number"),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
  stateCodes: z.array(z.string().length(2)).min(1, "At least one state code is required"),
});

// Mock tax calculation function (to be replaced with actual Python implementation)
const calculateTax = (income: number, filingStatus: string, stateCode?: string) => {
  // For now, we'll use a simple mock calculation
  // This will be replaced with the actual tax calculation from Python
  const federalIncomeTax = income * 0.15;
  const socialSecurity = Math.min(income * 0.062, 9114); // 6.2% up to $147,000 for 2022
  const medicare = income * 0.0145;
  
  // Mock state tax calculation
  let stateTax = 0;
  let stateMarginalRate = 0;
  let stateEffectiveRate = 0;
  
  if (stateCode) {
    switch (stateCode) {
      case "CA":
        stateTax = income * 0.08;
        stateMarginalRate = 8.0;
        break;
      case "NY":
        stateTax = income * 0.065;
        stateMarginalRate = 6.5;
        break;
      case "IL":
        stateTax = income * 0.0495;
        stateMarginalRate = 4.95;
        break;
      case "TX":
        // No state income tax
        stateTax = 0;
        stateMarginalRate = 0;
        break;
      default:
        stateTax = income * 0.05;
        stateMarginalRate = 5.0;
    }
    
    stateEffectiveRate = (stateTax / income) * 100;
  }
  
  const totalTax = federalIncomeTax + socialSecurity + medicare + stateTax;
  const takeHomePay = income - totalTax;
  const effectiveTaxRate = (totalTax / income) * 100;
  const federalEffectiveRate = ((federalIncomeTax + socialSecurity + medicare) / income) * 100;
  
  return {
    income,
    total_tax: totalTax,
    take_home_pay: takeHomePay,
    effective_tax_rate: effectiveTaxRate,
    federal: {
      income_tax: federalIncomeTax,
      social_security: socialSecurity,
      medicare: medicare,
      marginal_rate: 15.0, // Mock marginal rate
      effective_rate: federalEffectiveRate,
    },
    state: {
      state_code: stateCode || null,
      tax: stateTax,
      marginal_rate: stateMarginalRate,
      effective_rate: stateEffectiveRate,
    }
  };
};

// Mock paycheck calculation function
const calculatePaycheck = (annualIncome: number, payFrequency: string, filingStatus: string, stateCode?: string) => {
  const taxResult = calculateTax(annualIncome, filingStatus, stateCode);
  
  // Calculate pay periods based on frequency
  let payPeriods = 26; // biweekly default
  switch (payFrequency) {
    case "weekly":
      payPeriods = 52;
      break;
    case "biweekly":
      payPeriods = 26;
      break;
    case "semimonthly":
      payPeriods = 24;
      break;
    case "monthly":
      payPeriods = 12;
      break;
  }
  
  const grossPay = annualIncome / payPeriods;
  const federalWithholding = taxResult.federal.income_tax / payPeriods;
  const socialSecurity = taxResult.federal.social_security / payPeriods;
  const medicare = taxResult.federal.medicare / payPeriods;
  const stateWithholding = taxResult.state.tax / payPeriods;
  const totalWithholding = federalWithholding + socialSecurity + medicare + stateWithholding;
  const netPay = grossPay - totalWithholding;
  
  return {
    gross_pay: grossPay,
    net_pay: netPay,
    pay_frequency: payFrequency,
    pay_periods: payPeriods,
    annual_gross_pay: annualIncome,
    annual_net_pay: netPay * payPeriods,
    federal_withholding: federalWithholding,
    social_security: socialSecurity,
    medicare: medicare,
    state_withholding: stateWithholding,
    total_withholding: totalWithholding,
  };
};

// Register tax routes
export async function registerTaxRoutes(app: Express): Promise<void> {
  
  // Tax calculation endpoint
  app.post("/api/tax/calculate", validateRequest({ body: taxCalculationSchema }), (req: Request, res: Response) => {
    try {
      const { income, filingStatus, stateCode } = req.body;
      
      // Handle "NONE" value for state code
      const actualStateCode = stateCode === "NONE" ? undefined : stateCode;
      
      // Call the tax calculation function
      const result = calculateTax(income, filingStatus, actualStateCode);
      
      res.json(result);
    } catch (error) {
      console.error("Tax calculation error:", error);
      res.status(500).json({ error: "Failed to calculate taxes" });
    }
  });
  
  // Paycheck calculation endpoint
  app.post("/api/tax/paycheck", validateRequest({ body: paycheckCalculationSchema }), (req: Request, res: Response) => {
    try {
      const { annualIncome, payFrequency, filingStatus, stateCode } = req.body;
      
      // Handle "NONE" value for state code
      const actualStateCode = stateCode === "NONE" ? undefined : stateCode;
      
      // Call the paycheck calculation function
      const result = calculatePaycheck(annualIncome, payFrequency, filingStatus, actualStateCode);
      
      res.json(result);
    } catch (error) {
      console.error("Paycheck calculation error:", error);
      res.status(500).json({ error: "Failed to calculate paycheck details" });
    }
  });
  
  // State comparison endpoint
  app.post("/api/tax/compare-states", validateRequest({ body: stateComparisonSchema }), (req: Request, res: Response) => {
    try {
      const { income, filingStatus, stateCodes } = req.body;
      
      // Calculate taxes for each state
      const stateResults: Record<string, any> = {};
      
      for (const stateCode of stateCodes) {
        const result = calculateTax(income, filingStatus, stateCode);
        stateResults[stateCode] = {
          state_tax: result.state.tax,
          total_tax: result.total_tax,
          take_home_pay: result.take_home_pay,
          effective_tax_rate: result.effective_tax_rate,
        };
      }
      
      res.json(stateResults);
    } catch (error) {
      console.error("State comparison error:", error);
      res.status(500).json({ error: "Failed to compare state tax burdens" });
    }
  });
}