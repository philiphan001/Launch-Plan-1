// Financial rules and thresholds
export const financialRules = {
  // Housing rules
  homeValueToIncomeRatio: {
    good: 3.0,  // Home value should be no more than 3x annual income
    warning: 4.0,  // Warning level
    danger: 5.0   // Danger level
  },
  // Car rules
  carValueToIncomeRatio: {
    good: 0.35,  // Car value should be no more than 35% of annual income
    warning: 0.5,  // Warning level
    danger: 0.7   // Danger level
  },
  // Debt rules
  totalDebtToIncomeRatio: {
    good: 0.36,  // Total monthly debt payments should be below 36% of monthly income
    warning: 0.42,  // Warning level
    danger: 0.5   // Danger level
  },
  // Savings rules
  minimumEmergencyFund: {
    good: 6,  // 6 months of expenses
    warning: 3,  // Warning level
    danger: 1    // Danger level
  },
  // Down payment rules
  homeDownPaymentPercent: {
    good: 0.2,   // 20% down payment
    warning: 0.1, // 10% down payment
    danger: 0.05  // 5% down payment
  },
  carDownPaymentPercent: {
    good: 0.2,   // 20% down payment
    warning: 0.1, // 10% down payment
    danger: 0.0   // 0% down payment
  }
};

// Types for advice
export type AdviceSeverity = 'success' | 'warning' | 'danger';

export interface FinancialAdvice {
  id: string;
  title: string;
  message: string;
  severity: AdviceSeverity;
  solution?: string;
  milestone?: string;
}

// Financial state interface
export interface FinancialState {
  income: number;
  expenses: number;
  savings: number;
  studentLoanDebt: number;
  otherDebt: number;
  homeValue?: number;
  homeDownPayment?: number;
  homeMonthlyPayment?: number;
  carValue?: number;
  carDownPayment?: number;
  carMonthlyPayment?: number;
}

// Generate home purchase advice
function generateHomeAdvice(state: FinancialState): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  
  if (!state.homeValue || state.homeValue <= 0) return advice;
  
  // Check home value to income ratio
  const homeValueToIncomeRatio = state.homeValue / state.income;
  
  if (homeValueToIncomeRatio > financialRules.homeValueToIncomeRatio.danger) {
    advice.push({
      id: 'home-value-danger',
      title: 'Home affordability concern',
      message: `Your selected home value (${formatCurrency(state.homeValue)}) is ${homeValueToIncomeRatio.toFixed(1)}x your annual income, which is significantly higher than the recommended maximum of 3x.`,
      severity: 'danger',
      solution: `Consider a more affordable home, around ${formatCurrency(state.income * financialRules.homeValueToIncomeRatio.good)}, or increase your income before making this purchase.`,
      milestone: 'home'
    });
  } else if (homeValueToIncomeRatio > financialRules.homeValueToIncomeRatio.warning) {
    advice.push({
      id: 'home-value-warning',
      title: 'Consider a more affordable home',
      message: `Your selected home value (${formatCurrency(state.homeValue)}) is ${homeValueToIncomeRatio.toFixed(1)}x your annual income, which is higher than the recommended 3x.`,
      severity: 'warning',
      solution: `A more conservative home value would be around ${formatCurrency(state.income * financialRules.homeValueToIncomeRatio.good)}.`,
      milestone: 'home'
    });
  }
  
  // Check down payment percentage
  if (state.homeDownPayment !== undefined && state.homeValue > 0) {
    const downPaymentPercent = state.homeDownPayment / state.homeValue;
    
    if (downPaymentPercent < financialRules.homeDownPaymentPercent.danger) {
      advice.push({
        id: 'home-downpayment-danger',
        title: 'Very low down payment',
        message: `Your down payment is only ${(downPaymentPercent * 100).toFixed(1)}% of the home value, which will result in higher mortgage costs and potential PMI payments.`,
        severity: 'danger',
        solution: `Aim for at least a 10% down payment (${formatCurrency(state.homeValue * 0.1)}), but ideally 20% (${formatCurrency(state.homeValue * 0.2)}) to avoid PMI.`,
        milestone: 'home'
      });
    } else if (downPaymentPercent < financialRules.homeDownPaymentPercent.warning) {
      advice.push({
        id: 'home-downpayment-warning',
        title: 'Consider a larger down payment',
        message: `Your down payment is ${(downPaymentPercent * 100).toFixed(1)}% of the home value. Increasing to 20% would eliminate PMI and reduce monthly payments.`,
        severity: 'warning',
        solution: `Try to save for a 20% down payment (${formatCurrency(state.homeValue * 0.2)}) before purchasing.`,
        milestone: 'home'
      });
    }
  }
  
  return advice;
}

// Generate car purchase advice
function generateCarAdvice(state: FinancialState): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  
  if (!state.carValue || state.carValue <= 0) return advice;
  
  // Check car value to income ratio
  const carValueToIncomeRatio = state.carValue / state.income;
  
  if (carValueToIncomeRatio > financialRules.carValueToIncomeRatio.danger) {
    advice.push({
      id: 'car-value-danger',
      title: 'Car affordability concern',
      message: `Your selected car value (${formatCurrency(state.carValue)}) is ${(carValueToIncomeRatio * 100).toFixed(0)}% of your annual income, which is significantly higher than the recommended maximum of 35%.`,
      severity: 'danger',
      solution: `Consider a more affordable vehicle, around ${formatCurrency(state.income * financialRules.carValueToIncomeRatio.good)}, or increase your income before making this purchase.`,
      milestone: 'car'
    });
  } else if (carValueToIncomeRatio > financialRules.carValueToIncomeRatio.warning) {
    advice.push({
      id: 'car-value-warning',
      title: 'Consider a more affordable vehicle',
      message: `Your selected car value (${formatCurrency(state.carValue)}) is ${(carValueToIncomeRatio * 100).toFixed(0)}% of your annual income, which is higher than the recommended 35%.`,
      severity: 'warning',
      solution: `A more conservative car value would be around ${formatCurrency(state.income * financialRules.carValueToIncomeRatio.good)}.`,
      milestone: 'car'
    });
  }
  
  // Check down payment percentage
  if (state.carDownPayment !== undefined && state.carValue > 0) {
    const downPaymentPercent = state.carDownPayment / state.carValue;
    
    if (downPaymentPercent < financialRules.carDownPaymentPercent.danger) {
      advice.push({
        id: 'car-downpayment-danger',
        title: 'No down payment on car',
        message: `Purchasing a car with no down payment will result in higher monthly payments and potentially being "underwater" on your loan immediately.`,
        severity: 'danger',
        solution: `Try to save at least ${formatCurrency(state.carValue * 0.2)} (20%) for a down payment before purchasing the vehicle.`,
        milestone: 'car'
      });
    } else if (downPaymentPercent < financialRules.carDownPaymentPercent.warning) {
      advice.push({
        id: 'car-downpayment-warning',
        title: 'Consider a larger car down payment',
        message: `Your car down payment is ${(downPaymentPercent * 100).toFixed(1)}% of the vehicle value. A larger down payment would reduce your loan amount and monthly payments.`,
        severity: 'warning',
        solution: `Try to increase your down payment to at least 20% (${formatCurrency(state.carValue * 0.2)}).`,
        milestone: 'car'
      });
    }
  }
  
  return advice;
}

// Generate debt-related advice
function generateDebtAdvice(state: FinancialState): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  
  // Calculate monthly income
  const monthlyIncome = state.income / 12;
  
  // Calculate total monthly debt payments
  const monthlyDebtPayments = (state.homeMonthlyPayment || 0) + 
                              (state.carMonthlyPayment || 0) + 
                              (state.studentLoanDebt / 120) +  // Assuming 10-year repayment
                              (state.otherDebt / 60);          // Assuming 5-year repayment

  if (monthlyIncome > 0) {
    const debtToIncomeRatio = monthlyDebtPayments / monthlyIncome;
    
    if (debtToIncomeRatio > financialRules.totalDebtToIncomeRatio.danger) {
      advice.push({
        id: 'debt-ratio-danger',
        title: 'High debt-to-income ratio',
        message: `Your monthly debt payments (${formatCurrency(monthlyDebtPayments)}) are ${(debtToIncomeRatio * 100).toFixed(0)}% of your monthly income, which is significantly higher than the recommended maximum of 36%.`,
        severity: 'danger',
        solution: `Consider reducing debt or increasing income. You may want to postpone major purchases until your financial situation improves.`
      });
    } else if (debtToIncomeRatio > financialRules.totalDebtToIncomeRatio.warning) {
      advice.push({
        id: 'debt-ratio-warning',
        title: 'Elevated debt-to-income ratio',
        message: `Your monthly debt payments (${formatCurrency(monthlyDebtPayments)}) are ${(debtToIncomeRatio * 100).toFixed(0)}% of your monthly income, which is higher than the recommended 36%.`,
        severity: 'warning',
        solution: `Look for ways to reduce debt or increase income to improve your financial flexibility.`
      });
    }
  }
  
  return advice;
}

// Generate savings advice
function generateSavingsAdvice(state: FinancialState): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  
  // Check emergency fund
  const monthlyExpenses = state.expenses / 12;
  
  if (monthlyExpenses > 0) {
    const emergencyFundMonths = state.savings / monthlyExpenses;
    
    if (emergencyFundMonths < financialRules.minimumEmergencyFund.danger) {
      advice.push({
        id: 'emergency-fund-danger',
        title: 'Insufficient emergency fund',
        message: `Your savings (${formatCurrency(state.savings)}) would only cover ${emergencyFundMonths.toFixed(1)} months of expenses. This is far below the recommended 6-month minimum.`,
        severity: 'danger',
        solution: `Build up an emergency fund of at least ${formatCurrency(monthlyExpenses * 3)} (3 months) before making major purchases, and aim for ${formatCurrency(monthlyExpenses * 6)} (6 months).`
      });
    } else if (emergencyFundMonths < financialRules.minimumEmergencyFund.warning) {
      advice.push({
        id: 'emergency-fund-warning',
        title: 'Low emergency fund',
        message: `Your savings (${formatCurrency(state.savings)}) would only cover ${emergencyFundMonths.toFixed(1)} months of expenses, which is below the recommended 6-month minimum.`,
        severity: 'warning',
        solution: `Try to increase your emergency fund to ${formatCurrency(monthlyExpenses * 6)} (6 months of expenses) before making major purchases.`
      });
    }
  }
  
  return advice;
}

// Generate all financial advice
export function generateFinancialAdvice(state: FinancialState): FinancialAdvice[] {
  return [
    ...generateHomeAdvice(state),
    ...generateCarAdvice(state),
    ...generateDebtAdvice(state),
    ...generateSavingsAdvice(state)
  ];
}

// Generate tailored advice for a specific milestone
export function generateMilestoneAdvice(
  milestoneType: string, 
  milestoneData: any, 
  financialState: FinancialState
): FinancialAdvice[] {
  // Create a merged state with milestone data
  const mergedState: FinancialState = {
    ...financialState
  };
  
  // Add milestone-specific data to the state
  switch (milestoneType) {
    case 'home':
      mergedState.homeValue = milestoneData.homeValue;
      mergedState.homeDownPayment = milestoneData.homeDownPayment;
      mergedState.homeMonthlyPayment = milestoneData.homeMonthlyPayment;
      break;
      
    case 'car':
      mergedState.carValue = milestoneData.carValue;
      mergedState.carDownPayment = milestoneData.carDownPayment;
      mergedState.carMonthlyPayment = milestoneData.carMonthlyPayment;
      break;
  }
  
  // Generate advice for the specific milestone type
  let advice: FinancialAdvice[] = [];
  
  switch (milestoneType) {
    case 'home':
      advice = generateHomeAdvice(mergedState);
      break;
      
    case 'car':
      advice = generateCarAdvice(mergedState);
      break;
      
    default:
      // For other milestone types, generate comprehensive advice
      advice = generateFinancialAdvice(mergedState);
      break;
  }
  
  return advice;
}

// Formatter for currency display
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}