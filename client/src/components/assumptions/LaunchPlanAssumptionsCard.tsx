import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface LaunchPlanAssumption {
  name: string;
  value: string | number;
  description: string;
  category: string;
}

const LaunchPlanAssumptionsCard = () => {
  const [assumptions, setAssumptions] = useState<LaunchPlanAssumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // In a real app, this would be an API call to fetch the latest values from the server
    // For now, we'll use hard-coded values that match our Python configuration
    const loadAssumptions = () => {
      setLoading(true);
      try {
        // These values should match those in server/python/launch_plan_assumptions.py
        const assumptionsData: LaunchPlanAssumption[] = [
          {
            name: "HOME_PURCHASE_RENT_REDUCTION",
            value: "100%",
            description: "Percentage reduction in rent when purchasing a home",
            category: "housing"
          },
          {
            name: "CAR_PURCHASE_TRANSPORTATION_REDUCTION",
            value: "80%",
            description: "Percentage reduction in transportation expenses when buying a car",
            category: "car"
          },
          {
            name: "MARRIAGE_EXPENSE_INCREASE",
            value: "50%",
            description: "Percentage increase in general expenses after marriage",
            category: "marriage"
          },
          {
            name: "GRADUATE_SCHOOL_INCOME_INCREASE",
            value: "15%",
            description: "Percentage increase in income after completing graduate school",
            category: "education"
          },
          {
            name: "CHILD_EXPENSE_PER_YEAR",
            value: "$10,000",
            description: "Annual expense per child",
            category: "children"
          },
          {
            name: "CHILD_INITIAL_EXPENSE",
            value: "$7,500",
            description: "One-time expense when having a child",
            category: "children"
          }
        ];

        // Adding default expense allocations
        const expenseAllocations: LaunchPlanAssumption[] = [
          {
            name: "Housing Expense Allocation",
            value: "30%",
            description: "Percentage of income allocated to housing",
            category: "expenses"
          },
          {
            name: "Transportation Expense Allocation",
            value: "15%",
            description: "Percentage of income allocated to transportation",
            category: "expenses"
          },
          {
            name: "Food Expense Allocation",
            value: "15%",
            description: "Percentage of income allocated to food",
            category: "expenses"
          },
          {
            name: "Healthcare Expense Allocation",
            value: "10%",
            description: "Percentage of income allocated to healthcare",
            category: "expenses"
          },
          {
            name: "Discretionary Expense Allocation",
            value: "30%",
            description: "Percentage of income allocated to discretionary spending",
            category: "expenses"
          }
        ];

        setAssumptions([...assumptionsData, ...expenseAllocations]);
        setLoading(false);
      } catch (err) {
        setError("Failed to load launch plan assumptions");
        setLoading(false);
      }
    };

    loadAssumptions();
  }, []);

  // Group assumptions by category
  const categories = assumptions.reduce<Record<string, LaunchPlanAssumption[]>>((acc, assumption) => {
    if (!acc[assumption.category]) {
      acc[assumption.category] = [];
    }
    acc[assumption.category].push(assumption);
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Plan Configuration</CardTitle>
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
          <div className="space-y-6">
            {Object.entries(categories).map(([category, categoryAssumptions]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center">
                  <Badge variant="outline" className="capitalize">
                    {category}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAssumptions.map((assumption) => (
                    <div key={assumption.name} className="border rounded-md p-4">
                      <div className="font-medium">{assumption.name}</div>
                      <div className="text-2xl font-semibold my-2">{assumption.value}</div>
                      <div className="text-sm text-gray-500">{assumption.description}</div>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LaunchPlanAssumptionsCard;