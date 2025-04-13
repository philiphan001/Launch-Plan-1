import { useState, useEffect } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { 
  Career,
  Milestone,
  InsertMilestone 
} from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Home, GraduationCap, Car, Users, BriefcaseBusiness, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";

type MilestoneType = "marriage" | "children" | "home" | "car" | "education";

interface MilestonesSectionProps {
  userId: number;
  onMilestoneChange?: () => void;
}

const MilestonesSection = ({ userId, onMilestoneChange }: MilestonesSectionProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneType | null>(null);
  const [yearsAway, setYearsAway] = useState(3);
  const [income, setIncome] = useState(60000); // Current user's income
  const [isEditing, setIsEditing] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  
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
  const [educationType, setEducationType] = useState("masters");
  const [educationYears, setEducationYears] = useState(2);
  const [educationAnnualCost, setEducationAnnualCost] = useState(30000);
  const [educationAnnualLoan, setEducationAnnualLoan] = useState(20000);
  const [targetOccupation, setTargetOccupation] = useState("");
  const [workStatus, setWorkStatus] = useState("no"); // "no", "part-time", or "full-time"
  const [partTimeIncome, setPartTimeIncome] = useState(20000);
  const [returnToSameProfession, setReturnToSameProfession] = useState(true);
  
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
  
  // Get financial profile for the user to show available savings
  const { data: financialProfile, refetch: refetchFinancialProfile } = useQuery({
    queryKey: ['/api/financial-profiles/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/financial-profiles/user/${userId}`);
      if (!response.ok && response.status !== 404) throw new Error('Failed to fetch financial profile');
      
      // Return default values if profile doesn't exist
      if (response.status === 404) {
        return { 
          savingsAmount: 0
        };
      }
      
      return response.json();
    },
    // Ensure we have the latest financial profile data when the dialog opens
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0 // Always consider data stale to force a refetch
  });
  
  // Get future savings projection for the milestone year
  const { data: futureSavings, isLoading: isLoadingFutureSavings, refetch: refetchFutureSavings } = useQuery({
    queryKey: ['/api/calculate/future-savings', userId, yearsAway],
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const targetYear = currentYear + yearsAway;
      
      const response = await fetch('/api/calculate/future-savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          targetYear
        }),
      });
      
      if (!response.ok) throw new Error('Failed to calculate future savings');
      
      return response.json();
    },
    enabled: !!userId && yearsAway > 0 && dialogOpen, // Only fetch when dialog is open and we have valid inputs
  });
  
  // Effect to refetch future savings whenever dialog opens or years away changes
  useEffect(() => {
    if (dialogOpen && userId && yearsAway > 0) {
      // Refetch financial profile and future savings to ensure they're up-to-date
      refetchFinancialProfile();
      refetchFutureSavings();
    }
  }, [dialogOpen, yearsAway, userId, refetchFinancialProfile, refetchFutureSavings]);
  
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

  // Update a milestone
  const updateMilestone = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertMilestone> }) => {
      return await fetch(`/api/milestones/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate milestone queries
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', userId] });
      
      // Reset editing state
      setIsEditing(false);
      setEditingMilestoneId(null);
      
      // Trigger parent component update
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
      // Invalidate milestone queries
      queryClient.invalidateQueries({ queryKey: ['/api/milestones', userId] });
      
      // Wait for a brief moment to ensure the query invalidation is processed
      setTimeout(() => {
        if (onMilestoneChange) {
          onMilestoneChange();
        }
      }, 100);
    },
  });

  const openMilestoneDialog = (type: MilestoneType, milestoneToEdit?: Milestone) => {
    setCurrentMilestone(type);
    setDialogOpen(true);
    
    // Always refresh financial profile when opening dialog to get latest savings amount
    refetchFinancialProfile();
    
    if (milestoneToEdit) {
      // This is an edit operation
      setIsEditing(true);
      setEditingMilestoneId(milestoneToEdit.id);
      
      // Set common fields
      setYearsAway(milestoneToEdit.yearsAway || 3);
      setCustomName(milestoneToEdit.title || "");
      
      // Set type-specific fields based on milestone type
      if (type === "marriage") {
        // Set marriage-specific fields
        setSpouseOccupation(milestoneToEdit.spouseOccupation || "");
        setSpouseIncome(milestoneToEdit.spouseIncome || 50000);
        setSpouseAssets(milestoneToEdit.spouseAssets || 10000);
        setSpouseLiabilities(milestoneToEdit.spouseLiabilities || 5000);
      } else if (type === "home") {
        // Set home-specific fields
        setHomeValue(milestoneToEdit.homeValue || 300000);
        setHomeDownPayment(milestoneToEdit.homeDownPayment || 60000);
        setHomeMonthlyPayment(milestoneToEdit.homeMonthlyPayment || 1500);
      } else if (type === "car") {
        // Set car-specific fields
        setCarValue(milestoneToEdit.carValue || 25000);
        setCarDownPayment(milestoneToEdit.carDownPayment || 5000);
        setCarMonthlyPayment(milestoneToEdit.carMonthlyPayment || 350);
      } else if (type === "children") {
        // Set children-specific fields
        setChildrenCount(milestoneToEdit.childrenCount || 2);
        setChildrenExpensePerYear(milestoneToEdit.childrenExpensePerYear || 12000);
      } else if (type === "education") {
        // Set education-specific fields
        setEducationCost(milestoneToEdit.educationCost || 30000);
        setEducationType(milestoneToEdit.educationType || "masters");
        setEducationYears(milestoneToEdit.educationYears || 2);
        setEducationAnnualCost(milestoneToEdit.educationAnnualCost || 30000);
        setEducationAnnualLoan(milestoneToEdit.educationAnnualLoan || 20000);
        setTargetOccupation(milestoneToEdit.targetOccupation || "");
        setWorkStatus(milestoneToEdit.workStatus || "no");
        setPartTimeIncome(milestoneToEdit.partTimeIncome || 20000);
        // Fix for handling the boolean value correctly - use null check instead of logical OR
        setReturnToSameProfession(milestoneToEdit.returnToSameProfession !== false);
      }
    } else {
      // This is a new milestone
      setIsEditing(false);
      setEditingMilestoneId(null);
      setCustomName(""); // Reset custom name for new milestones
      
      // Reset all state values to defaults
      setYearsAway(3);
      
      if (type === "marriage") {
        setSpouseOccupation("");
        setSpouseIncome(50000);
        setSpouseAssets(10000);
        setSpouseLiabilities(5000);
      } else if (type === "home") {
        const defaultHomeValue = 300000;
        const defaultDownPaymentPercent = 20; // 20% downpayment
        setHomeValue(defaultHomeValue);
        setHomeDownPayment(defaultHomeValue * (defaultDownPaymentPercent / 100));
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
        setEducationType("masters");
        setEducationYears(2);
        setEducationAnnualCost(30000);
        setEducationAnnualLoan(20000);
        setTargetOccupation("");
        setWorkStatus("no");
        setPartTimeIncome(20000);
        setReturnToSameProfession(true);
      }
    }
  };

  const handleSaveMilestone = () => {
    let type = "";
    // Use custom name if provided, otherwise use default title
    let title = customName.trim() || "";
    
    const now = new Date();
    const targetYear = now.getFullYear() + yearsAway;
    const date = `${targetYear}`;
    
    // Build milestone based on type
    if (currentMilestone === "marriage") {
      if (!title) title = "Get Married";
      type = "marriage";
      
      // Safety check for careers data and spouse occupation
      let spouseIncomeValue = spouseIncome;  // Default to user-entered value
      
      // Only try to find a matching career if spouseOccupation is set
      if (spouseOccupation && careers && careers.length > 0) {
        const selectedCareer = careers.find(c => c.title === spouseOccupation);
        if (selectedCareer && selectedCareer.salaryMedian) {
          spouseIncomeValue = selectedCareer.salaryMedian;
        }
      }
      
      const milestoneData = {
        userId,
        type,
        title,
        date,
        yearsAway,
        spouseOccupation: spouseOccupation || null,  // Ensure this is never undefined
        spouseIncome: spouseIncomeValue,
        spouseAssets,
        spouseLiabilities,
      };
      
      if (isEditing && editingMilestoneId) {
        // Update existing milestone
        updateMilestone.mutate({ 
          id: editingMilestoneId, 
          data: milestoneData
        });
      } else {
        // Create new milestone
        createMilestone.mutate(milestoneData);
      }
    } else if (currentMilestone === "home") {
      if (!title) title = "Buy a Home";
      type = "home";
      
      const milestoneData = {
        userId,
        type,
        title,
        date,
        yearsAway,
        homeValue,
        homeDownPayment,
        homeMonthlyPayment,
      };
      
      if (isEditing && editingMilestoneId) {
        // Update existing milestone
        updateMilestone.mutate({ 
          id: editingMilestoneId, 
          data: milestoneData
        });
      } else {
        // Create new milestone
        createMilestone.mutate(milestoneData);
      }
    } else if (currentMilestone === "car") {
      if (!title) title = "Buy a Car";
      type = "car";
      
      const milestoneData = {
        userId,
        type,
        title,
        date,
        yearsAway,
        carValue,
        carDownPayment,
        carMonthlyPayment,
      };
      
      if (isEditing && editingMilestoneId) {
        // Update existing milestone
        updateMilestone.mutate({ 
          id: editingMilestoneId, 
          data: milestoneData
        });
      } else {
        // Create new milestone
        createMilestone.mutate(milestoneData);
      }
    } else if (currentMilestone === "children") {
      if (!title) title = "Have Children";
      type = "children";
      
      const milestoneData = {
        userId,
        type,
        title,
        date,
        yearsAway,
        childrenCount,
        childrenExpensePerYear,
      };
      
      if (isEditing && editingMilestoneId) {
        // Update existing milestone
        updateMilestone.mutate({ 
          id: editingMilestoneId, 
          data: milestoneData
        });
      } else {
        // Create new milestone
        createMilestone.mutate(milestoneData);
      }
    } else if (currentMilestone === "education") {
      if (!title) title = "Graduate School";
      type = "education";
      
      const milestoneData = {
        userId,
        type,
        title,
        date,
        yearsAway,
        educationCost,
        educationType,
        educationYears,
        educationAnnualCost,
        educationAnnualLoan,
        targetOccupation,
        workStatus,
        partTimeIncome,
        returnToSameProfession,
      };
      
      if (isEditing && editingMilestoneId) {
        // Update existing milestone
        updateMilestone.mutate({ 
          id: editingMilestoneId, 
          data: milestoneData
        });
      } else {
        // Create new milestone
        createMilestone.mutate(milestoneData);
      }
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
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-blue-500"
                        onClick={() => openMilestoneDialog(milestone.type as MilestoneType, milestone)}
                      >
                        <span className="text-sm">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => deleteMilestone.mutate(milestone.id)}
                      >
                        <span className="text-sm">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Milestone Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="custom-name">Milestone Name</Label>
                <Input
                  id="custom-name"
                  placeholder={
                    currentMilestone === "marriage" ? "Wedding" : 
                    currentMilestone === "children" ? "First Child" : 
                    currentMilestone === "home" ? "Dream Home" : 
                    currentMilestone === "car" ? "New Car" : 
                    "Graduate Degree"
                  }
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mt-2"
                />
              </div>
              
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
              
              {/* Marriage specific fields - Fun Version for High School Students */}
              {currentMilestone === "marriage" && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center space-x-2 bg-white py-2 px-4 rounded-full shadow-sm border border-pink-200">
                      <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
                      <h3 className="text-lg font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">Your Future Power Couple Goals</h3>
                      <Heart className="h-5 w-5 text-pink-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <Tabs defaultValue="dream" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-pink-100">
                      <TabsTrigger value="dream" className="data-[state=active]:bg-pink-200">The Dream</TabsTrigger>
                      <TabsTrigger value="reality" className="data-[state=active]:bg-pink-200">The Reality</TabsTrigger>
                      <TabsTrigger value="finances" className="data-[state=active]:bg-pink-200">The Money</TabsTrigger>
                    </TabsList>
                    
                    {/* The Dream Tab - Fun career selection */}
                    <TabsContent value="dream" className="bg-white rounded-md p-4 mt-4 border border-pink-100 shadow-sm">
                      <div className="space-y-4">
                        <div className="text-center mb-4">
                          <p className="text-sm text-gray-600">Who will you marry? Choose their dream job!</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="spouse-occupation" className="text-purple-700 font-medium flex items-center">
                            <span className="mr-2">💼</span> Future Spouse's Career
                          </Label>
                          <div className="mt-2 relative">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="w-full justify-between bg-white border-pink-200 hover:bg-pink-50 hover:text-pink-700 focus:ring-pink-500"
                                >
                                  {spouseOccupation 
                                    ? spouseOccupation 
                                    : "Search for a dream career..."}
                                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                                <Command>
                                  <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                                    <p className="text-xs text-center font-medium text-pink-600">💼 Choose wisely — this affects your financial future!</p>
                                  </div>
                                  <CommandInput placeholder="Type to search careers..." className="h-9 border-pink-100" />
                                  <CommandList className="max-h-[300px] overflow-auto">
                                    <CommandEmpty>No matching careers found</CommandEmpty>
                                    <CommandGroup>
                                      {careers?.sort((a, b) => a.title.localeCompare(b.title)).map((career) => (
                                        <CommandItem
                                          key={career.id}
                                          value={career.title}
                                          onSelect={() => {
                                            setSpouseOccupation(career.title);
                                          }}
                                          className="flex items-center"
                                        >
                                          <span>{career.title}</span>
                                          {career.salaryMedian && 
                                            <span className="ml-auto text-xs text-green-600 font-semibold">
                                              ${career.salaryMedian.toLocaleString()}
                                            </span>
                                          }
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        {spouseOccupation && (
                          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-lg border border-pink-100 mt-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <Label className="text-purple-700">Their Yearly Salary 💰</Label>
                                <div className="mt-1 font-medium text-lg text-green-600">
                                  ${careers?.find(c => c.title === spouseOccupation)?.salaryMedian?.toLocaleString() || "???,???"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Average salary for this job
                                </div>
                              </div>
                              <div className="text-5xl">
                                {
                                  (careers?.find(c => c.title === spouseOccupation)?.salaryMedian || 0) > 100000 ? "🤑" :
                                  (careers?.find(c => c.title === spouseOccupation)?.salaryMedian || 0) > 70000 ? "😎" :
                                  (careers?.find(c => c.title === spouseOccupation)?.salaryMedian || 0) > 40000 ? "🙂" : "😅"
                                }
                              </div>
                            </div>
                            
                            <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-pink-100">
                              <span className="font-medium">Pro tip:</span> Two incomes can help you reach financial goals faster, like buying a home or traveling!
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* The Reality Tab - Fun facts about marriage */}
                    <TabsContent value="reality" className="bg-white rounded-md p-4 mt-4 border border-pink-100 shadow-sm">
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <p className="text-sm text-gray-600">Marriage isn't just about love... it's teamwork! 👫</p>
                        </div>
                        
                        <div className="flex space-x-4">
                          <div className="w-1/2 bg-pink-50 rounded-lg p-3 border border-pink-100">
                            <h4 className="font-medium text-pink-700 flex items-center">
                              <span className="mr-2">💗</span> Benefits
                            </h4>
                            <ul className="mt-2 text-sm space-y-2">
                              <li className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span> Combined income potential
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span> Split housing & living costs
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span> Tax benefits for married couples
                              </li>
                              <li className="flex items-start">
                                <span className="text-green-500 mr-1">✓</span> Shared financial goals
                              </li>
                            </ul>
                          </div>
                          
                          <div className="w-1/2 bg-purple-50 rounded-lg p-3 border border-purple-100">
                            <h4 className="font-medium text-purple-700 flex items-center">
                              <span className="mr-2">🤔</span> Challenges
                            </h4>
                            <ul className="mt-2 text-sm space-y-2">
                              <li className="flex items-start">
                                <span className="text-yellow-500 mr-1">!</span> Managing money together
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-500 mr-1">!</span> Different spending habits
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-500 mr-1">!</span> Potential debt from partner
                              </li>
                              <li className="flex items-start">
                                <span className="text-yellow-500 mr-1">!</span> Setting financial boundaries
                              </li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="font-medium text-blue-700">Did you know? 💡</p>
                          <p className="mt-1 text-gray-700">
                            The average age for marriage in the US is 30 for men and 28 for women. 
                            Most financial experts recommend being financially stable before marriage!
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {/* The Money Tab - Financial impact */}
                    <TabsContent value="finances" className="bg-white rounded-md p-4 mt-4 border border-pink-100 shadow-sm">
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <p className="text-sm text-gray-600">Marriage affects your money in ways you might not expect! 💵</p>
                        </div>
                        
                        <div>
                          <Label htmlFor="spouse-income" className="text-purple-700 font-medium flex items-center">
                            <span className="mr-2">💰</span> Their Annual Income
                            {spouseOccupation && <span className="ml-2 text-xs text-gray-500">(Based on career)</span>}
                          </Label>
                          <div className="flex items-center mt-1">
                            <span className="mr-2 font-bold text-green-600">$</span>
                            <Input
                              type="number"
                              id="spouse-income"
                              value={spouseIncome}
                              onChange={(e) => setSpouseIncome(Number(e.target.value))}
                              className="border-green-200 focus:ring-green-500"
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1 italic">
                            {spouseOccupation ? "Salary from their career (you can adjust it)" : "How much will they make? Take a guess!"}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <Label htmlFor="spouse-assets" className="text-purple-700 font-medium flex items-center">
                              <span className="mr-2">💎</span> Their Savings
                            </Label>
                            <div className="flex items-center mt-1">
                              <span className="mr-2 font-bold text-green-600">$</span>
                              <Input
                                type="number"
                                id="spouse-assets"
                                value={spouseAssets}
                                onChange={(e) => setSpouseAssets(Number(e.target.value))}
                                className="border-green-200 focus:ring-green-500"
                              />
                            </div>
                            <div className="text-xs mt-1 flex justify-between">
                              <span className="text-green-600">Their money becomes yours too! 🎉</span>
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="spouse-liabilities" className="text-purple-700 font-medium flex items-center">
                              <span className="mr-2">📝</span> Their Debt
                            </Label>
                            <div className="flex items-center mt-1">
                              <span className="mr-2 font-bold text-red-500">$</span>
                              <Input
                                type="number"
                                id="spouse-liabilities"
                                value={spouseLiabilities}
                                onChange={(e) => setSpouseLiabilities(Number(e.target.value))}
                                className="border-red-200 focus:ring-red-500"
                              />
                            </div>
                            <div className="text-xs mt-1 flex justify-between">
                              <span className="text-red-500">Their debt becomes yours too! 😬</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-4">
                          <div className="flex items-center font-medium text-yellow-700 mb-2">
                            <span className="mr-2">🧮</span> Financial Impact Calculator
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white rounded p-2 border border-yellow-100">
                              <div className="text-gray-600">Combined Income</div>
                              <div className="font-bold text-green-600">${(income + spouseIncome).toLocaleString()}/year</div>
                            </div>
                            <div className="bg-white rounded p-2 border border-yellow-100">
                              <div className="text-gray-600">Net Worth Change</div>
                              <div className={`font-bold ${spouseAssets - spouseLiabilities > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                ${(spouseAssets - spouseLiabilities).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {/* Home specific fields */}
              {currentMilestone === "home" && (
                <div className="space-y-4">
                  {/* Display available savings information */}
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-700">Available Savings</h4>
                        <p className="text-sm text-blue-600">
                          {yearsAway > 0 
                            ? `Projected savings in ${yearsAway} years (${new Date().getFullYear() + yearsAway})`
                            : 'Current funds available for your down payment'
                          }
                        </p>
                      </div>
                      <div className="text-xl font-semibold text-blue-700">
                        {isLoadingFutureSavings ? (
                          <span className="text-sm text-blue-600">Calculating...</span>
                        ) : (
                          yearsAway > 0 && futureSavings 
                            ? `$${Math.round(futureSavings.futureSavings).toLocaleString()}`
                            : `$${financialProfile?.savingsAmount?.toLocaleString() || '0'}`
                        )}
                      </div>
                    </div>
                    
                    {/* Show warning if down payment exceeds available funds */}
                    {yearsAway > 0 && futureSavings && homeDownPayment > futureSavings.futureSavings && (
                      <div className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Your down payment would exceed your projected savings in {yearsAway} years
                      </div>
                    )}
                    
                    {yearsAway === 0 && financialProfile?.savingsAmount && homeDownPayment > financialProfile.savingsAmount && (
                      <div className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Your down payment exceeds your current available savings
                      </div>
                    )}
                    
                    {/* Show comparison between current and future savings when applicable */}
                    {yearsAway > 0 && futureSavings && (
                      <div className="mt-2 text-sm text-blue-700">
                        <div className="flex justify-between">
                          <span>Current savings:</span>
                          <span>${Math.round(futureSavings.currentSavings).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projected growth:</span>
                          <span>${Math.round(futureSavings.futureSavings - futureSavings.currentSavings).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="home-value">Home Value</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="home-value"
                        value={homeValue}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          setHomeValue(newValue);
                          
                          // Only update down payment if home value is valid
                          if (newValue > 0 && homeValue > 0) {
                            // Update downpayment to maintain the same percentage
                            const currentPercent = homeDownPayment / homeValue;
                            setHomeDownPayment(Math.round(newValue * currentPercent));
                          } else if (newValue > 0) {
                            // If previous value was invalid but new value is valid, 
                            // set a default 20% down payment
                            setHomeDownPayment(Math.round(newValue * 0.2));
                          }
                          // If new value is invalid (0 or negative), we don't change the down payment
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="home-down-payment">Down Payment Percentage</Label>
                    <div className="flex items-center mt-2">
                      <span className="mr-4 text-sm w-8">
                        {homeValue > 0 ? Math.round((homeDownPayment / homeValue) * 100) : 20}%
                      </span>
                      <Slider
                        id="home-down-payment"
                        min={5}
                        max={50}
                        step={1}
                        value={[homeValue > 0 ? Math.round((homeDownPayment / homeValue) * 100) : 20]}
                        onValueChange={(value) => {
                          if (homeValue > 0) {
                            setHomeDownPayment(Math.round(homeValue * (value[0] / 100)));
                          }
                        }}
                        className="flex-1"
                      />
                      <span className="ml-4 text-sm w-8">${homeDownPayment.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Recommended: at least 20% to avoid PMI
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="home-monthly-payment">Monthly Payment (Estimated)</Label>
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
                      Includes principal, interest, taxes, insurance, and maintenance
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => {
                        // Validate inputs before calculation
                        if (homeValue <= 0) {
                          alert("Please enter a valid home value greater than zero.");
                          return;
                        }
                        
                        // Ensure down payment is not higher than home value
                        if (homeDownPayment >= homeValue) {
                          alert("Down payment must be less than the home value.");
                          return;
                        }
                        
                        // Calculate estimated monthly payment (30-year loan at 6% interest rate)
                        const loanAmount = homeValue - homeDownPayment;
                        const monthlyInterestRate = 0.06 / 12;
                        const numberOfPayments = 30 * 12;
                        
                        // Calculate mortgage payment using the loan formula
                        const mortgagePayment = loanAmount * 
                          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
                          
                        // Add property tax (1.2% annually) and insurance (0.5% annually)
                        const propertyTax = (homeValue * 0.012) / 12;
                        const insurance = (homeValue * 0.005) / 12;
                        const maintenance = (homeValue * 0.01) / 12;
                        
                        // Total monthly payment - validate for NaN or Infinity
                        const calculatedTotal = mortgagePayment + propertyTax + insurance + maintenance;
                        const total = !isNaN(calculatedTotal) && isFinite(calculatedTotal) 
                          ? Math.round(calculatedTotal)
                          : 1500; // Fallback to default if calculation fails
                        
                        setHomeMonthlyPayment(total);
                      }}
                    >
                      Calculate Payment
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Car specific fields */}
              {currentMilestone === "car" && (
                <div className="space-y-4">
                  {/* Display available savings information */}
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-700">Available Savings</h4>
                        <p className="text-sm text-blue-600">
                          {yearsAway > 0 
                            ? `Projected savings in ${yearsAway} years (${new Date().getFullYear() + yearsAway})`
                            : 'Current funds available for your down payment'
                          }
                        </p>
                      </div>
                      <div className="text-xl font-semibold text-blue-700">
                        {isLoadingFutureSavings ? (
                          <span className="text-sm text-blue-600">Calculating...</span>
                        ) : (
                          yearsAway > 0 && futureSavings 
                            ? `$${Math.round(futureSavings.futureSavings).toLocaleString()}`
                            : `$${financialProfile?.savingsAmount?.toLocaleString() || '0'}`
                        )}
                      </div>
                    </div>
                    
                    {/* Show warning if down payment exceeds available funds */}
                    {yearsAway > 0 && futureSavings && carDownPayment > futureSavings.futureSavings && (
                      <div className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Your down payment would exceed your projected savings in {yearsAway} years
                      </div>
                    )}
                    
                    {yearsAway === 0 && financialProfile?.savingsAmount && carDownPayment > financialProfile.savingsAmount && (
                      <div className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Your down payment exceeds your current available savings
                      </div>
                    )}
                    
                    {/* Show comparison between current and future savings when applicable */}
                    {yearsAway > 0 && futureSavings && (
                      <div className="mt-2 text-sm text-blue-700">
                        <div className="flex justify-between">
                          <span>Current savings:</span>
                          <span>${Math.round(futureSavings.currentSavings).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projected growth:</span>
                          <span>${Math.round(futureSavings.futureSavings - futureSavings.currentSavings).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="car-value">Car Value</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="car-value"
                        value={carValue}
                        onChange={(e) => {
                          const newValue = Number(e.target.value);
                          setCarValue(newValue);
                          
                          // Only update down payment if car value is valid
                          if (newValue > 0 && carValue > 0) {
                            // Update downpayment to maintain the same percentage
                            const currentPercent = carDownPayment / carValue;
                            setCarDownPayment(Math.round(newValue * currentPercent));
                          } else if (newValue > 0) {
                            // If previous value was invalid but new value is valid, 
                            // set a default 20% down payment
                            setCarDownPayment(Math.round(newValue * 0.2));
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="car-down-payment">Down Payment Percentage</Label>
                    <div className="flex items-center mt-2">
                      <span className="mr-4 text-sm w-8">
                        {carValue > 0 ? Math.round((carDownPayment / carValue) * 100) : 20}%
                      </span>
                      <Slider
                        id="car-down-payment"
                        min={0}
                        max={100}
                        step={5}
                        value={[carValue > 0 ? Math.round((carDownPayment / carValue) * 100) : 20]}
                        onValueChange={(value) => {
                          if (carValue > 0) {
                            setCarDownPayment(Math.round(carValue * (value[0] / 100)));
                          }
                        }}
                        className="flex-1"
                      />
                      <span className="ml-4 text-sm w-8">${carDownPayment.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Higher down payment means lower monthly payments
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="car-monthly-payment">Monthly Payment (Estimated)</Label>
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
                      Includes loan payment, insurance, maintenance, etc.
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => {
                        // Validate inputs before calculation
                        if (carValue <= 0) {
                          alert("Please enter a valid car value greater than zero.");
                          return;
                        }
                        
                        // Ensure down payment is not higher than car value
                        if (carDownPayment >= carValue) {
                          alert("Down payment must be less than the car value.");
                          return;
                        }
                        
                        // Calculate estimated monthly payment (5-year car loan at 7% interest rate)
                        const loanAmount = carValue - carDownPayment;
                        const monthlyInterestRate = 0.07 / 12;
                        const numberOfPayments = 5 * 12;
                        
                        // Calculate car loan payment using the loan formula
                        const loanPayment = loanAmount * 
                          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
                          
                        // Add insurance (~$100/month) and maintenance (~$50/month)
                        const insurance = 100;
                        const maintenance = 50;
                        
                        // Total monthly payment - validate for NaN or Infinity
                        const calculatedTotal = loanPayment + insurance + maintenance;
                        const total = !isNaN(calculatedTotal) && isFinite(calculatedTotal) 
                          ? Math.round(calculatedTotal)
                          : 350; // Fallback to default if calculation fails
                        
                        setCarMonthlyPayment(total);
                      }}
                    >
                      Calculate Payment
                    </Button>
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
                <div className="space-y-4 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center space-x-2 bg-white py-2 px-4 rounded-full shadow-sm border border-purple-200">
                      <GraduationCap className="h-5 w-5 text-purple-500" />
                      <h3 className="text-lg font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text">Graduate School Planning</h3>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="education-type">Program Type</Label>
                    <Select
                      value={educationType}
                      onValueChange={(value) => {
                        console.log(`Education Type Selected: ${value}`);
                        console.log(`Is Graduate Program: ${['masters', 'phd', 'mba', 'jd', 'md'].includes(value)}`);
                        setEducationType(value);
                      }}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select program type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">Ph.D. / Doctoral</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="jd">Law School (JD)</SelectItem>
                        <SelectItem value="md">Medical School (MD)</SelectItem>
                        <SelectItem value="certificate">Professional Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="education-years">Program Duration (Years)</Label>
                    <div className="flex items-center mt-2">
                      <span className="mr-4 text-sm w-8">{educationYears}</span>
                      <Slider
                        id="education-years"
                        min={1}
                        max={8}
                        step={1}
                        value={[educationYears]}
                        onValueChange={(value) => setEducationYears(value[0])}
                        className="flex-1"
                      />
                      <span className="ml-4 text-sm w-8">{educationYears}</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="education-annual-cost">Annual Program Cost</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="education-annual-cost"
                        value={educationAnnualCost}
                        onChange={(e) => {
                          const cost = Number(e.target.value);
                          setEducationAnnualCost(cost);
                          setEducationCost(cost * educationYears);
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total program cost: ${(educationAnnualCost * educationYears).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="education-annual-loan">Annual Loan Amount</Label>
                    <div className="flex items-center mt-1">
                      <span className="mr-2">$</span>
                      <Input
                        type="number"
                        id="education-annual-loan"
                        value={educationAnnualLoan}
                        onChange={(e) => setEducationAnnualLoan(Number(e.target.value))}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Total loans: ${(educationAnnualLoan * educationYears).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-purple-100 mt-3">
                    <h4 className="font-medium text-purple-700 mb-2">Working Status During Education</h4>
                    <RadioGroup 
                      value={workStatus} 
                      onValueChange={(val: string) => setWorkStatus(val)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="work-status-no" />
                        <Label htmlFor="work-status-no" className="font-normal">Not working during education</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="part-time" id="work-status-part-time" />
                        <Label htmlFor="work-status-part-time" className="font-normal">Working part-time</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full-time" id="work-status-full-time" />
                        <Label htmlFor="work-status-full-time" className="font-normal">Working full-time</Label>
                      </div>
                    </RadioGroup>
                    
                    {workStatus === "part-time" && (
                      <div className="mt-3 border-t border-purple-100 pt-3">
                        <Label htmlFor="part-time-income" className="text-sm">Part-time Annual Income</Label>
                        <div className="flex items-center mt-1">
                          <span className="mr-2">$</span>
                          <Input
                            type="number"
                            id="part-time-income"
                            value={partTimeIncome}
                            onChange={(e) => setPartTimeIncome(Number(e.target.value))}
                            className="max-w-[200px]"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated annual income from part-time work during studies
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-purple-100 mt-3">
                    <h4 className="font-medium text-purple-700 mb-2">Funding Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-600">Total Program Cost:</div>
                      <div className="font-medium text-right">${(educationAnnualCost * educationYears).toLocaleString()}</div>
                      
                      <div className="text-gray-600">Total Loans:</div>
                      <div className="font-medium text-right">${(educationAnnualLoan * educationYears).toLocaleString()}</div>
                      
                      <div className="text-gray-600">From Savings:</div>
                      <div className="font-medium text-right">${(educationAnnualCost * educationYears - educationAnnualLoan * educationYears).toLocaleString()}</div>
                      
                      <div className="text-gray-600 pt-2 border-t border-gray-100">Required Savings:</div>
                      <div className="font-medium text-right pt-2 border-t border-gray-100 text-purple-700">
                        ${Math.max(0, educationAnnualCost * educationYears - educationAnnualLoan * educationYears).toLocaleString()}
                      </div>
                    </div>
                    
                    {futureSavings && (
                      <div className="mt-3 text-xs border-t border-purple-100 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Projected savings in {yearsAway} years:</span>
                          <span className="font-medium">${Math.round(futureSavings.futureSavings).toLocaleString()}</span>
                        </div>
                        
                        {futureSavings.futureSavings < Math.max(0, educationAnnualCost * educationYears - educationAnnualLoan * educationYears) ? (
                          <div className="mt-2 bg-red-50 text-red-700 p-2 rounded-md border border-red-100 flex items-start">
                            <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>You may need to increase your savings rate or loan amount to cover the education costs.</span>
                          </div>
                        ) : (
                          <div className="mt-2 bg-green-50 text-green-700 p-2 rounded-md border border-green-100">
                            Your projected savings should cover the education costs not funded by loans.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-purple-100 mt-4">
                    <h4 className="font-medium text-purple-700 mb-2">Career After Graduation</h4>
                    <div className="space-y-4">
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <Label className="text-purple-700 font-medium">Career Path</Label>
                        <RadioGroup 
                          value={returnToSameProfession ? "same" : "new"} 
                          onValueChange={(val: string) => setReturnToSameProfession(val === "same")}
                          className="space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="same" id="return-same-profession" />
                            <Label htmlFor="return-same-profession" className="font-normal">Return to same profession</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="new" id="enter-new-profession" />
                            <Label htmlFor="enter-new-profession" className="font-normal">Enter new profession</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <Label htmlFor="target-occupation" className="text-purple-700 font-medium flex items-center">
                        <span className="mr-2">💼</span> {returnToSameProfession ? "Your Profession After Graduation" : "New Occupation After Graduation"}
                      </Label>
                      <div className="mt-2 relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between bg-white border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus:ring-purple-500"
                            >
                              {targetOccupation 
                                ? targetOccupation 
                                : "Search for your target career..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
                            <Command>
                              <div className="px-3 py-2 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                                <p className="text-xs text-center font-medium text-purple-600">💼 What career do you want after graduating?</p>
                              </div>
                              <CommandInput placeholder="Type to search careers..." className="h-9 border-purple-100" />
                              <CommandList className="max-h-[300px] overflow-auto">
                                <CommandEmpty>No matching careers found</CommandEmpty>
                                <CommandGroup>
                                  {careers?.sort((a, b) => a.title.localeCompare(b.title)).map((career) => (
                                    <CommandItem
                                      key={career.id}
                                      value={career.title}
                                      onSelect={() => {
                                        setTargetOccupation(career.title);
                                      }}
                                      className="flex items-center"
                                    >
                                      <span>{career.title}</span>
                                      {career.salaryMedian && 
                                        <span className="ml-auto text-xs text-green-600 font-semibold">
                                          ${career.salaryMedian.toLocaleString()}
                                        </span>
                                      }
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    {targetOccupation && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-100 mt-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <Label className="text-purple-700">Expected Yearly Salary 💰</Label>
                            <div className="mt-1 font-medium text-lg text-green-600">
                              ${careers?.find(c => c.title === targetOccupation)?.salaryMedian?.toLocaleString() || "???,???"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Average salary for this job
                            </div>
                          </div>
                          <div className="text-5xl">
                            {
                              (careers?.find(c => c.title === targetOccupation)?.salaryMedian || 0) > 100000 ? "🤑" :
                              (careers?.find(c => c.title === targetOccupation)?.salaryMedian || 0) > 70000 ? "😎" :
                              (careers?.find(c => c.title === targetOccupation)?.salaryMedian || 0) > 40000 ? "🙂" : "😅"
                            }
                          </div>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-purple-100">
                          <span className="font-medium">Pro tip:</span> Advanced degrees can open doors to higher-paying roles and specialized positions in your field!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-white pt-4 pb-2 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone} className="ml-2">
              {isEditing ? "Update Milestone" : "Save Milestone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilestonesSection;