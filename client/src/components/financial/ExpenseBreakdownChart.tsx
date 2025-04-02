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
        
        // Create new chart
        chartInstance.current = createExpenseBreakdownChart(ctx, currentExpenses);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [currentExpenses]);

  // Calculate total expenses
  const totalExpenses = Object.values(currentExpenses).reduce((sum, value) => sum + value, 0);

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