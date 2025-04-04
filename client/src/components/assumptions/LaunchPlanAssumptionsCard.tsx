import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Info, Save, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface LaunchPlanAssumption {
  id: string;
  name: string;
  value: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  stepValue: number;
  unit: string;
  displayName: string;
  description: string;
  category: string;
  isEnabled: boolean;
  isLocationBased?: boolean; // Flag to indicate if this assumption is location-dependent
}

interface LocationCostOfLiving {
  id: number;
  zip_code: string;
  city: string;
  state: string;
  housing: number;
  transportation: number;
  food: number;
  healthcare: number;
  personal_insurance: number;
  apparel: number;
  services: number;
  entertainment: number;
  other: number;
  monthly_expense: number;
  income_adjustment_factor: number;
}

interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  zipCode: string;
  [key: string]: any;
}

const LaunchPlanAssumptionsCard = () => {
  const { toast } = useToast();
  const [assumptions, setAssumptions] = useState<LaunchPlanAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("housing");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const queryClient = useQueryClient();
  const [previousZipCode, setPreviousZipCode] = useState<string | null>(null);

  // Fetch user data to get the zipcode
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users', 1], // Using ID 1 for demo purposes
    queryFn: async () => {
      const response = await fetch('/api/users/1');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json() as Promise<User>;
    }
  });

  // Fetch location cost of living data
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['/api/location-cost-of-living/zip', userData?.zipCode],
    queryFn: async () => {
      if (!userData?.zipCode) return null;
      const response = await fetch(`/api/location-cost-of-living/zip/${userData.zipCode}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch location data');
      return response.json() as Promise<LocationCostOfLiving>;
    },
    enabled: !!userData?.zipCode
  });

  useEffect(() => {
    // Load assumptions with hard-coded base values that match Python configuration
    const loadAssumptions = () => {
      setLoading(true);
      try {
        // These values should match those in server/python/launch_plan_assumptions.py
        const baseAssumptionsData: LaunchPlanAssumption[] = [
          {
            id: "home-rent-reduction",
            name: "HOME_PURCHASE_RENT_REDUCTION",
            displayName: "Home Purchase Rent Reduction",
            value: 1.0,
            defaultValue: 1.0,
            minValue: 0,
            maxValue: 1,
            stepValue: 0.05,
            unit: "%",
            description: "Percentage reduction in rent when purchasing a home",
            category: "housing",
            isEnabled: true
          },
          // Removed duplicate car-transport-reduction assumption since we already have it in transportation category
          {
            id: "marriage-expense-increase",
            name: "MARRIAGE_EXPENSE_INCREASE",
            displayName: "Marriage Expense Increase",
            value: 0.5,
            defaultValue: 0.5,
            minValue: 0,
            maxValue: 1,
            stepValue: 0.05,
            unit: "%",
            description: "Percentage increase in general expenses after marriage",
            category: "marriage",
            isEnabled: true
          },
          {
            id: "grad-school-income-increase",
            name: "GRADUATE_SCHOOL_INCOME_INCREASE",
            displayName: "Graduate School Income Increase",
            value: 0.15,
            defaultValue: 0.15,
            minValue: 0,
            maxValue: 0.5,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage increase in income after completing graduate school",
            category: "education",
            isEnabled: true
          },
          {
            id: "child-expense-per-year",
            name: "CHILD_EXPENSE_PER_YEAR",
            displayName: "Child Expense Per Year",
            value: 10000,
            defaultValue: 10000,
            minValue: 5000,
            maxValue: 30000,
            stepValue: 500,
            unit: "$",
            description: "Annual expense per child",
            category: "children",
            isEnabled: true
          },
          {
            id: "child-initial-expense",
            name: "CHILD_INITIAL_EXPENSE",
            displayName: "Child Initial Expense",
            value: 7500,
            defaultValue: 7500,
            minValue: 1000,
            maxValue: 20000,
            stepValue: 500,
            unit: "$",
            description: "One-time expense when having a child",
            category: "children",
            isEnabled: true
          },
          // For expenses, we'll now use dollar values from location data instead of percentages
          {
            id: "housing-expense",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.housing",
            displayName: "Monthly Housing Expense",
            value: 2000, // Will be updated with location data
            defaultValue: 2000, // Will be updated with location data
            minValue: 500,
            maxValue: 5000,
            stepValue: 50,
            unit: "$",
            description: "Monthly expense for housing based on your location",
            category: "expenses",
            isEnabled: true,
            isLocationBased: true
          },
          {
            id: "transportation-expense",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.transportation",
            displayName: "Monthly Transportation Expense",
            value: 600, // Will be updated with location data
            defaultValue: 600, // Will be updated with location data
            minValue: 100,
            maxValue: 2000,
            stepValue: 50,
            unit: "$",
            description: "Monthly expense for transportation based on your location",
            category: "expenses",
            isEnabled: true,
            isLocationBased: true
          },
          {
            id: "food-expense",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.food",
            displayName: "Monthly Food Expense",
            value: 600, // Will be updated with location data
            defaultValue: 600, // Will be updated with location data
            minValue: 200,
            maxValue: 2000,
            stepValue: 50,
            unit: "$",
            description: "Monthly expense for food based on your location",
            category: "expenses",
            isEnabled: true,
            isLocationBased: true
          },
          {
            id: "healthcare-expense",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.healthcare",
            displayName: "Monthly Healthcare Expense",
            value: 400, // Will be updated with location data
            defaultValue: 400, // Will be updated with location data
            minValue: 100,
            maxValue: 1500,
            stepValue: 50,
            unit: "$",
            description: "Monthly expense for healthcare based on your location",
            category: "expenses",
            isEnabled: true,
            isLocationBased: true
          },
          {
            id: "healthcare-inflation",
            name: "HEALTHCARE_INFLATION_RATE",
            displayName: "Healthcare Inflation Rate",
            value: 0.04,
            defaultValue: 0.04,
            minValue: 0.01,
            maxValue: 0.10,
            stepValue: 0.01,
            unit: "%",
            description: "Annual inflation rate for healthcare expenses, typically higher than general inflation",
            category: "inflation",
            isEnabled: true
          },
          {
            id: "transportation-inflation",
            name: "TRANSPORTATION_INFLATION_RATE",
            displayName: "Transportation Inflation Rate",
            value: 0.03,
            defaultValue: 0.03,
            minValue: 0.01,
            maxValue: 0.08,
            stepValue: 0.01,
            unit: "%",
            description: "Annual inflation rate for transportation expenses",
            category: "inflation",
            isEnabled: true
          },
          {
            id: "transport-auto-replace",
            name: "CAR_AUTO_REPLACE",
            displayName: "Auto-Replace Cars",
            value: 0,
            defaultValue: 0,
            minValue: 0,
            maxValue: 1,
            stepValue: 1,
            unit: "",
            description: "Whether to automatically replace cars on a schedule (causes jumps in transportation expenses)",
            category: "transportation",
            isEnabled: false
          },
          {
            id: "car-transportation-reduction",
            name: "CAR_PURCHASE_TRANSPORTATION_REDUCTION",
            displayName: "Car Purchase Transit Reduction",
            value: 0.8,
            defaultValue: 0.8,
            minValue: 0.0,
            maxValue: 1.0,
            stepValue: 0.05,
            unit: "%",
            description: "How much public transportation expenses are reduced when you purchase a car (80% by default)",
            category: "transportation",
            isEnabled: true
          },
          {
            id: "discretionary-expense",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.discretionary",
            displayName: "Monthly Discretionary Expense",
            value: 1000, // Will be updated with location data
            defaultValue: 1000, // Will be updated with location data
            minValue: 200,
            maxValue: 3000,
            stepValue: 50,
            unit: "$",
            description: "Monthly expense for discretionary spending based on your location",
            category: "expenses",
            isEnabled: true,
            isLocationBased: true
          }
        ];

        setAssumptions(baseAssumptionsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load launch plan assumptions");
        setLoading(false);
      }
    };

    loadAssumptions();
  }, []);

  // Update the expense assumptions when location data changes
  useEffect(() => {
    if (!locationData || !userData?.zipCode) return;

    // Check if zip code has changed
    const zipCodeChanged = previousZipCode !== null && previousZipCode !== userData.zipCode;
    
    // Update previous zip code
    if (previousZipCode !== userData.zipCode) {
      setPreviousZipCode(userData.zipCode);
    }

    // Get expense defaults from location data
    const expenseDefaults = {
      housing: locationData.housing || 2000,
      transportation: locationData.transportation || 600,
      food: locationData.food || 600,
      healthcare: locationData.healthcare || 400,
      discretionary: (locationData.entertainment + locationData.apparel + locationData.services + locationData.other) || 1000
    };

    // Update expense assumptions with location data
    setAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => {
        // Only update location-based assumptions
        if (!assumption.isLocationBased) return assumption;

        // Get the expense category from the assumption name
        const category = assumption.name.split('.')[1]; // e.g., "DEFAULT_EXPENSE_ALLOCATIONS.housing" -> "housing"
        const defaultValue = expenseDefaults[category] || assumption.defaultValue;
        
        // If zip code changed, reset the value to the new default
        const value = zipCodeChanged ? defaultValue : assumption.value;

        // Update min and max values based on the default value
        const minValue = Math.max(defaultValue * 0.5, 100);
        const maxValue = defaultValue * 2.5;

        return {
          ...assumption,
          defaultValue,
          value,
          minValue,
          maxValue,
        };
      })
    );

    // If zip code changed, set unsaved changes to true and show a toast
    if (zipCodeChanged) {
      setUnsavedChanges(true);
      toast({
        title: "Location Updated",
        description: `Expense defaults have been updated based on your new location: ${locationData.city}, ${locationData.state}`,
      });
    }
  }, [locationData, userData?.zipCode, previousZipCode, toast]);

  // Format value for display with appropriate unit
  const formatValue = (value: number, unit: string) => {
    if (unit === "%") {
      return `${(value * 100).toFixed(0)}%`;
    } else if (unit === "$") {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  // Handle value changes
  const updateAssumptionValue = (id: string, value: number) => {
    setAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => 
        assumption.id === id ? { ...assumption, value } : assumption
      )
    );
    setUnsavedChanges(true);
  };

  // Toggle assumption enabled state
  const toggleAssumptionEnabled = (id: string) => {
    setAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => 
        assumption.id === id ? { ...assumption, isEnabled: !assumption.isEnabled } : assumption
      )
    );
    setUnsavedChanges(true);
  };

  // Reset all assumptions to their default values
  const resetAssumptions = () => {
    setAssumptions(prevAssumptions => 
      prevAssumptions.map(assumption => ({
        ...assumption,
        value: assumption.defaultValue,
        isEnabled: true
      }))
    );
    setUnsavedChanges(true);
  };

  // Save all assumption values
  const saveAssumptions = () => {
    // In a real app, this would be an API call to update the values in the server
    toast({
      title: "Success",
      description: "Launch plan assumptions saved successfully!",
    });
    setUnsavedChanges(false);
  };

  // Filter assumptions by category for the active tab
  const filteredAssumptions = assumptions.filter(
    assumption => assumption.category === activeTab
  );

  // Get unique categories for tabs
  const categoriesSet = new Set(assumptions.map(a => a.category));
  const categories = Array.from(categoriesSet);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Launch Plan Configuration</span>
          {locationData && (
            <Badge className="ml-2" variant="outline">
              {locationData.city}, {locationData.state} ({userData?.zipCode})
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          These are the core parameters used in financial calculations. Adjusting these values will change 
          how milestones affect your financial projections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || isLoadingLocation ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="space-y-6">
                    {filteredAssumptions.length > 0 ? (
                      <>
                        {category === "expenses" && (
                          <div className="bg-muted rounded-lg p-3 mb-4">
                            <div className="flex items-center">
                              <RefreshCw className="h-4 w-4 mr-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Expense defaults are based on your location ({locationData?.city || "unknown"}).
                                Changing your profile location will reset these values.
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {filteredAssumptions.map((assumption) => (
                          <div key={assumption.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <h3 className="text-lg font-medium">{assumption.displayName}</h3>
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
                                  <span>{formatValue(assumption.minValue, assumption.unit)}</span>
                                  <span>Default: {formatValue(assumption.defaultValue, assumption.unit)}</span>
                                  <span>{formatValue(assumption.maxValue, assumption.unit)}</span>
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
                                  <span className="ml-2 text-gray-600">
                                    {assumption.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
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
                disabled={loading}
              >
                Reset to Defaults
              </Button>
              <Button 
                onClick={saveAssumptions}
                disabled={!unsavedChanges || loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LaunchPlanAssumptionsCard;