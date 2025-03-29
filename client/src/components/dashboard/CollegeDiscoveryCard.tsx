import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

interface College {
  id: string;
  name: string;
  rating: number;
  location: string;
  type: string;
  tuition: number;
  acceptanceRate: number;
  isInState?: boolean;
}

interface CollegeDiscoveryCardProps {
  colleges?: College[];
  onSearch?: (query: string) => void;
}

const CollegeDiscoveryCard = ({ 
  colleges = [
    {
      id: "1",
      name: "University of Washington",
      rating: 4.5,
      location: "Seattle, WA",
      type: "Public Research University",
      tuition: 11465,
      acceptanceRate: 70,
      isInState: true
    },
    {
      id: "2",
      name: "Stanford University",
      rating: 4.8,
      location: "Stanford, CA",
      type: "Private Research University",
      tuition: 56169,
      acceptanceRate: 5,
      isInState: false
    }
  ],
  onSearch = () => {}
}: CollegeDiscoveryCardProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700">College Discovery</h3>
        <Link href="/colleges">
          <a className="text-primary hover:text-primary-dark text-sm">View All</a>
        </Link>
      </div>
      <CardContent className="px-6 py-4">
        <div className="mb-4">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search colleges..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {colleges.map((college) => (
            <div 
              key={college.id} 
              className="rounded-lg border border-gray-200 p-4 hover:border-primary cursor-pointer transition-colors"
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{college.name}</h4>
                <div className="flex items-center">
                  <span className="material-icons text-accent text-sm">star</span>
                  <span className="text-sm text-gray-600 ml-1">{college.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-1">{college.location} • {college.type}</p>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-xs text-gray-500 mr-4">
                  <span className="material-icons text-xs mr-1">payments</span>
                  ${college.tuition.toLocaleString()}{college.isInState ? ' in-state' : ''}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="material-icons text-xs mr-1">school</span>
                  {college.acceptanceRate}% acceptance
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
          Load More Colleges
        </button>
      </CardContent>
    </Card>
  );
};

export default CollegeDiscoveryCard;
