import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, HelpCircle } from "lucide-react";

/**
 * Component to display projection loading and error states
 */
interface ProjectionErrorHandlerProps {
  isLoading: boolean;
  error: any;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ProjectionErrorHandler({
  isLoading,
  error,
  title = "Projection Error",
  description = "There was an error loading the financial projection data.",
  onRetry
}: ProjectionErrorHandlerProps) {
  if (isLoading) {
    return (
      <Card className="mb-6 border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">Loading projection data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm">{description}</p>
          
          {error.message && (
            <p className="text-xs mt-2 font-mono bg-red-100 p-2 rounded">
              {error.message}
            </p>
          )}
          
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-red-100 hover:bg-red-200 text-red-800 text-xs px-3 py-1 rounded mt-3 transition-colors"
            >
              Try Again
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

/**
 * Component to display a warning about potentially invalid projection data
 */
interface ProjectionDataWarningProps {
  message: string;
  details?: string;
  onFix?: () => void;
}

export function ProjectionDataWarning({ message, details, onFix }: ProjectionDataWarningProps) {
  return (
    <Card className="mb-6 border-l-4 border-l-yellow-500">
      <CardContent className="pt-6">
        <div className="flex">
          <HelpCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{message}</p>
            {details && <p className="text-xs text-gray-600 mt-1">{details}</p>}
            
            {onFix && (
              <button 
                onClick={onFix}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded mt-2 transition-colors"
              >
                Fix Issue
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}