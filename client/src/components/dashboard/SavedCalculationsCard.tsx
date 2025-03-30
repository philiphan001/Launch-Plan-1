import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
const ProfileCalculationsSection = () => {
  const { toast } = useToast();
  // Default user ID (would come from auth context in a real app)
  const userId = 1;
  
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Your Saved Cost Calculations
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
                  <Link href={`/net-price-calculator?collegeId=${calc.collegeId}`}>
                    <Button variant="outline" size="sm">
                      Recalculate
                    </Button>
                  </Link>
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

export default ProfileCalculationsSection;