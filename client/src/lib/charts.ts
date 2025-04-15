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
  // Calculate total expenses
  const total = Object.values(expenses).reduce((sum, value) => sum + value, 0);
  
  // Prepare data
  const data = Object.values(expenses);
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
  const datasets = [
    {
      label: 'Net Worth',
      data: data.netWorth,
      borderColor: darkMode ? 'rgba(96, 165, 250, 1)' : 'rgba(37, 99, 235, 1)',
      backgroundColor: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(37, 99, 235, 0.1)',
      tension: 0.3,
      fill: true,
      yAxisID: 'y',
      order: 1,
    }
  ];

  if (showIncome && data.income) {
    datasets.push({
      label: 'Income',
      data: data.income,
      borderColor: darkMode ? 'rgba(74, 222, 128, 1)' : 'rgba(22, 163, 74, 1)',
      backgroundColor: darkMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(22, 163, 74, 0.1)',
      tension: 0.3,
      fill: false,
      yAxisID: 'y1',
      borderDash: [5, 5],
      order: 2,
    });
  }

  if (showExpenses && data.expenses) {
    datasets.push({
      label: 'Expenses',
      data: data.expenses,
      borderColor: darkMode ? 'rgba(248, 113, 113, 1)' : 'rgba(220, 38, 38, 1)',
      backgroundColor: darkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(220, 38, 38, 0.1)',
      tension: 0.3,
      fill: false,
      yAxisID: 'y1',
      borderDash: [5, 5],
      order: 3,
    });
  }

  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.ages.map(age => `Age ${age}`),
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
          beginAtZero: data.netWorth.some(value => value < 0) ? false : true,
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
export function fixLiabilityCalculation(liabilities: number[]): number[] {
  // Convert negative liabilities to positive for better display in charts
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
  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Income',
          data: data.income,
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
        {
          label: 'Expenses',
          data: data.expenses,
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
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [
        {
          label: 'Net Worth',
          data: data.values,
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
          beginAtZero: data.values.some(value => value < 0) ? false : true,
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
  labels: number[], 
  dataPoints: number[],
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

  // Select the color scheme based on the lineColor parameter
  const colorScheme = colors[lineColor as keyof typeof colors] || colors.blue;

  // Create a new chart
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels.map(age => `Age ${age}`),
      datasets: [
        {
          label: datasetLabel,
          data: dataPoints,
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
          beginAtZero: dataPoints.some(point => point < 0) ? false : true,
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