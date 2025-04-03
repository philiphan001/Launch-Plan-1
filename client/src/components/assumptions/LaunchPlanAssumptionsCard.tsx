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
import { Loader2, Info, Save } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

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
}

const LaunchPlanAssumptionsCard = () => {
  const { toast } = useToast();
  const [assumptions, setAssumptions] = useState<LaunchPlanAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("housing");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    // In a real app, this would be an API call to fetch the latest values from the server
    // For now, we'll use hard-coded values that match our Python configuration
    const loadAssumptions = () => {
      setLoading(true);
      try {
        // These values should match those in server/python/launch_plan_assumptions.py
        const assumptionsData: LaunchPlanAssumption[] = [
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
          {
            id: "car-transport-reduction",
            name: "CAR_PURCHASE_TRANSPORTATION_REDUCTION",
            displayName: "Car Purchase Transportation Reduction",
            value: 0.8,
            defaultValue: 0.8,
            minValue: 0,
            maxValue: 1,
            stepValue: 0.05,
            unit: "%",
            description: "Percentage reduction in transportation expenses when buying a car",
            category: "car",
            isEnabled: true
          },
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
          {
            id: "housing-allocation",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.housing",
            displayName: "Housing Expense Allocation",
            value: 0.3,
            defaultValue: 0.3,
            minValue: 0.1,
            maxValue: 0.5,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage of income allocated to housing",
            category: "expenses",
            isEnabled: true
          },
          {
            id: "transportation-allocation",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.transportation",
            displayName: "Transportation Expense Allocation",
            value: 0.15,
            defaultValue: 0.15,
            minValue: 0.05,
            maxValue: 0.3,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage of income allocated to transportation",
            category: "expenses",
            isEnabled: true
          },
          {
            id: "food-allocation",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.food",
            displayName: "Food Expense Allocation",
            value: 0.15,
            defaultValue: 0.15,
            minValue: 0.05,
            maxValue: 0.3,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage of income allocated to food",
            category: "expenses",
            isEnabled: true
          },
          {
            id: "healthcare-allocation",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.healthcare",
            displayName: "Healthcare Expense Allocation",
            value: 0.1,
            defaultValue: 0.1,
            minValue: 0.05,
            maxValue: 0.2,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage of income allocated to healthcare",
            category: "expenses",
            isEnabled: true
          },
          {
            id: "discretionary-allocation",
            name: "DEFAULT_EXPENSE_ALLOCATIONS.discretionary",
            displayName: "Discretionary Expense Allocation",
            value: 0.3,
            defaultValue: 0.3,
            minValue: 0.1,
            maxValue: 0.5,
            stepValue: 0.01,
            unit: "%",
            description: "Percentage of income allocated to discretionary spending",
            category: "expenses",
            isEnabled: true
          }
        ];

        setAssumptions(assumptionsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load launch plan assumptions");
        setLoading(false);
      }
    };

    loadAssumptions();
  }, []);

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
  const categories = [...new Set(assumptions.map(a => a.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Plan Configuration</CardTitle>
        <CardDescription>
          These are the core parameters used in financial calculations. Adjusting these values will change 
          how milestones affect your financial projections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
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
                      filteredAssumptions.map((assumption) => (
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
                                  {assumption.unit === "%" ? "%" : assumption.unit}
                                </span>
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