import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Info } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ScenarioData } from "./ScenarioCard";
import SafeScenarioCard from "./SafeScenarioCard";
import { motion } from "framer-motion";
import { isValidProjectionData } from "@/lib/validateProjectionData";
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
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface ScenariosSectionProps {
  userId?: number;
  username?: string;
}

const ScenariosSection = ({ userId, username = "User" }: ScenariosSectionProps) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [scenariosToCompare, setScenariosToCompare] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("recent");
  const [ageSliderValue, setAgeSliderValue] = useState<number>(30);
  const [useAgeSlider, setUseAgeSlider] = useState<boolean>(true);
  const [displayAge, setDisplayAge] = useState<number>(30);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayAge(ageSliderValue);
    }, 50);
    return () => clearTimeout(timer);
  }, [ageSliderValue]);

  const { data: scenarios = [], isLoading, error } = useQuery<ScenarioData[]>({
    queryKey: ['/api/financial-projections/user', userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID provided, skipping projection fetch");
        return [];
      }
      
      console.log(`Fetching financial projections for user ID: ${userId}`);
      try {
        const response = await fetch(`/api/financial-projections/${userId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch projections: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} projections for user ID ${userId}`);
        
        return data.map((projection: any) => {
          let projData = projection.projectionData;
          if (typeof projData === 'string') {
            try {
              projData = JSON.parse(projData);
            } catch (err) {
              console.error("Error parsing projection data:", err);
              projData = { netWorth: [], income: [], expenses: [], ages: [] };
            }
          }
          
          let educationTag = '';
          let careerTag = '';
          let locationTag = '';
          
          const title = projection.name || "Untitled Projection";
          const descriptionParts = title.split('+').map((s: string) => s.trim());
          
          if (descriptionParts.length > 1) {
            if (descriptionParts[0].toLowerCase().includes('degree') || 
                descriptionParts[0].toLowerCase().includes('university') ||
                descriptionParts[0].toLowerCase().includes('college')) {
              educationTag = descriptionParts[0];
            }
            
            if (descriptionParts[1]) {
              const careerLocation = descriptionParts[1].split('in').map((s: string) => s.trim());
              if (careerLocation.length > 0) {
                careerTag = careerLocation[0];
              }
              if (careerLocation.length > 1) {
                locationTag = careerLocation[1];
              }
            }
          }
          
          return {
            id: projection.id,
            title: projection.name || "Untitled Projection",
            description: projection.name || "Financial projection scenario",
            tags: {
              education: educationTag,
              career: careerTag,
              location: locationTag || (projection.locationZipCode ? `Zip: ${projection.locationZipCode}` : '')
            },
            projectionData: {
              netWorth: Array.isArray(projData.netWorthData) ? projData.netWorthData : 
                         Array.isArray(projData.netWorth) ? projData.netWorth : [],
              income: Array.isArray(projData.incomeData) ? projData.incomeData : 
                      Array.isArray(projData.income) ? projData.income : [],
              expenses: Array.isArray(projData.expensesData) ? projData.expensesData : 
                        Array.isArray(projData.expenses) ? projData.expenses : [],
              ages: Array.isArray(projData.ages) ? projData.ages : []
            }
          };
        });
      } catch (error) {
        console.error("Error fetching financial projections:", error);
        throw error;
      }
    },
    enabled: !!userId,
  });

  const handleViewDetails = (scenario: ScenarioData) => {
    setSelectedScenario(scenario);
    setDetailsOpen(true);
  };

  const handleEditScenario = (scenario: ScenarioData) => {
    const timestamp = Date.now();
    setLocation(`/projections?id=${scenario.id}&t=${timestamp}`);
    
    console.log(`Navigating to edit projection ${scenario.id}`);
  };

  const handleCompareScenarios = () => {
    setCompareOpen(true);
  };

  const getNetWorthAtAge = (scenario: ScenarioData, targetAge: number): number => {
    try {
      if (!scenario || !scenario.projectionData) {
        console.warn("Missing scenario or projectionData in getNetWorthAtAge");
        return 0;
      }
      
      const ages = Array.isArray(scenario.projectionData.ages) ? scenario.projectionData.ages : [];
      const netWorth = Array.isArray(scenario.projectionData.netWorth) ? scenario.projectionData.netWorth : [];
      
      if (ages.length === 0 || netWorth.length === 0) {
        console.warn("Empty ages or netWorth array in getNetWorthAtAge");
        return 0;
      }
      
      const ageIndex = ages.findIndex(age => age === targetAge);
      
      if (ageIndex !== -1 && ageIndex < netWorth.length) {
        return netWorth[ageIndex] || 0;
      }
      
      if (targetAge < ages[0]) {
        return netWorth[0] || 0;
      }
      
      if (targetAge > ages[ages.length - 1]) {
        return netWorth[netWorth.length - 1] || 0;
      }
      
      let lowerIndex = 0;
      for (let i = 0; i < ages.length; i++) {
        if (ages[i] <= targetAge) {
          lowerIndex = i;
        } else {
          break;
        }
      }
      
      const upperIndex = lowerIndex + 1;
      
      if (upperIndex >= ages.length) {
        return netWorth[lowerIndex] || 0;
      }
      
      if (lowerIndex >= netWorth.length || upperIndex >= netWorth.length) {
        return netWorth[netWorth.length - 1] || 0;
      }
      
      const lowerAge = ages[lowerIndex];
      const upperAge = ages[upperIndex];
      const lowerValue = netWorth[lowerIndex] || 0;
      const upperValue = netWorth[upperIndex] || 0;
      
      const interpolatedValue = lowerValue + (targetAge - lowerAge) * ((upperValue - lowerValue) / (upperAge - lowerAge));
      
      return isNaN(interpolatedValue) ? 0 : interpolatedValue;
    } catch (error) {
      console.error("Error calculating net worth at age", error);
      return 0;
    }
  };

  const allAges = scenarios
    .filter(scenario => 
      scenario && 
      scenario.projectionData && 
      isValidProjectionData(scenario.projectionData) &&
      Array.isArray(scenario.projectionData.ages)
    )
    .flatMap(scenario => scenario.projectionData.ages || []);
    
  const minAge = allAges.length > 0 ? Math.min(...allAges) : 25;
  const maxAge = allAges.length > 0 ? Math.max(...allAges) : 35;

  const getSortedScenarios = () => {
    if (!scenarios || scenarios.length === 0) return [];
    
    const scenariosCopy = [...scenarios];
    
    if (useAgeSlider) {
      return scenariosCopy.sort((a, b) => {
        try {
          const aNetWorthAtAge = getNetWorthAtAge(a, ageSliderValue);
          const bNetWorthAtAge = getNetWorthAtAge(b, ageSliderValue);
          
          console.log(`Age ${ageSliderValue} - Scenario ${a.id}: $${aNetWorthAtAge}, Scenario ${b.id}: $${bNetWorthAtAge}`);
          
          return bNetWorthAtAge - aNetWorthAtAge; 
        } catch (error) {
          console.error("Error in sorting by age:", error);
          return 0;
        }
      });
    } else if (sortBy === "netWorth") {
      return scenariosCopy.sort((a, b) => {
        try {
          if (!a?.projectionData?.netWorth || !Array.isArray(a.projectionData.netWorth) || 
              !b?.projectionData?.netWorth || !Array.isArray(b.projectionData.netWorth)) {
            return 0;
          }
          
          const aNetWorth = a.projectionData.netWorth.length > 0 ? a.projectionData.netWorth : [0];
          const bNetWorth = b.projectionData.netWorth.length > 0 ? b.projectionData.netWorth : [0];
          
          const aMaxNetWorth = Math.max(...aNetWorth);
          const bMaxNetWorth = Math.max(...bNetWorth);
          return bMaxNetWorth - aMaxNetWorth;
        } catch (error) {
          console.error("Error sorting by netWorth:", error);
          return 0;
        }
      });
    } else if (sortBy === "income") {
      return scenariosCopy.sort((a, b) => {
        try {
          if (!a?.projectionData?.income || !Array.isArray(a.projectionData.income) || 
              !b?.projectionData?.income || !Array.isArray(b.projectionData.income)) {
            return 0;
          }
          
          const aIncome = a.projectionData.income;
          const bIncome = b.projectionData.income;
          
          const aLastIncome = aIncome.length > 0 ? aIncome[aIncome.length - 1] : 0;
          const bLastIncome = bIncome.length > 0 ? bIncome[bIncome.length - 1] : 0;
          return bLastIncome - aLastIncome;
        } catch (error) {
          console.error("Error sorting by income:", error);
          return 0;
        }
      });
    } else if (sortBy === "expenses") {
      return scenariosCopy.sort((a, b) => {
        try {
          if (!a?.projectionData?.expenses || !Array.isArray(a.projectionData.expenses) || 
              !b?.projectionData?.expenses || !Array.isArray(b.projectionData.expenses)) {
            return 0;
          }
          
          const aExpenses = a.projectionData.expenses;
          const bExpenses = b.projectionData.expenses;
          
          const aLastExpenses = aExpenses.length > 0 ? aExpenses[aExpenses.length - 1] : 0;
          const bLastExpenses = bExpenses.length > 0 ? bExpenses[bExpenses.length - 1] : 0;
          return aLastExpenses - bLastExpenses;
        } catch (error) {
          console.error("Error sorting by expenses:", error);
          return 0;
        }
      });
    }
    
    return scenariosCopy.sort((a, b) => b.id - a.id);
  };
  
  const sortedScenarios = getSortedScenarios();

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-800">Welcome back, {username}</h2>
          <p className="text-gray-600 mt-1 mb-2">Continue planning your financial future</p>
          <h3 className="text-lg font-medium text-gray-700 mt-3">Your Saved Scenarios</h3>
        </div>
        <div className="flex items-center space-x-3">
          <Select 
            value={sortBy} 
            onValueChange={(value) => {
              setSortBy(value);
            }}
          >
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
            <Link href="/projections">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Scenario
            </Link>
          </Button>
        </div>
      </div>
      
      {scenarios.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Age Comparison</h3>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm flex items-center space-x-2">
              <span className="text-sm text-gray-500">Selected Age:</span>
              <span className="text-xl font-bold text-primary">{displayAge}</span>
            </div>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex-1 mb-4">
                <Slider
                  defaultValue={[30]}
                  min={minAge}
                  max={maxAge}
                  step={1}
                  value={[ageSliderValue]}
                  onValueChange={(values) => {
                    setAgeSliderValue(values[0]);
                  }}
                  onValueCommit={(values) => {
                    setAgeSliderValue(values[0]);
                    setUseAgeSlider(true);
                  }}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Age {minAge}</span>
                  <span>Age {maxAge}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md text-sm text-gray-600">
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center h-4 w-4 mr-2 text-blue-500 border border-blue-400 rounded-full text-xs font-bold">i</span>
                  Scenarios are ranked by net worth at age {ageSliderValue}
                  {Array.isArray(allAges) && allAges.includes(ageSliderValue) ? 
                    " (direct data point)" : 
                    " (interpolated value)"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading your scenarios...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Scenarios</h3>
          <p className="text-red-600 mb-4">We encountered a problem loading your saved financial scenarios. Please try again.</p>
          <Button 
            variant="outline" 
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Saved Scenarios Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first financial projection to see how your education, career, and life choices affect your financial future.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/projections">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Scenario
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/careers">
                <Info className="mr-2 h-4 w-4" /> Explore Career Options
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            layout
            transition={{
              layout: {
                type: "tween",
                duration: 0.3,
                ease: "easeOut"
              }
            }}
            style={{
              position: "relative",
              width: "100%"
            }}
          >
            {sortedScenarios.map((scenario, index) => (
              <SafeScenarioCard
                key={`${scenario.id}-${ageSliderValue}-${index}`}
                scenario={scenario}
                index={index}
                onViewDetails={handleViewDetails}
                onEdit={handleEditScenario}
                ageSliderActive={useAgeSlider}
                ageSliderValue={ageSliderValue}
              />
            ))}
          </motion.div>
        </div>
      )}

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
                        <div className="text-center h-full flex items-center justify-center">
                          <p className="text-gray-500">Detailed net worth chart would appear here</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Income & Expenses</h4>
                      <div className="h-64 bg-gray-50 p-4 rounded-md">
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
                              <span className="font-medium">
                                ${Array.isArray(selectedScenario?.projectionData?.netWorth) && selectedScenario.projectionData.netWorth.length > 0 
                                  ? Math.max(...selectedScenario.projectionData.netWorth).toLocaleString() 
                                  : "0"}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Income:</span>
                              <span className="font-medium">
                                ${Array.isArray(selectedScenario?.projectionData?.income) && selectedScenario.projectionData.income.length > 0
                                  ? selectedScenario.projectionData.income[selectedScenario.projectionData.income.length - 1].toLocaleString()
                                  : "0"}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Expenses:</span>
                              <span className="font-medium">
                                ${Array.isArray(selectedScenario?.projectionData?.expenses) && selectedScenario.projectionData.expenses.length > 0
                                  ? selectedScenario.projectionData.expenses[selectedScenario.projectionData.expenses.length - 1].toLocaleString()
                                  : "0"}
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Final Annual Cash Flow:</span>
                              <span className="font-medium">
                                ${(() => {
                                  try {
                                    if (!Array.isArray(selectedScenario?.projectionData?.income) || 
                                        !Array.isArray(selectedScenario?.projectionData?.expenses) ||
                                        selectedScenario.projectionData.income.length === 0 ||
                                        selectedScenario.projectionData.expenses.length === 0) {
                                      return "0";
                                    }
                                    
                                    const income = selectedScenario.projectionData.income[selectedScenario.projectionData.income.length - 1] || 0;
                                    const expenses = selectedScenario.projectionData.expenses[selectedScenario.projectionData.expenses.length - 1] || 0;
                                    return (income - expenses).toLocaleString();
                                  } catch (error) {
                                    console.error("Error calculating cash flow:", error);
                                    return "0";
                                  }
                                })()}
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
                        if (scenariosToCompare.length < 3) {
                          setScenariosToCompare([...scenariosToCompare, scenario.id]);
                        }
                      } else {
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
                setLocation(`/projections/compare?ids=${scenariosToCompare.join(',')}`);
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