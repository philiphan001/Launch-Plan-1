import ScenariosSection from "@/components/dashboard/ScenariosSection";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { User, AuthProps } from "@/interfaces/auth";

interface DashboardProps extends AuthProps {}

const Dashboard = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}: DashboardProps) => {
  // Use the user's name from props if available, otherwise use a default
  // Using firstName as name property isn't available
  const [username, setUsername] = useState(user?.firstName || user?.username || "User");
  
  // Update username when user changes
  useEffect(() => {
    if (user?.firstName || user?.username) {
      setUsername(user.firstName || user.username || "User");
    }
  }, [user]);

  // Example of how we would fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return {
        username: "Philip",
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
      {/* Pass username to ScenariosSection for the welcome message */}
      <ScenariosSection userId={user?.id} username={username} />
    </div>
  );
};

export default Dashboard;
