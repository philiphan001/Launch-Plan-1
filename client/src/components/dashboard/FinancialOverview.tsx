import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import CashFlowCard from "@/components/dashboard/CashFlowCard";
import MilestonesCard from "@/components/dashboard/MilestonesCard";

interface FinancialOverviewProps {
  userId?: number;
  projections?: any; // This would be typed properly in a real app
}

const FinancialOverview = ({ userId, projections }: FinancialOverviewProps) => {
  const [activeScenario, setActiveScenario] = useState<string>("overall");
  
  // In a real app, this data would come from the API
  const scenarioOptions = [
    { id: "overall", name: "Overall Financial Position" },
    { id: "education", name: "Education Path" },
    { id: "career", name: "Career Path" },
    { id: "personal", name: "Personal Path (Marriage, Home)" }
  ];
  
  // For demo purposes, we're using static data
  const financialData = {
    overall: {
      netWorth: {
        projectedNetWorth: 127540,
        percentageChange: 12.4
      },
      cashFlow: {
        annualCashFlow: 5260,
        income: 62400,
        expenses: 57140
      },
      milestones: [
        {
          id: "1",
          type: "school",
          title: "College Graduation",
          date: "May 2024",
          yearsAway: 2,
        },
        {
          id: "2",
          type: "work",
          title: "First Job",
          date: "June 2024",
          yearsAway: 2,
        },
        {
          id: "3",
          type: "home",
          title: "Buy First Home",
          date: "March 2028",
          yearsAway: 6,
        },
      ]
    },
    education: {
      netWorth: {
        projectedNetWorth: 85000,
        percentageChange: -4.2
      },
      cashFlow: {
        annualCashFlow: -15200,
        income: 28000,
        expenses: 43200
      },
      milestones: [
        {
          id: "1",
          type: "school",
          title: "College Graduation",
          date: "May 2024",
          yearsAway: 2,
        },
        {
          id: "4",
          type: "school",
          title: "Graduate School Start",
          date: "September 2026",
          yearsAway: 4,
        },
        {
          id: "5",
          type: "school",
          title: "Graduate School Completion",
          date: "May 2028",
          yearsAway: 6,
        }
      ]
    },
    career: {
      netWorth: {
        projectedNetWorth: 156800,
        percentageChange: 18.7
      },
      cashFlow: {
        annualCashFlow: 22400,
        income: 76800,
        expenses: 54400
      },
      milestones: [
        {
          id: "2",
          type: "work",
          title: "First Job",
          date: "June 2024",
          yearsAway: 2,
        },
        {
          id: "6",
          type: "work",
          title: "First Promotion",
          date: "June 2026",
          yearsAway: 4,
        },
        {
          id: "7",
          type: "work",
          title: "Career Change",
          date: "January 2029",
          yearsAway: 7,
        }
      ]
    },
    personal: {
      netWorth: {
        projectedNetWorth: 108600,
        percentageChange: 6.3
      },
      cashFlow: {
        annualCashFlow: -3800,
        income: 62400,
        expenses: 66200
      },
      milestones: [
        {
          id: "3",
          type: "home",
          title: "Buy First Home",
          date: "March 2028",
          yearsAway: 6,
        },
        {
          id: "8",
          type: "family",
          title: "Marriage",
          date: "June 2026",
          yearsAway: 4,
        },
        {
          id: "9",
          type: "family",
          title: "First Child",
          date: "August 2029",
          yearsAway: 7,
        }
      ]
    }
  };
  
  const currentData = financialData[activeScenario as keyof typeof financialData];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">Financial Overview</h2>
      
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="overall" value={activeScenario} onValueChange={setActiveScenario}>
            <TabsList className="mb-4 w-full grid grid-cols-4">
              {scenarioOptions.map(option => (
                <TabsTrigger key={option.id} value={option.id}>
                  {option.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.keys(financialData).map(key => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <NetWorthCard 
                    projectedNetWorth={financialData[key as keyof typeof financialData].netWorth.projectedNetWorth}
                    percentageChange={financialData[key as keyof typeof financialData].netWorth.percentageChange}
                  />
                  <CashFlowCard 
                    annualCashFlow={financialData[key as keyof typeof financialData].cashFlow.annualCashFlow}
                    income={financialData[key as keyof typeof financialData].cashFlow.income}
                    expenses={financialData[key as keyof typeof financialData].cashFlow.expenses}
                  />
                  <MilestonesCard 
                    milestones={financialData[key as keyof typeof financialData].milestones}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;