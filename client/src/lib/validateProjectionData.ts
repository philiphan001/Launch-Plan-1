import { ProjectionData } from "@/components/dashboard/ScenarioCard";
import { ProjectionSummaryData } from "@/components/financial/ProjectionSummary";

/**
 * Validates if the given object is a valid ProjectionData object
 * @param data The data to validate
 * @returns True if the data is valid, false otherwise
 */
export const isValidProjectionData = (data: any): boolean => {
  if (!data) return false;
  if (typeof data !== "object") return false;
  if (!Array.isArray(data.ages)) return false;
  if (!Array.isArray(data.netWorth)) return false;
  if (!Array.isArray(data.income)) return false;
  if (!Array.isArray(data.expenses)) return false;

  // All arrays should have at least one element
  if (data.ages.length === 0) return false;
  if (data.netWorth.length === 0) return false;
  if (data.income.length === 0) return false;
  if (data.expenses.length === 0) return false;

  return true;
};

/**
 * Advanced validation of projection data that checks for consistency between arrays
 * and validates each value in the arrays
 * @param data The projection data to validate
 * @returns An object with validation status and error messages
 */
export const validateProjectionData = (
  data: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic structure validation
  if (!data) {
    errors.push("Projection data is null or undefined");
    return { isValid: false, errors };
  }

  if (typeof data !== "object") {
    errors.push(`Projection data is not an object: ${typeof data}`);
    return { isValid: false, errors };
  }

  // Check required arrays exist
  const requiredArrays = ["ages", "netWorth", "income", "expenses"];
  for (const arrayName of requiredArrays) {
    if (!Array.isArray(data[arrayName])) {
      errors.push(`Required array "${arrayName}" is missing or not an array`);
    }
  }

  // If any required arrays are missing, return early
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Validate array lengths match
  const baseLength = data.ages.length;
  const arrayLengths: Record<string, number> = {};

  for (const key in data) {
    if (Array.isArray(data[key])) {
      arrayLengths[key] = data[key].length;

      if (data[key].length !== baseLength) {
        errors.push(
          `Array "${key}" length (${data[key].length}) doesn't match ages array length (${baseLength})`
        );
      }
    }
  }

  // Validate array values are numbers or null
  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (let i = 0; i < data[key].length; i++) {
        const value = data[key][i];
        if (
          value !== null &&
          typeof value !== "undefined" &&
          typeof value !== "number"
        ) {
          errors.push(
            `${key}[${i}] is not a number, null, or undefined: ${typeof value}`
          );
        }
      }
    }
  }

  // Check for NaN values which are technically numbers but invalid
  for (const key in data) {
    if (Array.isArray(data[key])) {
      for (let i = 0; i < data[key].length; i++) {
        if (typeof data[key][i] === "number" && isNaN(data[key][i])) {
          errors.push(`${key}[${i}] is NaN`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Creates a default ProjectionData object with empty arrays
 * @returns A default ProjectionData object
 */
export const createDefaultProjectionData = (): ProjectionData => {
  // Create a default ProjectionData object with required fields
  const defaultData: ProjectionData = {
    ages: [25, 26, 27, 28, 29, 30],
    netWorth: [0, 0, 0, 0, 0, 0],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0],
  };

  // Add extended fields - TypeScript will allow this because of the index signature in ProjectionData
  const extendedData = defaultData as any;
  extendedData.federalTax = [0, 0, 0, 0, 0, 0];
  extendedData.stateTax = [0, 0, 0, 0, 0, 0];
  extendedData.payrollTax = [0, 0, 0, 0, 0, 0];
  extendedData.retirementContribution = [0, 0, 0, 0, 0, 0];
  extendedData.effectiveTaxRate = [0, 0, 0, 0, 0, 0];
  extendedData.marginalTaxRate = [0, 0, 0, 0, 0, 0];

  return extendedData;
};

/**
 * Ensures that the given ProjectionData has valid data structure
 * If the data is invalid, it returns a default ProjectionData
 * @param data The data to ensure validity
 * @param logErrors Whether to log validation errors to console (default: true)
 * @returns Valid ProjectionData
 */
export const ensureValidProjectionData = (
  data: any,
  logErrors = true
): ProjectionData => {
  // First do the simple check
  if (!isValidProjectionData(data)) {
    if (logErrors) {
      console.warn(
        "Invalid projection data encountered, using default projection data",
        data
      );
    }
    return createDefaultProjectionData();
  }

  // Then do the more detailed validation
  const validation = validateProjectionData(data);

  // If validation failed with specific errors, log them
  if (!validation.isValid) {
    if (logErrors) {
      console.warn(
        "Projection data validation failed with the following errors:"
      );
      validation.errors.forEach((error, index) => {
        console.warn(`[${index + 1}/${validation.errors.length}] ${error}`);
      });
      console.warn("Using default projection data instead");
    }
    return createDefaultProjectionData();
  }

  // Data is valid, ensure all arrays are of equal length and repair if needed
  const fixedData = { ...data };
  const targetLength = data.ages.length;

  // Ensure all array values are numbers, replacing null/undefined with 0
  for (const key in fixedData) {
    if (Array.isArray(fixedData[key])) {
      // Ensure array is correct length
      if (fixedData[key].length < targetLength) {
        // Pad with zeros if too short
        const padding = Array(targetLength - fixedData[key].length).fill(0);
        fixedData[key] = [...fixedData[key], ...padding];
      } else if (fixedData[key].length > targetLength) {
        // Trim if too long
        fixedData[key] = fixedData[key].slice(0, targetLength);
      }

      // Ensure all values are numbers
      fixedData[key] = fixedData[key].map((val) =>
        val === null || val === undefined || isNaN(val) ? 0 : Number(val)
      );
    }
  }

  return fixedData as ProjectionData;
};

/**
 * Creates a key-value object from projection data arrays
 * This is useful for displaying data in tables and charts
 * @param projectionData The projection data
 * @returns Array of objects with age and financial values
 */
export const createProjectionDataTable = (
  projectionData: ProjectionData
): Array<{
  age: number;
  netWorth: number;
  income: number;
  expenses: number;
}> => {
  const validData = ensureValidProjectionData(projectionData);

  return validData.ages.map((age, index) => ({
    age,
    netWorth: validData.netWorth[index] || 0,
    income: validData.income[index] || 0,
    expenses: validData.expenses[index] || 0,
  }));
};

/**
 * Validates if the provided data conforms to the ProjectionSummaryData interface
 * @param data The data to validate
 * @returns True if the data is valid, false otherwise
 */
export const validateProjectionSummaryData = (data: any): boolean => {
  if (!data) return false;
  if (typeof data !== "object") return false;

  // Check if the financials object exists and has all required properties
  if (!data.financials) return false;
  if (typeof data.financials !== "object") return false;

  // Verify the required financials properties
  const requiredFinancialProps = [
    "startingSavings",
    "income",
    "expenses",
    "studentLoanDebt",
    "emergencyFundAmount",
  ];
  for (const prop of requiredFinancialProps) {
    if (typeof data.financials[prop] !== "number") return false;
  }

  // College data is optional, but if present, must have correct structure
  if (data.college) {
    if (typeof data.college !== "object") return false;
    if (typeof data.college.id !== "number") return false;
    if (typeof data.college.name !== "string") return false;
    if (typeof data.college.totalCost !== "number") return false;
    if (typeof data.college.studentLoanAmount !== "number") return false;
  }

  // Career data is optional, but if present, must have correct structure
  if (data.career) {
    if (typeof data.career !== "object") return false;
    if (typeof data.career.id !== "number") return false;
    if (typeof data.career.title !== "string") return false;
    if (typeof data.career.entryLevelSalary !== "number") return false;
    if (typeof data.career.projectedSalary !== "number") return false;
  }

  // Location data is optional, but if present, must have correct structure
  if (data.location) {
    if (typeof data.location !== "object") return false;
    if (typeof data.location.zipCode !== "string") return false;
    if (typeof data.location.city !== "string") return false;
    if (typeof data.location.state !== "string") return false;
  }

  return true;
};

/**
 * Creates a default ProjectionSummaryData object with minimal valid structure
 * @param initialValues Optional values to use instead of zeros
 * @returns A valid ProjectionSummaryData object
 */
export const createDefaultProjectionSummaryData = (initialValues?: {
  startingSavings?: number;
  income?: number;
  expenses?: number;
  studentLoanDebt?: number;
  emergencyFundAmount?: number;
}): ProjectionSummaryData => {
  return {
    financials: {
      startingSavings: initialValues?.startingSavings || 0,
      income: initialValues?.income || 0,
      expenses: initialValues?.expenses || 0,
      studentLoanDebt: initialValues?.studentLoanDebt || 0,
      emergencyFundAmount: initialValues?.emergencyFundAmount || 0,
    },
  };
};

/**
 * Validates projection data after authentication state changes
 * Checks for auth-specific issues that might occur when loading data
 * @param data The projection data to validate
 * @param userId Optional user ID for validation context
 * @returns An object with validation status and error messages
 */
export const validateProjectionDataAfterAuth = (
  data: any,
  userId?: string
): { isValid: boolean; errors: string[]; recoverable: boolean } => {
  const errors: string[] = [];
  let recoverable = true;

  // First do the standard validation
  const standardValidation = validateProjectionData(data);
  if (!standardValidation.isValid) {
    return {
      isValid: false,
      errors: [
        ...standardValidation.errors,
        "Failed standard validation checks",
      ],
      recoverable: true,
    };
  }

  // Check for auth-related issues

  // 1. Check for missing user ID in data that should have it
  if (data.userId && (!userId || data.userId !== userId)) {
    errors.push(
      `User ID mismatch: data has ${data.userId} but current user is ${userId || "unknown"}`
    );
    recoverable = false; // Security issue, not recoverable
  }

  // 2. Check if data appears to be from a different user
  if (data.userEmail && data.userEmail !== "anonymous" && !userId) {
    errors.push(`Authenticated data found but no user is logged in`);
    recoverable = false;
  }

  // 3. Check for corrupted projection data that sometimes occurs during auth transitions
  if (data.ages && data.ages.length > 0) {
    // Check if the ages array contains non-numeric entries that passed previous checks
    const invalidAges = data.ages.some(
      (age) =>
        typeof age === "number" &&
        (age < 0 || age > 120 || !Number.isInteger(age))
    );

    if (invalidAges) {
      errors.push(
        "Ages array contains invalid values (non-integer or out of reasonable range)"
      );
      recoverable = true; // We can recover by replacing with defaults
    }
  }

  // 4. Check for negative values in arrays that should always be positive
  const nonNegativeArrays = ["income", "expenses", "netWorth"];
  for (const arrayName of nonNegativeArrays) {
    if (Array.isArray(data[arrayName])) {
      const hasNegatives = data[arrayName].some(
        (val: any) => typeof val === "number" && val < 0 && !isNaN(val)
      );

      if (hasNegatives) {
        errors.push(
          `Array "${arrayName}" contains negative values which may indicate data corruption`
        );
        recoverable = true;
      }
    }
  }

  // 5. Check for unusually large values that might indicate data corruption
  const reasonableLimits: Record<string, number> = {
    income: 10000000, // $10M annual income
    expenses: 10000000, // $10M annual expenses
    netWorth: 1000000000, // $1B net worth
  };

  for (const [arrayName, limit] of Object.entries(reasonableLimits)) {
    if (Array.isArray(data[arrayName])) {
      const hasSuspiciousValues = data[arrayName].some(
        (val: any) => typeof val === "number" && val > limit && !isNaN(val)
      );

      if (hasSuspiciousValues) {
        errors.push(
          `Array "${arrayName}" contains suspiciously large values that may indicate corruption`
        );
        recoverable = true;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    recoverable,
  };
};

/**
 * Ensures that projection data is valid after authentication state changes
 * Attempts to repair or normalize data if possible
 * @param data The projection data to validate and fix
 * @param userId Current user ID for context
 * @param logErrors Whether to log validation errors to console (default: true)
 * @returns Valid ProjectionData or null if not recoverable
 */
export const ensureValidProjectionDataAfterAuth = (
  data: any,
  userId?: string,
  logErrors = true
): ProjectionData | null => {
  // Validate with auth-specific checks
  const validation = validateProjectionDataAfterAuth(data, userId);

  // If validation failed with specific errors, log them
  if (!validation.isValid) {
    if (logErrors) {
      console.warn(
        "Projection data validation after auth failed with the following errors:"
      );
      validation.errors.forEach((error, index) => {
        console.warn(`[${index + 1}/${validation.errors.length}] ${error}`);
      });
    }

    // If not recoverable, return null to signal the caller to handle this case
    if (!validation.recoverable) {
      if (logErrors) {
        console.warn(
          "Auth-related validation errors are not recoverable, data cannot be used"
        );
      }
      return null;
    }

    // If recoverable, continue with standard repairs
    if (logErrors) {
      console.warn("Attempting to recover projection data");
    }
  }

  // Use the standard repair function as a fallback
  return ensureValidProjectionData(data, logErrors);
};
