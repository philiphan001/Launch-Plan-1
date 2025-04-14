import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProjectionErrorHandlerProps {
  errorMessage?: string;
}

/**
 * A component to display when a projection has invalid data
 */
const ProjectionErrorHandler: React.FC<ProjectionErrorHandlerProps> = ({ 
  errorMessage = "The selected projection has invalid data format. Please try a different projection."
}) => {
  return (
    <Card className="mb-6 border-l-4 border-l-red-500">
      <CardContent className="pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Projection Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default ProjectionErrorHandler;