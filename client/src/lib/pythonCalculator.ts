// Python Calculator Service
// This file provides a service for interacting with the Python calculator backend

import { Milestone } from "@shared/schema";

// Define a type for the input data we'll send to the Python calculator
export interface CalculatorInputData {
  startAge: number;
  yearsToProject: number;
  pathType: string;
  costOfLivingFactor?: number; // Location-based adjustment factor (1.0 is average)
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
  cashFlow?: number[];
  
  // Base cost of living categories
  housing: number[];
  transportation: number[];
  food: number[];
  healthcare: number[];
  personalInsurance: number[];
  apparel: number[];
  services: number[];
  entertainment: number[];
  other: number[];
  
  // Milestone-driven categories
  education: number[];
  childcare: number[];
  debt: number[];
  discretionary: number[];
  
  // Asset breakdown
  homeValue: number[];
  mortgage: number[];
  carValue: number[];
  carLoan: number[];
  studentLoan: number[];
  savingsValue?: number[]; // Direct savings value array from Python
  
  // Milestone data
  milestones?: any[];
}

// Generate the input data for the Python calculator
export const generatePythonCalculatorInput = (
  age: number,
  years: number,
  startingSavings: number,
  income: number,
  incomeGrowth: number,
  studentLoanDebt: number,
  milestones: Milestone[] = [],
  costOfLivingFactor: number = 1.0,
  locationCostData: any = null
): CalculatorInputData => {
  // Sort milestones by yearsAway 
  const sortedMilestones = milestones ? [...milestones].sort((a, b) => {
    const aYears = a.yearsAway ?? 0;
    const bYears = b.yearsAway ?? 0;
    return aYears - bYears;
  }) : [];
  
  // NOTE: We used to adjust income here based on the cost of living factor
  // Now we pass both the original income and costOfLivingFactor to the Python backend
  // The costOfLivingFactor represents how much more/less expensive a location is
  // For expensive areas, incomes are typically higher (costOfLivingFactor > 1)
  // For less expensive areas, incomes are typically lower (costOfLivingFactor < 1)
  // The adjustment is now performed in the Python calculator
  
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
  
  // Calculate total annual expenses if location data is available
  const totalAnnualExpenses = locationCostData ? 
    ((locationCostData.housing || 0) +
     (locationCostData.transportation || 0) +
     (locationCostData.food || 0) +
     (locationCostData.healthcare || 0) +
     (locationCostData.personal_insurance || 0) +
     (locationCostData.apparel || 0) +
     (locationCostData.services || 0) +
     (locationCostData.entertainment || 0) +
     (locationCostData.other || 0)) * 12 : 0;
  
  // Create expenditures array based on location data
  const expenditures = [];
  
  // Only add location-based expenditures if we have the data
  if (locationCostData) {
    // Housing expenses (monthly → annual)
    if (locationCostData.housing) {
      expenditures.push({
        type: "housing",
        name: "Housing",
        annualAmount: locationCostData.housing * 12,
        inflationRate: 0.03
      });
    }
    
    // Transportation expenses
    if (locationCostData.transportation) {
      // Always disable auto-replacement to prevent unpredictable jumps in year 7
      // This ensures transportation costs grow at a predictable rate
      expenditures.push({
        type: "transportation", 
        name: "Transportation",
        annualAmount: locationCostData.transportation * 12,
        inflationRate: 0.03, // Use the TRANSPORTATION_INFLATION_RATE from Python
        auto_replace: false // Never auto-replace cars, we'll handle this explicitly via milestones
      });
    }
    
    // Food expenses
    if (locationCostData.food) {
      expenditures.push({
        type: "living",
        name: "Food",
        annualAmount: locationCostData.food * 12,
        inflationRate: 0.03
      });
    }
    
    // Healthcare expenses
    if (locationCostData.healthcare) {
      expenditures.push({
        type: "living",
        name: "Healthcare",
        annualAmount: locationCostData.healthcare * 12,
        inflationRate: 0.04
      });
    }
    
    // Personal insurance expenses
    if (locationCostData.personal_insurance) {
      expenditures.push({
        type: "living",
        name: "Personal Insurance",
        annualAmount: locationCostData.personal_insurance * 12,
        inflationRate: 0.03
      });
    }
    
    // Apparel expenses
    if (locationCostData.apparel) {
      expenditures.push({
        type: "living",
        name: "Apparel",
        annualAmount: locationCostData.apparel * 12,
        inflationRate: 0.02
      });
    }
    
    // Services expenses
    if (locationCostData.services) {
      expenditures.push({
        type: "living",
        name: "Services",
        annualAmount: locationCostData.services * 12,
        inflationRate: 0.03
      });
    }
    
    // Entertainment expenses
    if (locationCostData.entertainment) {
      expenditures.push({
        type: "living",
        name: "Entertainment",
        annualAmount: locationCostData.entertainment * 12,
        inflationRate: 0.02
      });
    }
    
    // Other expenses
    if (locationCostData.other) {
      expenditures.push({
        type: "living",
        name: "Other",
        annualAmount: locationCostData.other * 12,
        inflationRate: 0.02
      });
    }
  }
  
  // Create the input object for the Python calculator
  return {
    startAge: age,
    yearsToProject: years,
    pathType: "baseline", // Using the default baseline projection type
    costOfLivingFactor: costOfLivingFactor, // Explicitly pass the cost of living factor to Python
    
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
        annualAmount: income, // Send original income amount (Python will apply the adjustment)
        growthRate: incomeGrowth / 100, // Convert percentage to decimal
        startYear: 0
      }
    ],
    
    // Use the location-based expenditures
    expenditures,
    
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
    
    // Debug: Check which expense categories are present in the Python response
    const expenseCategories = [
      'housing', 'transportation', 'food', 'healthcare', 'education', 'debt', 
      'childcare', 'discretionary', 'personalInsurance', 'apparel', 'services', 
      'entertainment', 'other'
    ];
    
    console.log("Expense categories from Python model:", 
      expenseCategories.map(cat => ({ 
        category: cat, 
        present: !!result[cat], 
        firstValue: result[cat] ? result[cat][0] : 'N/A'
      }))
    );
    
    // Debug healthcare data more extensively to see what's coming back
    console.log("Healthcare data details:", {
      exists: !!result.healthcare,
      length: result.healthcare ? result.healthcare.length : 0,
      firstFewValues: result.healthcare ? result.healthcare.slice(0, 3) : [],
      isArray: Array.isArray(result.healthcare),
      dataType: result.healthcare && result.healthcare.length > 0 ? typeof result.healthcare[0] : 'unknown'
    });
    
    // If there's an error in the calculation
    if (result.error) {
      console.error("Python calculation error:", result.error);
      throw new Error(`Calculation error: ${result.error}`);
    }
    
    // Uncomment for debugging if needed
    // console.log("Python calculator returned expense categories:", 
    //            Object.keys(result).filter(key => 
    //              ['housing', 'transportation', 'food', 'healthcare', 'personalInsurance',
    //               'apparel', 'services', 'entertainment', 'other', 'education', 
    //               'childcare', 'debt', 'discretionary'].includes(key)));

    // Get the expenses array for length calculation
    const expensesArray = result.expenses || [];
    const yearsToProject = expensesArray.length || 10;
    
    // Debug data coming from Python
    console.log("RAW PYTHON DATA:", result);
    
    // Log details about specific asset categories
    console.log("ASSET DATA DEBUG:", {
      totalAssets: result.assets,
      homeValue: result.homeValue,
      savingsValue: result.savingsValue || null,
      year30: { 
        totalAssets: result.assets?.[3], 
        homeValue: result.homeValue?.[3],
        savingsValue: result.savingsValue?.[3]
      }
    });
      
    // Format the result into the expected format for our components
    const projectionData: FinancialProjectionData = {
      netWorth: result.netWorth || [],
      income: result.income || [],
      spouseIncome: result.spouseIncome || Array(yearsToProject).fill(0), // Initialize with zeros
      expenses: expensesArray,
      assets: result.assets || [],
      liabilities: result.liabilities || [],
      ages: result.ages || [],
      cashFlow: result.cashFlow || [],
      
      // If Python model sends us specific savings value array, use it
      savingsValue: result.savingsValue || [],
      
      // Use expense category breakdowns directly from Python backend
      // These are calculated in the backend based on the real data
      housing: result.housing || [],
      transportation: result.transportation || [],
      food: result.food || [],
      healthcare: result.healthcare || [],
      personalInsurance: result.personalInsurance || [],
      entertainment: result.entertainment || [],
      apparel: result.apparel || [],
      services: result.services || [],
      other: result.other || [],
      
      // Milestone-driven categories
      education: result.education || [],
      debt: result.debt || [],
      childcare: result.childcare || [],
      discretionary: result.discretionary || [],
      
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
    
    // Generate some initial non-zero values for expense data for fallback purposes
    // In a real application, these should be based on user input or removed
    const baseExpense = 50000;
    
    // Helper function for the fallback case
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
      cashFlow: [-baseExpense],
      
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