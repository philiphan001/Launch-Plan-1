import { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { parallelSearchService } from '@/services/parallel/ParallelSearchService';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Step } from './Step';
import CollegeSearch from './CollegeSearch';
import CareerSearch from './CareerSearch';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Location {
  zip_code: string;
  city: string;
  state: string;
  cost_of_living_index: number;
  income_adjustment_factor: number;
}

interface CareerPath {
  id: number;
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

interface TwoYearCollegePathProps {
  onComplete?: (data: { college: College; fieldOfStudy: string; career: Career; location: Location }) => void;
  onBack?: () => void;
  isAuthenticated?: boolean;
}

export default function TwoYearCollegePath({ onComplete, onBack, isAuthenticated }: TwoYearCollegePathProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedField, setSelectedField] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [collegeSearchResults, setCollegeSearchResults] = useState<College[]>([]);
  const [careerSearchResults, setCareerSearchResults] = useState<Career[]>([]);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showEducationWarning, setShowEducationWarning] = useState(false);
  const [pendingCareer, setPendingCareer] = useState<Career | null>(null);
  const [transferOption, setTransferOption] = useState<'yes' | 'no' | null>(null);
  const [transferCollege, setTransferCollege] = useState<College | null>(null);
  const [transferCollegeSearchQuery, setTransferCollegeSearchQuery] = useState('');
  const [transferCollegeResults, setTransferCollegeResults] = useState<College[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

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

  const handleTransferOptionSelect = (option: 'yes' | 'no') => {
    setTransferOption(option);
    if (option === 'no') {
      setCurrentStep(4); // Skip to career selection
    } else {
      handleNext(); // Continue to transfer college selection
    }
  };

  const handleNext = () => {
    if (currentStep === 3) {
      if (transferOption === 'yes') {
        setCurrentStep(4); // Go to transfer field selection
      } else {
        setCurrentStep(4); // Go to career path selection
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack?.();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCollegeSelect = async (collegeId: number) => {
    try {
      const college = await parallelSearchService.getCollegeById(collegeId);
      if (college) {
        setSelectedCollege(college);
        setSearchQuery(college.name);
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
    if (transferOption === 'no' && 
        (career.education?.toLowerCase().includes('bachelor') || 
         career.education?.toLowerCase().includes('master') || 
         career.education?.toLowerCase().includes('doctoral'))) {
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

  const handleTransferCollegeSearch = async () => {
    if (transferCollegeSearchQuery.length < 2) return;
    try {
      const results = await parallelSearchService.searchColleges(transferCollegeSearchQuery, '4year');
      setTransferCollegeResults(results);
    } catch (error) {
      console.error('Error searching transfer colleges:', error);
      toast({
        title: "Error",
        description: "Failed to search transfer colleges. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    if (transferOption === 'yes') {
      setCurrentStep(7); // Go to review step for transfer path
    } else {
      setCurrentStep(6); // Go to review step for non-transfer path
    }
  };

  const handleLocationSearch = async () => {
    if (locationQuery.length < 2) return;
    
    try {
      const results = await parallelSearchService.searchLocations(locationQuery);
      setLocationResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
      toast({
        title: "Error",
        description: "Failed to search locations. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a financial plan.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCollege || !selectedCareer || !selectedField || !selectedLocation) {
      toast({
        title: "Missing Information",
        description: "Please complete all steps before submitting.",
        variant: "destructive"
      });
      return;
    }

    onComplete?.({
      college: selectedCollege,
      fieldOfStudy: selectedField,
      career: selectedCareer,
      location: selectedLocation
    });
  };

  const renderTransferOptions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="material-icons text-primary text-xl">school</span>
        <h2 className="text-xl font-semibold">Transfer Options</h2>
      </div>
      
      <p className="text-gray-600">
        Many students start at a 2-year community college and then transfer to a 4-year college to complete their bachelor's 
        degree. This can be a cost-effective way to earn your degree.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            transferOption === 'yes' ? 'border-primary bg-blue-50' : ''
          }`}
          onClick={() => handleTransferOptionSelect('yes')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`rounded-full p-2 ${
                transferOption === 'yes' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <span className="material-icons">check</span>
              </div>
              <h3 className="font-semibold">Yes, I plan to transfer</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              After completing my associate's degree, I plan to transfer to a 4-year college to earn a bachelor's degree.
            </p>
            {transferOption === 'yes' && (
              <div className="mt-4">
                <Label>Find a 4-year college to transfer to:</Label>
                <div className="relative mt-2">
                  <Input
                    type="text"
                    placeholder="Search for 4-year colleges..."
                    value={transferCollegeSearchQuery}
                    onChange={async (e) => {
                      setTransferCollegeSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) {
                        try {
                          const results = await parallelSearchService.searchColleges(e.target.value, '4year');
                          setTransferCollegeResults(results);
                        } catch (error) {
                          console.error('Error searching transfer colleges:', error);
                          toast({
                            title: "Error",
                            description: "Failed to search transfer colleges. Please try again.",
                            variant: "destructive"
                          });
                        }
                      } else {
                        setTransferCollegeResults([]);
                      }
                    }}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can search for colleges or enter a college name manually.
                  </p>
                </div>
                {transferCollegeResults.length > 0 && (
                  <div className="mt-2 border rounded-md divide-y">
                    {transferCollegeResults.map((college) => (
                      <div
                        key={college.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 ${
                          transferCollege?.id === college.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setTransferCollege(college);
                          setTransferCollegeSearchQuery(college.name);
                        }}
                      >
                        <div className="font-medium">{college.name}</div>
                        <div className="text-sm text-gray-600">
                          {college.city}, {college.state}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${
            transferOption === 'no' ? 'border-primary bg-blue-50' : ''
          }`}
          onClick={() => handleTransferOptionSelect('no')}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`rounded-full p-2 ${
                transferOption === 'no' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}>
                <span className="material-icons">close</span>
              </div>
              <h3 className="font-semibold">No, I'll complete my 2-year degree</h3>
            </div>
            <p className="text-sm text-gray-600">
              I plan to enter the workforce directly after earning my associate's degree.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        {transferOption === 'yes' ? (
          <Button 
            onClick={handleNext}
            disabled={!transferCollege}
          >
            Next: Choose Field of Study
          </Button>
        ) : transferOption === 'no' ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : null}
      </div>
    </div>
  );

  const renderCollegeSelection = () => (
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

  const renderFieldSelection = () => (
    <Step
      title="Select Field of Study"
      subtitle="Choose the field you want to study at your selected college."
    >
      <div className="space-y-4">
        <div className="mb-6">
          <Label htmlFor="field">Field of Study</Label>
          <Select
            value={selectedField}
            onValueChange={(value) => {
              setSelectedField(value);
              handleNext();
            }}
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

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderTransferFieldSelection = () => (
    <Step
      title="Select Field of Study for Transfer"
      subtitle={`Choose the field you want to study at ${transferCollege?.name}`}
    >
      <div className="space-y-4">
        <div className="mb-6">
          <Label htmlFor="field">Field of Study at Transfer College</Label>
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

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedField}
          >
            Next: Choose Career
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderCareerSelection = () => (
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedCareer(null);
              }}
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

        {careerSearchResults.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-4">Search Results:</h3>
            <div className="space-y-2">
              {careerSearchResults.map((career) => (
                <Card 
                  key={career.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedCareer?.id === career.id ? 'border-primary bg-blue-50' : ''
                  }`}
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
          </>
        )}

        {selectedField && (
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
                          setSearchQuery(careerPath.career_title);
                          const careers = await parallelSearchService.searchCareers(careerPath.career_title);
                          if (careers && careers.length > 0) {
                            setCareerSearchResults(careers);
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
            disabled={!selectedCareer}
          >
            Next: Location
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderLocationSelection = () => (
    <Step
      title="Location Details"
      subtitle="Enter your location information for cost of living calculations."
    >
      <div className="space-y-4">
        <div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter ZIP code or city, state..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleLocationSearch}
              disabled={locationQuery.length < 2}
            >
              Search
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Examples: "90210" or "San Francisco, CA"
          </p>
        </div>

        {locationResults.length > 0 && (
          <div className="space-y-2">
            {locationResults.map((location) => (
              <Card
                key={location.zip_code}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedLocation?.zip_code === location.zip_code ? 'border-primary bg-blue-50' : ''
                }`}
                onClick={() => handleLocationSelect(location)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{location.city}, {location.state}</h4>
                      <p className="text-sm text-gray-600">ZIP: {location.zip_code}</p>
                      <p className="text-sm text-gray-500">
                        Cost of Living Index: {location.cost_of_living_index}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedLocation}
          >
            Next: Review
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderReview = () => (
    <Step
      title="Review Your Pathway"
      subtitle="Review your selections before creating your financial plan."
    >
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold">2-Year College</h3>
          <p>{selectedCollege?.name}</p>
          <p className="text-sm text-gray-500">{selectedCollege?.city}, {selectedCollege?.state}</p>
        </div>

        {transferOption === 'yes' && transferCollege && (
          <div>
            <h3 className="font-semibold">Transfer College</h3>
            <p>{transferCollege.name}</p>
            <p className="text-sm text-gray-500">{transferCollege.city}, {transferCollege.state}</p>
          </div>
        )}

        <div>
          <h3 className="font-semibold">Field of Study</h3>
          <p>{selectedField}</p>
          {transferOption === 'yes' && transferCollege && (
            <p className="text-sm text-gray-500">At {transferCollege.name}</p>
          )}
        </div>

        {selectedCareer && (
          <div>
            <h3 className="font-semibold">Career Path</h3>
            <p>{selectedCareer.title}</p>
            <p className="text-sm text-gray-600">{selectedCareer.description}</p>
            {selectedCareer.salary && (
              <p className="text-sm text-gray-500">
                Estimated Salary: ${selectedCareer.salary.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {selectedLocation && (
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{selectedLocation.city}, {selectedLocation.state}</p>
            <p className="text-sm text-gray-600">ZIP: {selectedLocation.zip_code}</p>
            <p className="text-sm text-gray-500">
              Cost of Living Index: {selectedLocation.cost_of_living_index}
            </p>
          </div>
        )}
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedCollege || !selectedField || !selectedCareer || !selectedLocation}
        >
          Create Financial Plan
        </Button>
      </div>
    </Step>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderCollegeSelection();
      case 2:
        return renderFieldSelection();
      case 3:
        return renderTransferOptions();
      case 4:
        if (transferOption === 'yes') {
          return renderTransferFieldSelection();
        } else {
          return renderCareerSelection();
        }
      case 5:
        if (transferOption === 'yes') {
          return renderCareerSelection();
        } else {
          return renderLocationSelection();
        }
      case 6:
        if (transferOption === 'yes') {
          return renderLocationSelection();
        } else {
          return renderReview();
        }
      case 7:
        if (transferOption === 'yes') {
          return renderReview();
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
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
          {(transferOption === 'yes' 
            ? [1, 2, 3, 4, 5, 6, 7] // Transfer path steps
            : [1, 2, 3, 4, 5, 6]) // Non-transfer path steps
            .filter((step): step is number => step !== null)
            .map((step) => (
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
          <span>Transfer</span>
          {transferOption === 'yes' ? (
            <>
              <span>Transfer Field</span>
              <span>Career</span>
              <span>Location</span>
              <span>Review</span>
            </>
          ) : (
            <>
              <span>Career</span>
              <span>Location</span>
              <span>Review</span>
            </>
          )}
        </div>
      </div>

      {renderCurrentStep()}
    </div>
  );
} 