import Chart from 'chart.js/auto';
import { NetWorthData, CashFlowData, ProjectionData } from './types';

// Function to create a net worth chart
export function createNetWorthChart(ctx: CanvasRenderingContext2D, data: NetWorthData[]): Chart {
  const labels = data.map(item => item.age.toString());
  const values = data.map(item => item.netWorth);
  
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Net Worth',
        data: values,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        fill: true,
        tension: 0.4
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
            label: function(context) {
              return `Net Worth: $${context.raw.toLocaleString()}`;
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
            label: function(context) {
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

// Function to create the main projection chart with different types of data
export function createMainProjectionChart(ctx: CanvasRenderingContext2D, data: ProjectionData, type: string = 'netWorth'): Chart {
  const labels = data.ages.map(age => age.toString());
  let chartData;
  let chartLabel;
  let chartColor;
  
  switch(type) {
    case 'income':
      chartData = data.income || [];
      chartLabel = 'Income';
      chartColor = 'rgba(38, 166, 154, 0.7)';
      break;
    case 'expenses':
      chartData = data.expenses || [];
      chartLabel = 'Expenses';
      chartColor = 'rgba(255, 152, 0, 0.7)';
      break;
    case 'assets':
      chartData = data.assets || [];
      chartLabel = 'Assets';
      chartColor = 'rgba(63, 81, 181, 0.7)';
      break;
    case 'liabilities':
      chartData = data.liabilities || [];
      chartLabel = 'Liabilities';
      chartColor = 'rgba(244, 67, 54, 0.7)';
      break;
    default:
      chartData = data.netWorth;
      chartLabel = 'Net Worth';
      chartColor = 'rgba(25, 118, 210, 0.7)';
  }
  
  const chartType = type === 'income' || type === 'expenses' ? 'bar' : 'line';
  
  const chartConfig: any = {
    type: chartType,
    data: {
      labels,
      datasets: [{
        label: chartLabel,
        data: chartData,
        backgroundColor: chartColor,
        borderColor: chartType === 'line' ? chartColor : undefined,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined,
        borderRadius: chartType === 'bar' ? 4 : undefined
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
