import React, { useState } from 'react';
import { parallelSearchService } from '@/services/parallel/ParallelSearchService';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Step } from '../Step';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Location {
  zip_code: string;
  city: string;
  state: string;
  cost_of_living_index: number;
  income_adjustment_factor: number;
}

interface CareerPath {
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

interface VocationalSchoolPathProps {
  onComplete?: (data: {
    school: College;
    program: string;
    career: Career;
    location?: Location;
  }) => void;
  onBack?: () => void;
}

export const VocationalSchoolPath: React.FC<VocationalSchoolPathProps> = ({
  onComplete,
  onBack,
}) => {
  // Step management
  const [currentStep, setCurrentStep] = useState<'school' | 'program' | 'career' | 'location' | 'review'>('school');
  
  // School selection state
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolResults, setSchoolResults] = useState<College[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<College | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  
  // Program selection state
  const [selectedProgram, setSelectedProgram] = useState('');
  
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

  // Fetch all vocational programs
  const { data: allPrograms = [], isLoading: isLoadingPrograms } = useQuery<CareerPath[]>({
    queryKey: ['/api/vocational-programs'],
    queryFn: async () => {
      const response = await fetch('/api/vocational-programs');
      if (!response.ok) {
        throw new Error('Failed to fetch vocational programs');
      }
      return response.json();
    }
  });

  const handleSchoolSearch = async () => {
    if (schoolQuery.length < 2) return;
    
    setIsLoadingSchools(true);
    setError(null);
    try {
      const results = await parallelSearchService.searchColleges(schoolQuery, '2year');
      setSchoolResults(results);
    } catch (err) {
      setError('Error searching schools: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingSchools(false);
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
      setLocationResults(results as Location[]);
    } catch (err) {
      setError('Error searching locations: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'school' && selectedSchool) {
      setCurrentStep('program');
    } else if (currentStep === 'program') {
      // Temporarily allow progression without program selection
      setSelectedProgram('TBD');
      setCurrentStep('career');
    } else if (currentStep === 'career' && selectedCareer) {
      setCurrentStep('location');
    } else if (currentStep === 'location' && selectedLocation) {
      setCurrentStep('review');
    } else if (currentStep === 'review' && selectedSchool && selectedCareer && selectedLocation) {
      onComplete?.({
        school: selectedSchool,
        program: selectedProgram,
        career: selectedCareer,
        location: selectedLocation,
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 'program') {
      setCurrentStep('school');
    } else if (currentStep === 'career') {
      setCurrentStep('program');
    } else if (currentStep === 'location') {
      setCurrentStep('career');
    } else if (currentStep === 'review') {
      setCurrentStep('location');
    } else {
      onBack?.();
    }
  };

  const renderSchoolSelection = () => (
    <Step 
      title="Select a Vocational School"
      subtitle="Search and select the vocational school you're interested in attending"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search vocational schools..."
            value={schoolQuery}
            onChange={(e) => setSchoolQuery(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleSchoolSearch}
            disabled={isLoadingSchools || schoolQuery.length < 2}
          >
            {isLoadingSchools ? 'Searching...' : 'Search'}
          </Button>
        </div>

        <div className="space-y-2">
          {schoolResults.map((school) => (
            <Card 
              key={school.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedSchool?.id === school.id ? 'border-primary' : ''
              }`}
              onClick={() => {
                setSelectedSchool(school);
                setSchoolQuery(school.name);
              }}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold">{school.name}</h4>
                <p className="text-sm text-gray-600">
                  {school.city}, {school.state}
                </p>
                <p className="text-sm text-gray-500">{school.type}</p>
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
            disabled={!selectedSchool}
          >
            Next
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderProgramSelection = () => (
    <Step
      title="Choose Your Program"
      subtitle="Select a vocational program you want to pursue"
    >
      <div className="space-y-4">
        <div className="mb-6">
          <p className="text-gray-600">Program selection coming soon...</p>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderCareerSelection = () => (
    <Step
      title="Choose Your Career Path"
      subtitle="Select a career path that aligns with your vocational program"
    >
      <div className="space-y-4">
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

        <div className="space-y-2">
          {careerResults.map((career) => (
            <Card 
              key={career.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedCareer?.id === career.id ? 'border-primary' : ''
              }`}
              onClick={() => setSelectedCareer(career)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold">{career.title}</h4>
                <p className="text-sm text-gray-600">{career.description}</p>
                {career.salary && (
                  <p className="text-sm text-gray-500">
                    Salary: ${career.salary.toLocaleString()}
                  </p>
                )}
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
            disabled={!selectedCareer}
          >
            Next
          </Button>
        </div>
      </div>
    </Step>
  );

  const renderLocationSelection = () => (
    <Step
      title="Choose Your Location"
      subtitle="Where do you plan to live and work?"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Search locations..."
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
                <h4 className="font-semibold">{location.city}, {location.state}</h4>
                <p className="text-sm text-gray-600">ZIP: {location.zip_code}</p>
                <p className="text-sm text-gray-500">
                  Cost of Living Index: {location.cost_of_living_index}
                </p>
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
      subtitle="Review your selections before creating your financial plan"
    >
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold">Vocational School</h3>
          <p>{selectedSchool?.name}</p>
          <p className="text-sm text-gray-500">{selectedSchool?.city}, {selectedSchool?.state}</p>
        </div>

        <div>
          <h3 className="font-semibold">Program</h3>
          <p>{selectedProgram}</p>
        </div>

        <div>
          <h3 className="font-semibold">Career Path</h3>
          <p>{selectedCareer?.title}</p>
          <p className="text-sm text-gray-600">{selectedCareer?.description}</p>
          {selectedCareer?.salary && (
            <p className="text-sm text-gray-500">
              Estimated Salary: ${selectedCareer.salary.toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <h3 className="font-semibold">Location</h3>
          <p>{selectedLocation?.city}, {selectedLocation?.state}</p>
          <p className="text-sm text-gray-600">ZIP: {selectedLocation?.zip_code}</p>
          <p className="text-sm text-gray-500">
            Cost of Living Index: {selectedLocation?.cost_of_living_index}
          </p>
        </div>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedSchool || !selectedCareer || !selectedLocation}
        >
          Create Financial Plan
        </Button>
      </div>
    </Step>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Vocational School Pathway</h1>
        <p className="text-gray-600">Plan your journey to a vocational career</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['school', 'program', 'career', 'location', 'review'].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 mx-1 rounded-full ${
                currentStep === step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>School</span>
          <span>Program</span>
          <span>Career</span>
          <span>Location</span>
          <span>Review</span>
        </div>
      </div>

      {currentStep === 'school' && renderSchoolSelection()}
      {currentStep === 'program' && renderProgramSelection()}
      {currentStep === 'career' && renderCareerSelection()}
      {currentStep === 'location' && renderLocationSelection()}
      {currentStep === 'review' && renderReview()}
    </div>
  );
}; 