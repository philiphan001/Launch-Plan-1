import React, { useState } from 'react';
import { parallelSearchService } from '@/services/parallel/ParallelSearchService';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Step } from './Step';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CareerPath {
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

interface Location {
  zip_code: string;
  city: string;
  state: string;
  cost_of_living_index: number;
  income_adjustment_factor: number;
}

interface FourYearCollegePathProps {
  onComplete?: (data: {
    college: College;
    fieldOfStudy: string;
    career: Career;
    location?: Location;
  }) => void;
  onBack?: () => void;
}

export const FourYearCollegePath: React.FC<FourYearCollegePathProps> = ({
  onComplete,
  onBack,
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<'college' | 'field' | 'career' | 'location'>('college');
  
  // College selection state
  const [collegeQuery, setCollegeQuery] = useState('');
  const [collegeResults, setCollegeResults] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  
  // Field of study state
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  
  // Career selection state
  const [careerQuery, setCareerQuery] = useState('');
  const [careerResults, setCareerResults] = useState<Career[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);

  // Location selection state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Fetch all career paths for the field selection dropdown
  const { data: allCareerPaths = [], isLoading: isLoadingCareerPaths } = useQuery<CareerPath[]>({
    queryKey: ['/api/career-paths'],
    queryFn: async () => {
      const response = await fetch('/api/career-paths');
      if (!response.ok) {
        throw new Error('Failed to fetch career paths');
      }
      return response.json();
    }
  });
  
  // Get unique fields of study from the career paths
  const fieldsOfStudy = allCareerPaths && Array.isArray(allCareerPaths)
    ? Array.from(new Set(allCareerPaths.map((path: CareerPath) => path.field_of_study))).sort() 
    : [];

  // Fetch suggested careers for the selected field
  const { data: suggestedCareers = [], isLoading: isLoadingSuggestions } = useQuery<CareerPath[]>({
    queryKey: ['/api/career-paths/field', fieldOfStudy],
    queryFn: async () => {
      if (!fieldOfStudy) return [];
      const response = await fetch(`/api/career-paths/field/${encodeURIComponent(fieldOfStudy)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested careers');
      }
      return response.json();
    },
    enabled: !!fieldOfStudy
  });

  const handleCollegeSearch = async () => {
    if (collegeQuery.length < 2) return;
    
    setIsLoadingColleges(true);
    setError(null);
    try {
      const results = await parallelSearchService.searchColleges(collegeQuery, '4year');
      setCollegeResults(results);
    } catch (err) {
      setError('Error searching colleges: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingColleges(false);
    }
  };

  const handleCareerSearch = async () => {
    if (careerQuery.length < 2) return;
    
    setIsLoadingCareers(true);
    setError(null);
    try {
      const results = await parallelSearchService.searchCareers(careerQuery);
      setCareerResults(results);
    } catch (err) {
      setError('Error searching careers: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingCareers(false);
    }
  };

  const handleLocationSearch = async () => {
    if (locationQuery.length < 2) return;
    
    setIsLoadingLocations(true);
    try {
      const results = await parallelSearchService.searchLocations(locationQuery);
      setLocationResults(results);
    } catch (err) {
      setError('Error searching locations: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'college' && selectedCollege) {
      setCurrentStep('field');
    } else if (currentStep === 'field' && fieldOfStudy) {
      setCurrentStep('career');
    } else if (currentStep === 'career' && selectedCareer) {
      setCurrentStep('location');
    } else if (currentStep === 'location' && selectedLocation) {
      onComplete?.({
        college: selectedCollege!,
        fieldOfStudy,
        career: selectedCareer!,
        location: selectedLocation,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'field') {
      setCurrentStep('college');
    } else if (currentStep === 'career') {
      setCurrentStep('field');
    } else if (currentStep === 'location') {
      setCurrentStep('career');
    } else {
      onBack?.();
    }
  };

  const renderCollegeSelection = () => (
    <Step 
      title="Select a 4-Year College"
      subtitle="Search and select the college you're interested in attending"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search colleges..."
            value={collegeQuery}
            onChange={(e) => setCollegeQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleCollegeSearch}
            disabled={isLoadingColleges || collegeQuery.length < 2}
          >
            {isLoadingColleges ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="space-y-2">
          {collegeResults.map((college) => (
            <Card 
              key={college.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedCollege?.id === college.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedCollege(college)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold">{college.name}</h4>
                <p className="text-sm text-gray-600">
                  {college.city}, {college.state}
                </p>
                <p className="text-sm text-gray-500">{college.type}</p>
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

  const renderFieldOfStudy = () => (
    <Step
      title="Choose Your Field of Study"
      subtitle="What do you plan to study at college?"
    >
      <div className="space-y-4">
        {isLoadingCareerPaths ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fields of study...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <label htmlFor="field-select" className="block text-sm font-medium mb-2">Field of Study</label>
              <Select 
                value={fieldOfStudy}
                onValueChange={setFieldOfStudy}
              >
                <SelectTrigger id="field-select" className="w-full">
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

            {fieldOfStudy && (
              <>
                <h3 className="text-lg font-semibold mb-4">Suggested Career Options:</h3>
                <div className="space-y-2">
                  {isLoadingSuggestions ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading suggestions...</p>
                    </div>
                  ) : (
                    suggestedCareers
                      .sort((a, b) => a.option_rank - b.option_rank)
                      .map((careerPath) => (
                        <Card 
                          key={careerPath.career_title} 
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={async () => {
                            setCareerQuery(careerPath.career_title);
                            await handleCareerSearch();
                            setCurrentStep('career');
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{careerPath.career_title}</h4>
                                <p className="text-sm text-gray-600">{fieldOfStudy}</p>
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
                disabled={!fieldOfStudy}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </Step>
  );

  const renderLocationSelection = () => (
    <Step
      title="Where Do You Want to Live?"
      subtitle="Search by ZIP code (e.g. 90210) or city and state (e.g. San Francisco, CA)"
    >
      <div className="space-y-4">
        {selectedLocation ? (
          <div className="bg-green-50 border border-green-100 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-green-500 mt-0.5">
                <span className="material-icons">check_circle</span>
              </div>
              <div className="flex-1">
                <h4 className="text-md font-medium text-green-700 mb-1">Location Selected</h4>
                <p className="text-sm text-green-600 mb-4">
                  {selectedLocation.city}, {selectedLocation.state} ({selectedLocation.zip_code})
                </p>
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                    Change Location
                  </Button>
                  <Button 
                    onClick={() => {
                      onComplete?.({
                        college: selectedCollege!,
                        fieldOfStudy,
                        career: selectedCareer!,
                        location: selectedLocation,
                      });
                    }}
                  >
                    Create Financial Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
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
                  disabled={isLoadingLocations || locationQuery.length < 2}
                >
                  {isLoadingLocations ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Examples: "90210" or "San Francisco, CA"
              </p>
            </div>

            <div className="space-y-2">
              {locationResults.map((location) => (
                <Card 
                  key={location.zip_code} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedLocation?.zip_code === location.zip_code ? 'border-primary' : ''
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{location.city}, {location.state}</h4>
                        <p className="text-sm text-gray-600">ZIP: {location.zip_code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Cost of Living Index: {location.cost_of_living_index}</p>
                        <p className="text-sm text-gray-500">
                          Income Adjustment: {(location.income_adjustment_factor * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

  const renderCareerSelection = () => (
    <Step
      title="Choose Your Career Path"
      subtitle="Select a career that interests you"
    >
      <div className="space-y-4">
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search careers..."
              value={careerQuery}
              onChange={(e) => setCareerQuery(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCareerSearch}
              disabled={isLoadingCareers || careerQuery.length < 2}
            >
              {isLoadingCareers ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {careerResults.length > 0 ? (
          <div className="space-y-2">
            {careerResults.map((career) => (
              <Card 
                key={career.id} 
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  selectedCareer?.id === career.id ? 'border-primary' : ''
                }`}
                onClick={() => {
                  setSelectedCareer(career);
                  setCurrentStep('location');
                }}
              >
                <CardContent className="p-4">
                  <h4 className="font-semibold">{career.title}</h4>
                  <p className="text-sm text-gray-600">{career.description}</p>
                  <p className="text-sm text-gray-500">
                    Salary: ${career.salary?.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold">Suggested Career Options:</h3>
            <div className="space-y-2">
              {isLoadingSuggestions ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading suggestions...</p>
                </div>
              ) : (
                suggestedCareers
                  .sort((a, b) => a.option_rank - b.option_rank)
                  .map((careerPath) => (
                    <Card 
                      key={careerPath.career_title} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={async () => {
                        setCareerQuery(careerPath.career_title);
                        await handleCareerSearch();
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{careerPath.career_title}</h4>
                            <p className="text-sm text-gray-600">{fieldOfStudy}</p>
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

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {currentStep === 'college' && renderCollegeSelection()}
      {currentStep === 'field' && renderFieldOfStudy()}
      {currentStep === 'career' && renderCareerSelection()}
      {currentStep === 'location' && renderLocationSelection()}
    </div>
  );
}; 