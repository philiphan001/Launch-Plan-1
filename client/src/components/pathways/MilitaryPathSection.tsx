import React from 'react';
import "@/index.css";  // Import Tailwind CSS
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MilitaryPathSectionProps {
  militaryBranch: 'army' | 'navy' | 'airforce' | 'marines' | 'coastguard' | 'spaceguard' | null;
  serviceLength: string;
  postMilitaryPath: 'education' | 'job' | null;
  militaryToEducation: boolean;
  militaryToJob: boolean;
  militaryBenefits: {
    giBillEligible: boolean;
    giBillPercentage: number;
    housingAllowance: boolean;
    veteransPreference: boolean;
    retirementEligible: boolean;
  } | null;
  onBranchChange: (branch: 'army' | 'navy' | 'airforce' | 'marines' | 'coastguard' | 'spaceguard' | null) => void;
  onServiceLengthChange: (length: string) => void;
  onPostMilitaryPathChange: (path: 'education' | 'job' | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export const MilitaryPathSection: React.FC<MilitaryPathSectionProps> = ({
  militaryBranch,
  serviceLength,
  postMilitaryPath,
  militaryToEducation,
  militaryToJob,
  militaryBenefits,
  onBranchChange,
  onServiceLengthChange,
  onPostMilitaryPathChange,
  onNext,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Select Military Branch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`border ${militaryBranch === 'army' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('army')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'army' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'army' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">shield</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'army' ? 'text-primary' : ''}`}>Army</h5>
                    <p className="text-sm text-gray-600">Land-based operations</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${militaryBranch === 'navy' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('navy')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'navy' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'navy' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">sailing</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'navy' ? 'text-primary' : ''}`}>Navy</h5>
                    <p className="text-sm text-gray-600">Sea-based operations</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${militaryBranch === 'airforce' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('airforce')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'airforce' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'airforce' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">flight</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'airforce' ? 'text-primary' : ''}`}>Air Force</h5>
                    <p className="text-sm text-gray-600">Air-based operations</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${militaryBranch === 'marines' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('marines')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'marines' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'marines' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">security</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'marines' ? 'text-primary' : ''}`}>Marines</h5>
                    <p className="text-sm text-gray-600">Amphibious operations</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${militaryBranch === 'coastguard' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('coastguard')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'coastguard' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'coastguard' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">water</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'coastguard' ? 'text-primary' : ''}`}>Coast Guard</h5>
                    <p className="text-sm text-gray-600">Maritime safety & security</p>
                  </div>
                </div>
              </div>
              
              <div 
                className={`border ${militaryBranch === 'spaceguard' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                onClick={() => onBranchChange('spaceguard')}
              >
                <div className="flex items-center">
                  <div className={`rounded-full ${militaryBranch === 'spaceguard' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${militaryBranch === 'spaceguard' ? 'text-white' : 'text-gray-600'} mr-3`}>
                    <span className="material-icons text-sm">rocket</span>
                  </div>
                  <div>
                    <h5 className={`font-medium ${militaryBranch === 'spaceguard' ? 'text-primary' : ''}`}>Space Force</h5>
                    <p className="text-sm text-gray-600">Space operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {militaryBranch && (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Service Length</h3>
                <Select
                  value={serviceLength}
                  onValueChange={onServiceLengthChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select service length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4year">4 Years</SelectItem>
                    <SelectItem value="6year">6 Years</SelectItem>
                    <SelectItem value="8year">8 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {militaryBenefits && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Available Benefits</h3>
                  <div className="space-y-2">
                    {militaryBenefits.giBillEligible && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">GI Bill Eligibility</span>
                        <Badge variant="secondary">{militaryBenefits.giBillPercentage}%</Badge>
                      </div>
                    )}
                    {militaryBenefits.housingAllowance && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Housing Allowance</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    )}
                    {militaryBenefits.veteransPreference && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Veterans Preference</span>
                        <Badge variant="secondary">Eligible</Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Post-Service Plans</h3>
                <div className="space-y-4">
                  <Button
                    variant={militaryToEducation ? "default" : "outline"}
                    className="w-full"
                    onClick={() => onPostMilitaryPathChange('education')}
                  >
                    Continue Education
                  </Button>
                  <Button
                    variant={militaryToJob ? "default" : "outline"}
                    className="w-full"
                    onClick={() => onPostMilitaryPathChange('job')}
                  >
                    Enter Workforce
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            {militaryBranch && (
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