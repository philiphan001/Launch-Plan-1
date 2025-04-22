import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

// Hard-coding user ID for demo purposes
const DEMO_USER_ID = 1;

const RetirementContributionWidget = () => {
  const [contributionRate, setContributionRate] = useState<number>(10.0);
  const [hasChanges, setHasChanges] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch assumptions from API
  const { data: assumptions, isLoading } = useQuery({
    queryKey: ['/api/assumptions/user', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/assumptions/user/${DEMO_USER_ID}`);
      if (!response.ok) {
        throw new Error(`Error fetching assumptions: ${response.statusText}`);
      }
      return response.json();
    }
  });

  // Find the retirement contribution rate assumption
  const retirementAssumption = assumptions?.find(
    (a: any) => a.key === 'retirement-contribution-rate'
  );

  // Initialize state when assumptions are loaded
  useEffect(() => {
    if (retirementAssumption) {
      console.log("Found retirement assumption:", retirementAssumption);
      setContributionRate(retirementAssumption.value);
      setHasChanges(false);
    }
  }, [retirementAssumption]);

  // Save changes
  const saveChanges = useMutation({
    mutationFn: async () => {
      if (!retirementAssumption) {
        throw new Error("Retirement contribution assumption not found");
      }

      console.log("Saving retirement contribution rate:", contributionRate);
      
      const response = await fetch(`/api/assumptions/${retirementAssumption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: contributionRate,
          isEnabled: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error saving changes: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Retirement contribution rate updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assumptions/user', DEMO_USER_ID] });
      setHasChanges(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save changes: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  // Handle input change
  const handleInputChange = (value: string) => {
    const newRate = parseFloat(value);
    if (!isNaN(newRate)) {
      // Clamp value to min/max range
      const min = retirementAssumption?.minValue || 0;
      const max = retirementAssumption?.maxValue || 25;
      const clampedValue = Math.min(Math.max(newRate, min), max);
      
      setContributionRate(clampedValue);
      setHasChanges(clampedValue !== retirementAssumption?.value);
      console.log("Setting contribution rate to:", clampedValue);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (retirementAssumption) {
      setContributionRate(retirementAssumption.defaultValue);
      setHasChanges(retirementAssumption.defaultValue !== retirementAssumption.value);
    }
  };

  if (isLoading || !retirementAssumption) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="h-40 flex items-center justify-center">
            <p>Loading retirement settings...</p>
          </div>
        </CardContent>
      </Card>
    );
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
                  <p>The percentage of your annual income that you contribute to retirement accounts each year. Higher contributions lead to larger retirement savings over time.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-2xl font-semibold text-primary">{contributionRate.toFixed(1)}%</div>
        </div>

        <div className="space-y-6">
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Setting a higher contribution rate can significantly impact your long-term retirement savings.
              The recommended contribution rate is typically 10-15% of your income.
            </p>
            
            <div className="flex items-center mt-4">
              <label htmlFor="contribution-rate" className="text-sm mr-4 whitespace-nowrap">
                Contribution rate:
              </label>
              <Input
                id="contribution-rate"
                type="number"
                value={contributionRate}
                onChange={(e) => handleInputChange(e.target.value)}
                min={retirementAssumption.minValue}
                max={retirementAssumption.maxValue}
                step={retirementAssumption.stepValue}
                className="w-20 text-right"
              />
              <span className="ml-2">%</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleReset}
              disabled={contributionRate === retirementAssumption.defaultValue}
            >
              Reset to Default
            </Button>
            <Button 
              size="sm"
              onClick={() => saveChanges.mutate()}
              disabled={!hasChanges || saveChanges.isPending}
            >
              {saveChanges.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RetirementContributionWidget;