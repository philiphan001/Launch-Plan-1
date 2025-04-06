import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createCashFlowChart } from "@/lib/charts";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface CashFlowCardProps {
  annualCashFlow?: number;
  income?: number;
  expenses?: number;
  chartData?: { age: number; income: number; expenses: number }[];
}

const CashFlowCard = ({
  annualCashFlow = 5260,
  income = 62400,
  expenses = 57140,
  chartData = [
    { age: 22, income: 24000, expenses: 22000 },
    { age: 23, income: 25000, expenses: 24000 },
    { age: 24, income: 30000, expenses: 45000 },
    { age: 25, income: 62000, expenses: 58000 },
    { age: 26, income: 65000, expenses: 59000 },
    { age: 27, income: 68000, expenses: 60000 },
    { age: 28, income: 72000, expenses: 62000 },
    { age: 29, income: 76000, expenses: 63000 },
    { age: 30, income: 80000, expenses: 65000 },
  ],
}: CashFlowCardProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createCashFlowChart(ctx, chartData);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Cash Flow</h3>
        <Link to="/projections">
          <span className="text-primary text-sm flex items-center">
            Details <ArrowRight className="h-4 w-4 ml-1" />
          </span>
        </Link>
      </div>
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500 uppercase">Current Annual</p>
          <p className="text-2xl font-mono font-medium text-gray-800">
            ${annualCashFlow.toLocaleString()}
          </p>
          <div className="flex items-center justify-center text-xs flex-wrap">
            <span className="px-2 py-1 bg-gray-100 rounded mr-2 mb-1">
              Income: ${income.toLocaleString()}
            </span>
            <span className="px-2 py-1 bg-gray-100 rounded mb-1">
              Expenses: ${expenses.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="chart-container mt-4">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4 text-center">
          <Link to="/projections" className="text-primary text-sm">
            Customize Income & Expenses
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashFlowCard;
