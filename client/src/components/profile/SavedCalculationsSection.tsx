import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Calculator, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";

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
}

interface College {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
}

// This is a profile component to display saved college cost calculations
const SavedCalculationsSection = () => {
  const { toast } = useToast();
  // Default user ID (would come from auth context in a real app)
  const userId = 1;
  const queryClient = useQueryClient();
  
  // Fetch saved calculations
  const { data: calculations, isLoading, error } = useQuery({
    queryKey: ['/api/college-calculations/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/college-calculations/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch saved calculations');
      }
      return response.json() as Promise<CollegeCalculation[]>;
    }
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
    }
  });
  
  // Mutation to remove a calculation
  const deleteMutation = useMutation({
    mutationFn: async (calculationId: number) => {
      const response = await fetch(`/api/college-calculations/${calculationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete calculation');
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
      console.error("Error removing calculation:", error);
      toast({
        title: "Error removing calculation",
        description: "There was a problem removing this calculation. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to remove a calculation
  const removeCalculation = (id: number) => {
    deleteMutation.mutate(id);
  };
  
  // Function to get college name by ID
  const getCollegeName = (collegeId: number): string => {
    if (!colleges) return 'Unknown College';
    const college = colleges.find(c => c.id === collegeId);
    return college ? college.name : 'Unknown College';
  };
  
  if (isLoading || isLoadingColleges) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Your Saved Cost Calculations
          </CardTitle>
          <CardDescription>Loading your saved college cost calculations...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Your Saved Cost Calculations
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Your Saved College Calculations
        </CardTitle>
        <CardDescription>View and compare your saved college cost calculations</CardDescription>
      </CardHeader>
      <CardContent>
        {calculations && calculations.length > 0 ? (
          <div className="space-y-4">
            {calculations.map((calc) => (
              <div key={calc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <School className="h-5 w-5 text-primary mr-2" />
                    <h3 className="font-medium">{getCollegeName(calc.collegeId)}</h3>
                  </div>
                  <Badge variant={calc.inState ? "outline" : "secondary"}>
                    {calc.inState ? "In-State" : "Out-of-State"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Net Price</p>
                    <p className="font-medium text-lg">{formatCurrency(calc.netPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cost</p>
                    <p className="font-medium text-lg">{formatCurrency(calc.totalCost)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Family Contribution</p>
                    <p className="font-medium">{formatCurrency(calc.familyContribution)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Work-Study</p>
                    <p className="font-medium">{formatCurrency(calc.workStudy)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Student Loans</p>
                    <p className="font-medium">{formatCurrency(calc.studentLoanAmount)}</p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mt-3">
                  <p>Calculation date: {formatDate(new Date(calc.calculationDate))}</p>
                </div>
                
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => removeCalculation(calc.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Calculator className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No saved calculations</h3>
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
      </CardContent>
    </Card>
  );
};

export default SavedCalculationsSection;