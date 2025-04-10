import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Info, RotateCcw } from 'lucide-react';
// Using a fixed demo user ID
const DEMO_USER_ID = 1;

const IncomeGrowthWidget = () => {
  const [growthRate, setGrowthRate] = useState<number>(3.0);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // We'll implement this as a global assumption in the schema later
  // For now we'll just simulate it
  const incomeGrowthAssumption = {
    id: 'income-growth-rate',
    key: 'income-growth-rate',
    value: 3.0,
    defaultValue: 3.0,
    minValue: 0.0,
    maxValue: 10.0,
    stepValue: 0.5,
    unit: '%',
    description: 'The annual growth rate applied to your income over time.',
    category: 'general',
    isEnabled: true
  };

  // Save changes - this is a placeholder until we implement the full API
  const saveChanges = useMutation({
    mutationFn: async () => {
      // In a real implementation, we would save to the API
      toast({
        title: "Income growth rate updated",
        description: `Changed to ${growthRate.toFixed(1)}%`,
      });
      setHasChanges(false);
      
      // Update shared state globally via context or other global state
      window.localStorage.setItem('income-growth-rate', growthRate.toString());
      
      // Invalidate relevant queries to refresh data that depends on income growth rate
      return queryClient.invalidateQueries({ queryKey: ['/api/calculate/financial-projection'] });
    }
  });

  // Handle slider or input changes
  const handleValueChange = (value: number[]) => {
    const newValue = value[0];
    setGrowthRate(newValue);
    setHasChanges(true);
  };

  const handleInputChange = (value: string) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      // Clamp value within valid range
      const clampedValue = Math.max(
        incomeGrowthAssumption.minValue,
        Math.min(parsedValue, incomeGrowthAssumption.maxValue)
      );
      setGrowthRate(clampedValue);
      setHasChanges(true);
    }
  };

  // Reset to default
  const handleReset = () => {
    setGrowthRate(incomeGrowthAssumption.defaultValue);
    setHasChanges(false);
  };

  // Check if there's a stored value and use it on load
  useEffect(() => {
    const storedValue = window.localStorage.getItem('income-growth-rate');
    if (storedValue) {
      const parsedValue = parseFloat(storedValue);
      if (!isNaN(parsedValue)) {
        setGrowthRate(parsedValue);
      }
    }
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Income Growth Rate</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 ml-2 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The annual rate at which your income is expected to grow over time due to raises, promotions, and career advancement.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-2xl font-semibold text-primary">{growthRate.toFixed(1)}%</div>
        </div>

        <div className="space-y-6">
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Income growth varies by career and experience level. The average annual wage growth
              in the US is typically 2-4%, while career advancement can lead to larger increases.
            </p>
            
            <Slider
              value={[growthRate]}
              onValueChange={handleValueChange}
              min={incomeGrowthAssumption.minValue}
              max={incomeGrowthAssumption.maxValue}
              step={incomeGrowthAssumption.stepValue}
              className="mb-4"
            />
            
            <div className="flex items-center mt-4">
              <label htmlFor="growth-rate" className="text-sm mr-4 whitespace-nowrap">
                Growth rate:
              </label>
              <Input
                id="income-growth-rate"
                type="number"
                value={growthRate.toString()}
                onChange={(e) => handleInputChange(e.target.value)}
                min={incomeGrowthAssumption.minValue}
                max={incomeGrowthAssumption.maxValue}
                step={incomeGrowthAssumption.stepValue}
                className="w-20 text-right"
              />
              <span className="ml-2">%</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={growthRate === incomeGrowthAssumption.defaultValue}
              className="flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => saveChanges.mutate()}
              disabled={!hasChanges || saveChanges.isPending}
            >
              {saveChanges.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeGrowthWidget;