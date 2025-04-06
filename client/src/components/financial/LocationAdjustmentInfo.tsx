import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FinancialProjectionData } from "@/lib/pythonCalculator";
import { MapPin, DollarSign, Home, Car, Utensils, Heart } from "lucide-react";

interface LocationAdjustmentInfoProps {
  projectionData: FinancialProjectionData;
}

export const LocationAdjustmentInfo: React.FC<LocationAdjustmentInfoProps> = ({ projectionData }) => {
  const location = projectionData.location;
  
  if (!location) {
    return null;
  }
  
  // Format factors to percentage values
  const formatFactor = (factor?: number) => {
    if (factor === undefined || factor === null) return "N/A";
    const percentage = (factor - 1) * 100;
    const prefix = percentage >= 0 ? "+" : "";
    return `${prefix}${percentage.toFixed(1)}%`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Location Adjustment Details</h3>
          <div className="flex items-center">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {location.city || ""} {location.state || ""} {location.zipCode || ""}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Income Adjustment</h4>
              <p className="text-sm text-gray-600">
                {formatFactor(location.incomeAdjustmentFactor)} compared to national average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Home className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Housing Cost</h4>
              <p className="text-sm text-gray-600">
                {formatFactor(location.housingFactor)} compared to national average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Car className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Transportation Cost</h4>
              <p className="text-sm text-gray-600">
                {formatFactor(location.transportationFactor)} compared to national average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Utensils className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Food Cost</h4>
              <p className="text-sm text-gray-600">
                {formatFactor(location.foodFactor)} compared to national average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Heart className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Healthcare Cost</h4>
              <p className="text-sm text-gray-600">
                {formatFactor(location.healthcareFactor)} compared to national average
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">Overall Cost of Living</h4>
              <p className="text-sm text-gray-600">
                {location.costOfLivingIndex ? `${location.costOfLivingIndex}% of national average` : "N/A"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">How this affects your financial projections:</span> The financial projections 
            shown on this page have been adjusted to reflect the cost of living in your location. Income and expense 
            projections account for the local factors shown above. For example, in areas with higher costs, both 
            expenses and potential income are typically higher than the national average.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationAdjustmentInfo;