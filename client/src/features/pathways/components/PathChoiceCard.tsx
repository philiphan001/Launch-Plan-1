import React from 'react';
import "@/index.css";  // Import Tailwind CSS
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PathChoice = "education" | "job" | "military" | "gap";

interface PathChoiceCardProps {
  type: PathChoice;
  title: string;
  description: string;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
  onNext?: () => void;
  showNextButton?: boolean;
}

export const PathChoiceCard: React.FC<PathChoiceCardProps> = ({
  type,
  title,
  description,
  icon,
  isSelected,
  onClick,
  onNext,
  showNextButton = false
}) => {
  return (
    <Card 
      className={`border ${isSelected ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center">
          <div className={`rounded-full ${isSelected ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${isSelected ? 'text-white' : 'text-gray-600'} mr-3`}>
            <span className="material-icons text-sm">{icon}</span>
          </div>
          <div>
            <h5 className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{title}</h5>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        {showNextButton && isSelected && onNext && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Next Step
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 