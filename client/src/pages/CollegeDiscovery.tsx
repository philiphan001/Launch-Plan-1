import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";

interface College {
  id: string;
  name: string;
  rating: number;
  location: string;
  state: string;
  type: string;
  tuition: number;
  acceptanceRate: number;
  isInState?: boolean;
  rank?: number;
  size: "small" | "medium" | "large";
}

const CollegeDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [maxTuition, setMaxTuition] = useState(60000);
  const [acceptanceRange, setAcceptanceRange] = useState([0, 100]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  
  const { data: colleges, isLoading } = useQuery({
    queryKey: ['/api/colleges'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [] as College[];
    },
    // Disable actual fetching for now
    enabled: false
  });
  
  const defaultColleges: College[] = [
    {
      id: "1",
      name: "University of Washington",
      rating: 4.5,
      location: "Seattle, WA",
      state: "WA",
      type: "Public Research",
      tuition: 11465,
      acceptanceRate: 70,
      isInState: true,
      rank: 58,
      size: "large"
    },
    {
      id: "2",
      name: "Stanford University",
      rating: 4.8,
      location: "Stanford, CA",
      state: "CA",
      type: "Private Research",
      tuition: 56169,
      acceptanceRate: 5,
      isInState: false,
      rank: 3,
      size: "medium"
    },
    {
      id: "3",
      name: "Harvard University",
      rating: 4.9,
      location: "Cambridge, MA",
      state: "MA",
      type: "Private Research",
      tuition: 55587,
      acceptanceRate: 4,
      isInState: false,
      rank: 1,
      size: "medium"
    },
    {
      id: "4",
      name: "Massachusetts Institute of Technology",
      rating: 4.9,
      location: "Cambridge, MA",
      state: "MA",
      type: "Private Research",
      tuition: 57590,
      acceptanceRate: 7,
      isInState: false,
      rank: 2,
      size: "medium"
    },
    {
      id: "5",
      name: "University of California, Berkeley",
      rating: 4.7,
      location: "Berkeley, CA",
      state: "CA",
      type: "Public Research",
      tuition: 14226,
      acceptanceRate: 16,
      isInState: true,
      rank: 22,
      size: "large"
    },
    {
      id: "6",
      name: "Williams College",
      rating: 4.7,
      location: "Williamstown, MA",
      state: "MA",
      type: "Private Liberal Arts",
      tuition: 58780,
      acceptanceRate: 13,
      isInState: false,
      rank: 1,
      size: "small"
    },
    {
      id: "7",
      name: "Community College of Seattle",
      rating: 3.9,
      location: "Seattle, WA",
      state: "WA",
      type: "Community College",
      tuition: 3690,
      acceptanceRate: 100,
      isInState: true,
      size: "medium"
    },
    {
      id: "8",
      name: "University of Michigan",
      rating: 4.6,
      location: "Ann Arbor, MI",
      state: "MI",
      type: "Public Research",
      tuition: 15948,
      acceptanceRate: 23,
      isInState: false,
      rank: 23,
      size: "large"
    }
  ];
  
  const collegeList = colleges || defaultColleges;
  
  // Extract unique types, states and sizes
  const types = [...new Set(collegeList.map(college => college.type))];
  const states = [...new Set(collegeList.map(college => college.state))];
  const sizes = [...new Set(collegeList.map(college => college.size))];
  
  // Filter colleges based on search and filters
  const filteredColleges = collegeList.filter(college => {
    const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          college.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTuition = college.tuition <= maxTuition;
    const matchesAcceptance = college.acceptanceRate >= acceptanceRange[0] && college.acceptanceRate <= acceptanceRange[1];
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(college.type);
    const matchesState = selectedStates.length === 0 || selectedStates.includes(college.state);
    const matchesSize = selectedSizes.length === 0 || selectedSizes.includes(college.size);
    
    return matchesSearch && matchesTuition && matchesAcceptance && matchesType && matchesState && matchesSize;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">College Discovery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>Maximum Tuition: ${maxTuition.toLocaleString()}</Label>
                  <Slider
                    value={[maxTuition]}
                    onValueChange={(value) => setMaxTuition(value[0])}
                    min={0}
                    max={60000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Acceptance Rate: {acceptanceRange[0]}% - {acceptanceRange[1]}%</Label>
                  <Slider
                    value={acceptanceRange}
                    onValueChange={(value) => setAcceptanceRange(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">College Type</Label>
                  <div className="space-y-2">
                    {types.map(type => (
                      <div key={type} className="flex items-center">
                        <Checkbox 
                          id={`type-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`type-${type}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">States</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {states.map(state => (
                      <div key={state} className="flex items-center">
                        <Checkbox 
                          id={`state-${state}`}
                          checked={selectedStates.includes(state)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStates([...selectedStates, state]);
                            } else {
                              setSelectedStates(selectedStates.filter(s => s !== state));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`state-${state}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {state}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">College Size</Label>
                  <div className="space-y-2">
                    {sizes.map(size => (
                      <div key={size} className="flex items-center">
                        <Checkbox 
                          id={`size-${size}`}
                          checked={selectedSizes.includes(size)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSizes([...selectedSizes, size]);
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`size-${size}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMaxTuition(60000);
                    setAcceptanceRange([0, 100]);
                    setSelectedTypes([]);
                    setSelectedStates([]);
                    setSelectedSizes([]);
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <span className="material-icons absolute left-3 top-2.5 text-gray-400">search</span>
              <Input 
                placeholder="Search colleges..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredColleges.length > 0 ? (
              filteredColleges.map((college) => (
                <Card key={college.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{college.name}</h4>
                      <div className="flex items-center">
                        <span className="material-icons text-accent text-sm">star</span>
                        <span className="text-sm text-gray-600 ml-1">{college.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{college.location} • {college.type}</p>
                    <div className="flex flex-wrap items-center mt-2">
                      <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                        <span className="material-icons text-xs mr-1">payments</span>
                        ${college.tuition.toLocaleString()}{college.isInState ? ' in-state' : ''}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                        <span className="material-icons text-xs mr-1">school</span>
                        {college.acceptanceRate}% acceptance
                      </div>
                      {college.rank && (
                        <div className="flex items-center text-xs text-gray-500 mb-1">
                          <span className="material-icons text-xs mr-1">emoji_events</span>
                          Rank: #{college.rank}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm">Add to Favorites</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">school_off</span>
                  <h3 className="text-lg font-medium text-gray-700">No colleges found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {filteredColleges.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeDiscovery;
