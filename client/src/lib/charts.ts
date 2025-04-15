import Chart from 'chart.js/auto';
import { formatCurrency, formatPercentage } from '../lib/formatters';

/**
 * Creates an expense breakdown chart (doughnut chart)
 */
export function createExpenseBreakdownChart(
  canvas: HTMLCanvasElement,
  expenses: {
    housing: number;
    transportation: number;
    food: number;
    healthcare: number;
    insurance: number;
    debt: number;
    personal: number;
    entertainment: number;
    other: number;
  },
  darkMode: boolean = false
): Chart {
  // Ensure all expense values are valid numbers
  const safeExpenses = {
    housing: typeof expenses.housing === 'number' ? expenses.housing : 0,
    transportation: typeof expenses.transportation === 'number' ? expenses.transportation : 0,
    food: typeof expenses.food === 'number' ? expenses.food : 0,
    healthcare: typeof expenses.healthcare === 'number' ? expenses.healthcare : 0,
    insurance: typeof expenses.insurance === 'number' ? expenses.insurance : 0,
    debt: typeof expenses.debt === 'number' ? expenses.debt : 0,
    personal: typeof expenses.personal === 'number' ? expenses.personal : 0,
    entertainment: typeof expenses.entertainment === 'number' ? expenses.entertainment : 0,
    other: typeof expenses.other === 'number' ? expenses.other : 0
  };
  
  // Calculate total expenses with safe values
  const total = Object.values(safeExpenses).reduce((sum, value) => sum + value, 0);
  
  // Prepare data
  const data = Object.values(safeExpenses);
  const labels = [
    'Housing', 
    'Transportation', 
    'Food', 
    'Healthcare', 
    'Insurance', 
    'Debt Payments', 
    'Personal', 
    'Entertainment', 
    'Other'
  ];
  
  // Color scheme
  const backgroundColors = [
    'rgba(59, 130, 246, 0.8)',   // Blue (Housing)
    'rgba(16, 185, 129, 0.8)',   // Green (Transportation)
    'rgba(249, 115, 22, 0.8)',   // Orange (Food)
    'rgba(236, 72, 153, 0.8)',   // Pink (Healthcare)
    'rgba(139, 92, 246, 0.8)',   // Purple (Insurance)
    'rgba(239, 68, 68, 0.8)',    // Red (Debt)
    'rgba(14, 165, 233, 0.8)',   // Sky (Personal)
    'rgba(234, 179, 8, 0.8)',    // Yellow (Entertainment)
    'rgba(107, 114, 128, 0.8)'   // Gray (Other)
  ];
  
  // Create chart
  return new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
        borderColor: darkMode ? 'rgba(30, 41, 59, 1)' : 'white',
        borderWidth: 1,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw as number;
              const percentage = (value / total * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            }
          }
        },
        legend: {
          position: 'right',
          labels: {
            color: darkMode ? '#e2e8f0' : '#334155',
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        }
      }
    }
  });
}

/**
 * Creates the main financial projection chart
 */
export function createMainProjectionChart(
  canvas: HTMLCanvasElement, 
  data: {
    ages: number[];
    netWorth: number[];
    income?: number[];
    expenses?: number[];
    assets?: number[];
    liabilities?: number[];
    cashFlow?: number[];
  },
  showIncome: boolean = false,
  showExpenses: boolean = false,
  darkMode: boolean = false
): Chart {
  // Ensure all data arrays are valid
  const safeAges = Array.isArray(data.ages) ? data.ages : [];
  const safeNetWorth = Array.isArray(data.netWorth) ? data.netWorth : [];
  const safeIncome = Array.isArray(data.income) ? data.income : [];
  const safeExpenses = Array.isArray(data.expenses) ? data.expenses : [];
  
  const datasets = [
    {
      label: 'Net Worth',
      data: safeNetWorth,
      borderColor: darkMode ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
      backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
      tension: 0.3,
      fill: true,
      yAxisID: 'y',
      order: 1,
    }
  ];

  if (showIncome && safeIncome.length > 0) {
    datasets.push({
      label: 'Income',
      data: safeIncome,
      borderColor: darkMode ? 'rgba(74, 222, 128, 1)' : 'rgba(22, 163, 74, 1)',
      backgroundColor: darkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.1)',
      tension: 0.3,
      fill: false,
      yAxisID: 'y1',
      order: 2,
      // @ts-ignore - borderDash is a valid property in Chart.js but TypeScript doesn't know about it
      borderDash: [5, 5],
    });
  }

  if (showExpenses && safeExpenses.length > 0) {
    datasets.push({
      label: 'Expenses',
      data: safeExpenses,
      borderColor: darkMode ? 'rgba(248, 113, 113, 1)' : 'rgba(220, 38, 38, 1)',
      backgroundColor: darkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(220, 38, 38, 0.1)',
      tension: 0.3,
      fill: false,
      yAxisID: 'y1',
      order: 3,
      // @ts-ignore - borderDash is a valid property in Chart.js but TypeScript doesn't know about it
      borderDash: [5, 5],
    });
  }

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: safeAges.map(age => `Age ${age}`),
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          beginAtZero: safeNetWorth.length > 0 ?
            safeNetWorth.some(value => value < 0) ? false : true :
            true,
          title: {
            display: true,
            text: 'Net Worth',
            color: darkMode ? '#e2e8f0' : '#334155',
          },
          ticks: {
            callback: function(value) {
              return formatCurrency(value as number);
            },
            color: darkMode ? '#e2e8f0' : '#334155',
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        y1: {
          type: 'linear',
          display: showIncome || showExpenses,
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Income / Expenses',
            color: darkMode ? '#e2e8f0' : '#334155',
          },
          ticks: {
            callback: function(value) {
              return formatCurrency(value as number);
            },
            color: darkMode ? '#e2e8f0' : '#334155',
          },
          grid: {
            drawOnChartArea: false,
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          ticks: {
            color: darkMode ? '#e2e8f0' : '#334155',
          },
          grid: {
            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: darkMode ? '#e2e8f0' : '#334155',
          },
        },
      },
    },
  });
}

/**
 * Helper function to fix liability calculation in charts
 */
export function fixLiabilityCalculation(liabilities: number[] | undefined | null): number[] {
  // Convert negative liabilities to positive for better display in charts
  if (!Array.isArray(liabilities) || liabilities.length === 0) {
    return [];
  }
  return liabilities.map(value => Math.abs(value));
}

/**
 * Creates a cash flow chart with income and expenses
 */
export function createCashFlowChart(
  canvas: HTMLCanvasElement,
  data: {
    labels: string[];
    income: number[];
    expenses: number[];
  }
): Chart {
  // Ensure income and expenses are valid arrays
  const safeIncome = Array.isArray(data.income) ? data.income : [];
  const safeExpenses = Array.isArray(data.expenses) ? data.expenses : [];
  const safeLabels = Array.isArray(data.labels) ? data.labels : [];
  
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: safeLabels,
      datasets: [
        {
          label: 'Income',
          data: safeIncome,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: safeExpenses,
          backgroundColor: 'rgba(239, 68, 68, 0.7)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value as number);
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
    },
  });
}

/**
 * Creates a net worth chart for the dashboard
 */
export function createNetWorthChart(
  canvas: HTMLCanvasElement,
  data: {
    labels: string[];
    values: number[];
  }
): Chart {
  // Ensure data arrays are valid
  const safeLabels = Array.isArray(data.labels) ? data.labels : [];
  const safeValues = Array.isArray(data.values) ? data.values : [];
  
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: safeLabels,
      datasets: [
        {
          label: 'Net Worth',
          data: safeValues,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: safeValues.length > 0 ? 
            safeValues.some(value => value < 0) ? false : true : 
            true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value as number);
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Net Worth: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
      },
    },
  });
}

/**
 * Creates a line chart for financial data
 */
export function createLineChart(
  canvas: HTMLCanvasElement, 
  labels: number[] | undefined | null, 
  dataPoints: number[] | undefined | null,
  lineColor: string = 'blue',
  datasetLabel: string = 'Value'
): Chart {
  // Define color gradients for different chart types
  const colors = {
    blue: {
      line: 'rgba(59, 130, 246, 1)',
      fill: 'rgba(59, 130, 246, 0.1)',
    },
    green: {
      line: 'rgba(16, 185, 129, 1)',
      fill: 'rgba(16, 185, 129, 0.1)',
    },
    red: {
      line: 'rgba(239, 68, 68, 1)',
      fill: 'rgba(239, 68, 68, 0.05)',
    },
    purple: {
      line: 'rgba(139, 92, 246, 1)',
      fill: 'rgba(139, 92, 246, 0.1)',
    },
    orange: {
      line: 'rgba(249, 115, 22, 1)',
      fill: 'rgba(249, 115, 22, 0.1)',
    },
  };

  // Ensure data arrays are valid
  const safeLabels = Array.isArray(labels) ? labels : [];
  const safeDataPoints = Array.isArray(dataPoints) ? dataPoints : [];

  // Select the color scheme based on the lineColor parameter
  const colorScheme = colors[lineColor as keyof typeof colors] || colors.blue;

  // Create a new chart
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: safeLabels.map(age => `Age ${age}`),
      datasets: [
        {
          label: datasetLabel,
          data: safeDataPoints,
          borderColor: colorScheme.line,
          backgroundColor: colorScheme.fill,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: colorScheme.line,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: safeDataPoints.length > 0 ?
            safeDataPoints.some(point => point < 0) ? false : true :
            true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value as number);
            },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            },
          },
        },
        legend: {
          display: true,
          position: 'top',
        },
      },
    },
  });
}