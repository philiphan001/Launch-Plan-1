import Chart from 'chart.js/auto';
import { NetWorthData, CashFlowData, ProjectionData } from './types';

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
}): Chart {
  const { 
    housing, transportation, food, healthcare, 
    education, debt, childcare, discretionary,
    personalInsurance = 0, entertainment = 0, apparel = 0, services = 0, other = 0
  } = data;
  
  const total = housing + transportation + food + healthcare + 
                education + debt + childcare + discretionary + 
                personalInsurance + entertainment + apparel + services + other;
  
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
  ];
  
  const chartData = [
    housing, transportation, food, healthcare, 
    education, debt, childcare, discretionary,
    personalInsurance, entertainment, apparel, services, other
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
  
  // Log the raw savings data for debugging
  console.log("Raw savings values from Python:", savingsRaw);
  
  // We'll use a different approach for savings visualization
  // Instead of stacking, which doesn't handle negative values well,
  // we'll use a regular bar chart approach for the savings values
  const datasets = [];
  
  // Create a single dataset for savings that shows positive and negative values directly
  datasets.push({
    label: 'Savings & Investments',
    data: savingsRaw,
    backgroundColor: (context: any) => {
      const value = context.raw as number;
      return value >= 0 ? 'rgba(63, 81, 181, 0.7)' : 'rgba(244, 67, 54, 0.7)';
    },
    borderRadius: 4,
    // Not using stack for savings so we can see the negative values clearly
  });
  
  // Debug output
  console.log("Asset Breakdown Chart Data:");
  for (let i = 0; i < data.ages.length; i++) {
    console.log(`Year ${i} (Age ${data.ages[i]}): Savings Raw=${savingsRaw[i]}, Home=${data.homeValue?.[i] || 0}, Total Assets=${data.assets?.[i] || 0}`);
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
    { key: 'other', label: 'Other', color: 'rgba(158, 158, 158, 0.7)' }            // Grey
  ];
  
  // Add datasets for each expense category if data exists
  expenseCategories.forEach(category => {
    // Check if this category exists in our data and has non-zero values
    const categoryData = data[category.key];
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
  const labels = data.ages.map(age => age.toString());
  
  // Calculate other debts (total liabilities minus mortgage, car loan, and student loans)
  const otherDebts = data.liabilities?.map((liabilityValue, index) => {
    const mortgageValue = data.mortgage && data.mortgage[index] ? data.mortgage[index] : 0;
    const studentLoanValue = data.studentLoan && data.studentLoan[index] ? data.studentLoan[index] : 0;
    const carLoanValue = data.carLoan && data.carLoan[index] ? data.carLoan[index] : 0;
    return liabilityValue - mortgageValue - studentLoanValue - carLoanValue;
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
  if (data.studentLoan && data.studentLoan.some(value => value > 0)) {
    datasets.push({
      label: 'Student Loans',
      data: data.studentLoan,
      backgroundColor: 'rgba(255, 152, 0, 0.7)', // Orange for student loans
      borderRadius: 4,
      stack: 'liabilities'
    });
  }
  
  // Add car loan dataset if it exists and has positive values
  if (data.carLoan && data.carLoan.some(value => value > 0)) {
    datasets.push({
      label: 'Car Loan',
      data: data.carLoan,
      backgroundColor: 'rgba(156, 39, 176, 0.7)', // Purple for car loan
      borderRadius: 4,
      stack: 'liabilities'
    });
  }

  // Add mortgage dataset if it exists and has positive values
  if (data.mortgage && data.mortgage.some(value => value > 0)) {
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
  
  // Get expense data
  const expenses = data.expenses || Array(labels.length).fill(0);
  
  // Debug expense data
  console.log("Cash flow chart data:", {
    income: income.slice(0, 3),
    spouseIncome: spouseIncome.slice(0, 3),
    expenses: expenses.slice(0, 3),
    housing: data.housing?.slice(0, 3),
    food: data.food?.slice(0, 3),
    transportation: data.transportation?.slice(0, 3)
  });
  
  // Calculate net cash flow (income - expenses)
  const netCashFlow = income.map((value, index) => {
    // Add spouse income if available
    const totalIncome = value + (spouseIncome[index] || 0);
    // Subtract expenses
    return totalIncome - (expenses[index] || 0);
  });
  
  // Create datasets
  const datasets = [
    {
      type: 'bar' as const,
      label: 'Income',
      data: income.map((value, index) => value + (spouseIncome[index] || 0)),
      backgroundColor: 'rgba(38, 166, 154, 0.7)', // Green for income
      borderRadius: 4,
      order: 2
    },
    {
      type: 'bar' as const,
      label: 'Expenses',
      data: expenses,
      backgroundColor: 'rgba(255, 152, 0, 0.7)', // Orange for expenses
      borderRadius: 4,
      order: 3
    },
    {
      type: 'line' as const,
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
    }
  ];
  
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
              // Only calculate savings rate for years with positive net cash flow
              const incomeItem = tooltipItems.find((item: any) => item.dataset.label === 'Income');
              const expensesItem = tooltipItems.find((item: any) => item.dataset.label === 'Expenses');
              const netCashFlowItem = tooltipItems.find((item: any) => item.dataset.label === 'Net Cash Flow');
              
              if (incomeItem && expensesItem && netCashFlowItem) {
                const income = incomeItem.parsed.y;
                const expenses = expensesItem.parsed.y;
                const netCashFlow = netCashFlowItem.parsed.y;
                
                // Calculate savings rate as a percentage of income
                const savingsRate = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : '0';
                
                return `Savings Rate: ${savingsRate}%`;
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