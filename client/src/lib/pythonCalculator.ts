// Python Calculator Service
// This file provides a service for interacting with the Python calculator backend

import { Milestone } from "@shared/schema";

// Define a type for the input data we'll send to the Python calculator
export interface CalculatorInputData {
  startAge: number;
  yearsToProject: number;
  pathType: string;
  assets: Array<{
    type: string;
    name: string;
    initialValue: number;
    growthRate?: number;
    depreciationRate?: number;
  }>;
  liabilities: Array<{
    type: string;
    name: string;
    initialBalance: number;
    interestRate: number;
    termYears: number;
    defermentYears?: number;
    subsidized?: boolean;
  }>;
  incomes: Array<{
    type: string;
    name: string;
    annualAmount: number;
    growthRate: number;
    startYear?: number;
    endYear?: number;
    bonus_percent?: number;
  }>;
  expenditures: Array<{
    type: string;
    name: string;
    annualAmount: number;
    inflationRate: number;
    lifestyle_factor?: number;
    tax_rate?: number;
  }>;
  milestones: Array<any>;
}

// Define a type for the projection data returned from the calculator
export interface FinancialProjectionData {
  netWorth: number[];
  income: number[];
  spouseIncome?: number[];
  expenses: number[];
  assets: number[];
  liabilities: number[];
  ages: number[];
  
  // Base cost of living categories
  housing?: number[];
  transportation?: number[];
  food?: number[];
  healthcare?: number[];
  personalInsurance?: number[];
  apparel?: number[];
  services?: number[];
  entertainment?: number[];
  other?: number[];
  
  // Milestone-driven categories
  education?: number[];
  childcare?: number[];
  debt?: number[];
  discretionary?: number[];
  
  // Asset breakdown
  homeValue?: number[];
  mortgage?: number[];
  carValue?: number[];
  carLoan?: number[];
  studentLoan?: number[];
  
  // Milestone data
  milestones?: any[];
}

// Generate the input data for the Python calculator
export const generatePythonCalculatorInput = (
  age: number,
  years: number,
  startingSavings: number,
  income: number,
  expenses: number,
  incomeGrowth: number,
  studentLoanDebt: number,
  milestones: Milestone[] = [],
  costOfLivingFactor: number = 1.0
): CalculatorInputData => {
  // Sort milestones by yearsAway 
  const sortedMilestones = milestones ? [...milestones].sort((a, b) => {
    const aYears = a.yearsAway ?? 0;
    const bYears = b.yearsAway ?? 0;
    return aYears - bYears;
  }) : [];
  
  // Adjust income based on cost of living
  const adjustedIncome = income * costOfLivingFactor;
  
  // Format milestones for the Python calculator
  const formattedMilestones = sortedMilestones.map(milestone => {
    // Extract milestone type and yearsAway
    const { type, yearsAway, ...rest } = milestone;
    
    // Create a new milestone object with year property instead of yearsAway
    return {
      type,
      year: yearsAway ?? 0,
      ...rest
    };
  });
  
  // Create the input object for the Python calculator
  return {
    startAge: age,
    yearsToProject: years,
    pathType: "baseline", // Using the default baseline projection type
    
    // Assets
    assets: [
      {
        type: "investment",
        name: "Savings",
        initialValue: startingSavings,
        growthRate: 0.03 // 3% annual growth
      }
    ],
    
    // Liabilities
    liabilities: studentLoanDebt > 0 ? [
      {
        type: "studentLoan",
        name: "Student Loan",
        initialBalance: studentLoanDebt,
        interestRate: 0.05, // 5% interest rate
        termYears: 10 // 10 year term
      }
    ] : [],
    
    // Income sources
    incomes: [
      {
        type: "salary",
        name: "Primary Income",
        annualAmount: adjustedIncome,
        growthRate: incomeGrowth / 100, // Convert percentage to decimal
        startYear: 0
      }
    ],
    
    // Basic expenses
    expenditures: [
      {
        type: "housing",
        name: "Housing",
        annualAmount: expenses * 0.3, // 30% of expenses for housing
        inflationRate: 0.03
      },
      {
        type: "transportation",
        name: "Transportation",
        annualAmount: expenses * 0.15, // 15% of expenses for transportation 
        inflationRate: 0.02
      },
      {
        type: "living",
        name: "Food",
        annualAmount: expenses * 0.15, // 15% of expenses for food
        inflationRate: 0.03
      },
      {
        type: "living",
        name: "Healthcare",
        annualAmount: expenses * 0.1, // 10% of expenses for healthcare
        inflationRate: 0.04
      },
      {
        type: "living",
        name: "Discretionary",
        annualAmount: expenses * 0.3, // 30% of expenses for discretionary
        inflationRate: 0.02
      }
    ],
    
    // Add milestones for the calculation
    milestones: formattedMilestones
  };
};

// Call the Python calculator API
export const calculateFinancialProjection = async (inputData: CalculatorInputData): Promise<FinancialProjectionData> => {
  try {
    console.log("Sending data to Python calculator:", inputData);
    
    // Call the Python calculator API
    const response = await fetch('/api/calculate/financial-projection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to calculate financial projection: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("Received result from Python calculator:", result);
    
    // If there's an error in the calculation
    if (result.error) {
      console.error("Python calculation error:", result.error);
      throw new Error(`Calculation error: ${result.error}`);
    }
    
    // Helper function to calculate percentage of expenses
    const calculatePercentage = (expenses: number[] | undefined, percentage: number): number[] => {
      if (!expenses || expenses.length === 0) return [];
      return expenses.map(exp => Math.round(exp * percentage));
    };
    
    // For debugging
    console.log("Python calculator returned these expense categories:", 
                Object.keys(result).filter(key => 
                  ['housing', 'transportation', 'food', 'healthcare', 'personalInsurance',
                   'apparel', 'services', 'entertainment', 'other', 'education', 
                   'childcare', 'debt', 'discretionary'].includes(key)));

    // Format the result into the expected format for our components
    const projectionData: FinancialProjectionData = {
      netWorth: result.netWorth || [],
      income: result.income || [],
      spouseIncome: result.spouseIncome || Array(result.income?.length || 0).fill(0), // Initialize with zeros
      expenses: result.expenses || [],
      assets: result.assets || [],
      liabilities: result.liabilities || [],
      ages: result.ages || [],
      
      // Base cost of living categories - use Python calculator results with fallbacks
      housing: result.housing || calculatePercentage(result.expenses, 0.30),
      transportation: result.transportation || calculatePercentage(result.expenses, 0.15),
      food: result.food || calculatePercentage(result.expenses, 0.15),
      healthcare: result.healthcare || calculatePercentage(result.expenses, 0.10),
      personalInsurance: result.personalInsurance || calculatePercentage(result.expenses, 0.05),
      apparel: result.apparel || calculatePercentage(result.expenses, 0.04),
      services: result.services || calculatePercentage(result.expenses, 0.07),
      entertainment: result.entertainment || calculatePercentage(result.expenses, 0.05),
      other: result.other || calculatePercentage(result.expenses, 0.05),
      
      // Milestone-driven categories - use Python calculator results with fallbacks
      education: result.education || Array(result.expenses?.length || 0).fill(0),
      debt: result.debt || Array(result.expenses?.length || 0).fill(0),
      childcare: result.childcare || Array(result.expenses?.length || 0).fill(0),
      discretionary: result.discretionary || calculatePercentage(result.expenses, 0.04),
      
      // Asset breakdown
      homeValue: result.homeValue || Array(result.assets?.length || 0).fill(0),
      mortgage: result.mortgage || Array(result.liabilities?.length || 0).fill(0),
      carValue: result.carValue || Array(result.assets?.length || 0).fill(0),
      carLoan: result.carLoan || Array(result.liabilities?.length || 0).fill(0),
      studentLoan: result.studentLoan || Array(result.liabilities?.length || 0).fill(0),
      
      // Add milestone data if available
      milestones: result.milestones || []
    };
    
    return projectionData;
  } catch (error) {
    console.error("Error calculating financial projection:", error);
    
    // Generate some initial non-zero values for expense data for testing purposes
    // In a real application, these should be based on user input or removed
    const baseExpense = 50000;
    
    // Use the same helper function for the fallback
    const calculatePercentage = (value: number, percentage: number): number => {
      return Math.round(value * percentage);
    };

    // Return empty results as fallback
    return {
      netWorth: [0],
      income: [0],
      spouseIncome: [0],
      expenses: [baseExpense],
      assets: [0],
      liabilities: [0],
      ages: [0],
      
      // Base cost of living categories
      housing: [calculatePercentage(baseExpense, 0.25)],
      transportation: [calculatePercentage(baseExpense, 0.12)],
      food: [calculatePercentage(baseExpense, 0.14)],
      healthcare: [calculatePercentage(baseExpense, 0.08)],
      personalInsurance: [calculatePercentage(baseExpense, 0.05)],
      apparel: [calculatePercentage(baseExpense, 0.04)],
      services: [calculatePercentage(baseExpense, 0.07)],
      entertainment: [calculatePercentage(baseExpense, 0.05)],
      other: [calculatePercentage(baseExpense, 0.05)],
      
      // Milestone-driven categories
      education: [0],
      debt: [0],
      childcare: [0], 
      discretionary: [calculatePercentage(baseExpense, 0.15)],
      
      // Asset and liability breakdowns
      homeValue: [0],
      mortgage: [0],
      carValue: [0],
      carLoan: [0],
      studentLoan: [0]
    };
  }
};