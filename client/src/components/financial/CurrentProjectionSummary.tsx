import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { School, Briefcase, MapPin, Calculator } from "lucide-react";
import ProjectionAvatar from '@/components/ProjectionAvatar';

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

interface CurrentProjectionSummaryProps {
  collegeCalculation: CollegeCalculation | null | undefined;
  careerCalculation: CareerCalculation | null | undefined;
  locationData: LocationData | null | undefined;
}

const CurrentProjectionSummary: React.FC<CurrentProjectionSummaryProps> = ({
  collegeCalculation,
  careerCalculation,
  locationData,
}) => {
  return (
    <Card className="mb-6 border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-primary" />
          Current Projection Summary
        </h2>
        <div className="flex flex-row items-start gap-6">
          {/* Avatar on the left */}
          <div className="flex-shrink-0">
            <ProjectionAvatar mood="happy" commentary="Here's a quick look at your current plan!" />
          </div>
          {/* Summary details on the right */}
          <div className="flex-1">
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
                ) : (
                  <p className="text-sm text-muted-foreground italic">No career selected</p>
                )}
              </div>
              
              {/* Location Section */}
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1.5" />
                  Location
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
                ) : (
                  <p className="text-sm text-muted-foreground italic">No location data</p>
                )}
              </div>
            </div>
            {/* If all sections are missing, show a placeholder */}
            {(!collegeCalculation && !careerCalculation && !locationData) && (
              <div className="mt-4 text-center text-muted-foreground italic">
                No projection data yet. Add a college, career, or location to get started!
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentProjectionSummary;