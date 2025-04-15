import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { AuthProps } from "@/interfaces/auth";
import { FinancialProjection } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
        
        // Initialize the chart once we have data
        setTimeout(() => {
          if (chartRef.current && data.results) {
            if (chartInstance.current) {
              chartInstance.current.destroy();
            }
            
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
              chartInstance.current = createMainProjectionChart(
                chartRef.current,
                {
                  ages: data.results.ages || [],
                  netWorth: data.results.netWorth || [],
                  income: data.results.annualIncome || [],
                  expenses: data.results.annualExpenses || [],
                  assets: data.results.assets || [],
                  liabilities: data.results.liabilities ? fixLiabilityCalculation(data.results.liabilities) : [],
                },
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

        {projection.results?.currentExpenses && (
          <ExpenseBreakdownChart 
            currentExpenses={projection.results.currentExpenses} 
            title="Current Monthly Expenses" 
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
                <p className="text-2xl font-bold">{projection.currentAge || "N/A"}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Current Income</h3>
                <p className="text-2xl font-bold">
                  {projection.income ? formatCurrency(projection.income) : "N/A"}
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Retirement Age</h3>
                <p className="text-2xl font-bold">{projection.retirementAge || "N/A"}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Initial Savings</h3>
                <p className="text-2xl font-bold">
                  {projection.initialSavings ? formatCurrency(projection.initialSavings) : "N/A"}
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Career Field</h3>
                <p className="text-2xl font-bold">{projection.careerField || "N/A"}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                <p className="text-2xl font-bold">{projection.location || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default ProjectionViewer;