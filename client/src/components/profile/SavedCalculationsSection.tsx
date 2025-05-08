import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calculator, School, Trash2, Briefcase, Book, GraduationCap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User } from "@/interfaces/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { College } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authenticatedFetch } from "@/services/favoritesService";

interface CollegeCalculation {
  id: number;
  userId: number;
  collegeId: number;
  netPrice: number;
  inState: boolean;
  familyContribution: number;
  workStudy: number;
  studentLoanAmount: number;
  financialAid: number;
  householdIncome: number;
  householdSize: number;
  zip: string;
  tuitionUsed: number;
  roomAndBoardUsed: number;
  onCampusHousing: boolean;
  totalCost: number;
  notes: string;
  calculationDate: string;
  includedInProjection: boolean;
}

interface CareerCalculation {
  id: number;
  userId: number;
  careerId: number;
  career?: {
    id: number;
    title: string;
    salary: number | null;
    education: string | null;
  };
  projectedSalary: number;
  startYear: number | null;
  education: string | null;
  entryLevelSalary: number | null;
  midCareerSalary: number | null;
  experiencedSalary: number | null;
  additionalNotes: string | null;
  calculationDate: string;
  includedInProjection: boolean;
  locationZip: string | null;
  adjustedForLocation: boolean;
}

interface Career {
  id: number;
  title: string;
  salary: number | null;
  education: string | null;
  description: string | null;
  growthRate: string | null;
}

interface SavedCalculationsSectionProps {
  user?: User | null;
}

// This is a profile component to display saved college and career calculations
const SavedCalculationsSection = ({ user }: SavedCalculationsSectionProps) => {
  const { toast } = useToast();
  // Get user ID from props
  const userId = user?.id;
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // State for active tab and dialog
  const [activeTab, setActiveTab] = useState<'college' | 'career' | 'cities'>('college');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCalculationId, setSelectedCalculationId] = useState<number | null>(null);
  
  // State to track selected calculations
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  
  // Fetch saved college calculations with automatic refresh
  const { data: collegeCalculations, isLoading: isLoadingCollegeCalcs, error: collegeError } = useQuery({
    queryKey: ['/api/college-calculations/user', userId],
    queryFn: async () => {
      // Skip if no user ID
      if (!userId) {
        return [] as CollegeCalculation[];
      }
      
      const response = await authenticatedFetch(`/api/college-calculations/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved college calculations');
      }
      return response.json() as Promise<CollegeCalculation[]>;
    },
    // Only refetch when window regains focus after 30 seconds
    refetchOnWindowFocus: false,
    staleTime: 30000, // Data is considered fresh for 30 seconds
    // Don't run query if user isn't authenticated
    enabled: !!userId
  });
  
  // Fetch colleges to get their names
  const { data: colleges, isLoading: isLoadingColleges } = useQuery({
    queryKey: ['/api/colleges'],
    queryFn: async () => {
      const response = await fetch('/api/colleges');
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      return response.json() as Promise<College[]>;
    },
    staleTime: 30000, // Data is considered fresh for 30 seconds
    refetchOnWindowFocus: false
  });
  
  // Fetch saved career calculations with automatic refresh
  const { data: careerCalculations, isLoading: isLoadingCareerCalcs, error: careerError } = useQuery({
    queryKey: ['/api/career-calculations/user', userId],
    queryFn: async () => {
      // Skip if no user ID
      if (!userId) {
        return [] as CareerCalculation[];
      }
      
      const response = await authenticatedFetch(`/api/career-calculations/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved career calculations');
      }
      return response.json() as Promise<CareerCalculation[]>;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Data is considered fresh for 30 seconds
    enabled: !!userId
  });
  
  // Fetch careers to get their titles
  const { data: careers, isLoading: isLoadingCareers } = useQuery({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      const response = await fetch('/api/careers');
      if (!response.ok) {
        throw new Error('Failed to fetch careers');
      }
      return response.json() as Promise<Career[]>;
    }
  });
  
  // College mutations
  const deleteCollegeMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      const response = await fetch(`/api/college-calculations/${calculationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete college calculation');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/college-calculations/user', userId] });
      toast({
        title: "Calculation removed",
        description: "The college calculation has been removed from your profile.",
      });
    },
    onError: (error) => {
      console.error("Error removing college calculation:", error);
      toast({
        title: "Error removing calculation",
        description: "There was a problem removing this calculation. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const toggleCollegeProjectionMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      console.log("Toggling college projection for ID:", calculationId);
      const response = await fetch(`/api/college-calculations/${calculationId}/toggle-projection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle college projection inclusion');
      }
      
      const result = await response.json();
      console.log("Toggle response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("College toggle success, invalidating query cache");
      // Force an immediate refetch to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/college-calculations/user', userId] });
      queryClient.refetchQueries({ queryKey: ['/api/college-calculations/user', userId] });
      
      toast({
        title: "Financial Projection Updated",
        description: "This college scenario is now selected for your financial projections. Any previously selected college has been deselected.",
      });
    },
    onError: (error) => {
      console.error("Error toggling college projection inclusion:", error);
      toast({
        title: "Error updating projection",
        description: "There was a problem including this calculation in your projections. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Career mutations
  const deleteCareerMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      const response = await fetch(`/api/career-calculations/${calculationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete career calculation');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/career-calculations/user', userId] });
      toast({
        title: "Calculation removed",
        description: "The career calculation has been removed from your profile.",
      });
    },
    onError: (error) => {
      console.error("Error removing career calculation:", error);
      toast({
        title: "Error removing calculation",
        description: "There was a problem removing this calculation. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const toggleCareerProjectionMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      console.log("Toggling career projection for ID:", calculationId);
      const response = await fetch(`/api/career-calculations/${calculationId}/toggle-projection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle career projection inclusion');
      }
      
      const result = await response.json();
      console.log("Career toggle response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Career toggle success, invalidating query cache");
      // Force an immediate refetch to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/career-calculations/user', userId] });
      queryClient.refetchQueries({ queryKey: ['/api/career-calculations/user', userId] });
      
      toast({
        title: "Financial Projection Updated",
        description: "This career scenario is now selected for your financial projections. Any previously selected career has been deselected.",
      });
    },
    onError: (error) => {
      console.error("Error toggling career projection inclusion:", error);
      toast({
        title: "Error updating projection",
        description: "There was a problem including this calculation in your projections. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Helper functions to remove calculations and toggle projection inclusion
  const removeCollegeCalculation = (id: number) => {
    deleteCollegeMutation.mutate(id);
  };
  
  const handleCollegeSelection = (id: number) => {
    // Check if we already have an existing selection
    const hasExistingSelection = collegeCalculations?.some(calc => 
      calc.includedInProjection && calc.id !== id
    );
    
    // If calculation is already selected, just deselect it
    const isCurrentlySelected = collegeCalculations?.find(calc => calc.id === id)?.includedInProjection;
    if (isCurrentlySelected) {
      toggleCollegeProjectionMutation.mutate(id);
      return;
    }
    
    // If we have an existing selection, show confirmation dialog
    if (hasExistingSelection) {
      setSelectedCalculationId(id);
      setConfirmDialogOpen(true);
    } else {
      // Otherwise just toggle directly
      toggleCollegeProjectionMutation.mutate(id);
    }
  };
  
  const toggleCollegeProjectionInclusion = (id: number) => {
    handleCollegeSelection(id);
  };
  
  const removeCareerCalculation = (id: number) => {
    deleteCareerMutation.mutate(id);
  };
  
  const handleCareerSelection = (id: number) => {
    // Check if we already have an existing selection
    const hasExistingSelection = careerCalculations?.some(calc => 
      calc.includedInProjection && calc.id !== id
    );
    
    // If calculation is already selected, just deselect it
    const isCurrentlySelected = careerCalculations?.find(calc => calc.id === id)?.includedInProjection;
    if (isCurrentlySelected) {
      toggleCareerProjectionMutation.mutate(id);
      return;
    }
    
    // If we have an existing selection, show confirmation dialog
    if (hasExistingSelection) {
      setSelectedCalculationId(id);
      setConfirmDialogOpen(true);
    } else {
      // Otherwise just toggle directly
      toggleCareerProjectionMutation.mutate(id);
    }
  };
  
  const toggleCareerProjectionInclusion = (id: number) => {
    handleCareerSelection(id);
  };
  
  const confirmToggleProjection = () => {
    if (selectedCalculationId === null) return;
    
    if (activeTab === 'college') {
      toggleCollegeProjectionMutation.mutate(selectedCalculationId);
    } else {
      toggleCareerProjectionMutation.mutate(selectedCalculationId);
    }
    
    setConfirmDialogOpen(false);
    setSelectedCalculationId(null);
  };
  
  // Function to get college name by ID
  const getCollegeName = (collegeId: number): string => {
    if (!colleges) return 'Unknown College';
    const college = colleges.find(c => Number(c.id) === collegeId);
    return college ? college.name : 'Unknown College';
  };
  
  // Function to get career title by ID
  const getCareerTitle = (careerId: number): string => {
    if (!careers) return 'Unknown Career';
    const career = careers.find(c => Number(c.id) === careerId);
    return career ? career.title : 'Unknown Career';
  };
  
  // useEffect to initialize the selected calculations
  useEffect(() => {
    // Find the currently selected college calculation
    const selectedCollege = collegeCalculations?.find(calc => calc.includedInProjection);
    if (selectedCollege) {
      setSelectedCollegeId(selectedCollege.id);
    }

    // Find the currently selected career calculation
    const selectedCareer = careerCalculations?.find(calc => calc.includedInProjection);
    if (selectedCareer) {
      setSelectedCareerId(selectedCareer.id);
    }
  }, [collegeCalculations, careerCalculations]);
  
  const isLoading = isLoadingCollegeCalcs || isLoadingColleges || isLoadingCareerCalcs || isLoadingCareers;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Your Saved Calculations
          </CardTitle>
          <CardDescription>Loading your saved calculations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (collegeError && careerError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Your Saved Calculations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              We encountered an error loading your saved calculations. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing projection?</AlertDialogTitle>
            <AlertDialogDescription>
              You already have a {activeTab === 'college' ? 'college' : 'career'} scenario selected for your financial projection. 
              Do you want to replace it with this selection? Only one {activeTab === 'college' ? 'college' : 'career'} scenario 
              can be active at a time for your financial projections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedCalculationId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleProjection}>
              Yes, update projection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Your Saved Financial Calculations
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  // Clear all selections
                  const collegePromises = collegeCalculations
                    ?.filter(calc => calc.includedInProjection)
                    .map(calc => toggleCollegeProjectionMutation.mutateAsync(calc.id)) || [];
                  const careerPromises = careerCalculations
                    ?.filter(calc => calc.includedInProjection)
                    .map(calc => toggleCareerProjectionMutation.mutateAsync(calc.id)) || [];
                  await Promise.all([...collegePromises, ...careerPromises]);
                  toast({
                    title: "Selections Cleared",
                    description: "All projection selections have been cleared.",
                  });
                }}
              >
                Clear All Selections
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  // Check if a career calculation is included
                  const hasCareer = careerCalculations?.some(calc => calc.includedInProjection);
                  if (!hasCareer) {
                    toast({
                      title: "No Career Selected",
                      description: "You have not selected a career for your projection. The projection will use default values.",
                      variant: "destructive",
                    });
                  }
                  // Redirect to projections page with autoGenerate flag and force recalculation
                  setLocation("/projections?autoGenerate=true&forceRecalculate=true");
                }}
              >
                Run Projection
              </Button>
            </div>
          </div>
          <CardDescription>View and compare your saved college and career calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="college" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'college' | 'career' | 'cities')}
            className="mt-2"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="college" className="flex items-center">
                <School className="mr-2 h-4 w-4" />
                College Costs
              </TabsTrigger>
              <TabsTrigger value="career" className="flex items-center">
                <Briefcase className="mr-2 h-4 w-4" />
                Career Earnings
              </TabsTrigger>
              <TabsTrigger value="cities" className="flex items-center">
                <Book className="mr-2 h-4 w-4" />
                Saved Cities
              </TabsTrigger>
            </TabsList>
            
            {/* College Calculations Tab */}
            <TabsContent value="college">
              {collegeCalculations && collegeCalculations.length > 0 ? (
                <div className="space-y-6">
                  {/* Group calculations by college type */}
                  {Object.entries(
                    collegeCalculations.reduce((acc, calc) => {
                      const college = colleges?.find(c => c.id === calc.collegeId);
                      
                      // Primary categorization based on type field for community colleges
                      let type = 'Other';
                      if (college?.type?.toLowerCase().includes('community') || 
                          college?.type?.toLowerCase().includes('2-year') || 
                          college?.type?.toLowerCase().includes('2 year') || 
                          college?.type?.toLowerCase().includes('junior') ||
                          (college?.name && college?.name.toLowerCase().includes('community college'))) {
                        type = 'Community College';
                      }
                      // Then check degreesAwardedPredominant for other types
                      else if (college?.degreesAwardedPredominant === 1) {
                        type = 'Vocational';
                      }
                      else if (college?.degreesAwardedPredominant === 2 && type !== 'Community College') {
                        type = 'Community College';
                      }
                      else if (college?.degreesAwardedPredominant === 4) {
                        type = 'Graduate';
                      }
                      else if (college?.degreesAwardedPredominant === 3) {
                        type = '4-Year';
                      }
                      // Fallback to type field for other categories
                      else if (college?.type) {
                        if (/vocational|technical|trade/i.test(college.type)) {
                          type = 'Vocational';
                        }
                        else if (/graduate|professional/i.test(college.type)) {
                          type = 'Graduate';
                        }
                        else {
                          // Default to 4-year if type doesn't match other categories
                          type = '4-Year';
                        }
                      }
                      else {
                        // Default to 4-year if no categorization information is available
                        type = '4-Year';
                      }
                      
                      if (!acc[type]) {
                        acc[type] = [];
                      }
                      acc[type].push(calc);
                      return acc;
                    }, {} as Record<string, CollegeCalculation[]>)
                  ).map(([type, calculations]) => (
                    <div key={type} className="space-y-4">
                      <div className="flex items-center gap-2">
                        {type === 'Vocational' && <Book className="h-4 w-4 text-primary" />}
                        {type === 'Community College' && <School className="h-4 w-4 text-primary" />}
                        {type === '4-Year' && <GraduationCap className="h-4 w-4 text-primary" />}
                        {type === 'Graduate' && <GraduationCap className="h-4 w-4 text-primary" />}
                        <h3 className="font-medium text-sm">{type} Institutions</h3>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {calculations.length} {calculations.length === 1 ? 'calculation' : 'calculations'}
                        </Badge>
                      </div>
                      {calculations.map((calc) => (
                        <div key={calc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <School className="h-4 w-4 text-primary mr-1.5" />
                                <h3 className="font-medium text-sm">{getCollegeName(calc.collegeId)}</h3>
                                <Badge variant={calc.inState ? "outline" : "secondary"} className="ml-2 text-xs">
                                  {calc.inState ? "In-State" : "Out-of-State"}
                                </Badge>
                              </div>
                              {calc.notes && (
                                <p className="text-xs text-muted-foreground">{calc.notes}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Net Price:</span>
                                <span className="font-medium text-sm">{formatCurrency(calc.netPrice)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Total Cost:</span>
                                <span className="font-medium text-sm">{formatCurrency(calc.totalCost)}</span>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Family Contribution:</span>
                                <span className="font-medium text-sm">{formatCurrency(calc.familyContribution)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-muted-foreground">Loans:</span>
                                <span className="font-medium text-sm">{formatCurrency(calc.studentLoanAmount)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-1">
                            <p>{formatDate(new Date(calc.calculationDate))}</p>
                          </div>
                          
                          <div className="mt-2 pt-2 border-t flex justify-end gap-2">
                            <Button 
                              variant={calc.includedInProjection ? "default" : "outline"} 
                              size="sm"
                              className={`h-7 text-xs ${calc.includedInProjection ? "bg-primary text-primary-foreground" : "bg-background"}`}
                              onClick={() => toggleCollegeProjectionInclusion(calc.id)}
                              disabled={toggleCollegeProjectionMutation.isPending}
                            >
                              <Calculator className="h-3 w-3 mr-1" />
                              {calc.includedInProjection ? "✓ Selected for Projection" : "Select for Projection"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => removeCollegeCalculation(calc.id)}
                              disabled={deleteCollegeMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <School className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No saved college calculations</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't saved any college cost calculations yet.
                  </p>
                  <Link href="/net-price-calculator">
                    <Button>
                      Calculate College Costs
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            {/* Career Calculations Tab */}
            <TabsContent value="career">
              {careerCalculations && careerCalculations.length > 0 ? (
                <div className="space-y-4">
                  {careerCalculations.map((calc) => (
                    <div key={calc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 text-primary mr-1.5" />
                            <h3 className="font-medium text-sm">{calc.career?.title || getCareerTitle(calc.careerId)}</h3>
                            {(calc.adjustedForLocation && calc.locationZip) && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Location Adjusted
                              </Badge>
                            )}
                          </div>
                          {calc.additionalNotes && (
                            <p className="text-xs text-muted-foreground">{calc.additionalNotes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-xs text-muted-foreground">Projected Salary:</span>
                            <span className="font-medium text-sm">{formatCurrency(calc.projectedSalary)}</span>
                          </div>
                          {calc.startYear && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Start Year:</span>
                              <span className="font-medium text-sm">{calc.startYear}</span>
                            </div>
                          )}
                          {calc.locationZip && calc.adjustedForLocation && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Location:</span>
                              <span className="font-medium text-sm">Location Adjusted</span>
                            </div>
                          )}
                        </div>
                        <div>
                          {calc.education && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Education:</span>
                              <span className="font-medium text-sm">{calc.education}</span>
                            </div>
                          )}
                          {calc.entryLevelSalary && (
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Entry Level:</span>
                              <span className="font-medium text-sm">{formatCurrency(calc.entryLevelSalary)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        <p>{formatDate(new Date(calc.calculationDate))}</p>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t flex justify-end gap-2">
                        <Button 
                          variant={calc.includedInProjection ? "default" : "outline"} 
                          size="sm"
                          className={`h-7 text-xs ${calc.includedInProjection ? "bg-primary text-primary-foreground" : "bg-background"}`}
                          onClick={() => toggleCareerProjectionInclusion(calc.id)}
                          disabled={toggleCareerProjectionMutation.isPending}
                        >
                          <Calculator className="h-3 w-3 mr-1" />
                          {calc.includedInProjection ? "✓ Selected for Projection" : "Select for Projection"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => removeCareerCalculation(calc.id)}
                          disabled={deleteCareerMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No saved career calculations</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You haven't saved any career earnings calculations yet.
                  </p>
                  <Link href="/career-builder">
                    <Button>
                      Explore Career Builder
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
            
            {/* Saved Cities Tab */}
            <TabsContent value="cities">
              <SavedCitiesList userId={userId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

function SavedCitiesList({ userId }: { userId?: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: favoriteLocations = [], isLoading } = useQuery({
    queryKey: ["/api/favorites/locations", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await import("@/services/favoritesService").then(m => m.FavoritesService.getFavoriteLocations(userId));
    },
    enabled: !!userId,
  });
  const removeFavoriteLocationMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return await import("@/services/favoritesService").then(m => m.FavoritesService.removeLocationFromFavorites(favoriteId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/locations", userId] });
      toast({
        title: "City removed",
        description: "City has been removed from your saved cities.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite city:", error);
      toast({
        title: "Error removing city",
        description: "There was a problem removing this city from your saved cities.",
        variant: "destructive",
      });
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!favoriteLocations.length) {
    return <div className="text-center py-6 text-muted-foreground">No saved cities yet</div>;
  }
  return (
    <div className="space-y-3">
      {favoriteLocations.map((loc) => (
        <div key={loc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
          <div>
            <span className="font-bold text-primary mr-2">🏙️</span>
            <span>{loc.city}, {loc.state} ({loc.zipCode})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => removeFavoriteLocationMutation.mutate(loc.id)}
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
}

export default SavedCalculationsSection;