import React from 'react';
import "@/index.css";  // Import Tailwind CSS
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface GapYearSectionProps {
  gapYearActivity: 'travel' | 'volunteer' | 'work' | 'other' | null;
  gapYearLength: '3month' | '6month' | '9month' | '12month' | null;
  gapYearBudget: number;
  onActivityChange: (activity: 'travel' | 'volunteer' | 'work' | 'other' | null) => void;
  onLengthChange: (length: '3month' | '6month' | '9month' | '12month' | null) => void;
  onBudgetChange: (budget: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export const GapYearSection: React.FC<GapYearSectionProps> = ({
  gapYearActivity,
  gapYearLength,
  gapYearBudget,
  onActivityChange,
  onLengthChange,
  onBudgetChange,
  onNext,
  onBack
}) => {
  const getTimeDescription = () => {
    switch(gapYearLength) {
      case '3month': return '3-month';
      case '6month': return '6-month';
      case '9month': return '9-month';
      case '12month': return 'full-year';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">What would you like to do during your gap year?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`border ${gapYearActivity === 'travel' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onActivityChange('travel')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${gapYearActivity === 'travel' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'travel' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">flight_takeoff</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${gapYearActivity === 'travel' ? 'text-primary' : ''}`}>Travel</h5>
                    <p className="text-sm text-gray-600">Explore new places and cultures</p>
                  </div>
                </div>
              </div>

              <div 
                className={`border ${gapYearActivity === 'volunteer' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onActivityChange('volunteer')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${gapYearActivity === 'volunteer' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'volunteer' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">volunteer_activism</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${gapYearActivity === 'volunteer' ? 'text-primary' : ''}`}>Volunteer</h5>
                    <p className="text-sm text-gray-600">Give back to communities</p>
                  </div>
                </div>
              </div>

              <div 
                className={`border ${gapYearActivity === 'work' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onActivityChange('work')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${gapYearActivity === 'work' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'work' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">work</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${gapYearActivity === 'work' ? 'text-primary' : ''}`}>Work</h5>
                    <p className="text-sm text-gray-600">Gain professional experience</p>
                  </div>
                </div>
              </div>

              <div 
                className={`border ${gapYearActivity === 'other' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onActivityChange('other')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${gapYearActivity === 'other' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'other' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">more_horiz</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${gapYearActivity === 'other' ? 'text-primary' : ''}`}>Other</h5>
                    <p className="text-sm text-gray-600">Custom gap year plans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {gapYearActivity && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">How long would you like your gap year to be?</h3>
                <Select
                  value={gapYearLength || ''}
                  onValueChange={(value) => onLengthChange(value as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3month">3 Months</SelectItem>
                    <SelectItem value="6month">6 Months</SelectItem>
                    <SelectItem value="9month">9 Months</SelectItem>
                    <SelectItem value="12month">12 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Estimated Budget</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">$</span>
                  <Input
                    type="number"
                    value={gapYearBudget}
                    onChange={(e) => onBudgetChange(Number(e.target.value))}
                    className="w-full"
                    placeholder="Enter your budget"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  This will help us plan your {getTimeDescription()} gap year experience
                </p>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {gapYearActivity && gapYearLength && (
              <Button onClick={onNext}>
                Next Step
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 