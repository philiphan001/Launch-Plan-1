import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef, useEffect, useState } from "react";
import { createMainProjectionChart } from "@/lib/charts";
import { Button } from "@/components/ui/button";
import { BarChart, Eye, Pencil, Calculator, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export interface ProjectionData {
  netWorth: number[];
  income: number[];
  expenses: number[];
  ages: number[];
  
  // Tax-related fields
  federalTax?: number[];
  stateTax?: number[];
  payrollTax?: number[];
  retirementContribution?: number[];
  effectiveTaxRate?: number[];
  marginalTaxRate?: number[];
  
  // Allow for additional dynamic fields
  [key: string]: any;
}

export interface ScenarioTags {
  education?: string;
  career?: string;
  location?: string;
}

export interface ScenarioData {
  id: number;
  title: string;
  description: string;
  tags: ScenarioTags;
  projectionData: ProjectionData;
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
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  const [activeTab, setActiveTab] = useState<'netWorth' | 'cashFlow'>('netWorth');
  
  // Safely get the last value from an array
  const getSafeDataValue = (arr: number[] | undefined): number => {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
      return 0;
    }
    return arr[arr.length - 1];
  };

  // Function to get net worth at specific age
  const getNetWorthAtAge = (targetAge: number): number => {
    try {
      // Extra safety - validate projectionData exists and has valid arrays
      if (!scenario?.projectionData) {
        console.warn("Missing projectionData in scenario:", scenario?.id);
        return 0;
      }
      
      const ages = scenario.projectionData.ages || [];
      const netWorth = scenario.projectionData.netWorth || [];
      
      // Check for valid age data
      if (!Array.isArray(ages) || ages.length === 0 || !Array.isArray(netWorth) || netWorth.length === 0) {
        console.warn("Invalid ages or netWorth array in scenario:", scenario.id);
        return 0;
      }
      
      // Find the index of the age in the ages array
      const ageIndex = ages.findIndex(age => age === targetAge);
      
      // If the exact age exists in our data, use that value
      if (ageIndex !== -1 && ageIndex < netWorth.length) {
        const value = netWorth[ageIndex];
        return value !== undefined ? value : 0;
      }
      
      // If the target age is smaller than the first age in our data
      if (targetAge < ages[0] && netWorth.length > 0) {
        const value = netWorth[0]; 
        return value !== undefined ? value : 0;
      }
      
      // If the target age is larger than the last age in our data
      if (ages.length > 0 && netWorth.length > 0 && targetAge > ages[ages.length - 1]) {
        const value = netWorth[netWorth.length - 1];
        return value !== undefined ? value : 0;
      }
      
      // Find the closest ages before and after the target and interpolate
      let lowerIndex = 0;
      for (let i = 0; i < ages.length; i++) {
        if (ages[i] <= targetAge) {
          lowerIndex = i;
        } else {
          break;
        }
      }
      
      const upperIndex = lowerIndex + 1;
      
      // If we're at the last age, just return that value
      if (upperIndex >= ages.length) {
        const value = netWorth[lowerIndex];
        return value !== undefined ? value : 0;
      }
      
      // Safety check on indices
      if (lowerIndex >= netWorth.length || upperIndex >= netWorth.length) {
        console.warn("Index out of bounds when interpolating net worth");
        return netWorth[netWorth.length - 1] || 0;
      }
      
      // Calculate the net worth using linear interpolation
      const lowerAge = ages[lowerIndex];
      const upperAge = ages[upperIndex];
      const lowerValue = netWorth[lowerIndex] || 0;
      const upperValue = netWorth[upperIndex] || 0;
      
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
    // Safety check - ensure we have valid projection data before creating charts
    const hasValidProjectionData = scenario?.projectionData && 
                                 Array.isArray(scenario.projectionData.ages) && 
                                 scenario.projectionData.ages.length > 0;
    if (!hasValidProjectionData) {
      console.warn("Missing or invalid projection data in scenario:", scenario?.id);
      return; // Skip chart creation entirely if data is invalid
    }
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        try {
          const safeProjectionData = {
            ...scenario.projectionData,
            ages: [...(scenario.projectionData.ages || [])],
            netWorth: [...(scenario.projectionData.netWorth || [])],
            income: [...(scenario.projectionData.income || [])],
            expenses: [...(scenario.projectionData.expenses || [])]
          };
          if (activeTab === 'netWorth') {
            chartInstance.current = createMainProjectionChart(ctx, safeProjectionData, 'netWorth');
          } else {
            chartInstance.current = createMainProjectionChart(ctx, safeProjectionData, 'cashFlow');
          }
        } catch (err) {
          console.error("Error creating chart:", err);
        }
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [scenario, activeTab]);

  return (
    <motion.div
      key={`scenario-${scenario.id}-${index}`}
      layout
      initial={{ 
        opacity: 0,
        scale: 0.9,
        rotate: -180
      }}
      animate={{ 
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
          rotate: {
            type: "spring",
            stiffness: 200,
            damping: 15
          }
        }
      }}
      exit={{ 
        opacity: 0,
        scale: 0.9,
        rotate: 180,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      whileHover={{ 
        scale: 1.02,
        rotate: 2,
        transition: { 
          duration: 0.2,
          ease: "easeOut" 
        } 
      }}
      style={{
        position: "relative",
        transformOrigin: "center center",
        willChange: "transform"
      }}
      className="h-full"
    >
      <Card 
        id={`scenario-${scenario.id}`}
        className={`overflow-hidden border ${colorClass} h-full transition-all duration-300 relative`}
      >
        {ageSliderActive && (
          <motion.div 
            className="absolute top-0 right-0 bg-blue-600 text-white h-8 w-8 flex items-center justify-center rounded-bl-md z-10 font-bold shadow-md"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 20,
                delay: 0.2
              }
            }}
          >
            #{index + 1}
          </motion.div>
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
          <div className="mb-2 grid w-full grid-cols-2">
            <button 
              className={`flex items-center px-4 py-2 rounded-full text-sm ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveTab('netWorth')}
            >
              <BarChart className="h-4 w-4 mr-1" /> Net Worth
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-full text-sm ${activeTab === 'cashFlow' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveTab('cashFlow')}
            >
              <Calculator className="h-4 w-4 mr-1" /> Cash Flow
            </button>
          </div>
          <div className="h-56">
            <canvas ref={chartRef}></canvas>
          </div>
          <div className="mt-2 text-center">
            {ageSliderActive ? (
              <>
                <div className="text-xl font-semibold text-blue-600">
                  ${getNetWorthAtAge(ageSliderValue).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Net Worth at Age {ageSliderValue}</div>
                <div className="text-xs text-blue-500 mt-1">
                  {scenario?.projectionData?.ages && Array.isArray(scenario.projectionData.ages) &&
                   scenario.projectionData.ages.includes(ageSliderValue) ? 
                    "(Exact data point)" : 
                    "(Interpolated value)"}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-semibold">
                  ${scenario?.projectionData?.netWorth && Array.isArray(scenario.projectionData.netWorth) && 
                     scenario.projectionData.netWorth.length > 0 ? 
                     Math.max(...scenario.projectionData.netWorth).toLocaleString() : 
                     "0"}
                </div>
                <div className="text-sm text-gray-500">Projected Peak Net Worth</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScenarioCard;