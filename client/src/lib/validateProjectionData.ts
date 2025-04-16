import { ProjectionData } from "@/components/dashboard/ScenarioCard";

/**
 * Validates if the given object is a valid ProjectionData object
 * @param data The data to validate
 * @returns True if the data is valid, false otherwise
 */
export const isValidProjectionData = (data: any): boolean => {
  if (!data) return false;
  if (typeof data !== 'object') return false;
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
 * Creates a default ProjectionData object with empty arrays
 * @returns A default ProjectionData object
 */
export const createDefaultProjectionData = (): ProjectionData => {
  // Create a default ProjectionData object with required fields
  const defaultData: ProjectionData = {
    ages: [25, 26, 27, 28, 29, 30],
    netWorth: [0, 0, 0, 0, 0, 0],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0]
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
 * @returns Valid ProjectionData
 */
export const ensureValidProjectionData = (data: any): ProjectionData => {
  if (!isValidProjectionData(data)) {
    console.warn("Invalid projection data encountered, using default projection data", data);
    return createDefaultProjectionData();
  }
  
  return data;
};

/**
 * Creates a key-value object from projection data arrays
 * This is useful for displaying data in tables and charts
 * @param projectionData The projection data
 * @returns Array of objects with age and financial values
 */
export const createProjectionDataTable = (projectionData: ProjectionData): Array<{
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
    expenses: validData.expenses[index] || 0
  }));
};

/**
 * Validates if the provided data conforms to the ProjectionSummaryData interface
 * @param data The data to validate
 * @returns True if the data is valid, false otherwise
 */
export const validateProjectionSummaryData = (data: any): boolean => {
  if (!data) return false;
  if (typeof data !== 'object') return false;
  
  // Check if the financials object exists and has all required properties
  if (!data.financials) return false;
  if (typeof data.financials !== 'object') return false;
  
  // Verify the required financials properties
  const requiredFinancialProps = ['startingSavings', 'income', 'expenses', 'studentLoanDebt', 'emergencyFundAmount'];
  for (const prop of requiredFinancialProps) {
    if (typeof data.financials[prop] !== 'number') return false;
  }
  
  // College data is optional, but if present, must have correct structure
  if (data.college) {
    if (typeof data.college !== 'object') return false;
    if (typeof data.college.id !== 'number') return false;
    if (typeof data.college.name !== 'string') return false;
    if (typeof data.college.totalCost !== 'number') return false;
    if (typeof data.college.studentLoanAmount !== 'number') return false;
  }
  
  // Career data is optional, but if present, must have correct structure
  if (data.career) {
    if (typeof data.career !== 'object') return false;
    if (typeof data.career.id !== 'number') return false;
    if (typeof data.career.title !== 'string') return false;
    if (typeof data.career.entryLevelSalary !== 'number') return false;
    if (typeof data.career.projectedSalary !== 'number') return false;
  }
  
  // Location data is optional, but if present, must have correct structure
  if (data.location) {
    if (typeof data.location !== 'object') return false;
    if (typeof data.location.zipCode !== 'string') return false;
    if (typeof data.location.city !== 'string') return false;
    if (typeof data.location.state !== 'string') return false;
  }
  
  return true;
};

/**
 * Creates a default ProjectionSummaryData object with minimal valid structure
 * @param initialValues Optional values to use instead of zeros
 * @returns A valid ProjectionSummaryData object
 */
export const createDefaultProjectionSummaryData = (
  initialValues?: {
    startingSavings?: number;
    income?: number;
    expenses?: number;
    studentLoanDebt?: number;
    emergencyFundAmount?: number;
  }
): ProjectionSummaryData => {
  return {
    financials: {
      startingSavings: initialValues?.startingSavings || 0,
      income: initialValues?.income || 0,
      expenses: initialValues?.expenses || 0,
      studentLoanDebt: initialValues?.studentLoanDebt || 0,
      emergencyFundAmount: initialValues?.emergencyFundAmount || 0
    }
  };
};