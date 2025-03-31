import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createMainProjectionChart } from "@/lib/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Info, School, Briefcase, GraduationCap } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type ProjectionType = "netWorth" | "income" | "expenses" | "assets" | "liabilities";

// Interfaces for API responses
interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
  zipCode: string | null;
  birthYear: number | null;
}

interface CollegeCalculation {
  id: number;
  userId: number;
  collegeId: number;
  netPrice: number;
  studentLoanAmount: number;
  includedInProjection: boolean;
  college?: {
    name: string;
  };
}

interface CareerCalculation {
  id: number;
  userId: number;
  careerId: number;
  projectedSalary: number;
  entryLevelSalary: number | null;
  startYear: number | null;
  includedInProjection: boolean;
  education: string | null;
  career?: {
    title: string;
  };
}

interface FinancialProfile {
  id: number;
  userId: number;
  householdIncome: number | null;
  householdSize: number | null;
  savingsAmount: number | null;
  studentLoanAmount: number | null;
  otherDebtAmount: number | null;
}

const FinancialProjections = () => {
  // Temporary user ID for demo purposes
  const userId = 1;

  const [activeTab, setActiveTab] = useState<ProjectionType>("netWorth");
  const [timeframe, setTimeframe] = useState<string>("10 Years");
  const [age, setAge] = useState<number>(25);
  const [startingSavings, setStartingSavings] = useState<number>(5000);
  const [income, setIncome] = useState<number>(40000);
  const [expenses, setExpenses] = useState<number>(35000);
  const [incomeGrowth, setIncomeGrowth] = useState<number>(3);
  const [studentLoanDebt, setStudentLoanDebt] = useState<number>(0);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Fetch user data to get birth year
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json() as Promise<User>;
    }
  });

  // Fetch financial profile
  const { data: financialProfile, isLoading: isLoadingFinancialProfile, error: financialProfileError } = useQuery({
    queryKey: ['/api/financial-profiles/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/financial-profiles/user/${userId}`);
      if (response.status === 404) {
        // Return a default financial profile if none exists
        return {
          id: 0,
          userId: userId,
          householdIncome: null,
          householdSize: null,
          savingsAmount: 5000, // Default starting savings
          studentLoanAmount: null,
          otherDebtAmount: null
        } as FinancialProfile;
      }
      if (!response.ok) throw new Error('Failed to fetch financial profile');
      return response.json() as Promise<FinancialProfile>;
    },
    enabled: !!userData
  });
  
  // Fetch location cost of living data based on user's zip code
  const { data: locationCostData, isLoading: isLoadingLocationData } = useQuery({
    queryKey: ['/api/location-cost-of-living/zip', userData?.zipCode],
    queryFn: async () => {
      if (!userData?.zipCode) return null;
      const response = await fetch(`/api/location-cost-of-living/zip/${userData.zipCode}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch location cost of living data');
      return response.json();
    },
    enabled: !!userData?.zipCode
  });

  // Fetch college calculations to get student loan debt
  const { data: collegeCalculations, isLoading: isLoadingCollegeCalcs } = useQuery({
    queryKey: ['/api/college-calculations/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/college-calculations/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch college calculations');
      return response.json() as Promise<CollegeCalculation[]>;
    }
  });

  // Fetch career calculations to get income projection
  const { data: careerCalculations, isLoading: isLoadingCareerCalcs } = useQuery({
    queryKey: ['/api/career-calculations/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/career-calculations/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch career calculations');
      return response.json() as Promise<CareerCalculation[]>;
    }
  });
  
  // Update form values based on user profile and saved calculations
  useEffect(() => {
    // Calculate current age from birth year if available
    if (userData?.birthYear) {
      const currentAge = new Date().getFullYear() - userData.birthYear;
      setAge(currentAge);
    }
    
    // Set initial savings from financial profile
    if (financialProfile?.savingsAmount) {
      setStartingSavings(financialProfile.savingsAmount);
    }
    
    // Set student loan debt from college calculations
    if (collegeCalculations && collegeCalculations.length > 0) {
      // Find the college calculation that's included in projections
      const includedCollegeCalc = collegeCalculations.find(calc => calc.includedInProjection);
      if (includedCollegeCalc) {
        setStudentLoanDebt(includedCollegeCalc.studentLoanAmount || 0);
      }
    }
    
    // Set income from career calculations
    if (careerCalculations && careerCalculations.length > 0) {
      // Find the career calculation that's included in projections
      const includedCareerCalc = careerCalculations.find(calc => calc.includedInProjection);
      if (includedCareerCalc && includedCareerCalc.entryLevelSalary) {
        setIncome(includedCareerCalc.entryLevelSalary);
      } else if (includedCareerCalc) {
        setIncome(includedCareerCalc.projectedSalary);
      }
    }

    // Set appropriate defaults for expenses based on income and location
    if (income > 0) {
      // Base expenses on income (typically 70-80% of income)
      const baseExpenses = income * 0.75;
      
      // Apply location adjustment if available
      if (locationCostData) {
        // The values in the database are already percentages (2500 means 25x)
        // We need to convert them to proper multipliers (2500 -> 2.5)
        const expenseAdjustmentFactor = (
          ((locationCostData.housing || 0) / 100) * 0.35 + 
          ((locationCostData.food || 0) / 100) * 0.15 + 
          ((locationCostData.transportation || 0) / 100) * 0.15 + 
          ((locationCostData.healthcare || 0) / 100) * 0.1 + 
          ((locationCostData.personal_insurance || 0) / 100) * 0.1 + 
          1.0 * 0.15
        );
        
        // Make sure we're getting a reasonable result
        console.log("Expense adjustment factor:", expenseAdjustmentFactor);
        
        // Apply a more reasonable adjustment - cap it at 2.5x
        const cappedAdjustment = Math.min(expenseAdjustmentFactor, 2.5);
        setExpenses(Math.round(baseExpenses * cappedAdjustment));
      } else {
        setExpenses(Math.round(baseExpenses));
      }
    }
  }, [userData, financialProfile, collegeCalculations, careerCalculations, locationCostData, income]);
  
  // Find the included college and career calculations
  const includedCollegeCalc = collegeCalculations?.find(calc => calc.includedInProjection);
  const includedCareerCalc = careerCalculations?.find(calc => calc.includedInProjection);
  
  // Check if data is being loaded
  const isLoading = isLoadingUser || isLoadingFinancialProfile || isLoadingCollegeCalcs || isLoadingCareerCalcs || isLoadingLocationData;
  
  // Determine years based on timeframe
  const years = timeframe === "5 Years" ? 5 : timeframe === "20 Years" ? 20 : 10;
  
  // Get cost of living adjustment factor if available
  const costOfLivingFactor = locationCostData?.income_adjustment_factor || 1.0;
  
  // Generate projection data based on inputs
  const generateProjectionData = () => {
    // Calculate initial net worth (savings minus student loan debt)
    let netWorth = startingSavings - studentLoanDebt;
    
    // Properly adjust income based on cost of living - correctly apply the factor
    let currentIncome = income * costOfLivingFactor;
    
    // Use the expenses input as-is because we already adjusted it in the useEffect
    // We don't need to apply location adjustment again since it's already built into the input value
    let currentExpenses = expenses;
    
    // Ensure expenses are at least 50% of income and at most 90% as a sanity check
    currentExpenses = Math.max(currentIncome * 0.5, Math.min(currentExpenses, currentIncome * 0.9));
    
    const netWorthData = [netWorth];
    const incomeData = [currentIncome];
    const expensesData = [currentExpenses];
    const ages = [age];
    
    for (let i = 1; i <= years; i++) {
      currentIncome = Math.round(currentIncome * (1 + incomeGrowth / 100));
      currentExpenses = Math.round(currentExpenses * 1.02); // Assume 2% expense growth
      
      // Calculate annual surplus or deficit
      const annualSurplus = currentIncome - currentExpenses;
      
      // Update net worth
      netWorth += annualSurplus;
      
      // Apply student loan payments (simplified - 10 year repayment)
      if (studentLoanDebt > 0 && i <= 10) {
        const annualLoanPayment = studentLoanDebt / 10;
        netWorth -= annualLoanPayment;
      }
      
      netWorthData.push(netWorth);
      incomeData.push(currentIncome);
      expensesData.push(currentExpenses);
      ages.push(age + i);
    }
    
    return {
      netWorth: netWorthData,
      income: incomeData,
      expenses: expensesData,
      assets: netWorthData.map(nw => nw > 0 ? nw : 0),
      liabilities: netWorthData.map(nw => nw < 0 ? -nw : 0),
      ages: ages
    };
  };
  
  const projectionData = generateProjectionData();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createMainProjectionChart(ctx, projectionData, activeTab);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab, timeframe]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Financial Projections</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Projection Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Current Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <select 
                  id="timeframe"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option>5 Years</option>
                  <option>10 Years</option>
                  <option>20 Years</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="savings">Starting Savings ($)</Label>
                <Input 
                  id="savings" 
                  type="number" 
                  value={startingSavings} 
                  onChange={(e) => setStartingSavings(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="studentLoanDebt">Student Loan Debt ($)</Label>
                <Input 
                  id="studentLoanDebt" 
                  type="number" 
                  value={studentLoanDebt} 
                  onChange={(e) => setStudentLoanDebt(Number(e.target.value))} 
                  className="mt-1"
                />
                {includedCollegeCalc && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using student loan amount from {includedCollegeCalc.college?.name}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input 
                  id="income" 
                  type="number" 
                  value={income} 
                  onChange={(e) => setIncome(Number(e.target.value))} 
                  className="mt-1"
                />
                {includedCareerCalc && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using salary from {includedCareerCalc.career?.title} career
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="expenses">Annual Expenses ($)</Label>
                <Input 
                  id="expenses" 
                  type="number" 
                  value={expenses} 
                  onChange={(e) => setExpenses(Number(e.target.value))} 
                  className="mt-1"
                />
                {locationCostData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Adjusted for cost of living in {locationCostData.city || locationCostData.zip_code}
                  </p>
                )}
              </div>
              
              <div>
                <Label>Income Growth Rate: {incomeGrowth}%</Label>
                <Slider
                  value={[incomeGrowth]}
                  onValueChange={(value) => setIncomeGrowth(value[0])}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>
            
            <Button 
              className="w-full mt-6"
              onClick={async () => {
                try {
                  // Adjust income based on location, but we don't need to adjust expenses again
                  // since they're already adjusted in the UI as part of the expenses state
                  const adjustedIncome = income * (locationCostData?.income_adjustment_factor || 1.0);
                  const adjustedExpenses = expenses; // expenses is already adjusted via useEffect
                     
                  const response = await fetch('/api/financial-projections', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId,
                      projectionName: `Projection - ${new Date().toLocaleDateString()}`,
                      timeframe: years,
                      startingAge: age,
                      startingSavings,
                      income: Math.round(adjustedIncome),
                      expenses: Math.round(adjustedExpenses),
                      incomeGrowth,
                      studentLoanDebt,
                      projectionData: JSON.stringify(projectionData),
                      includesCollegeCalculation: !!includedCollegeCalc,
                      includesCareerCalculation: !!includedCareerCalc,
                      collegeCalculationId: includedCollegeCalc?.id || null,
                      careerCalculationId: includedCareerCalc?.id || null,
                      locationAdjusted: !!locationCostData,
                      locationZipCode: userData?.zipCode || null,
                      costOfLivingIndex: locationCostData ? 
                        (((locationCostData.housing || 0) / 100 * 0.35 + 
                          (locationCostData.food || 0) / 100 * 0.15 + 
                          (locationCostData.transportation || 0) / 100 * 0.15 + 
                          (locationCostData.healthcare || 0) / 100 * 0.1 + 
                          (locationCostData.personal_insurance || 0) / 100 * 0.1 + 
                          1.0 * 0.15)) : null,
                      incomeAdjustmentFactor: locationCostData?.income_adjustment_factor || null,
                    }),
                  });
                  
                  if (response.ok) {
                    alert('Projection saved successfully!');
                  } else {
                    throw new Error('Failed to save projection');
                  }
                } catch (error) {
                  console.error('Error saving projection:', error);
                  alert('Failed to save projection. Please try again.');
                }
              }}
            >
              Save Projection
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-wrap mb-4">
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('netWorth')}
              >
                Net Worth
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('income')}
              >
                Income
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'expenses' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'assets' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Assets
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'liabilities' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities
              </button>
            </div>
            
            <div className="h-96">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Net Worth at {projectionData.ages[projectionData.ages.length - 1]}</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Total Savings</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${(projectionData.netWorth[projectionData.netWorth.length - 1] - startingSavings).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Annual Savings Rate</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  {Math.round((projectionData.income[0] - projectionData.expenses[0]) / projectionData.income[0] * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Card to display location-based cost of living or 'Add Location' card if no data */}
      {locationCostData ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Location Cost of Living</h3>
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {locationCostData.city || 'Your Location'}, {locationCostData.state} ({userData?.zipCode})
                </div>
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your financial projections are adjusted based on the cost of living in your location. 
              {locationCostData.income_adjustment_factor > 1 
                ? ` This area has a ${((locationCostData.income_adjustment_factor - 1) * 100).toFixed(0)}% higher cost of living than the national average.`
                : ` This area has a ${((1 - locationCostData.income_adjustment_factor) * 100).toFixed(0)}% lower cost of living than the national average.`
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Income Adjustment</p>
                <p className="text-2xl font-medium text-primary">
                  {(locationCostData.income_adjustment_factor * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {locationCostData.income_adjustment_factor > 1 ? 'Higher' : 'Lower'} than average
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Housing Cost</p>
                <p className="text-2xl font-medium text-primary">
                  ${(locationCostData.housing || 0).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Monthly cost
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Total Monthly Cost</p>
                <p className="text-2xl font-medium text-primary">
                  ${((locationCostData.housing || 0) + 
                    (locationCostData.food || 0) + 
                    (locationCostData.transportation || 0) + 
                    (locationCostData.healthcare || 0) + 
                    (locationCostData.personal_insurance || 0) + 
                    (locationCostData.entertainment || 0) +
                    (locationCostData.services || 0)).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sum of all expense categories
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Detailed Cost Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Housing</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.housing || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.housing || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Food</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.food || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.food || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Transportation</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.transportation || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.transportation || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Healthcare</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.healthcare || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.healthcare || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Insurance</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.personal_insurance || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.personal_insurance || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Entertainment</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.entertainment || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.entertainment || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Services</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.services || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.services || 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Impact on your finances:</span> In {locationCostData.city || 'your location'}, 
                {(locationCostData.income_adjustment_factor || 0) >= 1 
                  ? ` salaries tend to be higher to compensate for the increased cost of living.`
                  : ` your expenses will be lower, but salaries may also be lower than in more expensive areas.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Location Cost of Living</h3>
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {userData?.zipCode || "No location set"}
                </div>
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
            
            <div className="py-8 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No location data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {userData?.zipCode 
                  ? `We don't have cost of living data for your current zip code (${userData.zipCode}).
                    Try changing to 94103 (San Francisco) to see data.`
                  : "Set your location to adjust financial projections based on cost of living."}
              </p>
              <div className="mt-6">
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Card to display included college and career calculations */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Included Calculations</h3>
          <p className="text-gray-600 mb-4">
            These saved calculations are factored into your financial projections.
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 ml-1">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your age is derived from birth year, student debt comes from college calculations, 
                    and starting income uses your career's entry-level salary.
                    {locationCostData && " Income and expenses are adjusted based on your location's cost of living."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* College calculation section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <School className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">College</h4>
                </div>
                
                {includedCollegeCalc ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">College:</span>
                      <span className="font-medium">{includedCollegeCalc.college?.name || "Unknown College"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Student Loan Amount:</span>
                      <span className="font-medium">{formatCurrency(includedCollegeCalc.studentLoanAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Cost:</span>
                      <span className="font-medium">{formatCurrency(includedCollegeCalc.netPrice)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <span className="text-gray-400">No college calculation included</span>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = "/net-price-calculator"}>
                        Add College Cost
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Career calculation section */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Briefcase className="h-5 w-5 text-primary mr-2" />
                  <h4 className="font-medium">Career</h4>
                </div>
                
                {includedCareerCalc ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Career:</span>
                      <span className="font-medium">{includedCareerCalc.career?.title || "Unknown Career"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Starting Salary:</span>
                      <span className="font-medium">
                        {formatCurrency(includedCareerCalc.entryLevelSalary || includedCareerCalc.projectedSalary)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Education:</span>
                      <span className="font-medium">{includedCareerCalc.education || "Not specified"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <span className="text-gray-400">No career calculation included</span>
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={() => window.location.href = "/career-builder"}>
                        Add Career
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Life Milestones Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Life Milestones</h3>
          <p className="text-gray-600 mb-4">Add major life events to see how they impact your financial projection.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <GraduationCap className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium">College Graduation</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <Briefcase className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-medium">New Job</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <svg className="h-6 w-6 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <h4 className="font-medium">Buy a Home</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <svg className="h-6 w-6 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h4 className="font-medium">Add Custom</h4>
            </div>
          </div>
          
          <Button variant="outline">Add Milestone</Button>
        </CardContent>
      </Card>
    </div>
  );
};

// UpdateLocationDialog component for changing the zip code
interface UpdateLocationDialogProps {
  userData: User | undefined;
}

const UpdateLocationDialog = ({ userData }: UpdateLocationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newZipCode, setNewZipCode] = useState(userData?.zipCode || '');
  const queryClient = useQueryClient(); // For cache invalidation

  const updateZipCodeMutation = useMutation({
    mutationFn: async (zipCode: string) => {
      const response = await fetch(`/api/users/${userData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries that depend on the user data or location data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/location-cost-of-living/zip', newZipCode] });
      setOpen(false);
    }
  });

  const handleUpdateLocation = () => {
    if (newZipCode && newZipCode.length === 5 && /^\d+$/.test(newZipCode)) {
      updateZipCodeMutation.mutate(newZipCode);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7">
          Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
          <DialogDescription>
            Change your location to recalculate financial projections based on the new cost of living.
            This change will be applied across all parts of the application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              placeholder="Enter zip code"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value)}
              maxLength={5}
              pattern="[0-9]{5}"
            />
            <p className="text-xs text-gray-500">
              Enter a valid US 5-digit zip code. Try 94103 (San Francisco) for example data.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleUpdateLocation}
            disabled={updateZipCodeMutation.isPending || !newZipCode || newZipCode.length !== 5 || !/^\d+$/.test(newZipCode)}
          >
            {updateZipCodeMutation.isPending ? "Updating..." : "Update Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialProjections;
