import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createNetWorthChart } from "@/lib/charts";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface NetWorthCardProps {
  projectedNetWorth?: number;
  percentageChange?: number;
  chartData?: { age: number; netWorth: number }[];
}

const NetWorthCard = ({
  projectedNetWorth = 127540,
  percentageChange = 12.4,
  chartData = [
    { age: 22, netWorth: 5000 },
    { age: 23, netWorth: 12000 },
    { age: 24, netWorth: -15000 },
    { age: 25, netWorth: -8000 },
    { age: 26, netWorth: 15000 },
    { age: 27, netWorth: 48000 },
    { age: 28, netWorth: 78000 },
    { age: 29, netWorth: 102000 },
    { age: 30, netWorth: 127540 },
  ],
}: NetWorthCardProps) => {
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
        chartInstance.current = createNetWorthChart(ctx, chartData);
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
        <h3 className="font-medium text-gray-700">Projected Net Worth</h3>
        <Link to="/projections">
          <span className="text-primary text-sm flex items-center">
            Details <ArrowRight className="h-4 w-4 ml-1" />
          </span>
        </Link>
      </div>
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500 uppercase">By Age 30</p>
          <p className="text-2xl font-mono font-medium text-gray-800">
            ${projectedNetWorth.toLocaleString()}
          </p>
          <p className={`text-xs flex items-center justify-center ${percentageChange >= 0 ? 'text-success' : 'text-error'}`}>
            <span className="material-icons text-xs mr-1">
              {percentageChange >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(percentageChange)}% {percentageChange >= 0 ? 'above' : 'below'} average
          </p>
        </div>
        <div className="chart-container mt-4">
          <canvas ref={chartRef}></canvas>
        </div>
        <div className="mt-4 text-center">
          <Link to="/projections" className="text-primary text-sm">
            Customize Projections
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthCard;
