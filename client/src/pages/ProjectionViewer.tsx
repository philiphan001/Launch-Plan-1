import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { AuthProps } from "@/interfaces/auth";
import { createMainProjectionChart, fixLiabilityCalculation } from "@/lib/charts";
import ExpenseBreakdownChart from "@/components/financial/ExpenseBreakdownChart";
import { Spinner } from "@/components/ui/spinner";
import { FinancialProjection } from "@shared/schema";
import Chart from 'chart.js/auto';

interface ProjectionDetail extends FinancialProjection {
  projectionData: any;
}

const ProjectionViewer = ({ user }: AuthProps) => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [projection, setProjection] = useState<ProjectionDetail | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { toast } = useToast();
  
  // Fetch projection data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Add cache-busting timestamp
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/financial-projections/detail/${id}?_=${timestamp}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projection: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate data
        if (!data || !data.projectionData) {
          throw new Error("Invalid projection data");
        }
        
        // Parse projectionData if it's a string
        let parsedData;
        if (typeof data.projectionData === 'string') {
          try {
            parsedData = JSON.parse(data.projectionData);
            // Check if it's still a string (double-stringified)
            if (typeof parsedData === 'string') {
              parsedData = JSON.parse(parsedData);
            }
          } catch (e) {
            console.error("Error parsing projection data:", e);
            parsedData = { error: "Invalid data format" };
          }
        } else {
          parsedData = data.projectionData;
        }
        
        // Set the data with parsed projection data
        setProjection({
          ...data,
          projectionData: parsedData
        });
        
      } catch (error) {
        console.error("Error loading projection:", error);
        toast({
          title: "Error",
          description: "Failed to load projection data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id, toast]);
  
  // Create chart when data is available
  useEffect(() => {
    if (chartRef.current && projection?.projectionData) {
      // Cleanup previous chart instance
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      
      try {
        const projData = projection.projectionData;
        
        // Ensure data arrays exist before creating chart
        if (!Array.isArray(projData.ages) || !Array.isArray(projData.netWorth)) {
          console.error("Invalid projection data arrays:", projData);
          return;
        }
        
        // Create chart with validated data
        chartInstance.current = createMainProjectionChart(
          chartRef.current,
          {
            ages: Array.isArray(projData.ages) ? projData.ages : [],
            netWorth: Array.isArray(projData.netWorth) ? projData.netWorth : [],
            income: Array.isArray(projData.income) ? projData.income : [],
            expenses: Array.isArray(projData.expenses) ? projData.expenses : [],
            assets: Array.isArray(projData.assets) ? projData.assets : [],
            liabilities: Array.isArray(projData.liabilities) ? fixLiabilityCalculation(projData.liabilities) : []
          },
          true, // Show income
          true  // Show expenses
        );
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [projection]);
  
  const handleBackClick = () => {
    setLocation("/projections");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!projection) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBackClick} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projections
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-medium text-gray-600">Projection Not Found</h3>
              <p className="mt-2 text-gray-500">The requested projection could not be loaded</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Safely access expense categories
  const currentExpenses = projection.projectionData.expenseCategories?.[0] || {
    housing: 0,
    transportation: 0, 
    food: 0,
    healthcare: 0,
    education: 0,
    debt: 0,
    childcare: 0,
    discretionary: 0,
    taxes: 0
  };
  
  return (
    <div className="p-6">
      <Button variant="outline" onClick={handleBackClick} className="mb-4">
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projections
      </Button>
      
      <div className="mb-4">
        <h2 className="text-2xl font-bold">{projection.name}</h2>
        <p className="text-gray-500">Created on {typeof projection.createdAt === 'string' ? new Date(projection.createdAt).toLocaleDateString() : 'Unknown'}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Financial Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={chartRef} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Projection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-500">Starting Age:</span>
                <span className="font-medium">{projection.startingAge}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Initial Savings:</span>
                <span className="font-medium">${projection.startingSavings?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Income:</span>
                <span className="font-medium">${projection.income?.toLocaleString()} /year</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Expenses:</span>
                <span className="font-medium">${projection.expenses?.toLocaleString()} /year</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Income Growth:</span>
                <span className="font-medium">{projection.incomeGrowth}% /year</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Student Loan Debt:</span>
                <span className="font-medium">${projection.studentLoanDebt?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Emergency Fund:</span>
                <span className="font-medium">${projection.emergencyFundAmount?.toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-500">Timeframe:</span>
                <span className="font-medium">{projection.timeframe} years</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpenseBreakdownChart 
          currentExpenses={currentExpenses} 
        />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Projection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(projection.projectionData.netWorth) && (
                <div>
                  <h4 className="font-medium">Net Worth Growth</h4>
                  <p className="text-gray-600">
                    Starting: ${projection.projectionData.netWorth[0]?.toLocaleString() || 0}
                  </p>
                  <p className="text-gray-600">
                    Ending: ${projection.projectionData.netWorth[projection.projectionData.netWorth.length - 1]?.toLocaleString() || 0}
                  </p>
                </div>
              )}
              
              {Array.isArray(projection.projectionData.cashFlow) && (
                <div>
                  <h4 className="font-medium">Cash Flow</h4>
                  <p className="text-gray-600">
                    Average: ${(projection.projectionData.cashFlow.reduce((sum: number, val: number) => sum + val, 0) / 
                      projection.projectionData.cashFlow.length).toLocaleString(undefined, {maximumFractionDigits: 0})} /year
                  </p>
                </div>
              )}
              
              {projection.projectionData.personalLoans && Array.isArray(projection.projectionData.personalLoans) && (
                <div>
                  <h4 className="font-medium">Personal Loans Created</h4>
                  <p className="text-gray-600">
                    Count: {projection.projectionData.personalLoans.length}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectionViewer;