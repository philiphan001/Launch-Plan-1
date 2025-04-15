import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { AuthProps } from "@/interfaces/auth";
import { FinancialProjection } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Using custom Spinner component directly since the import was causing issues
const Spinner = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizeClass = {
    "sm": "h-4 w-4 border-2",
    "md": "h-8 w-8 border-4",
    "lg": "h-12 w-12 border-4",
  }[size];
  
  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClass} ${className}`}
    />
  );
};
import { toast } from "@/hooks/use-toast";
import { createMainProjectionChart, fixLiabilityCalculation } from "@/lib/charts";
import ExpenseBreakdownChart from "@/components/financial/ExpenseBreakdownChart";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import Chart from 'chart.js/auto';

/**
 * Dedicated component for viewing a single financial projection
 * This is separate from the main FinancialProjections component to avoid state conflicts
 */
const ProjectionViewer = ({ user }: AuthProps) => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [projection, setProjection] = useState<FinancialProjection | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Load the projection by ID
  useEffect(() => {
    const loadProjection = async () => {
      setIsLoading(true);
      
      try {
        if (!id) {
          throw new Error("No projection ID provided");
        }
        
        const response = await fetch(`/api/financial-projections/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load projection: ${response.status}`);
        }
        
        const data = await response.json();
        setProjection(data);
        
        // Parse the projection data which is stored as JSON (unknown type)
        const parsedData = data.projectionData ? 
          (typeof data.projectionData === 'string' ? 
            JSON.parse(data.projectionData) : data.projectionData) : null;
        
        // Initialize the chart once we have data
        setTimeout(() => {
          if (chartRef.current && parsedData) {
            if (chartInstance.current) {
              chartInstance.current.destroy();
            }
            
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
              // Create a simple demo chart if no detailed data available
              const timeframe = data.timeframe || 40;
              const startAge = data.startingAge || 20;
              const ages = Array.from({length: timeframe}, (_, i) => startAge + i);
              const income = Array.from({length: timeframe}, (_, i) => data.income * Math.pow(1 + data.incomeGrowth, i));
              const expenses = Array.from({length: timeframe}, () => data.expenses * 12);
              
              // If we have detailed results in parsed data, use them
              const chartData = {
                ages: parsedData?.ages || ages,
                netWorth: parsedData?.netWorth || 
                  Array.from({length: timeframe}, (_, i) => data.startingSavings + (income[i] - expenses[i]) * i),
                income: parsedData?.annualIncome || income,
                expenses: parsedData?.annualExpenses || expenses,
                assets: parsedData?.assets || [],
                liabilities: parsedData?.liabilities ? 
                  fixLiabilityCalculation(parsedData.liabilities) : [],
              };
              
              chartInstance.current = createMainProjectionChart(
                chartRef.current,
                chartData,
                true, // show income
                true  // show expenses
              );
            }
          }
        }, 100);
      } catch (error) {
        console.error("Error loading projection:", error);
        toast({
          title: "Error Loading Projection",
          description: error instanceof Error ? error.message : "Failed to load projection data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjection();
    
    // Cleanup chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [id]);

  const handleBackClick = () => {
    setLocation("/financial-projections");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading projection data...</p>
      </div>
    );
  }

  if (!projection) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center min-h-[30vh]">
            <h3 className="text-xl font-semibold mb-2">Projection Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested projection could not be found or has been deleted.
            </p>
            <Button onClick={handleBackClick}>Return to Projections</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projection.name || "Financial Projection"}
            </h1>
            <p className="text-muted-foreground">
              Created {formatDate(projection.createdAt || new Date().toISOString())}
            </p>
          </div>
          <Button onClick={handleBackClick} variant="outline">
            Back to Projections
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Financial Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <canvas ref={chartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Check for expenses in the projection's data */}
        {projection.projectionData && typeof projection.projectionData === 'object' && 
         (projection.projectionData as any).currentExpenses && (
          <ExpenseBreakdownChart 
            currentExpenses={(projection.projectionData as any).currentExpenses} 
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Projection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Current Age</h3>
                <p className="text-2xl font-bold">{projection.startingAge || "N/A"}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Current Income</h3>
                <p className="text-2xl font-bold">
                  {projection.income ? formatCurrency(projection.income) : "N/A"}
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Timeframe (Years)</h3>
                <p className="text-2xl font-bold">{projection.timeframe || "N/A"}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Initial Savings</h3>
                <p className="text-2xl font-bold">
                  {projection.startingSavings ? formatCurrency(projection.startingSavings) : "N/A"}
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Annual Expenses</h3>
                <p className="text-2xl font-bold">{formatCurrency(projection.expenses * 12)}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Income Growth</h3>
                <p className="text-2xl font-bold">{(projection.incomeGrowth * 100).toFixed(1)}%/year</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectionViewer;