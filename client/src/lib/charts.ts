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
}): Chart {
  const { housing, transportation, food, healthcare, education, debt, childcare, discretionary } = data;
  const total = housing + transportation + food + healthcare + education + debt + childcare + discretionary;
  
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
  ];
  
  const chartData = [housing, transportation, food, healthcare, education, debt, childcare, discretionary];
  
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
function createStackedAssetChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  // Calculate savings (total assets minus home value and car value)
  const savings = data.assets?.map((assetValue, index) => {
    const homeValue = data.homeValue && data.homeValue[index] ? data.homeValue[index] : 0;
    const carValue = data.carValue && data.carValue[index] ? data.carValue[index] : 0;
    return assetValue - homeValue - carValue;
  }) || [];

  const datasets = [
    {
      label: 'Savings & Investments',
      data: savings,
      backgroundColor: 'rgba(63, 81, 181, 0.7)',
      borderRadius: 4,
      stack: 'assets'
    }
  ];

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
              return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
            },
            footer: function(tooltipItems: any) {
              let total = 0;
              tooltipItems.forEach(function(tooltipItem: any) {
                total += tooltipItem.parsed.y;
              });
              return `Total Assets: $${total.toLocaleString()}`;
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
function createStackedExpenseChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  const datasets = [];
  
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
  ];
  
  // Add datasets for each expense category if data exists
  expenseCategories.forEach(category => {
    if (data[category.key] && data[category.key].some(value => value > 0)) {
      datasets.push({
        label: category.label,
        data: data[category.key],
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
function createStackedLiabilityChart(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
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

export function createMainProjectionChart(ctx: CanvasRenderingContext2D, data: ProjectionData, type: string = 'netWorth'): Chart {
  const labels = data.ages.map(age => age.toString());
  let chartData;
  let chartLabel;
  let chartColor;
  
  switch(type) {
    case 'income':
      chartLabel = 'Income';
      chartColor = 'rgba(38, 166, 154, 0.7)';
      break;
    case 'expenses':
      // For expenses, we'll use the detailed breakdown if available
      if (
        (data.housing && data.housing.some(value => value > 0)) ||
        (data.transportation && data.transportation.some(value => value > 0)) ||
        (data.food && data.food.some(value => value > 0)) ||
        (data.healthcare && data.healthcare.some(value => value > 0)) ||
        (data.education && data.education.some(value => value > 0)) ||
        (data.childcare && data.childcare.some(value => value > 0))
      ) {
        // Use stacked chart for expenses with breakdown
        return createStackedExpenseChart(ctx, data);
      } else {
        chartData = data.expenses || [];
        chartLabel = 'Expenses';
        chartColor = 'rgba(255, 152, 0, 0.7)';
      }
      break;
    case 'assets':
      // For assets, we'll use the detailed breakdown if available
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
  
  // Handle stacked income chart (personal + spouse income)
  const datasets = [];
  
  if (type === 'income' && data.spouseIncome && data.spouseIncome.length > 0) {
    // Create datasets for personal and spouse income
    datasets.push({
      label: 'Personal Income',
      data: data.income || [],
      backgroundColor: chartColor,
      borderRadius: 4,
      stack: 'income'
    });
    
    datasets.push({
      label: 'Spouse Income',
      data: data.spouseIncome,
      backgroundColor: 'rgba(156, 39, 176, 0.7)', // Purple color for spouse income
      borderRadius: 4,
      stack: 'income'
    });
  } else {
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
  }
  
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
              // Show dataset label if it's a stacked chart
              if (type === 'income' && data.spouseIncome && data.spouseIncome.length > 0) {
                return `${context.dataset.label}: $${Number(context.raw).toLocaleString()}`;
              }
              return `${chartLabel}: $${Number(context.raw).toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function(value: any) {
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