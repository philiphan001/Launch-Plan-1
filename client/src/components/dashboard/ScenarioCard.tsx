import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useEffect } from "react";
import { createMainProjectionChart } from "@/lib/charts";
import { Button } from "@/components/ui/button";
import { BarChart, Eye, Pencil, Calculator, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
  isComparing?: boolean;
  comparisonHighlight?: 'better' | 'worse' | 'neutral';
}

interface ScenarioCardProps {
  scenario: ScenarioData;
  index: number;
  onViewDetails: (scenario: ScenarioData) => void;
  onEdit: (scenario: ScenarioData) => void;
  ageSliderActive?: boolean;
  ageSliderValue?: number;
  isComparing?: boolean;
  comparisonMetric?: 'netWorth' | 'income' | 'expenses';
}

interface ScenarioCardProps {
  scenario: ScenarioData;
  index: number;
  onViewDetails: (scenario: ScenarioData) => void;
  onEdit: (scenario: ScenarioData) => void;
  ageSliderActive?: boolean;
  ageSliderValue?: number;
}

const ScenarioCard = ({ 
  scenario, 
  index, 
  onViewDetails, 
  onEdit,
  ageSliderActive = false,
  ageSliderValue = 30
}: ScenarioCardProps) => {
  const netWorthChartRef = useRef<HTMLCanvasElement>(null);
  const cashFlowChartRef = useRef<HTMLCanvasElement>(null);
  const netWorthChartInstance = useRef<any>(null);
  const cashFlowChartInstance = useRef<any>(null);
  
  // Function to get net worth at specific age
  const getNetWorthAtAge = (targetAge: number): number => {
    try {
      // Check for valid age data
      if (!scenario.projectionData.ages || scenario.projectionData.ages.length === 0) {
        return 0;
      }
      
      // Find the index of the age in the ages array
      const ageIndex = scenario.projectionData.ages.findIndex(age => age === targetAge);
      
      // If the exact age exists in our data, use that value
      if (ageIndex !== -1) {
        const value = scenario.projectionData.netWorth[ageIndex];
        return value !== undefined ? value : 0;
      }
      
      // If the target age is smaller than the first age in our data
      if (targetAge < scenario.projectionData.ages[0]) {
        const value = scenario.projectionData.netWorth[0]; 
        return value !== undefined ? value : 0;
      }
      
      // If the target age is larger than the last age in our data
      if (targetAge > scenario.projectionData.ages[scenario.projectionData.ages.length - 1]) {
        const value = scenario.projectionData.netWorth[scenario.projectionData.netWorth.length - 1];
        return value !== undefined ? value : 0;
      }
      
      // Find the closest ages before and after the target and interpolate
      let lowerIndex = 0;
      for (let i = 0; i < scenario.projectionData.ages.length; i++) {
        if (scenario.projectionData.ages[i] <= targetAge) {
          lowerIndex = i;
        } else {
          break;
        }
      }
      
      const upperIndex = lowerIndex + 1;
      
      // If we're at the last age, just return that value
      if (upperIndex >= scenario.projectionData.ages.length) {
        const value = scenario.projectionData.netWorth[lowerIndex];
        return value !== undefined ? value : 0;
      }
      
      // Calculate the net worth using linear interpolation
      const lowerAge = scenario.projectionData.ages[lowerIndex];
      const upperAge = scenario.projectionData.ages[upperIndex];
      const lowerValue = scenario.projectionData.netWorth[lowerIndex] || 0;
      const upperValue = scenario.projectionData.netWorth[upperIndex] || 0;
      
      // Linear interpolation formula: y = y1 + (x - x1) * ((y2 - y1) / (x2 - x1))
      const interpolatedValue = lowerValue + (targetAge - lowerAge) * ((upperValue - lowerValue) / (upperAge - lowerAge));
      
      return isNaN(interpolatedValue) ? 0 : interpolatedValue;
    } catch (error) {
      console.error("Error calculating net worth at age", error);
      return 0; // Return 0 as fallback
    }
  };
  
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
          expenses: scenario.projectionData.expenses,
          netWorth: scenario.projectionData.netWorth // Add netWorth to satisfy type requirement
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
    <motion.div
      key={`scenario-${scenario.id}-${index}`}
      layout="position"
      layoutId={`scenario-${scenario.id}`}
      initial={{ opacity: 0.8, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 80,
          damping: 20,
          duration: 1.0
        }
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 } 
      }}
      transition={{
        layout: { 
          type: "spring", 
          bounce: 0.2,
          duration: 1.0,
          mass: 1.2,  // More mass makes it feel "weightier"
          damping: 20 // Higher damping means less oscillation
        }
      }}
      className="h-full"
    >
      <Card className={`overflow-hidden border ${colorClass} h-full transition-all duration-300 relative`}>
        {ageSliderActive && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white h-8 w-8 flex items-center justify-center rounded-bl-md z-10 font-bold shadow-md">
            #{index + 1}
          </div>
        )}
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
                {ageSliderActive ? (
                  <>
                    <div className="text-xl font-semibold text-blue-600">
                      ${getNetWorthAtAge(ageSliderValue).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Net Worth at Age {ageSliderValue}</div>
                    <div className="text-xs text-blue-500 mt-1">
                      {scenario.projectionData.ages.includes(ageSliderValue) ? 
                        "(Exact data point)" : 
                        "(Interpolated value)"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-semibold">
                      ${Math.max(...scenario.projectionData.netWorth).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Projected Peak Net Worth</div>
                  </>
                )}
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
    </motion.div>
  );
};

export default ScenarioCard;