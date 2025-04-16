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
  return {
    ages: [25, 26, 27, 28, 29, 30],
    netWorth: [0, 0, 0, 0, 0, 0],
    income: [0, 0, 0, 0, 0, 0],
    expenses: [0, 0, 0, 0, 0, 0],
    // Tax-related fields
    federalTax: [0, 0, 0, 0, 0, 0],
    stateTax: [0, 0, 0, 0, 0, 0],
    payrollTax: [0, 0, 0, 0, 0, 0],
    retirementContribution: [0, 0, 0, 0, 0, 0],
    effectiveTaxRate: [0, 0, 0, 0, 0, 0],
    marginalTaxRate: [0, 0, 0, 0, 0, 0]
  };
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