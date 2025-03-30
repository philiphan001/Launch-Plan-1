import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface Career {
  id: string;
  title: string;
  salary: number;
  description: string;
  growthRate: "fast" | "stable" | "slow";
  education: string;
}

interface CareerExplorationCardProps {
  careers?: Career[];
  onSearch?: (query: string) => void;
}

const CareerExplorationCard = ({ 
  careers = [
    {
      id: "1",
      title: "Software Developer",
      salary: 107510,
      description: "Design, develop, and test software applications",
      growthRate: "fast",
      education: "Bachelor's"
    },
    {
      id: "2",
      title: "Financial Analyst",
      salary: 83660,
      description: "Analyze financial data and market trends",
      growthRate: "stable",
      education: "Bachelor's"
    }
  ],
  onSearch = () => {}
}: CareerExplorationCardProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">Career Exploration</h3>
        <div className="flex items-center space-x-4">
          <Link href="/career-builder">
            <a className="text-primary hover:text-primary-dark text-sm flex items-center">
              <span className="material-icons text-xs mr-1">auto_awesome</span>
              AI Builder
            </a>
          </Link>
          <Link href="/careers">
            <a className="text-primary hover:text-primary-dark text-sm">View All</a>
          </Link>
        </div>
      </div>
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search careers..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {careers.map((career) => (
            <div 
              key={career.id} 
              className="rounded-lg border border-gray-200 p-4 hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{career.title}</h4>
                <span className="text-sm font-mono text-gray-600">${career.salary.toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1">{career.description}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-xs text-gray-500 mr-4">
                  <span className="material-icons text-xs mr-1">trending_up</span>
                  {career.growthRate === 'fast' ? 'Growing fast' : career.growthRate === 'stable' ? 'Stable growth' : 'Slow growth'}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="material-icons text-xs mr-1">school</span>
                  {career.education}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
          Load More Careers
        </button>
      </CardContent>
    </Card>
  );
};

export default CareerExplorationCard;
