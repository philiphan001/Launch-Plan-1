import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createMainProjectionChart } from "@/lib/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { College, Career, Milestone, PathChoice, ProjectionData, SavedProjection } from "@/lib/types";
import { ArrowRight, Calendar, Briefcase, GraduationCap, Home, PlusCircle, Save, AlertCircle, ChevronRight, Landmark, DollarSign, BuildingLibrary } from "lucide-react";

type ProjectionType = "netWorth" | "income" | "expenses" | "assets" | "liabilities";
type ProjectionPathway = "education" | "job" | "military" | "gap";

interface MilestoneDialogProps {
  onAddMilestone: (milestone: Partial<Milestone>) => void;
}

interface LocationData {
  id: number;
  zip_code: string;
  city: string;
  state: string;
  monthly_expense: number;
  income_adjustment_factor: number;
}

interface ProjectionInputs {
  pathway: PathChoice;
  age: number;
  startingSavings: number;
  selectedCollegeId: number | null;
  selectedCareerId: number | null;
  selectedLocationId: number | null;
  timeframe: number;
  studentLoanAmount: number;
  incomeGrowth: number;
  inflationRate: number;
  expenseGrowth: number;
}

const DEFAULT_USER_ID = 1;

// Milestone Dialog Component
const MilestoneDialog = ({ onAddMilestone }: MilestoneDialogProps) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"school" | "work" | "home" | "other">("other");
  const [yearsAway, setYearsAway] = useState(4);
  
  const handleSubmit = () => {
    if (!title) return;
    
    onAddMilestone({
      type,
      title,
      yearsAway,
      userId: DEFAULT_USER_ID
    });
    
    // Reset form
    setTitle("");
    setType("other");
    setYearsAway(4);
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Life Milestone</DialogTitle>
        <DialogDescription>
          Add a major life event to see how it impacts your financial projection.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="milestone-type">Milestone Type</Label>
          <Select 
            value={type} 
            onValueChange={(value) => setType(value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="school">Education</SelectItem>
              <SelectItem value="work">Career</SelectItem>
              <SelectItem value="home">Housing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="milestone-title">Title</Label>
          <Input
            id="milestone-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., College Graduation, New Job, Buy a Home"
          />
        </div>
        
        <div>
          <Label htmlFor="milestone-years">Years from Now: {yearsAway}</Label>
          <Slider
            id="milestone-years"
            value={[yearsAway]}
            onValueChange={(value) => setYearsAway(value[0])}
            min={1}
            max={20}
            step={1}
            className="mt-2"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handleSubmit}>Add Milestone</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Milestone Card Component
const MilestoneCard = ({ type, title, yearsAway }: Partial<Milestone>) => {
  const getIcon = () => {
    switch (type) {
      case "school":
        return <GraduationCap className="h-8 w-8 text-primary" />;
      case "work":
        return <Briefcase className="h-8 w-8 text-primary" />;
      case "home":
        return <Home className="h-8 w-8 text-primary" />;
      default:
        return <Calendar className="h-8 w-8 text-primary" />;
    }
  };
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
      <div className="flex justify-center mb-2">
        {getIcon()}
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">In {yearsAway} years</p>
    </div>
  );
};

// Save Projection Dialog Component
const SaveProjectionDialog = ({ 
  onSave, 
  projectionData 
}: { 
  onSave: (name: string) => void,
  projectionData: ProjectionData
}) => {
  const [name, setName] = useState("");
  
  const handleSubmit = () => {
    if (!name) return;
    onSave(name);
    setName("");
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save Financial Projection</DialogTitle>
        <DialogDescription>
          Give your projection a name to save it for future reference.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4">
        <Label htmlFor="projection-name">Projection Name</Label>
        <Input
          id="projection-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="E.g., College + Tech Career"
        />
      </div>
      
      <div className="bg-muted p-3 rounded-md">
        <h4 className="font-medium mb-2">Projection Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Final Net Worth:</div>
          <div className="font-medium">${projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString()}</div>
          
          <div>Timeframe:</div>
          <div className="font-medium">{projectionData.ages.length - 1} years</div>
          
          <div>Age Range:</div>
          <div className="font-medium">{projectionData.ages[0]} to {projectionData.ages[projectionData.ages.length - 1]}</div>
        </div>
      </div>
      
      <DialogFooter>
        <Button onClick={handleSubmit}>Save Projection</Button>
      </DialogFooter>
    </DialogContent>
  );
};

// Main Financial Projections Component
const FinancialProjections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProjectionType>("netWorth");
  const [activePath, setActivePath] = useState<ProjectionPathway>("education");
  const [milestones, setMilestones] = useState<Partial<Milestone>[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Projection input state
  const [inputs, setInputs] = useState<ProjectionInputs>({
    pathway: "education",
    age: 18,
    startingSavings: 5000,
    selectedCollegeId: null,
    selectedCareerId: null,
    selectedLocationId: null,
    timeframe: 10,
    studentLoanAmount: 30000,
    incomeGrowth: 3,
    inflationRate: 2.5,
    expenseGrowth: 2.0
  });
  
  // Chart refs
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  
  // Fetch colleges
  const { data: colleges = [] } = useQuery({
    queryKey: ['/api/colleges'],
    staleTime: 60000
  });
  
  // Fetch careers
  const { data: careers = [] } = useQuery({
    queryKey: ['/api/careers'],
    staleTime: 60000
  });
  
  // Fetch locations/cost of living data
  const { data: locations = [] } = useQuery({
    queryKey: ['/api/location-cost-of-living'],
    staleTime: 60000
  });
  
  // Fetch saved projections
  const { data: savedProjections = [] } = useQuery({
    queryKey: ['/api/financial-projections', DEFAULT_USER_ID],
    staleTime: 30000
  });
  
  // Save projection mutation
  const saveMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('/api/financial-projections', 'POST', {
        userId: DEFAULT_USER_ID,
        name,
        projectionData: projectionData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/financial-projections', DEFAULT_USER_ID] });
      toast({
        title: "Projection Saved",
        description: "Your financial projection has been saved successfully.",
      });
      setShowSaveDialog(false);
    },
    onError: (error) => {
      console.error('Failed to save projection:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your projection. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Add milestone mutation
  const milestoneMutation = useMutation({
    mutationFn: async (milestone: Partial<Milestone>) => {
      return apiRequest('/api/milestones', 'POST', milestone);
    },
    onSuccess: (data) => {
      // For simplicity, just add it to local state instead of refetching
      setMilestones(prev => [...prev, data]);
      toast({
        title: "Milestone Added",
        description: "Your life milestone has been added to the projection.",
      });
    },
    onError: (error) => {
      console.error('Failed to add milestone:', error);
      toast({
        title: "Failed to Add Milestone",
        description: "There was an error adding your milestone. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle input changes
  const handleInputChange = (key: keyof ProjectionInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle adding a milestone
  const handleAddMilestone = (milestone: Partial<Milestone>) => {
    // In a real app, we'd call the API to save the milestone
    // For now, just add it to local state
    milestoneMutation.mutate(milestone);
  };
  
  // Handle saving a projection
  const handleSaveProjection = (name: string) => {
    if (!name.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please provide a valid name for your projection.",
        variant: "destructive"
      });
      return;
    }
    
    saveMutation.mutate(name);
  };
  
  // Selected entities
  const selectedCollege = useMemo(() => {
    return colleges.find((c: College) => c.id === inputs.selectedCollegeId) || null;
  }, [colleges, inputs.selectedCollegeId]);
  
  const selectedCareer = useMemo(() => {
    return careers.find((c: Career) => c.id === inputs.selectedCareerId) || null;
  }, [careers, inputs.selectedCareerId]);
  
  const selectedLocation = useMemo(() => {
    return locations.find((l: LocationData) => l.id === inputs.selectedLocationId) || null;
  }, [locations, inputs.selectedLocationId]);
  
  // Generate projection data based on inputs
  const generateProjectionData = (): ProjectionData => {
    let netWorth = inputs.startingSavings;
    let currentIncome = 0;
    let currentExpenses = 0;
    let studentDebt = 0;
    
    // Initialize based on pathway
    if (inputs.pathway === "education") {
      // For education pathway, start with college expenses and student loans
      studentDebt = inputs.studentLoanAmount;
      netWorth -= studentDebt;
      
      // If college is selected, use its costs as initial expenses
      if (selectedCollege) {
        // Simple tuition calculation for 4 years
        const annualCost = selectedCollege.tuition + (selectedCollege.roomAndBoard || 0);
        studentDebt = annualCost * 4 - inputs.startingSavings;
        if (studentDebt < 0) studentDebt = 0;
        
        netWorth = 0; // Assume savings are spent on education
      }
      
      // After education, income is based on selected career
      currentIncome = selectedCareer ? selectedCareer.salary : 60000;
      
      // Adjust income based on location if selected
      if (selectedLocation && selectedLocation.income_adjustment_factor) {
        currentIncome = Math.round(currentIncome * selectedLocation.income_adjustment_factor);
      }
      
      // Set initial expenses based on income and location
      if (selectedLocation) {
        currentExpenses = selectedLocation.monthly_expense * 12;
      } else {
        currentExpenses = Math.round(currentIncome * 0.7); // Default: 70% of income
      }
    } else if (inputs.pathway === "job") {
      // For job pathway, start with immediate work
      currentIncome = selectedCareer ? selectedCareer.salary * 0.7 : 35000; // Lower initial salary for no degree
      
      // Adjust for location
      if (selectedLocation && selectedLocation.income_adjustment_factor) {
        currentIncome = Math.round(currentIncome * selectedLocation.income_adjustment_factor);
      }
      
      // Set expenses
      if (selectedLocation) {
        currentExpenses = selectedLocation.monthly_expense * 12;
      } else {
        currentExpenses = Math.round(currentIncome * 0.8); // Higher expense ratio for entry-level
      }
    } else if (inputs.pathway === "military") {
      // Military pathway with standard pay and benefits
      currentIncome = 30000; // Base military pay
      currentExpenses = 20000; // Lower due to housing/food provided
      
      // Military often provides education benefits/loan forgiveness
      studentDebt = 0;
    } else if (inputs.pathway === "gap") {
      // Gap year with minimal income and savings depletion
      currentIncome = 15000; // Part-time or gig work
      currentExpenses = 20000; // Modest living
      netWorth = Math.max(0, inputs.startingSavings - 5000); // Spend some savings
    }
    
    // Initialize arrays
    const netWorthData = [netWorth];
    const incomeData = [currentIncome];
    const expensesData = [currentExpenses];
    const assetsData = [Math.max(0, netWorth)];
    const liabilitiesData = [Math.max(0, -netWorth)];
    const ages = [inputs.age];
    
    // Calculate yearly projections
    for (let i = 1; i <= inputs.timeframe; i++) {
      // Income growth with career progression
      currentIncome = Math.round(currentIncome * (1 + inputs.incomeGrowth / 100));
      
      // Apply milestone effects
      milestones.forEach(milestone => {
        if (milestone.yearsAway === i) {
          switch (milestone.type) {
            case "work":
              // New job with income boost
              currentIncome = Math.round(currentIncome * 1.15); // 15% raise
              break;
            case "home":
              // Home purchase - increases expenses but builds equity
              currentExpenses += 5000; // Higher monthly payments
              netWorth += 3000; // Building equity
              break;
            case "school":
              // Additional education might temporarily lower income but raise future potential
              if (i < inputs.timeframe - 2) { // Only apply if early enough
                currentIncome = Math.round(currentIncome * 0.5); // Reduced income during education
                currentExpenses += 10000; // Education costs
                // Boost future income potential
                inputs.incomeGrowth += 1; // Increase future growth rate
              }
              break;
          }
        }
      });
      
      // Expense growth based on inflation
      currentExpenses = Math.round(currentExpenses * (1 + inputs.expenseGrowth / 100));
      
      // Pay down student debt if any (simplified)
      if (studentDebt > 0) {
        const payment = Math.min(6000, studentDebt); // Fixed $6k annual payment
        studentDebt -= payment;
        currentExpenses += payment;
      }
      
      // Update net worth
      netWorth += (currentIncome - currentExpenses);
      
      // Push to data arrays
      netWorthData.push(netWorth);
      incomeData.push(currentIncome);
      expensesData.push(currentExpenses);
      assetsData.push(Math.max(0, netWorth));
      liabilitiesData.push(Math.max(0, -netWorth));
      ages.push(inputs.age + i);
    }
    
    return {
      netWorth: netWorthData,
      income: incomeData,
      expenses: expensesData,
      assets: assetsData,
      liabilities: liabilitiesData,
      ages: ages
    };
  };
  
  const projectionData = useMemo(() => generateProjectionData(), [
    inputs,
    selectedCollege,
    selectedCareer,
    selectedLocation,
    milestones
  ]);
  
  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createMainProjectionChart(ctx, projectionData, activeTab);
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab]);
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold text-gray-800">Financial Projections</h1>
          <p className="text-muted-foreground">
            Model your financial future based on different life choices and pathways
          </p>
        </div>
        
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Projection
            </Button>
          </DialogTrigger>
          <SaveProjectionDialog 
            onSave={handleSaveProjection} 
            projectionData={projectionData}
          />
        </Dialog>
      </div>
      
      {(!selectedCareer || !selectedLocation) && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Incomplete Projection</AlertTitle>
          <AlertDescription>
            Please select a {!selectedCareer ? 'career' : ''} 
            {!selectedCareer && !selectedLocation ? ' and ' : ''} 
            {!selectedLocation ? 'location' : ''} to generate a more accurate financial projection.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="education" className="mb-6" onValueChange={(value) => handleInputChange('pathway', value)}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="education">
            <GraduationCap className="h-4 w-4 mr-2" />
            Education Path
          </TabsTrigger>
          <TabsTrigger value="job">
            <Briefcase className="h-4 w-4 mr-2" />
            Direct Workforce
          </TabsTrigger>
          <TabsTrigger value="military">
            <Landmark className="h-4 w-4 mr-2" />
            Military Service
          </TabsTrigger>
          <TabsTrigger value="gap">
            <Calendar className="h-4 w-4 mr-2" />
            Gap Year
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle>College to Career Pathway</CardTitle>
              <CardDescription>
                This pathway models your finances starting with college education
                followed by career employment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="college-select">Select College</Label>
                  <Select 
                    value={inputs.selectedCollegeId?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("selectedCollegeId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college: College) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                          {college.name} - ${college.tuition.toLocaleString()}/yr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="student-loan">Student Loan Amount</Label>
                  <Input
                    id="student-loan"
                    type="number"
                    value={inputs.studentLoanAmount}
                    onChange={(e) => handleInputChange("studentLoanAmount", Number(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="savings">Starting Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={inputs.startingSavings}
                    onChange={(e) => handleInputChange("startingSavings", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="job">
          <Card>
            <CardHeader>
              <CardTitle>Direct Workforce Pathway</CardTitle>
              <CardDescription>
                This pathway models your finances starting with immediate entry into the workforce
                after high school
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="starting-job">Starting Job</Label>
                  <Select 
                    value={inputs.selectedCareerId?.toString() || ""} 
                    onValueChange={(value) => handleInputChange("selectedCareerId", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a starting job" />
                    </SelectTrigger>
                    <SelectContent>
                      {careers
                        .filter((career: Career) => !career.education || career.education === "High School")
                        .map((career: Career) => (
                          <SelectItem key={career.id} value={career.id.toString()}>
                            {career.title} - ${career.salary.toLocaleString()}/yr
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="savings">Starting Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={inputs.startingSavings}
                    onChange={(e) => handleInputChange("startingSavings", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="military">
          <Card>
            <CardHeader>
              <CardTitle>Military Service Pathway</CardTitle>
              <CardDescription>
                This pathway models your finances starting with military service,
                which offers stable income and benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="military-branch">Military Branch</Label>
                  <Select 
                    defaultValue="army"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="army">Army</SelectItem>
                      <SelectItem value="navy">Navy</SelectItem>
                      <SelectItem value="airforce">Air Force</SelectItem>
                      <SelectItem value="marines">Marines</SelectItem>
                      <SelectItem value="coastguard">Coast Guard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="savings">Starting Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={inputs.startingSavings}
                    onChange={(e) => handleInputChange("startingSavings", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gap">
          <Card>
            <CardHeader>
              <CardTitle>Gap Year Pathway</CardTitle>
              <CardDescription>
                This pathway models taking time off for personal growth, travel, or
                volunteer work before deciding on a permanent path
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gap-activity">Gap Year Activity</Label>
                  <Select defaultValue="travel">
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="volunteer">Volunteer Work</SelectItem>
                      <SelectItem value="work">Part-time Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="savings">Starting Savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    value={inputs.startingSavings}
                    onChange={(e) => handleInputChange("startingSavings", Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Projection Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Current Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={inputs.age} 
                  onChange={(e) => handleInputChange("age", Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Projection Years</Label>
                <Select 
                  value={inputs.timeframe.toString()} 
                  onValueChange={(value) => handleInputChange("timeframe", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                    <SelectItem value="40">40 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="career-select">Career Goal</Label>
                <Select 
                  value={inputs.selectedCareerId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("selectedCareerId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a career" />
                  </SelectTrigger>
                  <SelectContent>
                    {careers.map((career: Career) => (
                      <SelectItem key={career.id} value={career.id.toString()}>
                        {career.title} - ${career.salary.toLocaleString()}/yr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location-select">Living Location</Label>
                <Select 
                  value={inputs.selectedLocationId?.toString() || ""} 
                  onValueChange={(value) => handleInputChange("selectedLocationId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location: LocationData) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.city}, {location.state} ({location.zip_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label>Income Growth Rate: {inputs.incomeGrowth}%</Label>
                <Slider
                  value={[inputs.incomeGrowth]}
                  onValueChange={(value) => handleInputChange("incomeGrowth", value[0])}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>Expense Growth Rate: {inputs.expenseGrowth}%</Label>
                <Slider
                  value={[inputs.expenseGrowth]}
                  onValueChange={(value) => handleInputChange("expenseGrowth", value[0])}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Projection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-wrap mb-4">
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('netWorth')}
              >
                Net Worth
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('income')}
              >
                Income
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'expenses' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'assets' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Assets
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'liabilities' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities
              </button>
            </div>
            
            <div className="h-96">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Net Worth at {projectionData.ages[projectionData.ages.length - 1]}</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Total Growth</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${(projectionData.netWorth[projectionData.netWorth.length - 1] - projectionData.netWorth[0]).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Final Annual Savings Rate</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  {Math.round((projectionData.income![projectionData.income!.length - 1] - projectionData.expenses![projectionData.expenses!.length - 1]) / projectionData.income![projectionData.income!.length - 1] * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Life Milestones</h3>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <MilestoneDialog onAddMilestone={handleAddMilestone} />
              </Dialog>
            </div>
            
            <p className="text-gray-600 mb-4">Major life events that will impact your financial projection.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {milestones.length > 0 ? (
                milestones.map((milestone, idx) => (
                  <MilestoneCard 
                    key={idx} 
                    type={milestone.type} 
                    title={milestone.title} 
                    yearsAway={milestone.yearsAway} 
                  />
                ))
              ) : (
                <div className="col-span-2 text-center p-6 border border-dashed rounded-lg border-gray-300">
                  <Calendar className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-gray-500 mb-1">No Milestones Added</h4>
                  <p className="text-sm text-gray-400">Add important life events to see their impact on your finances.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Saved Projections</h3>
            
            <div className="space-y-3">
              {savedProjections.length > 0 ? (
                savedProjections.map((projection: SavedProjection) => (
                  <div 
                    key={projection.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <h4 className="font-medium">{projection.name}</h4>
                      <p className="text-sm text-gray-500">
                        Created on {new Date(projection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))
              ) : (
                <div className="text-center p-6 border border-dashed rounded-lg border-gray-300">
                  <DollarSign className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-gray-500 mb-1">No Saved Projections</h4>
                  <p className="text-sm text-gray-400">Save your current projection to compare different scenarios.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-12">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Your Financial Journey</h3>
          
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="ml-12 space-y-8">
              {/* Starting point */}
              <div className="relative">
                <div className="absolute -left-12 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h4 className="text-lg font-medium">Age {projectionData.ages[0]} - Starting Point</h4>
                <p className="text-gray-600 mt-1">
                  Starting with ${inputs.startingSavings.toLocaleString()} in savings.
                  {inputs.pathway === "education" && " Beginning your college education."}
                  {inputs.pathway === "job" && " Entering the workforce directly."}
                  {inputs.pathway === "military" && " Joining military service."}
                  {inputs.pathway === "gap" && " Taking a gap year for personal growth."}
                </p>
              </div>
              
              {/* First major milestone - depends on pathway */}
              <div className="relative">
                <div className="absolute -left-12 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h4 className="text-lg font-medium">
                  Age {projectionData.ages[inputs.pathway === "education" ? 4 : 2]} - 
                  {inputs.pathway === "education" ? " College Graduation" : 
                   inputs.pathway === "job" ? " Career Growth" :
                   inputs.pathway === "military" ? " Service Completion" : " Next Steps"}
                </h4>
                <p className="text-gray-600 mt-1">
                  {inputs.pathway === "education" ? 
                    selectedCollege ? 
                      `Graduating from ${selectedCollege.name} with ${inputs.studentLoanAmount > 0 ? `$${inputs.studentLoanAmount.toLocaleString()} in student loans` : 'no student debt'}. Starting your career with an income of $${projectionData.income![4].toLocaleString()}/year.` : 
                      "Completing your college education and starting your career." :
                   inputs.pathway === "job" ? 
                      `After gaining work experience, your income grows to $${projectionData.income![2].toLocaleString()}/year with potential for further advancement.` :
                   inputs.pathway === "military" ? 
                      "Completing your initial service commitment with valuable skills and experience. You may qualify for education benefits." :
                   "After your gap year, moving forward with your chosen path with new perspectives and experiences."}
                </p>
              </div>
              
              {/* Milestones from user input */}
              {milestones.map((milestone, idx) => (
                <div className="relative" key={idx}>
                  <div className="absolute -left-12 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <h4 className="text-lg font-medium">
                    Age {projectionData.ages[0] + (milestone.yearsAway || 0)} - {milestone.title}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    {milestone.type === "work" ? 
                      `Career advancement with increased income to $${projectionData.income![milestone.yearsAway || 0].toLocaleString()}/year.` :
                     milestone.type === "home" ?
                      "Purchasing a home increases your monthly expenses but builds equity over time." :
                     milestone.type === "school" ?
                      "Further education temporarily impacts income but increases long-term earning potential." :
                      "This life event impacts your financial trajectory."}
                  </p>
                </div>
              ))}
              
              {/* Final projection point */}
              <div className="relative">
                <div className="absolute -left-12 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                <h4 className="text-lg font-medium">
                  Age {projectionData.ages[projectionData.ages.length - 1]} - Projection End
                </h4>
                <p className="text-gray-600 mt-1">
                  By this age, your projected net worth is ${projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString()}, 
                  with an annual income of ${projectionData.income![projectionData.income!.length - 1].toLocaleString()}.
                  Your annual expenses are ${projectionData.expenses![projectionData.expenses!.length - 1].toLocaleString()},
                  allowing you to save {Math.round((projectionData.income![projectionData.income!.length - 1] - projectionData.expenses![projectionData.expenses!.length - 1]) / projectionData.income![projectionData.income!.length - 1] * 100)}% of your income.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialProjections;
