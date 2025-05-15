import { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { ProjectionData } from "@/lib/types";
import { ensureValidProjectionData } from "@/lib/validateProjectionData";

interface TaxBreakdownChartProps {
  projectionData: ProjectionData;
  isLoading?: boolean;
}

const TaxBreakdownChart = ({ projectionData, isLoading }: TaxBreakdownChartProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [activeTab, setActiveTab] = useState<"breakdown" | "rates">("breakdown");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    try {
      // Reset error state
      setError(null);

      // Validate projection data
      const validData = ensureValidProjectionData(projectionData);
      
      // Destroy any existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      
      const ctx = chartRef.current.getContext("2d");
      if (!ctx) {
        setError("Could not get chart context");
        return;
      }
      
      // Type assertion to handle dynamic fields not in the type definition
      const data = validData as any;
      
      // Check if we have any tax data at all
      const hasTaxData = data.federalTax?.length > 0 || data.stateTax?.length > 0 || data.payrollTax?.length > 0;
      const hasRateData = data.effectiveTaxRate?.length > 0 || data.marginalTaxRate?.length > 0;
      
      if (!hasTaxData && !hasRateData) {
        setError("No tax data available");
        return;
      }
      
      const years = data.ages.map((age: number) => age.toString());
      
      if (activeTab === "breakdown") {
        // Initialize arrays with zeros if they don't exist
        const federalTax = data.federalTax || Array(years.length).fill(0);
        const stateTax = data.stateTax || Array(years.length).fill(0);
        const payrollTax = data.payrollTax || Array(years.length).fill(0);
        const retirementContribution = data.retirementContribution || Array(years.length).fill(0);
        
        // Tax breakdown chart
        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: years,
            datasets: [
              {
                label: "Federal Tax",
                data: federalTax,
                backgroundColor: "rgba(54, 162, 235, 0.7)",
                borderRadius: 4,
                stack: "tax",
              },
              {
                label: "State Tax",
                data: stateTax,
                backgroundColor: "rgba(75, 192, 192, 0.7)",
                borderRadius: 4,
                stack: "tax",
              },
              {
                label: "Payroll Tax",
                data: payrollTax,
                backgroundColor: "rgba(153, 102, 255, 0.7)",
                borderRadius: 4,
                stack: "tax",
              },
              {
                label: "Retirement Contributions",
                data: retirementContribution,
                backgroundColor: "rgba(255, 205, 86, 0.7)",
                borderRadius: 4,
                stack: "tax",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Tax & Retirement Breakdown",
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${formatCurrency(context.raw as number)}`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Age",
                },
                stacked: true,
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: "Amount ($)",
                },
                ticks: {
                  callback: function (value) {
                    return formatCurrency(value as number);
                  },
                },
              },
            },
          },
        });
      } else {
        // Initialize arrays with zeros if they don't exist
        const effectiveTaxRate = data.effectiveTaxRate || Array(years.length).fill(0);
        const marginalTaxRate = data.marginalTaxRate || Array(years.length).fill(0);
        
        // Tax rates chart
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: years,
            datasets: [
              {
                label: "Effective Tax Rate",
                data: effectiveTaxRate,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.1)",
                tension: 0.4,
                fill: false,
                pointRadius: 3,
                yAxisID: "y",
              },
              {
                label: "Marginal Tax Rate",
                data: marginalTaxRate,
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.1)",
                tension: 0.4,
                fill: false,
                pointRadius: 3,
                yAxisID: "y",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Tax Rates Over Time",
                font: {
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const value = context.raw as number;
                    return `${context.dataset.label}: ${(value * 100).toFixed(1)}%`;
                  },
                },
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Age",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Tax Rate (%)",
                },
                ticks: {
                  callback: function (value) {
                    return (Number(value) * 100).toFixed(0) + "%";
                  },
                },
                suggestedMin: 0,
                suggestedMax: 0.5, // 50% as the max scale
              },
            },
          },
        });
      }
    } catch (error) {
      console.error("Error creating tax breakdown chart:", error);
      setError("Error creating chart");
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab, isLoading]);

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-primary">
          Tax Analysis
        </CardTitle>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "breakdown" | "rates")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
            <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          {error ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>{error}</p>
            </div>
          ) : (
            <canvas ref={chartRef} />
          )}
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            {activeTab === "breakdown" 
              ? "This chart shows your tax obligations and retirement contributions over time. These values are directly related to your income and filing status."
              : "The effective tax rate represents the total percentage of your income paid in taxes. The marginal tax rate shows the tax rate on your last dollar earned."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxBreakdownChart;