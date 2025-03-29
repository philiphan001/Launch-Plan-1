import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

interface Career {
  id: string;
  title: string;
  salary: number;
  description: string;
  growthRate: "fast" | "stable" | "slow";
  education: string;
  category: string;
}

const CareerExploration = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedGrowth, setSelectedGrowth] = useState<string[]>([]);
  
  const { data: careers, isLoading } = useQuery({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [
        {
          id: "1",
          title: "Software Developer",
          salary: 107510,
          description: "Design, develop, and test software applications",
          growthRate: "fast",
          education: "Bachelor's",
          category: "Technology"
        },
        {
          id: "2",
          title: "Financial Analyst",
          salary: 83660,
          description: "Analyze financial data and market trends",
          growthRate: "stable",
          education: "Bachelor's",
          category: "Finance"
        },
        {
          id: "3",
          title: "Registered Nurse",
          salary: 75330,
          description: "Provide and coordinate patient care",
          growthRate: "fast",
          education: "Bachelor's",
          category: "Healthcare"
        },
        {
          id: "4",
          title: "Marketing Manager",
          salary: 142170,
          description: "Plan and direct marketing programs",
          growthRate: "stable",
          education: "Bachelor's",
          category: "Marketing"
        },
        {
          id: "5",
          title: "Electrical Engineer",
          salary: 103390,
          description: "Design, develop, and test electrical equipment",
          growthRate: "stable",
          education: "Bachelor's",
          category: "Engineering"
        },
        {
          id: "6",
          title: "Data Scientist",
          salary: 100910,
          description: "Analyze and interpret complex data",
          growthRate: "fast",
          education: "Master's",
          category: "Technology"
        },
        {
          id: "7",
          title: "Graphic Designer",
          salary: 53380,
          description: "Create visual concepts for various media",
          growthRate: "slow",
          education: "Bachelor's",
          category: "Arts"
        },
        {
          id: "8",
          title: "Physical Therapist",
          salary: 91010,
          description: "Help patients improve movement and manage pain",
          growthRate: "fast",
          education: "Doctoral",
          category: "Healthcare"
        }
      ] as Career[];
    },
    // Disable actual fetching for now
    enabled: false
  });
  
  const defaultCareers: Career[] = [
    {
      id: "1",
      title: "Software Developer",
      salary: 107510,
      description: "Design, develop, and test software applications",
      growthRate: "fast",
      education: "Bachelor's",
      category: "Technology"
    },
    {
      id: "2",
      title: "Financial Analyst",
      salary: 83660,
      description: "Analyze financial data and market trends",
      growthRate: "stable",
      education: "Bachelor's",
      category: "Finance"
    },
    {
      id: "3",
      title: "Registered Nurse",
      salary: 75330,
      description: "Provide and coordinate patient care",
      growthRate: "fast",
      education: "Bachelor's",
      category: "Healthcare"
    },
    {
      id: "4",
      title: "Marketing Manager",
      salary: 142170,
      description: "Plan and direct marketing programs",
      growthRate: "stable",
      education: "Bachelor's",
      category: "Marketing"
    },
    {
      id: "5",
      title: "Electrical Engineer",
      salary: 103390,
      description: "Design, develop, and test electrical equipment",
      growthRate: "stable",
      education: "Bachelor's",
      category: "Engineering"
    },
    {
      id: "6",
      title: "Data Scientist",
      salary: 100910,
      description: "Analyze and interpret complex data",
      growthRate: "fast",
      education: "Master's",
      category: "Technology"
    },
    {
      id: "7",
      title: "Graphic Designer",
      salary: 53380,
      description: "Create visual concepts for various media",
      growthRate: "slow",
      education: "Bachelor's",
      category: "Arts"
    },
    {
      id: "8",
      title: "Physical Therapist",
      salary: 91010,
      description: "Help patients improve movement and manage pain",
      growthRate: "fast",
      education: "Doctoral",
      category: "Healthcare"
    }
  ];
  
  const careerList = careers || defaultCareers;
  
  // Extract unique categories, education levels and growth rates
  const categories = [...new Set(careerList.map(career => career.category))];
  const educationLevels = [...new Set(careerList.map(career => career.education))];
  const growthRates = [...new Set(careerList.map(career => career.growthRate))];
  
  // Filter careers based on search and filters
  const filteredCareers = careerList.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          career.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSalary = career.salary >= minSalary;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(career.category);
    const matchesEducation = selectedEducation.length === 0 || selectedEducation.includes(career.education);
    const matchesGrowth = selectedGrowth.length === 0 || selectedGrowth.includes(career.growthRate);
    
    return matchesSearch && matchesSalary && matchesCategory && matchesEducation && matchesGrowth;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Career Exploration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="minSalary">Minimum Salary</Label>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">$</span>
                    <Input 
                      id="minSalary" 
                      type="number" 
                      value={minSalary} 
                      onChange={(e) => setMinSalary(Number(e.target.value))} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Categories</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Education Required</Label>
                  <div className="space-y-2">
                    {educationLevels.map(education => (
                      <div key={education} className="flex items-center">
                        <Checkbox 
                          id={`education-${education}`}
                          checked={selectedEducation.includes(education)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedEducation([...selectedEducation, education]);
                            } else {
                              setSelectedEducation(selectedEducation.filter(e => e !== education));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`education-${education}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {education}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Growth Rate</Label>
                  <div className="space-y-2">
                    {growthRates.map(rate => (
                      <div key={rate} className="flex items-center">
                        <Checkbox 
                          id={`growth-${rate}`}
                          checked={selectedGrowth.includes(rate)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGrowth([...selectedGrowth, rate]);
                            } else {
                              setSelectedGrowth(selectedGrowth.filter(g => g !== rate));
                            }
                          }}
                        />
                        <label 
                          htmlFor={`growth-${rate}`}
                          className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {rate === 'fast' ? 'Growing fast' : rate === 'stable' ? 'Stable growth' : 'Slow growth'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMinSalary(0);
                    setSelectedCategories([]);
                    setSelectedEducation([]);
                    setSelectedGrowth([]);
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
                placeholder="Search careers..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredCareers.length > 0 ? (
              filteredCareers.map((career) => (
                <Card key={career.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{career.title}</h4>
                      <span className="text-sm font-mono text-gray-600">${career.salary.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{career.description}</p>
                    <div className="flex flex-wrap items-center mt-2">
                      <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                        <span className="material-icons text-xs mr-1">trending_up</span>
                        {career.growthRate === 'fast' ? 'Growing fast' : career.growthRate === 'stable' ? 'Stable growth' : 'Slow growth'}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                        <span className="material-icons text-xs mr-1">school</span>
                        {career.education}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <span className="material-icons text-xs mr-1">category</span>
                        {career.category}
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline">More Details</Button>
                      <Button size="sm">Add to Favorites</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <span className="material-icons text-gray-400 text-4xl mb-2">search_off</span>
                  <h3 className="text-lg font-medium text-gray-700">No careers found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          {filteredCareers.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerExploration;
