import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Clock } from "lucide-react";

interface WelcomeCardProps {
  username?: string;
}

const WelcomeCard = ({ username = "User" }: WelcomeCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-800">
            Welcome back, {username}
          </h2>
          <p className="text-gray-600 mt-1">Continue planning your financial future</p>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Track your progress</span>
          </div>
          <div className="flex items-center text-blue-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Plan ahead</span>
          </div>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/projections">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Scenario
            </Link>
          </Button>
        </div>
        
        {/* Mobile-only button */}
        <div className="md:hidden">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/projections">
              <PlusCircle className="mr-2 h-4 w-4" /> Create
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
