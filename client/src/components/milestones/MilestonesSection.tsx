import { useState } from "react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Slider 
} from "@/components/ui/slider";
import { 
  Career,
  Milestone,
  InsertMilestone 
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Home, GraduationCap, Car, Users, BriefcaseBusiness } from "lucide-react";

type MilestoneType = "marriage" | "children" | "home" | "car" | "education";

interface MilestonesSectionProps {
  userId: number;
  onMilestoneChange?: () => void;
}

const MilestonesSection = ({ userId, onMilestoneChange }: MilestonesSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneType | null>(null);
  const [yearsAway, setYearsAway] = useState(3);
  
  // Marriage milestone specific state
  const [spouseOccupation, setSpouseOccupation] = useState("");
  const [spouseIncome, setSpouseIncome] = useState(50000);
  const [spouseAssets, setSpouseAssets] = useState(10000);
  const [spouseLiabilities, setSpouseLiabilities] = useState(5000);
  
  // Home milestone specific state
  const [homeValue, setHomeValue] = useState(300000);
  const [homeDownPayment, setHomeDownPayment] = useState(60000);
  const [homeMonthlyPayment, setHomeMonthlyPayment] = useState(1500);
  
  // Car milestone specific state
  const [carValue, setCarValue] = useState(25000);
  const [carDownPayment, setCarDownPayment] = useState(5000);
  const [carMonthlyPayment, setCarMonthlyPayment] = useState(350);
  
  // Children milestone specific state
  const [childrenCount, setChildrenCount] = useState(2);
  const [childrenExpensePerYear, setChildrenExpensePerYear] = useState(12000);

  // Education milestone specific state
  const [educationCost, setEducationCost] = useState(30000);
  
  const queryClient = useQueryClient();
  
  // Get careers for spouse occupation dropdown
  const { data: careers } = useQuery({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      const response = await fetch('/api/careers');
      if (!response.ok) throw new Error('Failed to fetch careers');
      return response.json() as Promise<Career[]>;
    }
  });
  
  // Get existing milestones for the user
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ['/api/milestones', userId],
    queryFn: async () => {
      const response = await fetch(`/api/milestones/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch milestones');
      return response.json() as Promise<Milestone[]>;
    }
  });

  // Create a milestone
  const createMilestone = useMutation({
    mutationFn: async (milestone: InsertMilestone) => {
      return await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(milestone),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', userId] });
      if (onMilestoneChange) {
        onMilestoneChange();
      }
    },
  });

  // Delete a milestone
  const deleteMilestone = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`/api/milestones/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', userId] });
      if (onMilestoneChange) {
        onMilestoneChange();
      }
    },
  });

  const openMilestoneDialog = (type: MilestoneType) => {
    setCurrentMilestone(type);
    setDialogOpen(true);
    
    // Reset all state values to defaults
    setYearsAway(3);
    
    if (type === "marriage") {
      setSpouseOccupation("");
      setSpouseIncome(50000);
      setSpouseAssets(10000);
      setSpouseLiabilities(5000);
    } else if (type === "home") {
      setHomeValue(300000);
      setHomeDownPayment(60000);
      setHomeMonthlyPayment(1500);
    } else if (type === "car") {
      setCarValue(25000);
      setCarDownPayment(5000);
      setCarMonthlyPayment(350);
    } else if (type === "children") {
      setChildrenCount(2);
      setChildrenExpensePerYear(12000);
    } else if (type === "education") {
      setEducationCost(30000);
    }
  };

  const handleSaveMilestone = () => {
    let title = "";
    let type = "";
    
    const now = new Date();
    const targetYear = now.getFullYear() + yearsAway;
    const date = `${targetYear}`;
    
    // Build milestone based on type
    if (currentMilestone === "marriage") {
      title = "Get Married";
      type = "marriage";
      
      const selectedCareer = careers?.find(c => c.title === spouseOccupation);
      const spouseIncomeValue = selectedCareer ? selectedCareer.salaryMedian || 50000 : spouseIncome;
      
      createMilestone.mutate({
        userId,
        type,
        title,
        date,
        yearsAway,
        spouseOccupation,
        spouseIncome: spouseIncomeValue,
        spouseAssets,
        spouseLiabilities,
      });
    } else if (currentMilestone === "home") {
      title = "Buy a Home";
      type = "home";
      
      createMilestone.mutate({
        userId,
        type,
        title,
        date,
        yearsAway,
        homeValue,
        homeDownPayment,
        homeMonthlyPayment,
      });
    } else if (currentMilestone === "car") {
      title = "Buy a Car";
      type = "car";
      
      createMilestone.mutate({
        userId,
        type,
        title,
        date,
        yearsAway,
        carValue,
        carDownPayment,
        carMonthlyPayment,
      });
    } else if (currentMilestone === "children") {
      title = "Have Children";
      type = "children";
      
      createMilestone.mutate({
        userId,
        type,
        title,
        date,
        yearsAway,
        childrenCount,
        childrenExpensePerYear,
      });
    } else if (currentMilestone === "education") {
      title = "Graduate School";
      type = "education";
      
      createMilestone.mutate({
        userId,
        type,
        title,
        date,
        yearsAway,
        educationCost,
      });
    }
    
    setDialogOpen(false);
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "marriage":
        return <Heart className="h-6 w-6 text-pink-500" />;
      case "children":
        return <Users className="h-6 w-6 text-blue-500" />;
      case "home":
        return <Home className="h-6 w-6 text-green-500" />;
      case "car":
        return <Car className="h-6 w-6 text-orange-500" />;
      case "education":
        return <GraduationCap className="h-6 w-6 text-purple-500" />;
      default:
        return <BriefcaseBusiness className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "marriage":
        return "bg-pink-100 border-pink-300";
      case "children":
        return "bg-blue-100 border-blue-300";
      case "home":
        return "bg-green-100 border-green-300";
      case "car":
        return "bg-orange-100 border-orange-300";
      case "education":
        return "bg-purple-100 border-purple-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Life Milestones</h3>
          <p className="text-gray-600 mb-4">
            Add major life events to see how they impact your financial projection.
          </p>
          
          {/* Milestones grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-colors text-center"
              onClick={() => openMilestoneDialog("marriage")}
            >
              <Heart className="h-6 w-6 text-pink-500 mx-auto mb-2" />
              <h4 className="font-medium">Get Married</h4>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors text-center"
              onClick={() => openMilestoneDialog("children")}
            >
              <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium">Have Kids</h4>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors text-center"
              onClick={() => openMilestoneDialog("home")}
            >
              <Home className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium">Buy a Home</h4>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-colors text-center"
              onClick={() => openMilestoneDialog("car")}
            >
              <Car className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <h4 className="font-medium">Buy a Car</h4>
            </div>
            
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors text-center"
              onClick={() => openMilestoneDialog("education")}
            >
              <GraduationCap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium">Graduate School</h4>
            </div>
          </div>
          
          {/* Active milestones list */}
          {milestones && milestones.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Active Milestones</h4>
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className={`border rounded-md p-3 flex justify-between items-center ${getMilestoneColor(milestone.type)}`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getMilestoneIcon(milestone.type)}
                      </div>
                      <div>
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-gray-600">
                          In {milestone.yearsAway} years ({milestone.date})
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => deleteMilestone.mutate(milestone.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Milestone Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentMilestone === "marriage" && "Get Married"}
              {currentMilestone === "children" && "Have Children"}
              {currentMilestone === "home" && "Buy a Home"}
              {currentMilestone === "car" && "Buy a Car"}
              {currentMilestone === "education" && "Graduate School"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Common fields for all milestones */}
              <div>
                <Label htmlFor="years-away">Years to Milestone</Label>
                <div className="flex items-center mt-2">
                  <span className="mr-4 text-sm w-8">{yearsAway}</span>
                  <Slider
                    id="years-away"
                    min={1}
                    max={30}
                    step={1}
                    value={[yearsAway]}
                    onValueChange={(value) => setYearsAway(value[0])}
                    className="flex-1"
                  />
                  <span className="ml-4 text-sm w-8">{yearsAway + 1}</span>
                </div>
              </div>
              
              {/* Marriage specific fields */}
              {currentMilestone === "marriage" && (
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="finances">Finances</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general">
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="spouse-occupation">Spouse Occupation</Label>
                        <Select value={spouseOccupation} onValueChange={setSpouseOccupation}>
                          <SelectTrigger id="spouse-occupation" className="mt-1">
                            <SelectValue placeholder="Select an occupation" />
                          </SelectTrigger>
                          <SelectContent>
                            {careers?.sort((a, b) => a.title.localeCompare(b.title)).map((career) => (
                              <SelectItem key={career.id} value={career.title}>
                                {career.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {spouseOccupation && (
                        <div>
                          <Label>Estimated Income</Label>
                          <div className="mt-1 font-medium text-lg">
                            ${careers?.find(c => c.title === spouseOccupation)?.salaryMedian?.toLocaleString() || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Median salary for this occupation
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="finances">
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="spouse-income">
                          Spouse Income (Override)
                        </Label>
                        <div className="flex items-center mt-1">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            id="spouse-income"
                            value={spouseIncome}
                            onChange={(e) => setSpouseIncome(Number(e.target.value))}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Only used if no occupation is selected
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="spouse-assets">Spouse Assets</Label>
                        <div className="flex items-center mt-1">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            id="spouse-assets"
                            value={spouseAssets}
                            onChange={(e) => setSpouseAssets(Number(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="spouse-liabilities">Spouse Liabilities</Label>
                        <div className="flex items-center mt-1">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            id="spouse-liabilities"
                            value={spouseLiabilities}
                            onChange={(e) => setSpouseLiabilities(Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
              
              {/* Home specific fields */}
              {currentMilestone === "home" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="home-value">Home Value</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="home-value"
                        value={homeValue}
                        onChange={(e) => setHomeValue(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="home-down-payment">Down Payment</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="home-down-payment"
                        value={homeDownPayment}
                        onChange={(e) => setHomeDownPayment(Number(e.target.value))}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Down payment: {Math.round((homeDownPayment / homeValue) * 100)}% of home value
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="home-monthly-payment">Monthly Payment</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="home-monthly-payment"
                        value={homeMonthlyPayment}
                        onChange={(e) => setHomeMonthlyPayment(Number(e.target.value))}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Includes mortgage, taxes, insurance, etc.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Car specific fields */}
              {currentMilestone === "car" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="car-value">Car Value</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="car-value"
                        value={carValue}
                        onChange={(e) => setCarValue(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="car-down-payment">Down Payment</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="car-down-payment"
                        value={carDownPayment}
                        onChange={(e) => setCarDownPayment(Number(e.target.value))}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Down payment: {Math.round((carDownPayment / carValue) * 100)}% of car value
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="car-monthly-payment">Monthly Payment</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="car-monthly-payment"
                        value={carMonthlyPayment}
                        onChange={(e) => setCarMonthlyPayment(Number(e.target.value))}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Includes loan payment, insurance, etc.
                    </div>
                  </div>
                </div>
              )}
              
              {/* Children specific fields */}
              {currentMilestone === "children" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="children-count">Number of Children</Label>
                    <div className="flex items-center mt-2">
                      <span className="mr-4 text-sm w-8">{childrenCount}</span>
                      <Slider
                        id="children-count"
                        min={1}
                        max={5}
                        step={1}
                        value={[childrenCount]}
                        onValueChange={(value) => setChildrenCount(value[0])}
                        className="flex-1"
                      />
                      <span className="ml-4 text-sm w-8">{childrenCount}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="children-expense">Annual Expense per Child</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="children-expense"
                        value={childrenExpensePerYear}
                        onChange={(e) => setChildrenExpensePerYear(Number(e.target.value))}
                      />
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Total annual cost: ${(childrenCount * childrenExpensePerYear).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Education specific fields */}
              {currentMilestone === "education" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="education-cost">Education Cost</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="education-cost"
                        value={educationCost}
                        onChange={(e) => setEducationCost(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone}>
              Save Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilestonesSection;