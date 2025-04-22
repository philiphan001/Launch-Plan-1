import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { parallelSearchService } from '@/services/parallel/ParallelSearchService';
import { College } from '@/types/college';
import { Step } from './Step';
import CollegeSearch from './CollegeSearch';
import CareerSearch from './CareerSearch';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Career {
  id: number;
  title: string;
  description: string;
  salary: number;
  growth_rate: number;
  education: string;
  category: string;
}

interface CareerPath {
  id: number;
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

export default function TwoYearCollegePath() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedField, setSelectedField] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [collegeSearchResults, setCollegeSearchResults] = useState<College[]>([]);
  const [careerSearchResults, setCareerSearchResults] = useState<Career[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showEducationWarning, setShowEducationWarning] = useState(false);
  const [pendingCareer, setPendingCareer] = useState<Career | null>(null);

  // Fetch all career paths for field selection dropdown
  const { data: careerPaths = [] } = useQuery<CareerPath[]>({
    queryKey: ['careerPaths'],
    queryFn: async () => {
      const response = await fetch('/api/career-paths');
      if (!response.ok) {
        throw new Error('Failed to fetch career paths');
      }
      return response.json();
    }
  });

  // Get unique fields of study
  const fieldsOfStudy = Array.from(new Set(careerPaths.map(path => path.field_of_study)));

  // Fetch career paths for selected field
  const { data: fieldCareerPaths = [], isLoading: isLoadingCareerPaths } = useQuery<CareerPath[]>({
    queryKey: ['careerPaths', selectedField],
    queryFn: async () => {
      if (!selectedField) return [];
      const response = await fetch(`/api/career-paths/field/${encodeURIComponent(selectedField)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch career paths');
      }
      return response.json();
    },
    enabled: !!selectedField
  });

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleCollegeSelect = async (collegeId: number) => {
    try {
      const college = await parallelSearchService.getCollegeById(collegeId);
      if (college) {
        setSelectedCollege(college);
        handleNext();
      } else {
        throw new Error('College not found');
      }
    } catch (error) {
      console.error('Error fetching college details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch college details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEducationWarningClose = () => {
    setShowEducationWarning(false);
    setPendingCareer(null);
  };

  const handleEducationWarningContinue = () => {
    if (pendingCareer) {
      setSelectedCareer(pendingCareer);
      handleNext();
    }
    setShowEducationWarning(false);
    setPendingCareer(null);
  };

  const handleTransferTo4Year = () => {
    setLocation('/test/four-year-path');
  };

  const checkEducationAndProceed = (career: Career) => {
    if (career.education?.toLowerCase().includes('bachelor') || 
        career.education?.toLowerCase().includes('master') || 
        career.education?.toLowerCase().includes('doctoral')) {
      setPendingCareer(career);
      setShowEducationWarning(true);
    } else {
      setSelectedCareer(career);
      handleNext();
    }
  };

  const handleCareerSelect = async (careerId: number) => {
    try {
      const career = await parallelSearchService.getCareerById(careerId);
      if (career) {
        checkEducationAndProceed(career);
      }
    } catch (error) {
      console.error('Error fetching career details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch career details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFieldSelect = (field: string) => {
    setSelectedField(field);
  };

  const handleCareerSearch = async () => {
    try {
      const results = await parallelSearchService.searchCareers(searchQuery);
      setCareerSearchResults(results);
    } catch (error) {
      console.error('Error searching careers:', error);
      toast({
        title: "Error",
        description: "Failed to search careers. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCollegeSearch = async () => {
    try {
      const results = await parallelSearchService.searchColleges(searchQuery, '2year');
      setCollegeSearchResults(results);
    } catch (error) {
      console.error('Error searching colleges:', error);
      toast({
        title: "Error",
        description: "Failed to search colleges. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a financial plan.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCollege || !selectedCareer || !selectedField) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create the pathway data
      const pathwayData = {
        userId: user.id,
        collegeId: selectedCollege.id,
        careerId: selectedCareer.id,
        fieldOfStudy: selectedField,
        educationType: '2year',
        location: locationInput || undefined,
        zipCode: zipCode || undefined
      };

      // Store the pathway data
      const response = await fetch('/api/pathways', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pathwayData),
      });

      if (!response.ok) {
        throw new Error('Failed to create pathway');
      }

      // Add the career to favorites if user is authenticated
      if (user) {
        await fetch('/api/favorites/careers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            careerId: selectedCareer.id
          }),
        });
      }

      // Add the college to favorites if user is authenticated
      if (user) {
        await fetch('/api/favorites/colleges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            collegeId: selectedCollege.id
          }),
        });
      }

      // Redirect to financial projections with the pathway data
      setLocation('/projections');

      toast({
        title: "Pathway Created",
        description: "Your 2-year college pathway has been created successfully.",
      });
    } catch (error) {
      console.error('Error creating pathway:', error);
      toast({
        title: "Error",
        description: "Failed to create pathway. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step
            title="Select a 2-Year College"
            subtitle="Search and select the college you're interested in attending"
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search colleges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCollegeSearch}
                  disabled={searchQuery.length < 2}
                >
                  Search
                </Button>
              </div>

              <div className="space-y-2">
                {collegeSearchResults.map((college) => (
                  <Card 
                    key={college.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCollegeSelect(college.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{college.name}</h4>
                          <p className="text-sm text-gray-600">{college.city}, {college.state}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!selectedCollege}
                >
                  Next
                </Button>
              </div>
            </div>
          </Step>
        );

      case 2:
        return (
          <Step
            title="Select Field of Study"
            subtitle="Choose the field you want to study at your selected college."
          >
            <div className="space-y-4">
              <div className="mb-6">
                <Label htmlFor="field">Field of Study</Label>
                <Select
                  value={selectedField}
                  onValueChange={setSelectedField}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsOfStudy.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedField && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Suggested Career Options:</h3>
                  <div className="space-y-2">
                    {isLoadingCareerPaths ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading suggestions...</p>
                      </div>
                    ) : (
                      fieldCareerPaths
                        .sort((a, b) => a.option_rank - b.option_rank)
                        .map((careerPath) => (
                          <Card 
                            key={careerPath.career_title} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={async () => {
                              try {
                                const careers = await parallelSearchService.searchCareers(careerPath.career_title);
                                if (careers && careers.length > 0) {
                                  const career = careers[0];
                                  setSelectedCareer(career);
                                  setSearchQuery(career.title);
                                  // For suggested careers, just show a toast warning
                                  if (career.education?.toLowerCase().includes('bachelor') || 
                                      career.education?.toLowerCase().includes('master') || 
                                      career.education?.toLowerCase().includes('doctoral')) {
                                    toast({
                                      title: "Note",
                                      description: "This career typically requires a bachelor's degree. Consider transferring to a 4-year college after completing your 2-year degree.",
                                      variant: "default"
                                    });
                                  }
                                  handleNext();
                                }
                              } catch (error) {
                                console.error('Error fetching career details:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to fetch career details. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{careerPath.career_title}</h4>
                                  <p className="text-sm text-gray-600">{selectedField}</p>
                                </div>
                                <p className="text-sm text-gray-500">Rank: {careerPath.option_rank}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!selectedField}
                >
                  Next
                </Button>
              </div>
            </div>
          </Step>
        );

      case 3:
        return (
          <Step
            title="Select Career Path"
            subtitle="Choose a career path that aligns with your field of study."
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="career">Career Search</Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search careers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCareerSearch}
                    disabled={searchQuery.length < 2}
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {careerSearchResults.map((career) => (
                  <Card 
                    key={career.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCareerSelect(career.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{career.title}</h4>
                          <p className="text-sm text-gray-600">{career.description}</p>
                          {career.salary && (
                            <p className="text-sm text-gray-500">
                              Salary: ${career.salary.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!searchQuery && selectedField && (
                <>
                  <h3 className="text-lg font-semibold mt-6 mb-4">Suggested Career Options:</h3>
                  <div className="space-y-2">
                    {isLoadingCareerPaths ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading suggestions...</p>
                      </div>
                    ) : (
                      fieldCareerPaths
                        .sort((a, b) => a.option_rank - b.option_rank)
                        .map((careerPath) => (
                          <Card 
                            key={careerPath.career_title} 
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={async () => {
                              try {
                                const careers = await parallelSearchService.searchCareers(careerPath.career_title);
                                if (careers && careers.length > 0) {
                                  const career = careers[0];
                                  setSelectedCareer(career);
                                  setSearchQuery(career.title);
                                  // For suggested careers, just show a toast warning
                                  if (career.education?.toLowerCase().includes('bachelor') || 
                                      career.education?.toLowerCase().includes('master') || 
                                      career.education?.toLowerCase().includes('doctoral')) {
                                    toast({
                                      title: "Note",
                                      description: "This career typically requires a bachelor's degree. Consider transferring to a 4-year college after completing your 2-year degree.",
                                      variant: "default"
                                    });
                                  }
                                  handleNext();
                                }
                              } catch (error) {
                                console.error('Error fetching career details:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to fetch career details. Please try again.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">{careerPath.career_title}</h4>
                                  <p className="text-sm text-gray-600">{selectedField}</p>
                                </div>
                                <p className="text-sm text-gray-500">Rank: {careerPath.option_rank}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                    )}
                  </div>
                </>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>
          </Step>
        );

      case 4:
        return (
          <Step
            title="Location Details"
            subtitle="Enter your location information for cost of living calculations."
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">City/State</Label>
                <Input
                  id="location"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter your city and state"
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Enter your ZIP code"
                />
              </div>
            </div>
          </Step>
        );

      case 5:
        return (
          <Step
            title="Review Your Pathway"
            subtitle="Review your selections before creating your financial plan."
          >
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold">Selected College</h3>
                <p>{selectedCollege?.name}</p>
                <p className="text-sm text-gray-500">{selectedCollege?.city}, {selectedCollege?.state}</p>
              </div>
              <div>
                <h3 className="font-semibold">Field of Study</h3>
                <p>{selectedField}</p>
              </div>
              <div>
                <h3 className="font-semibold">Career Path</h3>
                <p>{selectedCareer?.title}</p>
                <p className="text-sm text-gray-500">{selectedCareer?.description}</p>
              </div>
              {locationInput && (
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p>{locationInput}</p>
                  {zipCode && <p className="text-sm text-gray-500">ZIP: {zipCode}</p>}
                </div>
              )}
            </Card>
          </Step>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <AlertDialog open={showEducationWarning} onOpenChange={setShowEducationWarning}>
        <AlertDialogContent className="max-w-[600px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Education Requirement Warning</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This career typically requires a bachelor's degree or higher. Would you like to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Continue with the 2-year pathway and plan to transfer to a 4-year college later</li>
                <li>Switch to the 4-year college pathway now</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleEducationWarningClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEducationWarningContinue} className="bg-primary">
              Continue with 2-Year
            </AlertDialogAction>
            <AlertDialogAction onClick={handleTransferTo4Year} className="bg-blue-600">
              Switch to 4-Year
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">2-Year College Pathway</h1>
        <p className="text-gray-600">
          Plan your journey to a 2-year college degree
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 mx-1 rounded-full ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>College</span>
          <span>Field</span>
          <span>Career</span>
          <span>Location</span>
          <span>Review</span>
        </div>
      </div>

      {renderCurrentStep()}

      <div className="mt-8 flex justify-between">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={handleBack}
          >
            Back
          </Button>
        )}
        {currentStep === 5 ? (
          <Button
            onClick={handleSubmit}
            className="ml-auto"
          >
            Create Financial Plan
          </Button>
        ) : null}
      </div>
    </div>
  );
} 