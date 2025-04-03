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
  
  // Expense breakdown
  housing?: number[];
  transportation?: number[];
  food?: number[];
  healthcare?: number[];
  education?: number[];
  debt?: number[];
  childcare?: number[];
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
  const sortedMilestones = milestones ? [...milestones].sort((a, b) => a.yearsAway - b.yearsAway) : [];
  
  // Adjust income based on cost of living
  const adjustedIncome = income * costOfLivingFactor;
  
  // Format milestones for the Python calculator
  const formattedMilestones = sortedMilestones.map(milestone => ({
    type: milestone.type,
    year: milestone.yearsAway,
    ...milestone
  }));
  
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
    
    // Format the result into the expected format for our components
    const projectionData: FinancialProjectionData = {
      netWorth: result.netWorth || [],
      income: result.income || [],
      spouseIncome: Array(result.income?.length || 0).fill(0), // Initialize with zeros
      expenses: result.expenses || [],
      assets: result.assets || [],
      liabilities: result.liabilities || [],
      ages: result.ages || [],
      
      // Default expense breakdown based on percentages if not provided
      housing: result.housing || result.expenses?.map(exp => exp * 0.3) || [],
      transportation: result.transportation || result.expenses?.map(exp => exp * 0.15) || [],
      food: result.food || result.expenses?.map(exp => exp * 0.15) || [],
      healthcare: result.healthcare || result.expenses?.map(exp => exp * 0.1) || [],
      education: result.education || Array(result.expenses?.length || 0).fill(0),
      debt: result.debt || Array(result.expenses?.length || 0).fill(0),
      childcare: result.childcare || Array(result.expenses?.length || 0).fill(0),
      discretionary: result.discretionary || result.expenses?.map(exp => exp * 0.3) || [],
      
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
    // Return empty results as fallback
    return {
      netWorth: [0],
      income: [0],
      spouseIncome: [0],
      expenses: [0],
      assets: [0],
      liabilities: [0],
      ages: [0],
      housing: [0],
      transportation: [0],
      food: [0],
      healthcare: [0],
      education: [0],
      debt: [0],
      childcare: [0],
      discretionary: [0],
      homeValue: [0],
      mortgage: [0],
      carValue: [0],
      carLoan: [0],
      studentLoan: [0]
    };
  }
};