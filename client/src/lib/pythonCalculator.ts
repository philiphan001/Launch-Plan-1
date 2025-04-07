// Python Calculator Service
// This file provides a service for interacting with the Python calculator backend

import { Milestone } from "@shared/schema";

// Define a type for the input data we'll send to the Python calculator
export interface CalculatorInputData {
  startAge: number;
  yearsToProject: number;
  pathType: string;
  costOfLivingFactor?: number; // Location-based adjustment factor (1.0 is average)
  emergencyFundAmount?: number; // Fixed amount to maintain as emergency fund
  personalLoanTermYears?: number; // Term length in years for personal loans
  personalLoanInterestRate?: number; // Annual interest rate for personal loans (decimal format)
  retirementContributionRate?: number; // Percentage of income to contribute to retirement accounts (decimal format)
  retirementGrowthRate?: number; // Annual growth rate for retirement accounts (decimal format)
  careersData?: Array<{
    id: number;
    title: string;
    description?: string;
    median_salary?: number;
    entry_salary?: number;
    experienced_salary?: number;
    percentile_10?: number;
    percentile_25?: number;
    percentile_75?: number;
    percentile_90?: number;
    category?: string;
    education_required?: string;
    growth_rate?: number;
  }>; // List of all available careers for target occupation lookup
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
  educationLoans?: number[]; // Student loans from education milestones
  graduateSchoolLoans?: number[]; // Graduate school loans specifically
  personalLoans?: number[]; // Personal loans (auto-generated from negative cash flow)
  savingsValue?: number[]; // Direct savings value array from Python
  
  // Tax breakdown
  payrollTax?: number[];
  federalTax?: number[];
  stateTax?: number[];
  taxes?: number[];  // Combined tax expenses for visualization
  retirementContribution?: number[];
  effectiveTaxRate?: number[];
  marginalTaxRate?: number[];
  
  // Location information
  location?: {
    city?: string;
    state?: string;
    zipCode?: string;
    costOfLivingIndex?: number;
    incomeAdjustmentFactor?: number;
    housingFactor?: number;
    healthcareFactor?: number;
    transportationFactor?: number;
    foodFactor?: number;
  };
  
  // Path-specific information
  educationPath?: {
    college: any;
    occupation: any;
    totalCollegeCost: number;
    studentLoanAmount: number;
    graduationYear: number;
    estimatedStartingSalary: number;
  };
  
  jobPath?: {
    occupation: any;
    startingSalary: number;
    projection5Year: number;
    projection10Year: number;
  };
  
  militaryPath?: {
    branch: string;
    serviceYears: number;
    basePay: number;
    giBillBenefit: number;
    vaLoanEligible: boolean;
    postServiceOccupation: any;
  };
  
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
  locationCostData: any = null,
  emergencyFundAmount: number = 10000,
  personalLoanTermYears: number = 5,
  personalLoanInterestRate: number = 0.08,
  retirementContributionRate: number = 0.05,
  retirementGrowthRate: number = 0.07
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
    
    // Debug: Log the raw milestone data before formatting
    if (type === 'education') {
      console.log('DEBUG - Education milestone before formatting:', {
        workStatus: milestone.workStatus,
        workStatusType: typeof milestone.workStatus,
        milestone: JSON.stringify(milestone)
      });
    }
    
    // Create a new milestone object with year property instead of yearsAway
    // Make sure we have all the required fields for the education milestone type
    const formattedMilestone = {
      type,
      year: yearsAway ?? 0,
      ...rest,
      // Ensure these fields are present for education milestones
      // Pass workStatus as-is without using || since "no" is a valid value
      workStatus: milestone.workStatus !== undefined ? milestone.workStatus : null,
      partTimeIncome: milestone.partTimeIncome !== undefined ? milestone.partTimeIncome : 0,
      returnToSameProfession: milestone.returnToSameProfession !== undefined ? milestone.returnToSameProfession : true,
      details: milestone.details || {}
    };
    
    // Debug: Log the formatted milestone data after formatting
    if (type === 'education') {
      console.log('DEBUG - Education milestone after formatting:', {
        workStatus: formattedMilestone.workStatus,
        workStatusType: typeof formattedMilestone.workStatus
      });
    }
    
    return formattedMilestone;
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
    
    // Add detailed location data if available, used for more accurate calculations
    ...(locationCostData && {
      locationData: {
        zip_code: locationCostData.zip_code,
        city: locationCostData.city,
        state: locationCostData.state,
        cost_of_living_index: locationCostData.cost_of_living_index || 100,
        income_adjustment_factor: locationCostData.income_adjustment_factor || costOfLivingFactor,
        housing_factor: locationCostData.housing_factor || 1.0,
        healthcare_factor: locationCostData.healthcare_factor || 1.0,
        transportation_factor: locationCostData.transportation_factor || 1.0,
        food_factor: locationCostData.food_factor || 1.0
      }
    }),
    
    // If location data with zip code is available but doesn't have adjustment factors,
    // at least pass the zip code for database lookup in the backend
    ...(!locationCostData && { zipCode: locationCostData?.zip_code }),
    
    // User-configurable parameters with the values from the function parameters
    emergencyFundAmount: emergencyFundAmount,
    personalLoanTermYears: personalLoanTermYears,
    personalLoanInterestRate: personalLoanInterestRate,
    retirementContributionRate: retirementContributionRate,
    retirementGrowthRate: retirementGrowthRate,
    
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
    milestones: formattedMilestones,
    
    // Add the careers data to be used by the Python calculator
    // This allows the calculator to look up target occupations for milestone-driven career changes
    // such as those after graduation from education milestones
    // Now passed directly as a property by the FinancialProjections component
    careersData: []
  };
};

// Call the Python calculator API
export const calculateFinancialProjection = async (inputData: CalculatorInputData): Promise<FinancialProjectionData> => {
  try {
    // Enhanced debugging: Focus on milestone data
    if (inputData.milestones && inputData.milestones.length > 0) {
      console.log("MILESTONE DEBUG - Before sending to API:", 
        inputData.milestones.map(milestone => ({
          type: milestone.type,
          year: milestone.year,
          workStatus: milestone.workStatus,
          workStatusType: typeof milestone.workStatus
        }))
      );
    }
    
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
      educationLoans: result.educationLoans || Array(result.liabilities?.length || 0).fill(0),
      graduateSchoolLoans: result.graduateSchoolLoans || Array(result.liabilities?.length || 0).fill(0),
      personalLoans: result.personalLoans || Array(result.liabilities?.length || 0).fill(0),
      
      // Tax breakdown
      payrollTax: result.payrollTax || [],
      federalTax: result.federalTax || [],
      stateTax: result.stateTax || [],
      retirementContribution: result.retirementContribution || [],
      effectiveTaxRate: result.effectiveTaxRate || [],
      marginalTaxRate: result.marginalTaxRate || [],
      
      // Combined taxes (sum of payroll, federal, and state taxes)
      taxes: result.taxes || (result.payrollTax && result.federalTax && result.stateTax 
        ? result.payrollTax.map((p: number, i: number) => 
            (p || 0) + (result.federalTax?.[i] || 0) + (result.stateTax?.[i] || 0))
        : []),
      
      // Add location information if available from the backend
      ...(result.location && { location: result.location }),
      
      // Add path-specific information if available
      ...(result.educationPath && { educationPath: result.educationPath }),
      ...(result.jobPath && { jobPath: result.jobPath }),
      ...(result.militaryPath && { militaryPath: result.militaryPath }),
      
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
      studentLoan: [0],
      educationLoans: [0],
      graduateSchoolLoans: [0],
      personalLoans: [0],
      
      // Tax breakdown
      payrollTax: [calculatePercentage(baseExpense, 0.07)],
      federalTax: [calculatePercentage(baseExpense, 0.10)],
      stateTax: [calculatePercentage(baseExpense, 0.05)],
      retirementContribution: [calculatePercentage(baseExpense, 0.05)],
      effectiveTaxRate: [0.22],
      marginalTaxRate: [0.24],
      // Combined taxes
      taxes: [calculatePercentage(baseExpense, 0.22)]
    };
  }
};