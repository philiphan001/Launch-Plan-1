import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { School, Briefcase, MapPin, Calculator } from "lucide-react";
import { ProjectionErrorHandler, ProjectionDataWarning } from './ProjectionErrorHandler';

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
  
  // Extended fields that might be available in some projections
  startingAge?: number | null;
  startingSavings?: number | null;
  income?: number | null; 
  expenses?: number | null;
  incomeGrowth?: number | null;
  studentLoanDebt?: number | null;
  timeframe?: number | null;
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
  // Track if we encountered an error parsing the projection data
  const [hasDataError, setHasDataError] = React.useState(false);

  // Extract projection details from the savedProjection if available
  const projectionDetails = React.useMemo(() => {
    if (!savedProjection) return null;

    // Default values for projection details in case we can't extract them
    let defaults = {
      finalSalary: savedProjection.income || 0,
      ages: [savedProjection.startingAge || 25, (savedProjection.startingAge || 25) + (savedProjection.timeframe || 10)],
      initialNetWorth: savedProjection.startingSavings || 0,
      finalNetWorth: savedProjection.startingSavings ? savedProjection.startingSavings * 1.2 : 0
    };
    
    // If we don't have projection data, try to use other fields from savedProjection
    if (!savedProjection.projectionData) {
      console.log("No projection data available, using basic projection fields");
      return defaults;
    }
    
    try {
      // Parse the projectionData if it's a string
      let projData;
      try {
        // First, try to parse if it's a string
        if (typeof savedProjection.projectionData === 'string') {
          projData = JSON.parse(savedProjection.projectionData);
        } else {
          // Otherwise, use it directly as an object
          projData = savedProjection.projectionData;
        }
      } catch (parseError) {
        console.warn("Could not parse projection data as JSON", parseError);
        setHasDataError(true); // Set error flag
        return defaults;
      }
      
      // Validate that we have an object with expected arrays
      if (!projData || typeof projData !== 'object') {
        console.warn("Invalid projection data structure: not an object", projData);
        return defaults;
      }
      
      // Check for required data arrays and provide fallbacks
      const hasIncome = Array.isArray(projData.income) && projData.income.length > 0;
      const hasNetWorth = Array.isArray(projData.netWorth) && projData.netWorth.length > 0;
      const hasAges = Array.isArray(projData.ages) && projData.ages.length > 0;
      
      if (!hasIncome && !hasNetWorth && !hasAges) {
        console.warn("Projection data missing all required arrays", projData);
        return defaults;
      }
      
      // Return structured data from the projection with fallbacks
      return {
        // Extract data for the last year of projection for career info
        finalSalary: hasIncome && projData.income.length > 1 
          ? projData.income[projData.income.length - 1] 
          : (savedProjection.income || defaults.finalSalary),
          
        ages: hasAges ? projData.ages : 
          (savedProjection.startingAge ? 
            [savedProjection.startingAge, savedProjection.startingAge + (savedProjection.timeframe || 10)] : 
            defaults.ages),
            
        // Get the initial net worth (savings)
        initialNetWorth: hasNetWorth ? projData.netWorth[0] : 
          (savedProjection.startingSavings || defaults.initialNetWorth),
          
        // Get the final net worth projection
        finalNetWorth: hasNetWorth && projData.netWorth.length > 1 
          ? projData.netWorth[projData.netWorth.length - 1] 
          : (savedProjection.startingSavings ? savedProjection.startingSavings * 1.2 : defaults.finalNetWorth),
      };
    } catch (error) {
      console.error("Error extracting data from projection:", error);
      setHasDataError(true);
      return defaults;
    }
  }, [savedProjection]);
  
  // Always show the component if we have a savedProjection, even if we don't have details extracted
  // Otherwise, only show if we have at least one piece of data
  if (!savedProjection && !collegeCalculation && !careerCalculation && !locationData && !projectionDetails) {
    console.log("No data to display in CurrentProjectionSummary");
    return null;
  }
  
  // Show error alert when there's a data parsing problem
  if (hasDataError && savedProjection) {
    return (
      <>
        <ProjectionDataWarning 
          message="There was a problem processing the projection data."
          details="Some details may be unavailable or estimated. The system will use fallback values where possible."
        />
        
        <Card className="mb-6 border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Calculator className="mr-2 h-5 w-5 text-primary" />
              Projection Overview (Limited Data)
            </h2>
            
            <div className="my-3">
              <p className="text-sm mb-2">
                <strong>Name:</strong> {savedProjection.name}
              </p>
              
              {savedProjection.startingAge && (
                <p className="text-sm mb-2">
                  <strong>Starting Age:</strong> {savedProjection.startingAge}
                </p>
              )}
              
              {savedProjection.startingSavings !== null && savedProjection.startingSavings !== undefined && (
                <p className="text-sm mb-2">
                  <strong>Starting Savings:</strong> ${savedProjection.startingSavings.toLocaleString()}
                </p>
              )}
              
              {savedProjection.income !== null && savedProjection.income !== undefined && (
                <p className="text-sm mb-2">
                  <strong>Income:</strong> ${savedProjection.income.toLocaleString()}/year
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </>
    );
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