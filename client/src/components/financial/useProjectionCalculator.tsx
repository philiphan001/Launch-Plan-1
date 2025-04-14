import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to calculate financial projections
 * 
 * This hook encapsulates the logic for calculating financial projections
 * based on user inputs and milestones.
 */
export function useProjectionCalculator({
  age,
  income,
  expenses,
  startingSavings,
  studentLoanDebt,
  otherDebt,
  incomeGrowth,
  emergencyFundAmount,
  personalLoanInterestRate,
  personalLoanTermYears,
  timeframe,
  milestones
}) {
  const [projectionData, setProjectionData] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  // Function to generate JavaScript-based projection data as a fallback
  const generateLocalProjectionData = useCallback((milestones) => {
    console.log("Generating projection data with JavaScript calculator");
    
    // Extract timeframe from string like "10 Years" to get just the number
    const years = parseInt(timeframe.split(' ')[0]) || 10;
    
    // Base data structures
    const ages = [];
    const netWorth = [];
    const incomeValues = [];
    const expenseValues = [];
    const savings = [];
    const debt = [];
    
    // Starting values
    let currentAge = age || 25;
    let currentIncome = income || 50000;
    let currentExpenses = expenses || 40000;
    let currentSavings = startingSavings || 10000;
    let currentDebt = (studentLoanDebt || 0) + (otherDebt || 0);
    let currentNetWorth = currentSavings - currentDebt;
    
    // Create sorted milestones by yearsAway
    const sortedMilestones = [...(milestones || [])].sort((a, b) => a.yearsAway - b.yearsAway);
    
    // Year by year calculation
    for (let year = 0; year <= years; year++) {
      // Push current values to arrays
      ages.push(currentAge + year);
      
      // Apply milestone effects for this year
      const yearMilestones = sortedMilestones.filter(m => Math.floor(m.yearsAway) === year);
      
      // Adjust income/expenses based on milestones
      let adjustedIncome = currentIncome;
      let adjustedExpenses = currentExpenses;
      
      yearMilestones.forEach(milestone => {
        switch (milestone.type) {
          case 'career':
            // Career change affects income
            adjustedIncome = milestone.income || adjustedIncome;
            break;
          case 'education':
            // Education might reduce income if not working
            if (milestone.workStatus === 'no') {
              adjustedIncome = 0;
            } else if (milestone.workStatus === 'part-time') {
              adjustedIncome = milestone.partTimeIncome || adjustedIncome * 0.5;
            }
            // Add education expenses
            adjustedExpenses += milestone.educationAnnualCost || 0;
            break;
          case 'home':
            // Home purchase affects expenses (mortgage)
            adjustedExpenses += milestone.homeMonthlyPayment * 12 || 0;
            break;
          case 'car':
            // Car purchase affects expenses (car payment)
            adjustedExpenses += milestone.carMonthlyPayment * 12 || 0;
            break;
          case 'children':
            // Children affect expenses
            adjustedExpenses += (milestone.childrenCount || 1) * (milestone.childrenExpensePerYear || 10000);
            break;
          case 'marriage':
            // Marriage affects both income and expenses
            adjustedIncome += milestone.spouseIncome || 0;
            adjustedExpenses += adjustedExpenses * 0.7; // Economies of scale in shared expenses
            break;
          default:
            break;
        }
      });
      
      // Record the values for this year
      incomeValues.push(adjustedIncome);
      expenseValues.push(adjustedExpenses);
      
      // Calculate savings for this year (positive if income > expenses)
      const yearSavings = adjustedIncome - adjustedExpenses;
      savings.push(yearSavings);
      
      // Update net worth based on savings
      if (year > 0) {
        currentNetWorth += yearSavings;
      }
      
      netWorth.push(currentNetWorth);
      
      // Apply income growth for next year
      currentIncome = currentIncome * (1 + (incomeGrowth || 0.02));
      
      // Apply inflation to expenses for next year
      currentExpenses = currentExpenses * 1.025; // 2.5% inflation
    }
    
    return {
      ages,
      netWorth,
      income: incomeValues,
      expenses: expenseValues,
      savings,
      debt,
      milestones: milestones || []
    };
  }, [age, income, expenses, startingSavings, studentLoanDebt, otherDebt, incomeGrowth, timeframe]);

  // Function to calculate projections using the API
  const calculateProjections = useCallback(async () => {
    if (!milestones || milestones.length === 0) {
      console.log("No milestones to calculate projections for");
      return;
    }
    
    setIsCalculating(true);
    setError(null);
    
    try {
      // Prepare standardized milestone data for the calculator
      const formattedMilestones = milestones.map(m => ({
        id: m.id,
        type: m.type,
        title: m.title,
        date: m.date,
        yearsAway: m.yearsAway,
        financialImpact: m.financialImpact || 0,
        workStatus: m.workStatus || "full-time",
        spouseOccupation: m.spouseOccupation || "",
        spouseIncome: m.spouseIncome || 0,
        spouseAssets: m.spouseAssets || 0,
        spouseLiabilities: m.spouseLiabilities || 0,
        educationCost: m.educationCost || 0,
        educationType: m.educationType || "",
        educationYears: m.educationYears || 0,
        educationAnnualCost: m.educationAnnualCost || 0,
        educationAnnualLoan: m.educationAnnualLoan || 0,
        targetOccupation: m.targetOccupation || "",
        educationField: m.educationField || "",
        targetCareer: m.targetCareer || "",
        partTimeIncome: m.partTimeIncome || 0,
        returnToSameProfession: m.returnToSameProfession || false,
        homeValue: m.homeValue || 0,
        homeDownPayment: m.homeDownPayment || 0,
        homeMonthlyPayment: m.homeMonthlyPayment || 0,
        carValue: m.carValue || 0,
        carDownPayment: m.carDownPayment || 0,
        carMonthlyPayment: m.carMonthlyPayment || 0,
        childrenCount: m.childrenCount || 0,
        childrenExpensePerYear: m.childrenExpensePerYear || 0,
        details: m.details || {}
      }));
      
      // Prepare the calculator input
      const calculatorInput = {
        age: age || 25,
        income: income || 0,
        expenses: expenses || 0,
        savings: startingSavings || 0,
        studentLoanDebt: studentLoanDebt || 0,
        otherDebt: otherDebt || 0,
        incomeGrowthRate: incomeGrowth || 0.02,
        emergencyFundTarget: emergencyFundAmount || 10000,
        personalLoanInterestRate: personalLoanInterestRate ? personalLoanInterestRate / 100 : 0.08, // Convert from percentage to decimal
        personalLoanYears: personalLoanTermYears || 5,
        timeframe: parseInt(timeframe?.split(' ')[0]) || 10,
        milestones: formattedMilestones
      };
      
      console.log("Calculating projections with input:", calculatorInput);
      
      // Call the financial calculator API
      const response = await fetch('/api/financial-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculatorInput),
      });
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Projection calculation complete:", result);
      
      // Add milestone data to the result
      const resultWithMilestones = {
        ...result,
        milestones: formattedMilestones
      };
      
      setProjectionData(resultWithMilestones);
    } catch (error) {
      console.error("Error calculating projections:", error);
      setError(error.message || "Failed to calculate projections");
      
      // Use JavaScript calculator as fallback
      console.log("Using JavaScript calculator as fallback");
      const fallbackData = generateLocalProjectionData(milestones);
      setProjectionData(fallbackData);
    } finally {
      setIsCalculating(false);
    }
  }, [
    age, 
    income, 
    expenses, 
    startingSavings, 
    studentLoanDebt, 
    otherDebt, 
    incomeGrowth, 
    emergencyFundAmount, 
    personalLoanInterestRate, 
    personalLoanTermYears, 
    timeframe, 
    milestones, 
    generateLocalProjectionData
  ]);

  // Run calculation on initial render or when dependencies change
  useEffect(() => {
    calculateProjections();
  }, [calculateProjections]);

  return {
    projectionData,
    isCalculating,
    error,
    recalculate: calculateProjections
  };
}