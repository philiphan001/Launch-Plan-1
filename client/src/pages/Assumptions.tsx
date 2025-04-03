import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LaunchPlanAssumptionsCard from "@/components/assumptions/LaunchPlanAssumptionsCard";

// Hard-coding user ID for demo purposes
const DEMO_USER_ID = 1;

// Assumption type definition from schema
type AssumptionCategory = "marriage" | "housing" | "car" | "children" | "education";

interface Assumption {
  id: number;
  userId: number;
  category: string;
  key: string;
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  stepValue: number;
  unit: string;
  isEnabled: boolean;
}

// Temporary default assumptions - will be replaced with data from the API
const defaultAssumptions = [
  {
    key: "spouse-loan-term",
    category: "marriage",
    label: "Spouse Loan Repayment Term",
    description: "Number of years to repay spouse's liabilities",
    value: 10,
    defaultValue: 10,
    minValue: 5,
    maxValue: 30,
    stepValue: 1,
    unit: "years",
    isEnabled: true
  },
  {
    key: "spouse-loan-rate",
    category: "marriage",
    label: "Spouse Loan Interest Rate",
    description: "Annual interest rate for spouse's liabilities",
    value: 5.0,
    defaultValue: 5.0,
    minValue: 0,
    maxValue: 15,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  },
  {
    key: "spouse-asset-growth",
    category: "marriage",
    label: "Spouse Asset Growth Rate",
    description: "Annual growth rate for spouse's assets",
    value: 3.0,
    defaultValue: 3.0,
    minValue: 0,
    maxValue: 10,
    stepValue: 0.25,
    unit: "%",
    isEnabled: true
  }
];

const AssumptionsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AssumptionCategory>("marriage");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [localAssumptions, setLocalAssumptions] = useState<Assumption[]>([]);

  // Fetch assumptions from API
  const { data: assumptions, isLoading, isError, error } = useQuery({
    queryKey: ['/api/assumptions/user', DEMO_USER_ID],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assumptions/user/${DEMO_USER_ID}`);
        if (!response.ok) {
          throw new Error(`Error fetching assumptions: ${response.statusText}`);
        }
        return response.json() as Promise<Assumption[]>;
      } catch (err) {
        console.error("Failed to fetch assumptions:", err);
        return [] as Assumption[];
      }
    }
  });

  // Initialize assumptions from the API or use defaults
  useEffect(() => {
    if (assumptions && assumptions.length > 0) {
      setLocalAssumptions(assumptions);
    }
  }, [assumptions]);

  // Initialize default assumptions if none exist
  const initializeAssumptions = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/assumptions/initialize/${DEMO_USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Error initializing assumptions: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/assumptions/user', DEMO_USER_ID] });
      toast({
        title: "Assumptions Initialized",
        description: "Default assumptions have been created for your account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to initialize assumptions: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  // Save assumption mutation
  const saveAssumption = useMutation({
    mutationFn: async (assumption: Assumption) => {
      const response = await fetch(`/api/assumptions/${assumption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: assumption.value,
          isEnabled: assumption.isEnabled
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error updating assumption: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // No need to refetch as we're only updating locally tracked properties
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to save assumption: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    }
  });

  // Update value for a specific assumption
  const updateAssumptionValue = (id: number, value: number) => {
    setLocalAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => 
        assumption.id === id ? { ...assumption, value } : assumption
      )
    );
    setUnsavedChanges(true);
  };

  // Toggle assumption enabled state
  const toggleAssumptionEnabled = (id: number) => {
    setLocalAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => 
        assumption.id === id ? { ...assumption, isEnabled: !assumption.isEnabled } : assumption
      )
    );
    setUnsavedChanges(true);
  };

  // Reset all assumptions to their default values
  const resetAssumptions = () => {
    if (!assumptions) return;
    
    setLocalAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => ({
        ...assumption,
        value: assumption.defaultValue,
        isEnabled: true
      }))
    );
    setUnsavedChanges(true);
  };

  // Save all assumptions with changes
  const saveAssumptions = async () => {
    const promises = localAssumptions.map(assumption => 
      saveAssumption.mutateAsync(assumption)
    );
    
    try {
      await Promise.all(promises);
      toast({
        title: "Success",
        description: "All assumptions saved successfully!",
      });
      setUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Some assumptions could not be saved. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter assumptions by category
  const filteredAssumptions = localAssumptions.filter(
    assumption => assumption.category === activeTab
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">
        Launch Plan Assumptions
      </h1>
      
      <p className="text-gray-600 mb-6">
        These settings control the underlying assumptions used in financial projections and calculations.
        Adjusting these values will affect how various milestones impact your financial future.
      </p>

      <div className="grid grid-cols-1 gap-6">
        {/* Our new Launch Plan Assumptions Card - imported from a module we created */}
        <LaunchPlanAssumptionsCard />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Financial Model Assumptions</span>
              
              {isLoading ? (
                <span className="text-sm font-normal flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Loading assumptions...
                </span>
              ) : isError ? (
                <div className="text-sm font-normal text-red-500">
                  Error loading assumptions
                </div>
              ) : assumptions?.length === 0 ? (
                <Button
                  size="sm"
                  onClick={() => initializeAssumptions.mutate()}
                  disabled={initializeAssumptions.isPending}
                >
                  {initializeAssumptions.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Default Assumptions"
                  )}
                </Button>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : isError ? (
              <div className="py-8 text-center">
                <p className="text-red-500 mb-4">Failed to load assumptions</p>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/assumptions/user', DEMO_USER_ID] })}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : localAssumptions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 mb-4">No assumptions found. Click the button above to initialize default assumptions.</p>
              </div>
            ) : (
              <>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AssumptionCategory)}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="marriage">Marriage</TabsTrigger>
                    <TabsTrigger value="housing">Housing</TabsTrigger>
                    <TabsTrigger value="car">Car</TabsTrigger>
                    <TabsTrigger value="children">Children</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                  </TabsList>

                  {/* Tab content for different assumption categories */}
                  {["marriage", "housing", "car", "children", "education"].map((category) => (
                    <TabsContent key={category} value={category} className="mt-0">
                      <div className="space-y-6">
                        {filteredAssumptions.length > 0 ? (
                          filteredAssumptions.map((assumption) => (
                            <div key={assumption.id} className="border-b pb-4 last:border-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <h3 className="text-lg font-medium">{assumption.label}</h3>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Info className="w-4 h-4 ml-2 text-gray-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{assumption.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <div className="flex items-center">
                                  <Label htmlFor={`enable-${assumption.id}`} className="mr-2">
                                    {assumption.isEnabled ? "Enabled" : "Disabled"}
                                  </Label>
                                  <Switch
                                    id={`enable-${assumption.id}`}
                                    checked={assumption.isEnabled}
                                    onCheckedChange={() => toggleAssumptionEnabled(assumption.id)}
                                  />
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mb-4">{assumption.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                <div className="md:col-span-4">
                                  <Slider
                                    value={[assumption.value]}
                                    min={assumption.minValue}
                                    max={assumption.maxValue}
                                    step={assumption.stepValue}
                                    onValueChange={(value) => updateAssumptionValue(assumption.id, value[0])}
                                    disabled={!assumption.isEnabled}
                                    className="mb-2"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>{assumption.minValue}{assumption.unit}</span>
                                    <span>Default: {assumption.defaultValue}{assumption.unit}</span>
                                    <span>{assumption.maxValue}{assumption.unit}</span>
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <div className="flex items-center">
                                    <Input
                                      type="number"
                                      value={assumption.value}
                                      onChange={(e) => updateAssumptionValue(
                                        assumption.id,
                                        Math.min(
                                          Math.max(
                                            Number(e.target.value), 
                                            assumption.minValue
                                          ), 
                                          assumption.maxValue
                                        )
                                      )}
                                      min={assumption.minValue}
                                      max={assumption.maxValue}
                                      step={assumption.stepValue}
                                      disabled={!assumption.isEnabled}
                                      className="w-24"
                                    />
                                    <span className="ml-2 text-gray-600">{assumption.unit}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No assumptions configured for this category yet.</p>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={resetAssumptions}
                    disabled={isLoading || !localAssumptions.length}
                  >
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={saveAssumptions} 
                    disabled={!unsavedChanges || isLoading || saveAssumption.isPending}
                  >
                    {saveAssumption.isPending ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Assumptions"
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssumptionsPage;