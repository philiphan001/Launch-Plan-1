/**
 * Validation utilities for financial projection data
 * Created to ensure robust data handling after authentication changes
 */

export interface ProjectionData {
  netWorth: number[];
  ages: number[];
  income: number[];
  expenses: number[];
  _key?: string;
  // Optional arrays for different financial categories
  assets?: number[];
  liabilities?: number[];
  housing?: number[];
  transportation?: number[];
  food?: number[];
  healthcare?: number[];
  personalInsurance?: number[];
  apparel?: number[];
  services?: number[];
  entertainment?: number[];
  educationLoans?: number[];
  graduateSchoolLoans?: number[];
  other?: number[];
  spouseIncome?: number[];
  spouseNetWorth?: number[];
  // Additional metadata
  lastUpdated?: string;
  isLocation?: boolean;
  hasMilestones?: boolean;
}

/**
 * Validates if an array exists and has proper length
 * @param arr The array to validate
 * @param minLength Minimum required length
 * @returns boolean indicating if array is valid
 */
function isValidArray(arr: any, minLength = 1): boolean {
  return Array.isArray(arr) && arr.length >= minLength;
}

/**
 * Performs deep validation of projection data structure
 * @param data The projection data to validate
 * @returns Object with validation result and error message if any
 */
export function validateProjectionData(data: any): {
  valid: boolean;
  error?: string;
} {
  if (!data) {
    return { valid: false, error: "No projection data provided" };
  }

  if (typeof data !== "object") {
    return { valid: false, error: "Projection data must be an object" };
  }

  // Validate required arrays
  if (!isValidArray(data.netWorth)) {
    return { valid: false, error: "Missing or invalid netWorth array" };
  }

  if (!isValidArray(data.ages)) {
    return { valid: false, error: "Missing or invalid ages array" };
  }

  if (!isValidArray(data.income)) {
    return { valid: false, error: "Missing or invalid income array" };
  }

  if (!isValidArray(data.expenses)) {
    return { valid: false, error: "Missing or invalid expenses array" };
  }

  // Check that required arrays have consistent length
  const mainArrayLength = data.netWorth.length;
  if (data.ages.length !== mainArrayLength) {
    return {
      valid: false,
      error: `Array length mismatch: ages (${data.ages.length}) vs netWorth (${mainArrayLength})`,
    };
  }

  if (data.income.length !== mainArrayLength) {
    return {
      valid: false,
      error: `Array length mismatch: income (${data.income.length}) vs netWorth (${mainArrayLength})`,
    };
  }

  if (data.expenses.length !== mainArrayLength) {
    return {
      valid: false,
      error: `Array length mismatch: expenses (${data.expenses.length}) vs netWorth (${mainArrayLength})`,
    };
  }

  // Validate numeric values in required arrays
  if (data.netWorth.some((val: any) => typeof val !== "number")) {
    return {
      valid: false,
      error: "netWorth array contains non-numeric values",
    };
  }

  if (data.ages.some((val: any) => typeof val !== "number")) {
    return { valid: false, error: "ages array contains non-numeric values" };
  }

  if (data.income.some((val: any) => typeof val !== "number")) {
    return { valid: false, error: "income array contains non-numeric values" };
  }

  if (data.expenses.some((val: any) => typeof val !== "number")) {
    return {
      valid: false,
      error: "expenses array contains non-numeric values",
    };
  }

  // Optional arrays should have consistent length if present
  const optionalArrays = [
    "assets",
    "liabilities",
    "housing",
    "transportation",
    "food",
    "healthcare",
    "personalInsurance",
    "apparel",
    "services",
    "entertainment",
    "educationLoans",
    "graduateSchoolLoans",
    "other",
    "spouseIncome",
    "spouseNetWorth",
  ];

  for (const arrayName of optionalArrays) {
    if (data[arrayName] !== undefined) {
      if (!isValidArray(data[arrayName], 0)) {
        return { valid: false, error: `${arrayName} is not a valid array` };
      }

      if (
        data[arrayName].length > 0 &&
        data[arrayName].length !== mainArrayLength
      ) {
        return {
          valid: false,
          error: `Array length mismatch: ${arrayName} (${data[arrayName].length}) vs netWorth (${mainArrayLength})`,
        };
      }

      if (data[arrayName].some((val: any) => typeof val !== "number")) {
        return {
          valid: false,
          error: `${arrayName} array contains non-numeric values`,
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Ensures that projection data is valid, creates default data if not
 * @param data The projection data to validate and ensure is complete
 * @returns Valid projection data, either the original or a default
 */
export function ensureValidProjectionData(data: any): ProjectionData {
  const validationResult = validateProjectionData(data);

  if (!validationResult.valid) {
    console.error(
      `Projection data validation failed: ${validationResult.error}`,
      data
    );

    // Create default projection data
    const defaultData: ProjectionData = {
      netWorth: [5000],
      ages: [25],
      income: [40000],
      expenses: [35000],
      _key: `default-${Date.now()}`,
    };

    console.log("Created default projection data");
    return defaultData;
  }

  return data;
}

/**
 * Interface for summary data that's displayed in the UI
 */
export interface ProjectionSummaryData {
  college?: {
    id: number;
    name: string;
    type?: string;
    totalCost: number;
    studentLoanAmount: number;
    inState?: boolean;
  };
  career?: {
    id: number;
    title: string;
    entryLevelSalary: number;
    projectedSalary: number;
    education?: string;
  };
  location?: {
    zipCode: string;
    city: string;
    state: string;
    incomeAdjustmentFactor?: number;
  };
  financials: {
    startingSavings: number;
    income: number;
    expenses: number;
    studentLoanDebt: number;
    emergencyFundAmount: number;
  };
}

/**
 * Validates projection summary data
 * @param data The projection summary data to validate
 * @returns boolean indicating if the summary data is valid
 */
export function validateProjectionSummaryData(data: any): boolean {
  if (!data || typeof data !== "object") {
    console.error("Invalid summary data: Not an object", data);
    return false;
  }

  // Financials section is required
  if (!data.financials || typeof data.financials !== "object") {
    console.error("Invalid summary data: Missing financials object", data);
    return false;
  }

  // Validate required financial fields
  const requiredFinancialFields = [
    "startingSavings",
    "income",
    "expenses",
    "studentLoanDebt",
    "emergencyFundAmount",
  ];

  for (const field of requiredFinancialFields) {
    if (typeof data.financials[field] !== "number") {
      console.error(
        `Invalid summary data: Missing or invalid financials.${field}`,
        data.financials
      );
      return false;
    }
  }

  // College is optional but must have valid structure if present
  if (data.college) {
    if (typeof data.college !== "object") {
      console.error(
        "Invalid summary data: college is not an object",
        data.college
      );
      return false;
    }

    if (
      !data.college.id ||
      typeof data.college.name !== "string" ||
      typeof data.college.totalCost !== "number" ||
      typeof data.college.studentLoanAmount !== "number"
    ) {
      console.error(
        "Invalid summary data: college has missing or invalid fields",
        data.college
      );
      return false;
    }
  }

  // Career is optional but must have valid structure if present
  if (data.career) {
    if (typeof data.career !== "object") {
      console.error(
        "Invalid summary data: career is not an object",
        data.career
      );
      return false;
    }

    if (
      !data.career.id ||
      typeof data.career.title !== "string" ||
      typeof data.career.entryLevelSalary !== "number" ||
      typeof data.career.projectedSalary !== "number"
    ) {
      console.error(
        "Invalid summary data: career has missing or invalid fields",
        data.career
      );
      return false;
    }
  }

  // Location is optional but must have valid structure if present
  if (data.location) {
    if (typeof data.location !== "object") {
      console.error(
        "Invalid summary data: location is not an object",
        data.location
      );
      return false;
    }

    if (
      typeof data.location.zipCode !== "string" ||
      typeof data.location.city !== "string" ||
      typeof data.location.state !== "string"
    ) {
      console.error(
        "Invalid summary data: location has missing or invalid fields",
        data.location
      );
      return false;
    }
  }

  return true;
}

/**
 * Creates default projection summary data
 * @param options Initial values to use for the summary data
 * @returns A valid projection summary data object
 */
export function createDefaultProjectionSummaryData(
  options: {
    startingSavings?: number;
    income?: number;
    expenses?: number;
    studentLoanDebt?: number;
    emergencyFundAmount?: number;
  } = {}
): ProjectionSummaryData {
  return {
    financials: {
      startingSavings: options.startingSavings || 5000,
      income: options.income || 40000,
      expenses: options.expenses || 35000,
      studentLoanDebt: options.studentLoanDebt || 0,
      emergencyFundAmount: options.emergencyFundAmount || 10000,
    },
  };
}

/**
 * Fix liabilities calculation to ensure graduate school loans are properly counted
 * @param projectionData The projection data to fix
 * @returns The fixed projection data
 */
export function fixLiabilityCalculation(
  projectionData: ProjectionData
): ProjectionData {
  // If there's no graduate school loan data, return the original
  if (
    !projectionData.graduateSchoolLoans ||
    projectionData.graduateSchoolLoans.length === 0
  ) {
    return projectionData;
  }

  // If liabilities array doesn't exist, create it
  if (!projectionData.liabilities || projectionData.liabilities.length === 0) {
    projectionData.liabilities = Array(projectionData.netWorth.length).fill(0);
  }

  // Create a new copy to avoid mutating the original
  const fixedProjection = {
    ...projectionData,
    liabilities: [...projectionData.liabilities],
  };

  // Update liabilities to include graduate school loans
  for (let i = 0; i < projectionData.liabilities.length; i++) {
    if (i < projectionData.graduateSchoolLoans.length) {
      fixedProjection.liabilities[i] += projectionData.graduateSchoolLoans[i];
    }
  }

  return fixedProjection;
}
