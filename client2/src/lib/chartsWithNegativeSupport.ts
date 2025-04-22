import Chart from 'chart.js/auto';
import { ProjectionData } from './types';

// Function to create a stacked asset chart showing different asset categories with proper negative value support
export function createStackedAssetChartWithNegativeSupport(ctx: CanvasRenderingContext2D, data: ProjectionData): Chart {
  const labels = data.ages.map(age => age.toString());
  
  // Use savingsValue directly from the Python backend
  // If not available, fall back to zero - we should never calculate this in the frontend
  const savingsRaw = data.savingsValue || Array(data.ages.length).fill(0);
  
  console.log("Raw savings values from Python:", savingsRaw);
  
  // We'll use two separate datasets to represent savings:
  // 1. One for displaying positive values (always >= 0)
  // 2. One for displaying negative values (shown below the x-axis)
  const datasets = [];

  // Add savings dataset - this will show the entire value (positive or negative)
  // We'll handle the stacking differently than before
  datasets.push({
    label: 'Savings & Investments',
    data: savingsRaw,
    backgroundColor: (context: any) => {
      const value = context.raw as number;
      return value >= 0 ? 'rgba(63, 81, 181, 0.7)' : 'rgba(244, 67, 54, 0.7)';
    },
    borderRadius: 4,
    // We don't use stacking for this chart since we want to show negative values directly
  });
  
  // Add home value dataset if it exists and has positive values
  if (data.homeValue && data.homeValue.some(value => value > 0)) {
    datasets.push({
      label: 'Home Value',
      data: data.homeValue,
      backgroundColor: 'rgba(0, 150, 136, 0.7)', // Teal color for home value
      borderRadius: 4
    });
  }
  
  // Add car value dataset if it exists and has positive values
  if (data.carValue && data.carValue.some(value => value > 0)) {
    datasets.push({
      label: 'Car Value',
      data: data.carValue,
      backgroundColor: 'rgba(103, 58, 183, 0.7)', // Purple color for car value
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
          display: true
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.raw as number;
              const formattedValue = value < 0 
                ? `-$${Math.abs(value).toLocaleString()}`
                : `$${value.toLocaleString()}`;
              return `${context.dataset.label}: ${formattedValue}`;
            },
            footer: function(tooltipItems: any) {
              let totalAssets = 0;
              
              tooltipItems.forEach(function(tooltipItem: any) {
                totalAssets += tooltipItem.parsed.y;
              });
              
              return `Total Assets: $${totalAssets.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false // We're not stacking in this version
        },
        y: {
          beginAtZero: false, // Allow values to go below zero
          suggestedMin: Math.min(...savingsRaw) - 10000, // Ensure y-axis has room for negative values
          ticks: {
            callback: function(value: any) {
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