import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAssumptions } from '@/hooks/use-assumptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

const RetirementGrowthWidget = () => {
  const { assumptions, getAssumptionValue } = useAssumptions();
  const [rate, setRate] = useState<number>(6.0); // Default value
  const [originalRate, setOriginalRate] = useState<number>(6.0);
  const [hasChanged, setHasChanged] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize with the actual assumption value when loaded
  useEffect(() => {
    if (assumptions.length > 0) {
      const retirementRate = getAssumptionValue('retirement-growth-rate', 6.0);
      setRate(retirementRate);
      setOriginalRate(retirementRate);
    }
  }, [assumptions, getAssumptionValue]);

  // Find the actual assumption object
  const retirementGrowthAssumption = assumptions.find(a => a.key === 'retirement-growth-rate');

  // Save assumption mutation
  const saveAssumption = useMutation({
    mutationFn: async () => {
      if (!retirementGrowthAssumption) return null;

      const response = await fetch(`/api/assumptions/${retirementGrowthAssumption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: rate,
          isEnabled: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating retirement growth rate: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assumptions/user', 1] });
      toast({
        title: "Success",
        description: "Retirement growth rate updated successfully!",
      });
      setOriginalRate(rate);
      setHasChanged(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save retirement growth rate: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  const handleChange = (value: number[]) => {
    const newRate = value[0];
    setRate(newRate);
    setHasChanged(newRate !== originalRate);
  };

  const handleReset = () => {
    if (retirementGrowthAssumption) {
      setRate(retirementGrowthAssumption.defaultValue);
      setHasChanged(retirementGrowthAssumption.defaultValue !== originalRate);
    }
  };

  if (!retirementGrowthAssumption) {
    return null; // Don't render if the assumption isn't found
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Retirement Growth Rate</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 ml-2 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The annual investment growth rate applied to retirement accounts. This determines how your retirement contributions grow over time with compound interest.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-2xl font-semibold text-primary">{rate.toFixed(2)}%</div>
        </div>

        <div className="space-y-6">
          <div>
            <Slider
              value={[rate]}
              min={retirementGrowthAssumption.minValue}
              max={retirementGrowthAssumption.maxValue}
              step={retirementGrowthAssumption.stepValue}
              onValueChange={handleChange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{retirementGrowthAssumption.minValue}%</span>
              <span>Default: {retirementGrowthAssumption.defaultValue}%</span>
              <span>{retirementGrowthAssumption.maxValue}%</span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              disabled={rate === retirementGrowthAssumption.defaultValue}
            >
              Reset to Default
            </Button>
            <Button 
              size="sm"
              onClick={() => saveAssumption.mutate()}
              disabled={!hasChanged || saveAssumption.isPending}
            >
              {saveAssumption.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementGrowthWidget;