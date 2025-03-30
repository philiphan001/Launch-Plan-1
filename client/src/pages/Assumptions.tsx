import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AssumptionCategory {
  title: string;
  description: string;
  settings: AssumptionSetting[];
}

interface AssumptionSetting {
  id: string;
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const Assumptions = () => {
  const { toast } = useToast();
  const [isAdvanced, setIsAdvanced] = useState(false);
  
  // Define the global economic assumptions
  const [economicAssumptions, setEconomicAssumptions] = useState<AssumptionCategory>({
    title: "Economic Factors",
    description: "Global economic factors that affect all financial projections",
    settings: [
      {
        id: "inflation",
        label: "General Inflation Rate",
        description: "The average annual increase in prices and cost of living",
        value: 2.5,
        defaultValue: 2.5,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "%"
      },
      {
        id: "wageGrowth",
        label: "Average Wage Growth",
        description: "The average annual increase in wages across all sectors",
        value: 3.0,
        defaultValue: 3.0,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "%"
      }
    ]
  });
  
  // Define investment assumptions
  const [investmentAssumptions, setInvestmentAssumptions] = useState<AssumptionCategory>({
    title: "Investment Returns",
    description: "Expected returns for different investment types",
    settings: [
      {
        id: "stockReturns",
        label: "Stock Market Returns",
        description: "Average annual return for stock investments",
        value: 7.0,
        defaultValue: 7.0,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "bondReturns",
        label: "Bond Returns",
        description: "Average annual return for bond investments",
        value: 3.5,
        defaultValue: 3.5,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "%"
      },
      {
        id: "savingsReturns",
        label: "Savings Account Returns",
        description: "Average annual return for savings accounts and CDs",
        value: 1.0,
        defaultValue: 1.0,
        min: 0,
        max: 5,
        step: 0.1,
        unit: "%"
      }
    ]
  });
  
  // Define debt assumptions
  const [debtAssumptions, setDebtAssumptions] = useState<AssumptionCategory>({
    title: "Debt & Loans",
    description: "Interest rates and terms for different types of debt",
    settings: [
      {
        id: "studentLoanRate",
        label: "Student Loan Interest Rate",
        description: "Average interest rate for student loans",
        value: 5.0,
        defaultValue: 5.0,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "mortgageRate",
        label: "Mortgage Interest Rate",
        description: "Average interest rate for home mortgages",
        value: 4.5,
        defaultValue: 4.5,
        min: 0,
        max: 10,
        step: 0.1,
        unit: "%"
      },
      {
        id: "carLoanRate",
        label: "Auto Loan Interest Rate",
        description: "Average interest rate for auto loans",
        value: 4.0,
        defaultValue: 4.0,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "creditCardRate",
        label: "Credit Card Interest Rate",
        description: "Average interest rate for credit cards",
        value: 16.0,
        defaultValue: 16.0,
        min: 0,
        max: 30,
        step: 0.1,
        unit: "%"
      }
    ]
  });
  
  // Advanced assumptions for those who want more control
  const [advancedAssumptions, setAdvancedAssumptions] = useState<AssumptionCategory>({
    title: "Advanced Factors",
    description: "More specific economic factors for advanced projections",
    settings: [
      {
        id: "housingAppreciation",
        label: "Housing Appreciation Rate",
        description: "Average annual increase in home values",
        value: 3.8,
        defaultValue: 3.8,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "foodInflation",
        label: "Food Inflation Rate",
        description: "Average annual increase in food costs",
        value: 3.0,
        defaultValue: 3.0,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "healthcareInflation",
        label: "Healthcare Inflation Rate",
        description: "Average annual increase in healthcare costs",
        value: 5.0,
        defaultValue: 5.0,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      },
      {
        id: "educationInflation",
        label: "Education Inflation Rate",
        description: "Average annual increase in education costs",
        value: 5.5,
        defaultValue: 5.5,
        min: 0,
        max: 15,
        step: 0.1,
        unit: "%"
      }
    ]
  });
  
  // Update a setting in a category
  const updateSetting = (
    categoryState: AssumptionCategory, 
    setCategoryState: React.Dispatch<React.SetStateAction<AssumptionCategory>>, 
    settingId: string, 
    newValue: number
  ) => {
    setCategoryState({
      ...categoryState,
      settings: categoryState.settings.map(setting => 
        setting.id === settingId 
          ? { ...setting, value: newValue } 
          : setting
      )
    });
  };
  
  // Reset a category to default values
  const resetCategory = (
    categoryState: AssumptionCategory, 
    setCategoryState: React.Dispatch<React.SetStateAction<AssumptionCategory>>
  ) => {
    setCategoryState({
      ...categoryState,
      settings: categoryState.settings.map(setting => 
        ({ ...setting, value: setting.defaultValue })
      )
    });
  };
  
  // Save all assumption settings
  const saveAllAssumptions = () => {
    // In a real app, this would save to a database or localStorage
    toast({
      title: "Assumptions Saved",
      description: "Your custom economic assumptions have been saved and will be used for all future financial projections.",
    });
    
    // Here we would save the assumptions to be used in financial calculations
    // For now, we'll just log them to the console
    console.log("Economic Assumptions:", economicAssumptions);
    console.log("Investment Assumptions:", investmentAssumptions);
    console.log("Debt Assumptions:", debtAssumptions);
    console.log("Advanced Assumptions:", advancedAssumptions);
  };
  
  // Render a category of assumptions
  const renderAssumptionCategory = (
    category: AssumptionCategory, 
    setCategory: React.Dispatch<React.SetStateAction<AssumptionCategory>>
  ) => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-medium">{category.title}</h3>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => resetCategory(category, setCategory)}>
            Reset to Defaults
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-6">
          {category.settings.map(setting => (
            <div key={setting.id}>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor={setting.id} className="text-sm font-medium">
                  {setting.label}
                </Label>
                <span className="text-sm font-semibold">{setting.value}{setting.unit}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Slider
                  id={setting.id}
                  value={[setting.value]}
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  onValueChange={(values) => updateSetting(category, setCategory, setting.id, values[0])}
                  className="flex-1"
                />
                <Input
                  type="number"
                  min={setting.min}
                  max={setting.max}
                  step={setting.step}
                  value={setting.value}
                  onChange={(e) => updateSetting(
                    category, 
                    setCategory, 
                    setting.id, 
                    Number(e.target.value)
                  )}
                  className="w-16 text-right"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Economic Assumptions</h1>
          <p className="text-gray-600">Configure the economic variables used for all financial projections</p>
        </div>
        <Button onClick={saveAllAssumptions}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>About Economic Assumptions</AlertTitle>
        <AlertDescription>
          These settings control how the application projects future financial values. All projections are estimates based on these assumptions and historical trends. Actual results may vary.
        </AlertDescription>
      </Alert>
      
      <div className="flex items-center justify-between mb-6 bg-gray-100 p-4 rounded-lg">
        <Label 
          htmlFor="advanced-mode" 
          className="flex items-center cursor-pointer"
        >
          <div className="ml-2">
            <h3 className="text-sm font-medium">Advanced Mode</h3>
            <p className="text-xs text-muted-foreground">Enable more granular economic assumptions</p>
          </div>
        </Label>
        <Switch 
          id="advanced-mode"
          checked={isAdvanced}
          onCheckedChange={setIsAdvanced}
        />
      </div>
      
      {renderAssumptionCategory(economicAssumptions, setEconomicAssumptions)}
      {renderAssumptionCategory(investmentAssumptions, setInvestmentAssumptions)}
      {renderAssumptionCategory(debtAssumptions, setDebtAssumptions)}
      
      {isAdvanced && renderAssumptionCategory(advancedAssumptions, setAdvancedAssumptions)}
      
      <div className="flex justify-end mt-6 mb-12">
        <Button onClick={saveAllAssumptions} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save All Assumptions
        </Button>
      </div>
    </div>
  );
};

export default Assumptions;