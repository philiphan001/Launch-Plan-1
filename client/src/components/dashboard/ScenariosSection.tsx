import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "wouter";
import ScenarioCard, { ScenarioData } from "./ScenarioCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScenariosSectionProps {
  userId?: number;
}

const ScenariosSection = ({ userId }: ScenariosSectionProps) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [scenariosToCompare, setScenariosToCompare] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  // Fetch user scenarios
  const { data: scenarios = [], isLoading } = useQuery<ScenarioData[]>({
    queryKey: ['/api/financial-projections/user', userId],
    // For demo purposes, we're using a placeholder here
    // In a real app, this would be fetched from the API
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock data
      return [
        {
          id: 1,
          title: "Software Developer Path",
          description: "4-year CS degree + Software Developer career in Seattle",
          tags: {
            education: "University of Washington (CS)",
            career: "Software Developer",
            location: "Seattle, WA"
          },
          projectionData: {
            netWorth: [5000, 12000, -15000, -8000, 15000, 48000, 78000, 102000, 127540, 156000],
            income: [24000, 25000, 30000, 62000, 65000, 68000, 72000, 76000, 80000, 85000],
            expenses: [22000, 24000, 45000, 58000, 59000, 60000, 62000, 63000, 65000, 68000],
            ages: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
          }
        },
        {
          id: 2,
          title: "Healthcare Professional",
          description: "Nursing degree + Registered Nurse career in Portland",
          tags: {
            education: "Oregon Health & Science University",
            career: "Registered Nurse",
            location: "Portland, OR"
          },
          projectionData: {
            netWorth: [2000, 5000, -12000, -5000, 10000, 35000, 65000, 88000, 112000, 140000],
            income: [22000, 23000, 25000, 58000, 62000, 66000, 70000, 74000, 78000, 82000],
            expenses: [20000, 22000, 38000, 52000, 56000, 58000, 60000, 61000, 62000, 64000],
            ages: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
          }
        },
        {
          id: 3,
          title: "Business Management",
          description: "Business degree + Marketing Manager career in Chicago",
          tags: {
            education: "University of Chicago (Business)",
            career: "Marketing Manager",
            location: "Chicago, IL"
          },
          projectionData: {
            netWorth: [3000, 8000, -8000, -2000, 20000, 45000, 72000, 95000, 120000, 148000],
            income: [26000, 28000, 32000, 60000, 68000, 74000, 80000, 86000, 94000, 102000],
            expenses: [24000, 26000, 42000, 55000, 60000, 64000, 68000, 72000, 78000, 84000],
            ages: [22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
          }
        },
        {
          id: 4,
          title: "Vocational Path",
          description: "Technical certification + Electrician career in Phoenix",
          tags: {
            education: "Gateway Technical College",
            career: "Electrician",
            location: "Phoenix, AZ"
          },
          projectionData: {
            netWorth: [4000, 10000, 18000, 28000, 42000, 58000, 76000, 96000, 118000, 142000],
            income: [28000, 36000, 45000, 52000, 58000, 64000, 68000, 72000, 76000, 80000],
            expenses: [25000, 32000, 40000, 46000, 50000, 54000, 58000, 60000, 62000, 64000],
            ages: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
          }
        }
      ];
    },
    enabled: !!userId,
  });

  const handleViewDetails = (scenario: ScenarioData) => {
    setSelectedScenario(scenario);
    setDetailsOpen(true);
  };

  const handleEditScenario = (scenario: ScenarioData) => {
    // In a real app, this would navigate to the edit page
    window.location.href = `/projections/edit/${scenario.id}`;
  };

  const handleCompareScenarios = () => {
    setCompareOpen(true);
  };

  const sortedScenarios = [...(scenarios || [])].sort((a, b) => {
    if (sortBy === "netWorth") {
      const aMaxNetWorth = Math.max(...a.projectionData.netWorth);
      const bMaxNetWorth = Math.max(...b.projectionData.netWorth);
      return bMaxNetWorth - aMaxNetWorth; // Highest first
    } else if (sortBy === "income") {
      const aLastIncome = a.projectionData.income[a.projectionData.income.length - 1];
      const bLastIncome = b.projectionData.income[b.projectionData.income.length - 1];
      return bLastIncome - aLastIncome; // Highest first
    } else if (sortBy === "expenses") {
      const aLastExpenses = a.projectionData.expenses[a.projectionData.expenses.length - 1];
      const bLastExpenses = b.projectionData.expenses[b.projectionData.expenses.length - 1];
      return aLastExpenses - bLastExpenses; // Lowest first
    }
    // Default to recent (by ID in our mock data)
    return b.id - a.id;
  });

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold text-gray-800">Saved Scenarios</h2>
        <div className="flex items-center space-x-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="netWorth">Highest Net Worth</SelectItem>
              <SelectItem value="income">Highest Income</SelectItem>
              <SelectItem value="expenses">Lowest Expenses</SelectItem>
            </SelectContent>
          </Select>
          
          {scenarios.length > 1 && (
            <Button variant="outline" onClick={handleCompareScenarios}>
              Compare Scenarios
            </Button>
          )}
          
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/projections/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Scenario
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your scenarios...</p>
          </div>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Scenarios Yet</h3>
          <p className="text-gray-600 mb-4">Create your first financial scenario to start seeing projections</p>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/projections/create">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Scenario
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedScenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              index={index}
              onViewDetails={handleViewDetails}
              onEdit={handleEditScenario}
            />
          ))}
        </div>
      )}

      {/* Scenario Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl">
          {selectedScenario && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedScenario.title}</DialogTitle>
                <DialogDescription>{selectedScenario.description}</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-4 my-4">
                {selectedScenario.tags.education && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <span className="material-icons text-xs mr-1">school</span>
                      Education
                    </div>
                    <div className="font-medium">{selectedScenario.tags.education}</div>
                  </div>
                )}
                
                {selectedScenario.tags.career && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <span className="material-icons text-xs mr-1">work</span>
                      Career
                    </div>
                    <div className="font-medium">{selectedScenario.tags.career}</div>
                  </div>
                )}
                
                {selectedScenario.tags.location && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center text-sm font-medium text-gray-500 mb-1">
                      <span className="material-icons text-xs mr-1">location_on</span>
                      Location
                    </div>
                    <div className="font-medium">{selectedScenario.tags.location}</div>
                  </div>
                )}
              </div>
              
              <Tabs defaultValue="projections">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="projections">Financial Projections</TabsTrigger>
                  <TabsTrigger value="details">Scenario Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="projections">
                  <div className="space-y-4 py-4">
                    <div>
                      <h4 className="font-medium mb-2">Net Worth Projection</h4>
                      <div className="h-64 bg-gray-50 p-4 rounded-md">
                        {/* This would be a detailed chart in the actual implementation */}
                        <div className="text-center h-full flex items-center justify-center">
                          <p className="text-gray-500">Detailed net worth chart would appear here</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Income & Expenses</h4>
                      <div className="h-64 bg-gray-50 p-4 rounded-md">
                        {/* This would be a detailed chart in the actual implementation */}
                        <div className="text-center h-full flex items-center justify-center">
                          <p className="text-gray-500">Detailed income and expenses chart would appear here</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details">
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Milestones</h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <span className="material-icons text-primary mr-2">school</span>
                              <div>
                                <span className="font-medium">Education Complete</span>
                                <p className="text-sm text-gray-500">Age 22 - May 2025</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="material-icons text-primary mr-2">work</span>
                              <div>
                                <span className="font-medium">Career Start</span>
                                <p className="text-sm text-gray-500">Age 22 - June 2025</p>
                              </div>
                            </li>
                            <li className="flex items-start">
                              <span className="material-icons text-primary mr-2">home</span>
                              <div>
                                <span className="font-medium">Home Purchase</span>
                                <p className="text-sm text-gray-500">Age 28 - March 2031</p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Key Financial Metrics</h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <ul className="space-y-3">
                            <li className="flex justify-between">
                              <span className="text-gray-600">Peak Net Worth:</span>
                              <span className="font-medium">${Math.max(...selectedScenario.projectionData.netWorth).toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Income:</span>
                              <span className="font-medium">${selectedScenario.projectionData.income[selectedScenario.projectionData.income.length - 1].toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Expenses:</span>
                              <span className="font-medium">${selectedScenario.projectionData.expenses[selectedScenario.projectionData.expenses.length - 1].toLocaleString()}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Cash Flow:</span>
                              <span className="font-medium">
                                ${(selectedScenario.projectionData.income[selectedScenario.projectionData.income.length - 1] - 
                                selectedScenario.projectionData.expenses[selectedScenario.projectionData.expenses.length - 1]).toLocaleString()}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
                <Button onClick={() => handleEditScenario(selectedScenario)}>Edit Scenario</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Compare Scenarios Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare Scenarios</DialogTitle>
            <DialogDescription>
              Select the scenarios you want to compare side by side
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label>Select scenarios to compare (up to 3)</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {scenarios.map(scenario => (
                <div 
                  key={scenario.id} 
                  className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50"
                >
                  <input 
                    type="checkbox" 
                    id={`compare-${scenario.id}`}
                    checked={scenariosToCompare.includes(scenario.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Add to compare list (up to 3)
                        if (scenariosToCompare.length < 3) {
                          setScenariosToCompare([...scenariosToCompare, scenario.id]);
                        }
                      } else {
                        // Remove from compare list
                        setScenariosToCompare(scenariosToCompare.filter(id => id !== scenario.id));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor={`compare-${scenario.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{scenario.title}</div>
                    <div className="text-sm text-gray-500">{scenario.description}</div>
                  </label>
                </div>
              ))}
            </div>
            
            {scenariosToCompare.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-4">Comparison Preview</h4>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Comparison chart would appear here</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>Cancel</Button>
            <Button 
              disabled={scenariosToCompare.length < 2} 
              onClick={() => {
                // In a real app, this would navigate to the comparison page
                window.location.href = `/projections/compare?ids=${scenariosToCompare.join(',')}`;
              }}
            >
              Compare Selected ({scenariosToCompare.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScenariosSection;