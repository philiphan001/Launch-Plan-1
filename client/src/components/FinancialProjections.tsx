import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ProjectionData, College } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface EducationTypeOption {
  value: string;
  label: string;
  years: number;
}

const EDUCATION_TYPES: EducationTypeOption[] = [
  { value: "none", label: "No Education", years: 0 },
  { value: "2year_college", label: "2-Year College", years: 2 },
  { value: "4year_college", label: "4-Year College", years: 4 },
  { value: "masters", label: "Master's Degree", years: 6 },
  { value: "phd", label: "PhD", years: 10 },
  { value: "medical", label: "Medical School", years: 8 },
  { value: "law", label: "Law School", years: 7 },
  { value: "military", label: "Military Service", years: 4 },
  { value: "gap_year", label: "Gap Year", years: 1 }
];

export function FinancialProjections() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [startingAge, setStartingAge] = useState<number>(18);
  const [educationType, setEducationType] = useState<string>("none");
  const [projectionData, setProjectionData] = useState<ProjectionData | null>(null);
  const [favoriteColleges, setFavoriteColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  
  // Fetch user's favorite colleges when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchFavoriteColleges(user.id);
    }
  }, [isAuthenticated, user]);
  
  const fetchFavoriteColleges = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/favorite-colleges`);
      if (response.ok) {
        const data = await response.json();
        setFavoriteColleges(data);
      }
    } catch (error) {
      console.error("Error fetching favorite colleges:", error);
    }
  };
  
  const handleCalculate = async () => {
    try {
      // Prepare request data
      const requestData: any = {
        startAge: startingAge,
        // Only include educationType if no college is selected
        ...(selectedCollege ? {
          collegeId: selectedCollege.id,
          includesCollegeCalculation: true,
        } : {
          educationType: educationType
        }),
        // ... add other parameters as needed ...
      };
      
      // If college is selected, pass college data for more accurate calculations
      if (selectedCollege) {
        requestData.collegeData = selectedCollege;
      }
      
      const response = await fetch("/api/calculate/financial-projection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) throw new Error("Failed to calculate projections");
      
      const data = await response.json();
      setProjectionData(data);
      
      // Show age adjustment info if applicable
      if (data.age_adjustment && data.age_adjustment.years_added > 0) {
        toast({
          title: "Age Adjustment Applied",
          description: `Starting age adjusted from ${data.age_adjustment.original_age} to ${data.age_adjustment.adjusted_age} based on ${data.age_adjustment.education_type.replace("_", " ")}`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error calculating projections:", error);
      toast({
        title: "Error",
        description: "Failed to calculate financial projections",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Starting age input (can be added here) */}
      
      {/* College Selection */}
      <div className="grid gap-4">
        <Label htmlFor="college-selection">Selected College</Label>
        <Select
          value={selectedCollege?.id?.toString() || ""}
          onValueChange={(value) => {
            const college = favoriteColleges.find(c => c.id.toString() === value);
            setSelectedCollege(college || null);
            
            // If a college is selected, clear manual education type selection
            if (college) {
              setEducationType("none");
            }
          }}
        >
          <SelectTrigger id="college-selection">
            <SelectValue placeholder="Select a college" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {favoriteColleges.map((college) => (
              <SelectItem key={college.id} value={college.id.toString()}>
                {college.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedCollege && (
          <p className="text-sm text-muted-foreground">
            Your starting age will be adjusted based on the selected college type.
          </p>
        )}
      </div>
      
      {/* Only show education type if no college is selected */}
      {!selectedCollege && (
        <div className="grid gap-4">
          <Label htmlFor="education-type">Education Path</Label>
          <Select
            value={educationType}
            onValueChange={setEducationType}
          >
            <SelectTrigger id="education-type">
              <SelectValue placeholder="Select education path" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label} ({type.years} years)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {educationType !== "none" && (
            <p className="text-sm text-muted-foreground">
              Your starting age will be adjusted by {EDUCATION_TYPES.find(t => t.value === educationType)?.years} years to account for your education path.
            </p>
          )}
        </div>
      )}
      
      {/* Calculate Button */}
      <button 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        onClick={handleCalculate}
      >
        Calculate Projections
      </button>
      
      {/* Results Display */}
      {projectionData && projectionData.age_adjustment && (
        <div className="rounded-lg border p-4 bg-muted/50">
          <h3 className="font-medium mb-2">Age Adjustment Information</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt>Original Starting Age:</dt>
            <dd>{projectionData.age_adjustment.original_age}</dd>
            <dt>Adjusted Starting Age:</dt>
            <dd>{projectionData.age_adjustment.adjusted_age}</dd>
            <dt>Years Added:</dt>
            <dd>{projectionData.age_adjustment.years_added}</dd>
            <dt>Education Type:</dt>
            <dd className="capitalize">{projectionData.age_adjustment.education_type.replace("_", " ")}</dd>
          </dl>
        </div>
      )}
    </div>
  );
} 