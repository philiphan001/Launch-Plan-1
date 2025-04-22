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

const RetirementGrowthWidget = () => {
  const [growthRate, setGrowthRate] = useState<number>(6.0);
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

  // Find the retirement growth rate assumption
  const retirementAssumption = assumptions?.find(
    (a: any) => a.key === 'retirement-growth-rate'
  );

  // Initialize state when assumptions are loaded
  useEffect(() => {
    if (retirementAssumption) {
      console.log("Found retirement growth assumption:", retirementAssumption);
      setGrowthRate(retirementAssumption.value);
      setHasChanges(false);
    }
  }, [retirementAssumption]);

  // Save changes
  const saveChanges = useMutation({
    mutationFn: async () => {
      if (!retirementAssumption) {
        throw new Error("Retirement growth assumption not found");
      }

      console.log("Saving retirement growth rate:", growthRate);
      
      const response = await fetch(`/api/assumptions/${retirementAssumption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: growthRate,
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
        description: "Retirement growth rate updated successfully",
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
      const max = retirementAssumption?.maxValue || 12;
      const clampedValue = Math.min(Math.max(newRate, min), max);
      
      setGrowthRate(clampedValue);
      setHasChanges(clampedValue !== retirementAssumption?.value);
      console.log("Setting growth rate to:", clampedValue);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (retirementAssumption) {
      setGrowthRate(retirementAssumption.defaultValue);
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
          <div className="text-2xl font-semibold text-primary">{growthRate.toFixed(2)}%</div>
        </div>

        <div className="space-y-6">
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              The growth rate represents how your retirement investments perform over time.
              Historically, stock markets have returned 7-10% annually over the long term.
            </p>
            
            <div className="flex items-center mt-4">
              <label htmlFor="growth-rate" className="text-sm mr-4 whitespace-nowrap">
                Growth rate:
              </label>
              <Input
                id="growth-rate"
                type="number"
                value={growthRate}
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
              disabled={growthRate === retirementAssumption.defaultValue}
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

export default RetirementGrowthWidget;