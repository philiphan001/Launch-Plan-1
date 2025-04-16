
import { Card, CardContent } from "@/components/ui/card";
import { useRef, useEffect } from "react";
import { createMainProjectionChart } from "@/lib/charts";
import { ScenarioData } from "../dashboard/ScenarioCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparativeScenariosProps {
  scenarios: ScenarioData[];
  comparisonMetric: 'netWorth' | 'income' | 'expenses';
}

const ComparativeScenarios = ({ scenarios, comparisonMetric }: ComparativeScenariosProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current && scenarios.length > 0) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Create comparative chart
        createMainProjectionChart(ctx, {
          ages: scenarios[0].projectionData.ages,
          [comparisonMetric]: scenarios.map(s => s.projectionData[comparisonMetric]),
          labels: scenarios.map(s => s.title)
        }, comparisonMetric);
      }
    }
  }, [scenarios, comparisonMetric]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="h-96">
          <canvas ref={chartRef}></canvas>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{scenario.title}</h3>
              <div className="text-sm text-gray-600">
                <p>Final {comparisonMetric}: ${scenario.projectionData[comparisonMetric][scenario.projectionData[comparisonMetric].length - 1].toLocaleString()}</p>
                <p className="mt-1">Growth Rate: {((scenario.projectionData[comparisonMetric][scenario.projectionData[comparisonMetric].length - 1] / scenario.projectionData[comparisonMetric][0] - 1) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparativeScenarios;
