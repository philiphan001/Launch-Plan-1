import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Chart from 'chart.js/auto';

interface AssetBreakdownProps {
  assetData: {
    savings: number;
    retirement: number;
    homeValue: number;
    carValue: number;
    otherAssets?: number;
  };
  projectionYear?: number;
}

const AssetBreakdownChart: React.FC<AssetBreakdownProps> = ({ 
  assetData,
  projectionYear = 0
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Make sure all asset values are positive numbers
        const sanitizedAssets = {
          savings: Math.max(0, Number(assetData.savings) || 0),
          retirement: Math.max(0, Number(assetData.retirement) || 0),
          homeValue: Math.max(0, Number(assetData.homeValue) || 0),
          carValue: Math.max(0, Number(assetData.carValue) || 0),
          otherAssets: Math.max(0, Number(assetData.otherAssets) || 0),
        };
        
        // Create data for chart
        const labels = [];
        const data = [];
        const backgroundColors = [];
        
        if (sanitizedAssets.savings > 0) {
          labels.push('Savings');
          data.push(sanitizedAssets.savings);
          backgroundColors.push('#4F46E5'); // Indigo
        }
        
        if (sanitizedAssets.retirement > 0) {
          labels.push('Retirement');
          data.push(sanitizedAssets.retirement);
          backgroundColors.push('#059669'); // Emerald
        }
        
        if (sanitizedAssets.homeValue > 0) {
          labels.push('Home Value');
          data.push(sanitizedAssets.homeValue);
          backgroundColors.push('#D97706'); // Amber
        }
        
        if (sanitizedAssets.carValue > 0) {
          labels.push('Car Value');
          data.push(sanitizedAssets.carValue);
          backgroundColors.push('#DC2626'); // Red
        }
        
        if (sanitizedAssets.otherAssets > 0) {
          labels.push('Other Assets');
          data.push(sanitizedAssets.otherAssets);
          backgroundColors.push('#6B7280'); // Gray
        }
        
        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderColor: '#ffffff',
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
                  boxWidth: 12,
                  padding: 15,
                  font: {
                    size: 11
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const value = context.raw as number;
                    return `$${value.toLocaleString()}`;
                  }
                }
              }
            },
          }
        });
        
        // Log the data for debugging
        console.log("Creating asset breakdown chart with data:", sanitizedAssets);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [assetData]);

  // Calculate total assets with proper error handling
  const totalAssets = Object.values(assetData)
    .filter(value => !isNaN(Number(value)))
    .reduce((sum, value) => sum + (Number(value) || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {projectionYear === 0 
            ? "Current Asset Breakdown" 
            : `Year ${projectionYear} Asset Breakdown`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="h-60">
            <canvas ref={chartRef} />
          </div>
          <div className="mt-4 text-sm text-center">
            <div className="font-semibold">Total Assets: ${totalAssets.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetBreakdownChart;