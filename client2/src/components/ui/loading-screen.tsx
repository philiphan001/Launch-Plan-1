import React from "react";
import { AlertCircle, Clock, Calculator } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showCalculatingText?: boolean;
}

export function LoadingScreen({ 
  message = "Financial data is being prepared...", 
  showCalculatingText = true 
}: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Clock className="w-16 h-16 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {message}
        </h2>
        
        {showCalculatingText && (
          <div className="space-y-2 mb-4">
            <p className="text-gray-600">
              Calculating your financial projections based on your selections...
            </p>
            <p className="text-gray-500 text-sm">
              Loading both career and college data for your personalized plan...
            </p>
          </div>
        )}
        
        <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
          <AlertCircle className="w-4 h-4" />
          <span>This may take a few moments</span>
        </div>
        
        <div className="mt-8">
          <div className="h-2 w-48 mx-auto bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}