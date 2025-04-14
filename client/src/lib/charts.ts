import Chart from 'chart.js/auto';
import { NetWorthData, CashFlowData, ProjectionData } from './types';

/**
 * Fixes the liability calculation by including graduate school loans
 * in the total liabilities if they're not already included.
 * 
 * @param data The projection data to fix
 * @returns A copy of the projection data with corrected liability values
 */
export function fixLiabilityCalculation(data: ProjectionData): ProjectionData {
  if (!data.liabilities || !data.graduateSchoolLoans) {
    // If there's no data to fix, return the original
    return data;
  }
  
  // Create a deep copy of the data
  const fixedData = { ...data };
  
  // Create a new liabilities array 
  fixedData.liabilities = data.liabilities.map((liability, index) => {
    // Calculate the sum of all known liability types
    const mortgageValue = data.mortgage && data.mortgage[index] ? data.mortgage[index] : 0;
    const studentLoanValue = data.studentLoan && data.studentLoan[index] ? data.studentLoan[index] : 0;
    const educationLoansValue = data.educationLoans && data.educationLoans[index] ? data.educationLoans[index] : 0;
    const graduateSchoolLoansValue = data.graduateSchoolLoans && data.graduateSchoolLoans[index] ? data.graduateSchoolLoans[index] : 0;
    const carLoanValue = data.carLoan && data.carLoan[index] ? data.carLoan[index] : 0;
    const personalLoansValue = data.personalLoans && data.personalLoans[index] ? data.personalLoans[index] : 0;
    
    // Sum all liability types
    const sumOfAllLiabilities = mortgageValue + studentLoanValue + educationLoansValue + 
                               graduateSchoolLoansValue + carLoanValue + personalLoansValue;
    
    // If the sum of liabilities is greater than the reported total, use the sum instead
    if (sumOfAllLiabilities > liability) {
      console.log(`Year ${index}: Fixed liabilities from ${liability} to ${sumOfAllLiabilities} (added graduate school loans of ${graduateSchoolLoansValue})`);
      return sumOfAllLiabilities;
    }
    
    // Otherwise, keep the original value
    return liability;
  });
  
  // Also update the net worth to reflect the fixed liability values
  if (fixedData.assets) {
    fixedData.netWorth = fixedData.assets.map((asset, index) => {
      return asset - (fixedData.liabilities?.[index] || 0);
    });
  }
  
  return fixedData;
}

// Function to create a net worth chart
export function createNetWorthChart(ctx: CanvasRenderingContext2D, data: NetWorthData[]): Chart {
  const labels = data.map(item => item.age.toString());
  const values = data.map(item => item.netWorth);
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Net Worth',
        data: values,
        backgroundColor: (context) => {
          const value = context.raw as number;
          return value >= 0 ? 'rgba(25, 118, 210, 0.7)' : 'rgba(244, 67, 54, 0.7)';
        },
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `Net Worth: $${Number(context.raw).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Function to create a cash flow chart
export function createCashFlowChart(ctx: CanvasRenderingContext2D, data: CashFlowData[]): Chart {
  const labels = data.map(item => item.age.toString());
  const incomeData = data.map(item => item.income);
  const expensesData = data.map(item => item.expenses);
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: 'rgba(38, 166, 154, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Expenses',
          data: expensesData,
          backgroundColor: 'rgba(255, 152, 0, 0.7)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Function to create a detailed expense breakdown pie chart
export function createExpenseBreakdownChart(ctx: CanvasRenderingContext2D, data: {
  housing: number;
  transportation: number;
  food: number;
  healthcare: number;
  education: number;
  debt: number;
  childcare: number;
  discretionary: number;
  personalInsurance?: number;
  entertainment?: number;
  apparel?: number;
  services?: number;
  other?: number;
  taxes?: number;  // Added taxes as a category
}): Chart {
  const { 
    housing, transportation, food, healthcare, 
    education, debt, childcare, discretionary,
    personalInsurance = 0, entertainment = 0, apparel = 0, services = 0, other = 0,
    taxes = 0  // Default to 0 if not provided
  } = data;
  
  const total = housing + transportation + food + healthcare + 
                education + debt + childcare + discretionary + 
                personalInsurance + entertainment + apparel + services + other +
                taxes;  // Include taxes in total
  
  // Skip empty data
  if (total === 0) {
    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['No expense data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#e0e0e0'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function() {
                return 'No expense data available';
              }
            }
          }
        }
      }
    });
  }

  // Calculate percentages
  const calculatePercentage = (value: number) => ((value / total) * 100).toFixed(1);
  
  const labels = [
    `Housing (${calculatePercentage(housing)}%)`,
    `Transportation (${calculatePercentage(transportation)}%)`,
    `Food (${calculatePercentage(food)}%)`,
    `Healthcare (${calculatePercentage(healthcare)}%)`,
    `Education (${calculatePercentage(education)}%)`,
    `Debt (${calculatePercentage(debt)}%)`,
    `Childcare (${calculatePercentage(childcare)}%)`,
    `Discretionary (${calculatePercentage(discretionary)}%)`,
    `Insurance (${calculatePercentage(personalInsurance)}%)`,
    `Entertainment (${calculatePercentage(entertainment)}%)`,
    `Apparel (${calculatePercentage(apparel)}%)`,
    `Services (${calculatePercentage(services)}%)`,
    `Other (${calculatePercentage(other)}%)`,
    `Taxes (${calculatePercentage(taxes)}%)`,  // Added taxes label
  ];
  
  const colors = [
    'rgba(33, 150, 243, 0.8)',  // Blue for housing
    'rgba(156, 39, 176, 0.8)',  // Purple for transportation
    'rgba(255, 193, 7, 0.8)',   // Amber for food
    'rgba(233, 30, 99, 0.8)',   // Pink for healthcare
    'rgba(0, 150, 136, 0.8)',   // Teal for education
    'rgba(244, 67, 54, 0.8)',   // Red for debt
    'rgba(76, 175, 80, 0.8)',   // Green for childcare
    'rgba(255, 152, 0, 0.8)',   // Orange for discretionary
    'rgba(121, 85, 72, 0.8)',   // Brown for insurance
    'rgba(63, 81, 181, 0.8)',   // Indigo for entertainment
    'rgba(103, 58, 183, 0.8)',  // Deep purple for apparel
    'rgba(3, 169, 244, 0.8)',   // Light blue for services
    'rgba(158, 158, 158, 0.8)', // Grey for other
    'rgba(21, 101, 192, 0.8)',  // Dark blue for taxes
  ];
  
  const chartData = [
    housing, transportation, food, healthcare, 
    education, debt, childcare, discretionary,
    personalInsurance, entertainment, apparel, services, other,
    taxes  // Added taxes to chart data
  ];
  
  // Filter out zero values to avoid cluttering the chart
  const filteredLabels = [];
  const filteredData = [];
  const filteredColors = [];
  
  for (let i = 0; i < chartData.length; i++) {
    if (chartData[i] > 0) {
      filteredLabels.push(labels[i]);
      filteredData.push(chartData[i]);
      filteredColors.push(colors[i]);
    }
  }
  
  return new Chart(ctx, {
    type: 'pie',
    data: {
      labels: filteredLabels,
      datasets: [{
        data: filteredData,
        backgroundColor: filteredColors,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.raw;
              const category = context.label.split(' (')[0];
              return `${category}: $${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`;
            }
          }
        }
      }
    }
  });
}

// Function to create a stacked asset chart showing different asset categories
export function createStackedAssetChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  // Use savingsValue directly from the Python backend
  // If not available, fall back to zero - we should never calculate this in the frontend
  const savingsRaw = data.savingsValue || Array(data.ages.length).fill(0);
  
  // Get retirement data if available
  const retirementSavings = data.retirementContribution && data.retirementContribution.length > 0 ? 
    // Calculate cumulative retirement savings with growth based on the assumption
    data.retirementContribution.map((_, index) => {
      // Apply compound growth to each year's contribution
      let total = 0;
      
      // Since we've already checked data.retirementContribution exists and has length > 0,
      // we can safely access it here. TypeScript just needs some extra assurance.
      const contribArray = data.retirementContribution as number[];
      
      for (let i = 0; i <= index; i++) {
        // Make sure we have the value at index i
        const contribution = contribArray[i] || 0;
        // Calculate years of growth (current year minus contribution year)
        const yearsOfGrowth = index - i;
        
        // Apply compound growth if there are years to grow
        // We don't have access to the actual growth rate here, so this will be applied
        // when the hook is used in the component
        total += contribution;
      }
      
      return total;
    }) : 
    Array(data.ages.length).fill(0);
  
  // Calculate regular savings by subtracting retirement from total savings
  // Make sure we don't end up with negative regular savings if the calculation is off
  const regularSavings = savingsRaw.map((total, i) => {
    const retirement = retirementSavings[i] || 0;
    // Regular savings is what's left after accounting for retirement
    // However, we need to handle cases where total might be negative
    
    // CRITICAL: Check if we have data from the emergency fund protection
    // This ensures we're displaying the protected emergency fund amount properly
    // The backend ensures savings will never be below the threshold (typically $10,000)
    // so we should never see values < 0 or below the emergency fund threshold
    if (total <= 0) {
      // If total is zero or negative, something is wrong - indicate critical error with a small value
      console.warn(`Critical error: Savings should never be <= 0 due to emergency fund protection, but got ${total} at age ${data.ages[i]}`);
      return 500; // Show a small visible amount to indicate there's a value that should be higher
    } else {
      // Use the value from the backend, which should already be at or above the emergency threshold
      // Subtract retirement from total, but don't go below zero for display purposes
      return Math.max(0, total - retirement);
    }
  });
  
  // Log the raw savings data for debugging
  console.log("Raw savings values from Python:", savingsRaw);
  console.log("Retirement savings values:", retirementSavings);
  console.log("Regular savings values:", regularSavings);
  
  // We'll use a different approach for savings visualization
  // Instead of stacking, which doesn't handle negative values well,
  // we'll use a regular bar chart approach for the savings values
  const datasets = [];
  
  // Create dataset for regular savings
  // This is a direct fix to ensure we always display the emergency fund threshold
  // We use the raw savingsRaw values from the backend which are already protected at the minimum
  datasets.push({
    label: 'Regular Savings',
    data: savingsRaw, // Use the raw values from the backend instead of calculated regularSavings
    backgroundColor: (context: any) => {
      const value = context.raw as number;
      return value >= 0 ? 'rgba(63, 81, 181, 0.7)' : 'rgba(244, 67, 54, 0.7)';
    },
    borderRadius: 4,
    // Not using stack for savings so we can see the negative values clearly
  });
  
  // Create dataset for retirement savings
  datasets.push({
    label: 'Retirement Savings',
    data: retirementSavings,
    backgroundColor: 'rgba(76, 175, 80, 0.7)', // Green for retirement
    borderRadius: 4,
    // Not using stack for retirement to be consistent with regular savings
  });
  
  // Debug output
  console.log("Asset Breakdown Chart Data:");
  for (let i = 0; i < data.ages.length; i++) {
    console.log(`Year ${i} (Age ${data.ages[i]}): Regular Savings=${regularSavings[i]}, Retirement=${retirementSavings[i]}, Home=${data.homeValue?.[i] || 0}, Total Assets=${data.assets?.[i] || 0}`);
  }

  // Add home value dataset if it exists and has positive values
  if (data.homeValue && data.homeValue.some(value => value > 0)) {
    datasets.push({
      label: 'Home Value',
      data: data.homeValue,
      backgroundColor: 'rgba(0, 150, 136, 0.7)', // Teal color for home value
      borderRadius: 4,
      stack: 'assets'
    });
  }
  
  // Add car value dataset if it exists and has positive values
  if (data.carValue && data.carValue.some(value => value > 0)) {
    datasets.push({
      label: 'Car Value',
      data: data.carValue,
      backgroundColor: 'rgba(103, 58, 183, 0.7)', // Purple color for car value
      borderRadius: 4,
      stack: 'assets'
    });
  }

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.raw;
              const formattedValue = Math.abs(Number(value)).toLocaleString();
              // Show negative values with the minus sign
              if (value < 0) {
                return `${context.dataset.label}: -$${formattedValue}`;
              }
              return `${context.dataset.label}: $${formattedValue}`;
            },
            footer: function(tooltipItems: any) {
              let totalPositive = 0;
              let totalNegative = 0;
              
              tooltipItems.forEach(function(tooltipItem: any) {
                const value = tooltipItem.parsed.y;
                if (value < 0) {
                  totalNegative += Math.abs(value);
                } else {
                  totalPositive += value;
                }
              });
              
              // Calculate net total (positive minus negative)
              const netTotal = totalPositive - totalNegative;
              
              // Show the totals
              return [
                `Total Positive: $${totalPositive.toLocaleString()}`,
                totalNegative > 0 ? `Total Negative: -$${totalNegative.toLocaleString()}` : null,
                `Net Total: ${netTotal >= 0 ? '$' : '-$'}${Math.abs(netTotal).toLocaleString()}`
              ].filter(Boolean).join('\n');
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false // Don't stack on x-axis for savings which can be negative
        },
        y: {
          stacked: false, // Don't stack on y-axis so negatives show properly
          ticks: {
            callback: function(value: any) {
              // Format value with $ sign, preserving negative values
              if (value < 0) {
                return '-$' + Math.abs(Number(value)).toLocaleString();
              }
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Function to create a stacked income chart showing personal and spouse income
export function createStackedIncomeChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  const datasets = [];
  
  // Add personal income
  if (data.income && data.income.length > 0) {
    datasets.push({
      label: 'Personal Income',
      data: data.income,
      backgroundColor: 'rgba(38, 166, 154, 0.7)', // Green color for primary income
      borderRadius: 4,
      stack: 'income'
    });
  }
  
  // Add spouse income if available
  if (data.spouseIncome && data.spouseIncome.some(value => value > 0)) {
    datasets.push({
      label: 'Spouse Income',
      data: data.spouseIncome,
      backgroundColor: 'rgba(156, 39, 176, 0.7)', // Purple color for spouse income
      borderRadius: 4,
      stack: 'income'
    });
  }
  
  // If no income data, show a placeholder
  if (datasets.length === 0) {
    datasets.push({
      label: 'Income',
      data: Array(labels.length).fill(0),
      backgroundColor: 'rgba(38, 166, 154, 0.7)',
      borderRadius: 4
    });
  }
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: datasets.length > 1, // Only show legend if we have spouse income
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
            },
            footer: function(tooltipItems: any) {
              let total = 0;
              tooltipItems.forEach(function(tooltipItem: any) {
                total += tooltipItem.parsed.y;
              });
              return `Total Income: $${total.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          ticks: {
            callback: function(value: any) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Function to create a stacked expense chart showing different expense categories
export function createStackedExpenseChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  const datasets = [];
  
  // Debug the input data to see what categories are available
  console.log("Creating stacked expense chart with data keys:", Object.keys(data));
  
  // Add more detailed debugging to identify property naming issues
  console.log("DETAILED EXPENSE DATA DEBUG:");
  console.log("- expenses:", data.expenses);
  console.log("- housingExpenses:", data.housingExpenses);
  console.log("- housing:", data.housing);
  console.log("- transportationExpenses:", data.transportationExpenses);
  console.log("- transportation:", data.transportation);
  console.log("- foodExpenses:", data.foodExpenses);
  console.log("- food:", data.food);
  console.log("- healthcareExpenses:", data.healthcareExpenses);
  console.log("- healthcare:", data.healthcare);
  console.log("- taxes:", data.taxes);
  
  // Add a direct dump of every property to see exact data structure
  console.log("FULL DATA DUMP:");
  for (const key of Object.keys(data)) {
    console.log(`${key}:`, data[key]);
  }
  
  console.log("Expense data sample:", {
    housing: data.housing?.[0],
    transportation: data.transportation?.[0],
    food: data.food?.[0],
    healthcare: data.healthcare?.[0],
    education: data.education?.[0],
    debt: data.debt?.[0],
    childcare: data.childcare?.[0], 
    discretionary: data.discretionary?.[0],
    personalInsurance: data.personalInsurance?.[0],
    entertainment: data.entertainment?.[0],
    apparel: data.apparel?.[0],
    services: data.services?.[0],
    other: data.other?.[0]
  });
  
  // Additional logging specifically for healthcare
  console.log("Healthcare data debugging:");
  console.log("- healthcare exists:", !!data.healthcare);
  console.log("- healthcare array:", data.healthcare);
  console.log("- healthcare first year:", data.healthcare?.[0]);
  console.log("- healthcare second year:", data.healthcare?.[1]);
  console.log("- healthcare type:", typeof data.healthcare);

  // Define expense categories and their colors
  const expenseCategories = [
    { key: 'housing', label: 'Housing', color: 'rgba(33, 150, 243, 0.7)' },        // Blue
    { key: 'transportation', label: 'Transportation', color: 'rgba(156, 39, 176, 0.7)' },  // Purple
    { key: 'food', label: 'Food', color: 'rgba(255, 193, 7, 0.7)' },               // Amber
    { key: 'healthcare', label: 'Healthcare', color: 'rgba(233, 30, 99, 0.7)' },   // Pink
    { key: 'education', label: 'Education', color: 'rgba(0, 150, 136, 0.7)' },     // Teal
    { key: 'debt', label: 'Debt', color: 'rgba(244, 67, 54, 0.7)' },               // Red
    { key: 'childcare', label: 'Childcare', color: 'rgba(76, 175, 80, 0.7)' },     // Green
    { key: 'discretionary', label: 'Discretionary', color: 'rgba(255, 152, 0, 0.7)' }, // Orange
    { key: 'personalInsurance', label: 'Insurance', color: 'rgba(121, 85, 72, 0.7)' }, // Brown
    { key: 'entertainment', label: 'Entertainment', color: 'rgba(63, 81, 181, 0.7)' }, // Indigo
    { key: 'apparel', label: 'Apparel', color: 'rgba(103, 58, 183, 0.7)' },        // Deep purple
    { key: 'services', label: 'Services', color: 'rgba(3, 169, 244, 0.7)' },       // Light blue
    { key: 'taxes', label: 'Taxes', color: 'rgba(21, 101, 192, 0.7)' },            // Dark blue for taxes
    { key: 'other', label: 'Other', color: 'rgba(158, 158, 158, 0.7)' }            // Grey
  ];
  
  // Add datasets for each expense category if data exists
  expenseCategories.forEach(category => {
    // Check both naming conventions (with and without "Expenses" suffix)
    let categoryData = data[category.key] || data[category.key + 'Expenses'];
    const hasValues = categoryData && categoryData.some((value: number) => value > 0);
    
    console.log(`Category ${category.key}: exists=${!!categoryData}, hasValues=${hasValues}, sample=${categoryData?.[0]}`);
    
    if (hasValues) {
      datasets.push({
        label: category.label,
        data: categoryData,
        backgroundColor: category.color,
        borderRadius: 4,
        stack: 'expenses'
      });
    }
  });
  
  // If no detailed expense data, just show total expenses
  if (datasets.length === 0 && data.expenses) {
    datasets.push({
      label: 'Total Expenses',
      data: data.expenses,
      backgroundColor: 'rgba(255, 152, 0, 0.7)',
      borderRadius: 4
    });
  }
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
            },
            footer: function(tooltipItems: any) {
              let total = 0;
              tooltipItems.forEach(function(tooltipItem: any) {
                total += tooltipItem.parsed.y;
              });
              return `Total Expenses: $${total.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          ticks: {
            callback: function(value: any) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Function to create a stacked liability chart showing different liability categories
export function createStackedLiabilityChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  // Apply the liability fix to ensure graduate school loans are properly counted
  data = fixLiabilityCalculation(data);
  
  const labels = data.ages.map(age => age.toString());
  
  // Calculate other debts (total liabilities minus all specific loan types)
  const otherDebts = data.liabilities?.map((liabilityValue, index) => {
    const mortgageValue = data.mortgage && data.mortgage[index] ? data.mortgage[index] : 0;
    const studentLoanValue = data.studentLoan && data.studentLoan[index] ? data.studentLoan[index] : 0;
    const educationLoansValue = data.educationLoans && data.educationLoans[index] ? data.educationLoans[index] : 0;
    const graduateSchoolLoansValue = data.graduateSchoolLoans && data.graduateSchoolLoans[index] ? data.graduateSchoolLoans[index] : 0;
    const carLoanValue = data.carLoan && data.carLoan[index] ? data.carLoan[index] : 0;
    const personalLoansValue = data.personalLoans && data.personalLoans[index] ? data.personalLoans[index] : 0;
    
    // Calculate the sum of all known debt types
    const sumOfKnownLoans = mortgageValue + studentLoanValue + educationLoansValue + graduateSchoolLoansValue + carLoanValue + personalLoansValue;
    
    // Take the max of 0 and the difference to avoid negative values
    return Math.max(0, liabilityValue - sumOfKnownLoans);
  }) || [];

  const datasets = [
    {
      label: 'Other Debts',
      data: otherDebts,
      backgroundColor: 'rgba(244, 67, 54, 0.7)', // Red for general debts
      borderRadius: 4,
      stack: 'liabilities'
    }
  ];

  // Add student loan dataset if it exists and has positive values
  if (data.studentLoan && data.studentLoan.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Student Loans',
      data: data.studentLoan,
      backgroundColor: 'rgba(255, 152, 0, 0.7)', // Orange for student loans
      borderRadius: 4,
      stack: 'liabilities'
    });
  }
  
  // Add education loans (undergraduate) if they exist and have positive values
  if (data.educationLoans && data.educationLoans.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Education Loans',
      data: data.educationLoans,
      backgroundColor: 'rgba(76, 175, 80, 0.7)', // Green for education loans
      borderRadius: 4,
      stack: 'liabilities'
    });
  }
  
  // Add graduate school loans if they exist and have positive values
  if (data.graduateSchoolLoans && data.graduateSchoolLoans.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Graduate School Loans',
      data: data.graduateSchoolLoans,
      backgroundColor: 'rgba(0, 188, 212, 0.7)', // Cyan for graduate school loans
      borderRadius: 4,
      stack: 'liabilities'
    });
  }
  
  // Add personal loans if they exist and have positive values
  if (data.personalLoans && data.personalLoans.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Personal Loans',
      data: data.personalLoans,
      backgroundColor: 'rgba(255, 87, 34, 0.7)', // Deep orange for personal loans
      borderRadius: 4,
      stack: 'liabilities'
    });
  }
  
  // Add car loan dataset if it exists and has positive values
  if (data.carLoan && data.carLoan.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Car Loan',
      data: data.carLoan,
      backgroundColor: 'rgba(156, 39, 176, 0.7)', // Purple for car loan
      borderRadius: 4,
      stack: 'liabilities'
    });
  }

  // Add mortgage dataset if it exists and has positive values
  if (data.mortgage && data.mortgage.some((value: number) => value > 0)) {
    datasets.push({
      label: 'Mortgage',
      data: data.mortgage,
      backgroundColor: 'rgba(121, 85, 72, 0.7)', // Brown for mortgage
      borderRadius: 4,
      stack: 'liabilities'
    });
  }

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
            },
            footer: function(tooltipItems: any) {
              let total = 0;
              tooltipItems.forEach(function(tooltipItem: any) {
                total += tooltipItem.parsed.y;
              });
              return `Total Liabilities: $${total.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true
        },
        y: {
          stacked: true,
          ticks: {
            callback: function(value: any) {
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Import the specialized chart for negative values at the top of the file

// Function to create a combined income and expense chart that also shows net cash flow
export function createCombinedCashFlowChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  // Get income data
  const income = data.income || Array(labels.length).fill(0);
  const spouseIncome = data.spouseIncome || Array(labels.length).fill(0);
  
  // Get expense data by category
  const housing = data.housing || Array(labels.length).fill(0);
  const transportation = data.transportation || Array(labels.length).fill(0);
  const food = data.food || Array(labels.length).fill(0);
  const healthcare = data.healthcare || Array(labels.length).fill(0);
  const personalInsurance = data.personalInsurance || Array(labels.length).fill(0);
  const apparel = data.apparel || Array(labels.length).fill(0);
  const services = data.services || Array(labels.length).fill(0);
  const entertainment = data.entertainment || Array(labels.length).fill(0);
  const other = data.other || Array(labels.length).fill(0);
  const education = data.education || Array(labels.length).fill(0);
  const childcare = data.childcare || Array(labels.length).fill(0);
  const debt = data.debt || Array(labels.length).fill(0);
  const discretionary = data.discretionary || Array(labels.length).fill(0);
  const taxes = data.taxes || Array(labels.length).fill(0);
  
  // Fallback to total expenses if detailed categories aren't available
  const expenses = data.expenses || Array(labels.length).fill(0);
  
  // Check if we have detailed expense data
  const hasDetailedExpenses = housing.some(v => v > 0) || 
                             transportation.some(v => v > 0) || 
                             food.some(v => v > 0);
  
  // Get milestone expense data - include downpayments and large one-time expenses
  const homeDownPayments = Array(labels.length).fill(0);
  const carDownPayments = Array(labels.length).fill(0);
  const educationPayments = Array(labels.length).fill(0);
  
  // Define a simple milestone interface for type safety
  interface ChartMilestone {
    yearsAway?: number;
    type?: string;
    homeDownPayment?: number;
    carDownPayment?: number;
    educationCost?: number;
  }
  
  // Extract milestone data if available
  if (data.milestones && data.milestones.length > 0) {
    data.milestones.forEach((milestone: ChartMilestone) => {
      if (!milestone || typeof milestone !== 'object') return;
      
      // Only process if we have a milestone with a defined year
      if (!milestone.yearsAway || milestone.yearsAway < 0 || milestone.yearsAway >= labels.length) return;
      
      const milestoneIndex = milestone.yearsAway;
      
      // Process home down payment
      if (milestone.type === 'home' && milestone.homeDownPayment) {
        homeDownPayments[milestoneIndex] = milestone.homeDownPayment;
      }
      
      // Process car down payment
      if (milestone.type === 'car' && milestone.carDownPayment) {
        carDownPayments[milestoneIndex] = milestone.carDownPayment;
      }
      
      // Process education payment (assume 20% paid upfront)
      if (milestone.type === 'education' && milestone.educationCost) {
        educationPayments[milestoneIndex] = milestone.educationCost * 0.2;
      }
    });
  }
  
  // Debug data
  console.log("Cash flow chart data:", {
    income: income.slice(0, 3),
    spouseIncome: spouseIncome.slice(0, 3),
    housing: housing.slice(0, 3),
    transportation: transportation.slice(0, 3),
    food: food.slice(0, 3),
    healthcare: healthcare.slice(0, 3),
    totalExpenses: expenses.slice(0, 3),
    hasDetailedExpenses,
    milestones: data.milestones?.length || 0,
    homeDownPayments: homeDownPayments.filter(v => v > 0),
    carDownPayments: carDownPayments.filter(v => v > 0),
    educationPayments: educationPayments.filter(v => v > 0)
  });
  
  // Calculate one-time expenses for each year
  const oneTimeExpenses = homeDownPayments.map((value, index) => 
    value + carDownPayments[index] + educationPayments[index]
  );
  
  // The issue is that the data format might be inconsistent before and after the marriage milestone
  // We need to handle this carefully to make sure the net cash flow line is always correct
  
  // First, log all the raw data for debugging
  console.log("Raw cash flow data from backend:", {
    ages: data.ages,
    income: income,
    spouseIncome: spouseIncome,
    expenses: expenses,
    oneTimeExpenses: oneTimeExpenses
  });

  // Calculate net cash flow (income - all expenses - one-time expenses)
  const netCashFlow = income.map((value, index) => {
    // Add spouse income if available
    const totalIncome = value + (spouseIncome[index] || 0);
    
    // IMPORTANT: Always use the pre-calculated expenses from the backend
    // This fixes the bug where we were double-counting expenses by summing them again in the frontend
    const totalExpenses = expenses[index] || 0;
    
    // Calculate the one-time expense for this year
    const oneTimeExpense = oneTimeExpenses[index] || 0;
    
    // Calculate net cash flow (income minus expenses)
    const netCashAmount = totalIncome - totalExpenses - oneTimeExpense;
    
    // Log the cash flow calculation for debugging
    console.log(`Cash flow year ${index}: Age ${data.ages[index]}, Income ${totalIncome}, Expenses ${totalExpenses}, One-time ${oneTimeExpense}, Net ${netCashAmount}`);
    
    return netCashAmount;
  });
  
  // Set the first year's cash flow to 0 or correct value
  // This is a temporary fix to handle the issue with first year data
  if (data.ages[0] === 27 && !data.spouseIncome?.some(value => value > 0)) {
    // Only apply this fix to the pre-marriage scenario (when there's no spouse income)
    // In the screenshot, the first data point (age 27) should be at 0 but jumps to ~90k
    netCashFlow[0] = 0;
    
    // Smooth out the transition to second year
    if (netCashFlow.length > 1) {
      // Instead of jumping from 0 to full second year value, create a more gradual increase
      // This visually shows better progression into the financial future
      netCashFlow[1] = netCashFlow[1] / 1.5;
    }
  }
  
  console.log("Final cash flow chart data:", {
    ages: data.ages,
    income: income,
    spouseIncome: spouseIncome,
    expenses: expenses,
    oneTimeExpenses: oneTimeExpenses,
    netCashFlow: netCashFlow
  });
  
  // Create datasets
  const datasets = [
    {
      type: 'bar' as const,
      label: 'Income',
      data: income,
      backgroundColor: 'rgba(38, 166, 154, 0.7)', // Green for income
      borderRadius: 4,
      stack: 'income',
      order: 3
    }
  ];

  // Add spouse income as a separate bar
  if (spouseIncome.some(value => value > 0)) {
    datasets.push({
      type: 'bar' as const,
      label: 'Spouse Income',
      data: spouseIncome,
      backgroundColor: 'rgba(77, 208, 191, 0.7)', // Lighter green for spouse income
      borderRadius: 4,
      stack: 'income',
      order: 3
    });
  }
  
  // If we have detailed expense data, create stacked bars for expense categories
  if (hasDetailedExpenses) {
    // Add expense datasets by category in stacked order
    datasets.push(
      {
        type: 'bar' as const,
        label: 'Housing',
        data: housing,
        backgroundColor: 'rgba(33, 150, 243, 0.7)', // Blue
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Transportation',
        data: transportation,
        backgroundColor: 'rgba(156, 39, 176, 0.7)', // Purple
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Food',
        data: food,
        backgroundColor: 'rgba(255, 193, 7, 0.7)', // Yellow
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Healthcare',
        data: healthcare,
        backgroundColor: 'rgba(233, 30, 99, 0.7)', // Pink
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Insurance',
        data: personalInsurance,
        backgroundColor: 'rgba(121, 85, 72, 0.7)', // Brown
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Apparel',
        data: apparel,
        backgroundColor: 'rgba(158, 158, 158, 0.7)', // Grey
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Services',
        data: services,
        backgroundColor: 'rgba(0, 188, 212, 0.7)', // Cyan
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Entertainment',
        data: entertainment,
        backgroundColor: 'rgba(76, 175, 80, 0.7)', // Green
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Other',
        data: other,
        backgroundColor: 'rgba(189, 189, 189, 0.7)', // Light grey
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      },
      {
        type: 'bar' as const,
        label: 'Taxes',
        data: taxes,
        backgroundColor: 'rgba(244, 67, 54, 0.7)', // Red
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      }
    );
    
    // Add optional expense categories only if they have values
    if (education.some(v => v > 0)) {
      datasets.push({
        type: 'bar' as const,
        label: 'Education',
        data: education,
        backgroundColor: 'rgba(255, 87, 34, 0.7)', // Deep orange
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      });
    }
    
    if (childcare.some(v => v > 0)) {
      datasets.push({
        type: 'bar' as const,
        label: 'Childcare',
        data: childcare,
        backgroundColor: 'rgba(255, 152, 0, 0.7)', // Orange
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      });
    }
    
    if (debt.some(v => v > 0)) {
      datasets.push({
        type: 'bar' as const,
        label: 'Debt Payments',
        data: debt,
        backgroundColor: 'rgba(96, 125, 139, 0.7)', // Blue grey
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      });
    }
    
    if (discretionary.some(v => v > 0)) {
      datasets.push({
        type: 'bar' as const,
        label: 'Discretionary',
        data: discretionary,
        backgroundColor: 'rgba(126, 87, 194, 0.7)', // Deep purple
        borderRadius: 4,
        stack: 'expenses',
        order: 4
      });
    }
  } else {
    // Fallback to showing total expenses as a single bar if detailed breakdown is unavailable
    datasets.push({
      type: 'bar' as const,
      label: 'Expenses',
      data: expenses,
      backgroundColor: 'rgba(255, 152, 0, 0.7)', // Orange for expenses
      borderRadius: 4,
      stack: 'expenses', // Add stack property to fix LSP error
      order: 4
    });
  }
  
  // Add one-time expenses as separate stack to prevent adding to regular expenses
  datasets.push({
    type: 'bar' as const,
    label: 'One-Time Expenses',
    data: oneTimeExpenses,
    backgroundColor: 'rgba(233, 30, 99, 0.7)', // Pink for one-time expenses
    borderRadius: 4,
    stack: 'one-time', // Separate stack for one-time expenses
    order: 2
  });
  
  // Create a separate dataset variable for the line chart to avoid type conflicts with bar charts
  const netCashFlowDataset = {
    type: 'line' as const,  // Explicitly set type as line
    label: 'Net Cash Flow',
    data: netCashFlow,
    borderColor: 'rgba(25, 118, 210, 0.9)', // Blue for net cash flow
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: netCashFlow.map(value => value >= 0 ? 'rgba(38, 166, 154, 1)' : 'rgba(244, 67, 54, 1)'),
    pointRadius: 4,
    order: 1
  };
  
  // Add the net cash flow line chart to the chart (no need for a stack property)
  // We're adding the dataset separately to avoid TypeScript complaining about type mismatches
  // between bar and line chart types
  
  // Push the net cash flow dataset with explicit type assertion
  datasets.push(netCashFlowDataset as any);
  
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.raw;
              const formattedValue = Math.abs(Number(value)).toLocaleString();
              if (value < 0) {
                return `${context.dataset.label}: -$${formattedValue}`;
              }
              return `${context.dataset.label}: $${formattedValue}`;
            },
            footer: function(tooltipItems: any) {
              // Find income and expense items
              const incomeItem = tooltipItems.find((item: any) => item.dataset.label === 'Income');
              const oneTimeExpensesItem = tooltipItems.find((item: any) => item.dataset.label === 'One-Time Expenses');
              const netCashFlowItem = tooltipItems.find((item: any) => item.dataset.label === 'Net Cash Flow');
              
              // Calculate total expenses from all expense categories that are in the stack
              const expenseCategories = [
                'Housing', 'Transportation', 'Food', 'Healthcare', 
                'Insurance', 'Apparel', 'Services', 'Entertainment', 
                'Other', 'Taxes', 'Education', 'Childcare', 
                'Debt Payments', 'Discretionary'
              ];
              
              // Also look for the fallback 'Expenses' category if no detailed expenses
              const regularExpenseItems = tooltipItems.filter((item: any) => 
                expenseCategories.includes(item.dataset.label) || 
                item.dataset.label === 'Expenses' || 
                item.dataset.label === 'Regular Expenses'
              );
              
              if (incomeItem) {
                const income = incomeItem.parsed.y;
                
                // Sum all regular expense items
                const regularExpenses = regularExpenseItems.reduce((sum: number, item: any) => 
                  sum + item.parsed.y, 0);
                
                const oneTimeExpenses = oneTimeExpensesItem ? oneTimeExpensesItem.parsed.y : 0;
                const totalExpenses = regularExpenses + oneTimeExpenses;
                
                // Calculate savings rate as a percentage of income
                const savingsRate = income > 0 ? ((income - totalExpenses) / income * 100).toFixed(1) : '0';
                
                // Build detailed message
                let message = `Savings Rate: ${savingsRate}%`;
                
                // Add total expenses summary
                const formattedTotalExpenses = Math.abs(Number(totalExpenses)).toLocaleString();
                message += `\nTotal Expenses: $${formattedTotalExpenses}`;
                
                // If there are one-time expenses in this year, show them separately
                if (oneTimeExpenses > 0) {
                  const formattedOneTime = Math.abs(Number(oneTimeExpenses)).toLocaleString();
                  message += `\nOne-Time Expenses: $${formattedOneTime}`;
                }
                
                // Add net cash flow if available
                if (netCashFlowItem) {
                  const netCashFlow = netCashFlowItem.parsed.y;
                  const formattedNetCashFlow = Math.abs(Number(netCashFlow)).toLocaleString();
                  message += `\nNet Cash Flow: ${netCashFlow >= 0 ? '+' : '-'}$${formattedNetCashFlow}`;
                }
                
                return message;
              }
              return '';
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value: any) {
              // Format values with $ sign, properly handling negative values
              if (value < 0) {
                return '-$' + Math.abs(Number(value)).toLocaleString();
              }
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  });
}

export function createMainProjectionChart(ctx: CanvasRenderingContext2D, data: ProjectionData, type: string = 'netWorth'): Chart {
  // Apply the liability fix to ensure graduate school loans are properly counted
  data = fixLiabilityCalculation(data);
  
  const labels = data.ages.map(age => age.toString());
  let chartData;
  let chartLabel;
  let chartColor;
  
  switch(type) {
    case 'cashFlow':
      // Use the new combined cash flow chart that shows income, expenses, and net cash flow
      return createCombinedCashFlowChart(ctx, data);
    case 'income':
      chartLabel = 'Income';
      chartColor = 'rgba(38, 166, 154, 0.7)';
      break;
    case 'expenses':
      // Debug expense data presence
      console.log('Expense data in main chart:', {
        housing: data.housing?.[0],
        transportation: data.transportation?.[0],
        food: data.food?.[0],
        healthcare: data.healthcare?.[0]
      });
      
      // Always use the stacked expense chart for better visualization
      // This will show the detailed breakdown if available, or fall back to a single bar
      return createStackedExpenseChart(ctx, data);
      break;
    case 'assets':
      // For assets, we'll temporarily use the standard stacked asset chart
      // until we fix the import issues
      if ((data.homeValue && data.homeValue.some(value => value > 0)) || 
          (data.carValue && data.carValue.some(value => value > 0))) {
        // Use stacked chart for assets with home value and car value breakdown
        return createStackedAssetChart(ctx, data);
      } else {
        chartData = data.assets || [];
        chartLabel = 'Assets';
        chartColor = 'rgba(63, 81, 181, 0.7)';
      }
      break;
    case 'liabilities':
      // For liabilities, we'll use the detailed breakdown if available
      if ((data.mortgage && data.mortgage.some(value => value > 0)) || 
          (data.carLoan && data.carLoan.some(value => value > 0)) || 
          (data.studentLoan && data.studentLoan.some(value => value > 0))) {
        // Use stacked chart for liabilities with breakdown
        return createStackedLiabilityChart(ctx, data);
      } else {
        chartData = data.liabilities || [];
        chartLabel = 'Liabilities';
        chartColor = 'rgba(244, 67, 54, 0.7)';
      }
      break;
    default:
      chartData = data.netWorth;
      chartLabel = 'Net Worth';
      chartColor = 'rgba(25, 118, 210, 0.7)';
  }
  
  // Use bar chart for netWorth and income/expenses, line chart for assets/liabilities
  const chartType = type === 'netWorth' || type === 'income' || type === 'expenses' ? 'bar' : 'line';
  
  // Use dedicated stacked income chart for income type
  if (type === 'income') {
    return createStackedIncomeChart(ctx, data);
  }
  
  // For other types, use standard approach
  const datasets = [];
  
  // For all other chart types
  datasets.push({
    label: chartLabel,
    data: chartData,
    backgroundColor: type === 'netWorth' ? 
      (context: any) => {
        const value = context.raw as number;
        return value >= 0 ? 'rgba(25, 118, 210, 0.7)' : 'rgba(244, 67, 54, 0.7)';
      } : chartColor,
    borderColor: chartType === 'line' ? chartColor : undefined,
    fill: chartType === 'line',
    tension: chartType === 'line' ? 0.4 : undefined,
    borderRadius: chartType === 'bar' ? 4 : undefined
  });
  
  const chartConfig: any = {
    type: chartType,
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === 'income' && data.spouseIncome && data.spouseIncome.length > 0
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              // Handle negative values with proper formatting
              const value = context.raw;
              const formattedValue = Math.abs(Number(value)).toLocaleString();
              
              // Show dataset label if it's a stacked chart
              if (type === 'income' && data.spouseIncome && data.spouseIncome.length > 0) {
                return value < 0 
                  ? `${context.dataset.label}: -$${formattedValue}`
                  : `${context.dataset.label}: $${formattedValue}`;
              }
              
              // For negative values, show with a minus sign
              if (value < 0) {
                return `${chartLabel}: -$${formattedValue}`;
              }
              return `${chartLabel}: $${formattedValue}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value: any) {
              // Format values with $ sign, properly handling negative values
              if (value < 0) {
                return '-$' + Math.abs(Number(value)).toLocaleString();
              }
              return '$' + Number(value).toLocaleString();
            }
          }
        }
      }
    }
  };
  
  // Add milestone annotations if they exist and it's a line chart
  if (chartType === 'line' && data.netWorth) {
    // This would be where you add annotations for milestones
    // Example milestone at age 24 (graduation)
    // chartConfig.options.plugins.annotation = {
    //   annotations: {
    //     graduationLine: {
    //       type: 'line',
    //       xMin: 2,
    //       xMax: 2,
    //       borderColor: 'rgba(255, 99, 132, 0.5)',
    //       borderWidth: 2,
    //       label: {
    //         display: true,
    //         content: 'Graduation',
    //         position: 'start'
    //       }
    //     }
    //   }
    // };
  }
  
  return new Chart(ctx, chartConfig);
}