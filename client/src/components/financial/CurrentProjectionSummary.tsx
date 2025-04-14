import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { School, Briefcase, MapPin, Calculator } from "lucide-react";

interface CollegeCalculation {
  id: number;
  userId: number;
  collegeId: number;
  netPrice: number;
  studentLoanAmount: number;
  college?: {
    name: string;
    type?: string;
  };
  inState?: boolean;
}

interface CareerCalculation {
  id: number;
  userId: number;
  careerId: number;
  projectedSalary: number;
  entryLevelSalary?: number | null;
  education?: string | null;
  career?: {
    title: string;
  };
}

interface LocationData {
  id?: number;
  zip_code: string;
  city: string | null;
  state: string | null;
  income_adjustment_factor?: number | null;
}

interface FinancialProjection {
  id: number;
  name: string;
  projectionData?: any;
  includesCollegeCalculation?: boolean;
  collegeCalculationId?: number | null;
  includesCareerCalculation?: boolean;
  careerCalculationId?: number | null;
}

interface CurrentProjectionSummaryProps {
  collegeCalculation: CollegeCalculation | null | undefined;
  careerCalculation: CareerCalculation | null | undefined;
  locationData: LocationData | null | undefined;
  savedProjection?: FinancialProjection | null;
}

const CurrentProjectionSummary: React.FC<CurrentProjectionSummaryProps> = ({
  collegeCalculation,
  careerCalculation,
  locationData,
  savedProjection,
}) => {
  // Extract projection details from the savedProjection if available
  const projectionDetails = React.useMemo(() => {
    if (!savedProjection?.projectionData) return null;
    
    try {
      // Parse the projectionData if it's a string
      const projData = typeof savedProjection.projectionData === 'string'
        ? JSON.parse(savedProjection.projectionData)
        : savedProjection.projectionData;
        
      // Return structured data from the projection
      if (projData) {
        return {
          // Extract data for the last year of projection for career info
          finalSalary: projData.income && projData.income.length > 1 
            ? projData.income[projData.income.length - 1] 
            : null,
          ages: projData.ages || [],
          // Get the initial net worth (savings)
          initialNetWorth: projData.netWorth && projData.netWorth.length > 0 
            ? projData.netWorth[0] 
            : null,
          // Get the final net worth projection
          finalNetWorth: projData.netWorth && projData.netWorth.length > 1 
            ? projData.netWorth[projData.netWorth.length - 1] 
            : null,
        };
      }
    } catch (error) {
      console.error("Error extracting data from projection:", error);
    }
    
    return null;
  }, [savedProjection]);
  
  // If we don't have any data for at least one section, don't render the component
  if (!collegeCalculation && !careerCalculation && !locationData && !projectionDetails) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-primary" />
          Current Projection Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Education Section */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <School className="h-4 w-4 mr-1.5" />
              Education
            </h4>
            {collegeCalculation ? (
              <>
                <p className="text-base font-medium">
                  {collegeCalculation.college?.type || ''} College
                </p>
                <p className="text-sm">
                  {collegeCalculation.college?.name || 'Unknown College'}
                </p>
                {collegeCalculation.inState !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {collegeCalculation.inState ? 'In-State' : 'Out-of-State'}
                  </p>
                )}
              </>
            ) : savedProjection?.includesCollegeCalculation ? (
              <>
                <p className="text-base font-medium">
                  Higher Education
                </p>
                <p className="text-sm">
                  {savedProjection.name.includes("College") ? "College Education" : 
                    savedProjection.name.includes("Vocational") ? "Vocational Training" : 
                    "Educational Path"}
                </p>
                {projectionDetails?.initialNetWorth !== null && (
                  <p className="text-xs text-muted-foreground">
                    Initial Investment: ${projectionDetails?.initialNetWorth?.toLocaleString() || 0}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">No college selected</p>
            )}
          </div>
          
          {/* Career Section */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <Briefcase className="h-4 w-4 mr-1.5" />
              Career
            </h4>
            {careerCalculation ? (
              <>
                <p className="text-base font-medium">
                  {careerCalculation.career?.title || 'Career'}
                </p>
                {careerCalculation.education && (
                  <p className="text-sm">{careerCalculation.education}</p>
                )}
                {careerCalculation.projectedSalary && (
                  <p className="text-xs text-muted-foreground">
                    Projected: ${careerCalculation.projectedSalary.toLocaleString()}
                  </p>
                )}
              </>
            ) : savedProjection?.includesCareerCalculation || projectionDetails?.finalSalary ? (
              <>
                <p className="text-base font-medium">
                  Career Path
                </p>
                <p className="text-sm">
                  {savedProjection?.name || "Professional Pathway"}
                </p>
                {projectionDetails?.finalSalary && (
                  <p className="text-xs text-muted-foreground">
                    Projected: ${projectionDetails.finalSalary.toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">No career selected</p>
            )}
          </div>
          
          {/* Location Section */}
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              Location & Financial Metrics
            </h4>
            {locationData ? (
              <>
                <p className="text-base font-medium">
                  {locationData.city ? locationData.city.toUpperCase() : 'Unknown City'}, 
                  {locationData.state ? locationData.state : ''}
                </p>
                <p className="text-sm">
                  Zip Code: {locationData.zip_code}
                </p>
                {locationData.income_adjustment_factor && (
                  <p className="text-xs text-muted-foreground">
                    Income Adj: {(locationData.income_adjustment_factor * 100).toFixed(0)}% of national average
                  </p>
                )}
              </>
            ) : projectionDetails ? (
              <>
                <p className="text-base font-medium">
                  Financial Overview
                </p>
                {projectionDetails.initialNetWorth !== null && projectionDetails.finalNetWorth !== null && (
                  <p className="text-sm">
                    Net worth growth: ${projectionDetails.initialNetWorth.toLocaleString()} → ${projectionDetails.finalNetWorth.toLocaleString()}
                  </p>
                )}
                {projectionDetails.ages && projectionDetails.ages.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Age range: {projectionDetails.ages[0]} to {projectionDetails.ages[projectionDetails.ages.length - 1]} years
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">No location data</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProjectionSummary;