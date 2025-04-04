import React, { useEffect, useRef } from 'react';
import { createExpenseBreakdownChart } from '@/lib/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpenseBreakdownProps {
  currentExpenses: {
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
  };
  projectionYear?: number;
}

const ExpenseBreakdownChart: React.FC<ExpenseBreakdownProps> = ({ 
  currentExpenses,
  projectionYear = 0
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Log the raw incoming expense data for debugging
        console.log(`Expense Breakdown Chart - Raw incoming data for year ${projectionYear}:`, {
          housing: currentExpenses.housing,
          transportation: currentExpenses.transportation,
          food: currentExpenses.food,
          healthcare: currentExpenses.healthcare,
          education: currentExpenses.education,
          debt: currentExpenses.debt,
          childcare: currentExpenses.childcare,
          discretionary: currentExpenses.discretionary,
          personalInsurance: currentExpenses.personalInsurance,
          entertainment: currentExpenses.entertainment,
          apparel: currentExpenses.apparel,
          services: currentExpenses.services,
          other: currentExpenses.other
        });
        
        // Make sure all expense values are positive numbers
        const sanitizedExpenses = {
          housing: Math.max(0, Number(currentExpenses.housing) || 0),
          transportation: Math.max(0, Number(currentExpenses.transportation) || 0),
          food: Math.max(0, Number(currentExpenses.food) || 0),
          healthcare: Math.max(0, Number(currentExpenses.healthcare) || 0),
          education: Math.max(0, Number(currentExpenses.education) || 0),
          debt: Math.max(0, Number(currentExpenses.debt) || 0),
          childcare: Math.max(0, Number(currentExpenses.childcare) || 0),
          discretionary: Math.max(0, Number(currentExpenses.discretionary) || 0),
          // Additional expense categories
          personalInsurance: Math.max(0, Number(currentExpenses.personalInsurance) || 0),
          entertainment: Math.max(0, Number(currentExpenses.entertainment) || 0),
          apparel: Math.max(0, Number(currentExpenses.apparel) || 0),
          services: Math.max(0, Number(currentExpenses.services) || 0),
          other: Math.max(0, Number(currentExpenses.other) || 0)
        };
        
        // Special healthcare debug
        console.log("Healthcare expense details:", {
          raw: currentExpenses.healthcare,
          parsed: Number(currentExpenses.healthcare),
          sanitized: sanitizedExpenses.healthcare,
          type: typeof currentExpenses.healthcare
        });
        
        // Create new chart with sanitized data
        chartInstance.current = createExpenseBreakdownChart(ctx, sanitizedExpenses);
        
        // Log the data being used to create the chart for debugging
        console.log("Creating expense breakdown chart with sanitized data:", sanitizedExpenses);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [currentExpenses]);

  // Calculate total expenses with proper error handling
  const totalExpenses = Object.values(currentExpenses)
    .filter(value => !isNaN(Number(value)))
    .reduce((sum, value) => sum + (Number(value) || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {projectionYear === 0 
            ? "Current Expense Breakdown" 
            : `Year ${projectionYear} Expense Breakdown`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="h-60">
            <canvas ref={chartRef} />
          </div>
          <div className="mt-4 text-sm text-center">
            <div className="font-semibold">Total Annual Expenses: ${totalExpenses.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseBreakdownChart;