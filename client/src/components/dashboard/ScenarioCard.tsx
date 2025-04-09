import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useEffect } from "react";
import { createMainProjectionChart } from "@/lib/charts";
import { Button } from "@/components/ui/button";
import { BarChart, Eye, Pencil, Calculator } from "lucide-react";

export interface ScenarioData {
  id: number;
  title: string;
  description: string;
  tags: {
    education?: string;
    career?: string;
    location?: string;
  };
  projectionData: {
    netWorth: number[];
    income: number[];
    expenses: number[];
    ages: number[];
  };
}

interface ScenarioCardProps {
  scenario: ScenarioData;
  index: number;
  onViewDetails: (scenario: ScenarioData) => void;
  onEdit: (scenario: ScenarioData) => void;
}

const ScenarioCard = ({ scenario, index, onViewDetails, onEdit }: ScenarioCardProps) => {
  const netWorthChartRef = useRef<HTMLCanvasElement>(null);
  const cashFlowChartRef = useRef<HTMLCanvasElement>(null);
  const netWorthChartInstance = useRef<any>(null);
  const cashFlowChartInstance = useRef<any>(null);
  
  // Create color variants for different cards
  const colorVariants = [
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200",
    "bg-purple-50 border-purple-200",
    "bg-amber-50 border-amber-200",
  ];
  
  const colorClass = colorVariants[index % colorVariants.length];
  
  useEffect(() => {
    if (netWorthChartRef.current) {
      const ctx = netWorthChartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (netWorthChartInstance.current) {
          netWorthChartInstance.current.destroy();
        }
        
        // Create new net worth chart
        netWorthChartInstance.current = createMainProjectionChart(ctx, scenario.projectionData, "netWorth");
      }
    }
    
    if (cashFlowChartRef.current) {
      const ctx = cashFlowChartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (cashFlowChartInstance.current) {
          cashFlowChartInstance.current.destroy();
        }
        
        // Create cash flow chart with income and expenses
        const cashFlowData = {
          ages: scenario.projectionData.ages,
          income: scenario.projectionData.income,
          expenses: scenario.projectionData.expenses
        };
        
        cashFlowChartInstance.current = createMainProjectionChart(ctx, cashFlowData, "income");
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (netWorthChartInstance.current) {
        netWorthChartInstance.current.destroy();
      }
      if (cashFlowChartInstance.current) {
        cashFlowChartInstance.current.destroy();
      }
    };
  }, [scenario]);

  return (
    <Card className={`overflow-hidden border ${colorClass}`}>
      <CardHeader className="bg-white pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium">{scenario.title}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(scenario)}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewDetails(scenario)}>
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {scenario.tags.education && (
            <Badge variant="secondary" className="flex items-center">
              <span className="material-icons text-xs mr-1">school</span>
              {scenario.tags.education}
            </Badge>
          )}
          {scenario.tags.career && (
            <Badge variant="secondary" className="flex items-center">
              <span className="material-icons text-xs mr-1">work</span>
              {scenario.tags.career}
            </Badge>
          )}
          {scenario.tags.location && (
            <Badge variant="secondary" className="flex items-center">
              <span className="material-icons text-xs mr-1">location_on</span>
              {scenario.tags.location}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="netWorth">
          <TabsList className="mb-2 grid w-full grid-cols-2">
            <TabsTrigger value="netWorth" className="flex items-center">
              <BarChart className="h-4 w-4 mr-1" />
              Net Worth
            </TabsTrigger>
            <TabsTrigger value="cashFlow" className="flex items-center">
              <Calculator className="h-4 w-4 mr-1" />
              Cash Flow
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="netWorth" className="mt-0">
            <div className="h-56">
              <canvas ref={netWorthChartRef}></canvas>
            </div>
            <div className="mt-2 text-center">
              <div className="text-xl font-semibold">
                ${Math.max(...scenario.projectionData.netWorth).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Projected Net Worth</div>
            </div>
          </TabsContent>
          
          <TabsContent value="cashFlow" className="mt-0">
            <div className="h-56">
              <canvas ref={cashFlowChartRef}></canvas>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-green-600 text-lg font-semibold">
                  ${scenario.projectionData.income[scenario.projectionData.income.length - 1].toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Annual Income</div>
              </div>
              <div>
                <div className="text-red-600 text-lg font-semibold">
                  ${scenario.projectionData.expenses[scenario.projectionData.expenses.length - 1].toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Annual Expenses</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScenarioCard;