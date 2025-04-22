import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PathChoice = "education" | "job" | "military" | "gap";
type EducationType = "4year" | "2year" | "vocational" | null;

interface PathwaysSectionProps {
  onPathSelected?: (path: PathChoice) => void;
  onEducationTypeSelected?: (type: EducationType) => void;
}

const PathwaysSection = ({
  onPathSelected = () => {},
  onEducationTypeSelected = () => {}
}: PathwaysSectionProps) => {
  const [selectedPath, setSelectedPath] = useState<PathChoice | null>(null);
  const [selectedEducationType, setSelectedEducationType] = useState<EducationType>(null);
  
  const handlePathSelect = (path: PathChoice) => {
    setSelectedPath(path);
    onPathSelected(path);
    
    // Reset education type if changing paths
    if (path !== 'education') {
      setSelectedEducationType(null);
    }
  };
  
  const handleEducationTypeSelect = (type: EducationType) => {
    setSelectedEducationType(type);
    onEducationTypeSelected(type);
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">Planning Your Path</h2>
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Decision Tree</h3>
          <p className="text-sm text-gray-500 mt-1">Map out your post-high school journey</p>
        </div>
        <CardContent className="p-6">
          <div className="mb-6">
            <h4 className="text-gray-800 font-medium mb-3">What would you like to do after high school?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                className={`border ${selectedPath === 'education' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                onClick={() => handlePathSelect('education')}
              >
                <div className={`rounded-full ${selectedPath === 'education' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'education' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                  <span className="material-icons">school</span>
                </div>
                <h5 className={`font-medium ${selectedPath === 'education' ? 'text-primary' : ''}`}>Continue Education</h5>
                <p className="text-sm text-gray-600 mt-1">Pursue college or other learning</p>
              </div>
              
              <div 
                className={`border ${selectedPath === 'job' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                onClick={() => handlePathSelect('job')}
              >
                <div className={`rounded-full ${selectedPath === 'job' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'job' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                  <span className="material-icons">work</span>
                </div>
                <h5 className={`font-medium ${selectedPath === 'job' ? 'text-primary' : ''}`}>Get a Job</h5>
                <p className="text-sm text-gray-600 mt-1">Enter the workforce</p>
              </div>
              
              <div 
                className={`border ${selectedPath === 'military' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                onClick={() => handlePathSelect('military')}
              >
                <div className={`rounded-full ${selectedPath === 'military' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'military' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                  <span className="material-icons">military_tech</span>
                </div>
                <h5 className={`font-medium ${selectedPath === 'military' ? 'text-primary' : ''}`}>Join Military</h5>
                <p className="text-sm text-gray-600 mt-1">Serve in armed forces</p>
              </div>
              
              <div 
                className={`border ${selectedPath === 'gap' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                onClick={() => handlePathSelect('gap')}
              >
                <div className={`rounded-full ${selectedPath === 'gap' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'gap' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                  <span className="material-icons">explore</span>
                </div>
                <h5 className={`font-medium ${selectedPath === 'gap' ? 'text-primary' : ''}`}>Take a Gap Year</h5>
                <p className="text-sm text-gray-600 mt-1">Explore before deciding</p>
              </div>
            </div>
          </div>
          
          {selectedPath === 'education' && (
            <div className="mb-2">
              <h4 className="text-gray-800 font-medium mb-3">What type of education are you interested in?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border ${selectedEducationType === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => handleEducationTypeSelect('4year')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedEducationType === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${selectedEducationType === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">apartment</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${selectedEducationType === '4year' ? 'text-primary' : ''}`}>4-Year College</h5>
                      <p className="text-sm text-gray-600">Bachelor's degree programs</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${selectedEducationType === '2year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => handleEducationTypeSelect('2year')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedEducationType === '2year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${selectedEducationType === '2year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">account_balance</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${selectedEducationType === '2year' ? 'text-primary' : ''}`}>2-Year College</h5>
                      <p className="text-sm text-gray-600">Associate's degree programs</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${selectedEducationType === 'vocational' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => handleEducationTypeSelect('vocational')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedEducationType === 'vocational' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${selectedEducationType === 'vocational' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">build</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${selectedEducationType === 'vocational' ? 'text-primary' : ''}`}>Vocational School</h5>
                      <p className="text-sm text-gray-600">Specialized training programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              disabled={!selectedPath}
            >
              Back
            </Button>
            <Button disabled={!selectedPath || (selectedPath === 'education' && !selectedEducationType)}>
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PathwaysSection;
