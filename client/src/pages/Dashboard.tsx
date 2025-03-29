import WelcomeCard from "@/components/dashboard/WelcomeCard";
import NetWorthCard from "@/components/dashboard/NetWorthCard";
import CashFlowCard from "@/components/dashboard/CashFlowCard";
import MilestonesCard from "@/components/dashboard/MilestonesCard";
import ProjectionSection from "@/components/dashboard/ProjectionSection";
import CareerExplorationCard from "@/components/dashboard/CareerExplorationCard";
import CollegeDiscoveryCard from "@/components/dashboard/CollegeDiscoveryCard";
import PathwaysSection from "@/components/dashboard/PathwaysSection";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Dashboard = () => {
  const [username, setUsername] = useState("Alex");

  // Example of how we would fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        username: "Alex",
        netWorth: {
          projectedAmount: 127540,
          percentageChange: 12.4,
          chartData: [
            { age: 22, netWorth: 5000 },
            { age: 23, netWorth: 12000 },
            { age: 24, netWorth: -15000 },
            { age: 25, netWorth: -8000 },
            { age: 26, netWorth: 15000 },
            { age: 27, netWorth: 48000 },
            { age: 28, netWorth: 78000 },
            { age: 29, netWorth: 102000 },
            { age: 30, netWorth: 127540 },
          ]
        },
        cashFlow: {
          annualAmount: 5260,
          income: 62400,
          expenses: 57140,
          chartData: [
            { age: 22, income: 24000, expenses: 22000 },
            { age: 23, income: 25000, expenses: 24000 },
            { age: 24, income: 30000, expenses: 45000 },
            { age: 25, income: 62000, expenses: 58000 },
            { age: 26, income: 65000, expenses: 59000 },
            { age: 27, income: 68000, expenses: 60000 },
            { age: 28, income: 72000, expenses: 62000 },
            { age: 29, income: 76000, expenses: 63000 },
            { age: 30, income: 80000, expenses: 65000 },
          ]
        },
        // Other dashboard data would go here
      };
    },
    // Disable actual fetching for now
    enabled: false
  });

  return (
    <div className="max-w-7xl mx-auto">
      <WelcomeCard username={username} />
      
      <div className="mb-6">
        <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NetWorthCard 
            projectedNetWorth={127540}
            percentageChange={12.4}
          />
          <CashFlowCard 
            annualCashFlow={5260}
            income={62400}
            expenses={57140}
          />
          <MilestonesCard 
            milestones={[
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
            ]}
          />
        </div>
      </div>
      
      <ProjectionSection />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CareerExplorationCard />
        <CollegeDiscoveryCard />
      </div>
      
      <PathwaysSection />
    </div>
  );
};

export default Dashboard;
