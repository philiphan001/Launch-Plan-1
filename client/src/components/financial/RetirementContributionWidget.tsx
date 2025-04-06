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
import { Input } from "@/components/ui/input";

const RetirementContributionWidget = () => {
  const { assumptions, getAssumptionValue } = useAssumptions();
  const [rate, setRate] = useState<number>(10.0); // Default value
  const [originalRate, setOriginalRate] = useState<number>(10.0);
  const [hasChanged, setHasChanged] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize with the actual assumption value when loaded
  useEffect(() => {
    if (assumptions.length > 0) {
      const contributionRate = getAssumptionValue('retirement-contribution-rate', 10.0);
      setRate(contributionRate);
      setOriginalRate(contributionRate);
    }
  }, [assumptions, getAssumptionValue]);

  // Find the actual assumption object
  const retirementContributionAssumption = assumptions.find(a => a.key === 'retirement-contribution-rate');

  // Save assumption mutation
  const saveAssumption = useMutation({
    mutationFn: async () => {
      if (!retirementContributionAssumption) return null;

      const response = await fetch(`/api/assumptions/${retirementContributionAssumption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: rate,
          isEnabled: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating retirement contribution rate: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assumptions/user', 1] });
      toast({
        title: "Success",
        description: "Retirement contribution rate updated successfully!",
      });
      setOriginalRate(rate);
      setHasChanged(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save retirement contribution rate: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  const handleChange = (value: number[]) => {
    if (value && value.length > 0) {
      const newRate = value[0];
      setRate(newRate);
      setHasChanged(newRate !== originalRate);
      console.log("Retirement contribution changed to:", newRate);
    }
  };

  const handleReset = () => {
    if (retirementContributionAssumption) {
      setRate(retirementContributionAssumption.defaultValue);
      setHasChanged(retirementContributionAssumption.defaultValue !== originalRate);
    }
  };

  if (!retirementContributionAssumption) {
    return null; // Don't render if the assumption isn't found
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-lg font-medium">Retirement Contribution Rate</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 ml-2 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>The percentage of your annual income that you contribute to retirement accounts. Higher contributions lead to larger retirement savings over time.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-2xl font-semibold text-primary">{rate.toFixed(1)}%</div>
        </div>

        <div className="space-y-6">
          <div>
            <Slider
              value={[rate]}
              min={retirementContributionAssumption.minValue}
              max={retirementContributionAssumption.maxValue}
              step={retirementContributionAssumption.stepValue}
              onValueChange={handleChange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{retirementContributionAssumption.minValue}%</span>
              <span>Default: {retirementContributionAssumption.defaultValue}%</span>
              <span>{retirementContributionAssumption.maxValue}%</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm mr-4">Manual adjustment:</div>
            <Input
              type="number"
              value={rate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                if (!isNaN(newRate)) {
                  const clampedRate = Math.min(
                    Math.max(newRate, retirementContributionAssumption.minValue),
                    retirementContributionAssumption.maxValue
                  );
                  setRate(clampedRate);
                  setHasChanged(clampedRate !== originalRate);
                  console.log("Manual retirement contribution rate set to:", clampedRate);
                }
              }}
              min={retirementContributionAssumption.minValue}
              max={retirementContributionAssumption.maxValue}
              step={retirementContributionAssumption.stepValue}
              className="w-20 text-right"
            />
            <span className="ml-2">%</span>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              disabled={rate === retirementContributionAssumption.defaultValue}
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

export default RetirementContributionWidget;