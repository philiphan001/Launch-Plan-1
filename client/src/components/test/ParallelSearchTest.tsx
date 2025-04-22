import React, { useState } from 'react';
import { parallelSearchService } from '@/services/parallel/ParallelSearchService';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Location } from '@/types/location';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ParallelSearchTest = () => {
  // College state
  const [collegeQuery, setCollegeQuery] = useState('');
  const [collegeResults, setCollegeResults] = useState<College[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);

  // Career state
  const [careerQuery, setCareerQuery] = useState('');
  const [careerResults, setCareerResults] = useState<Career[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);

  // Location state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const handleCollegeSearch = async () => {
    if (collegeQuery.length < 2) return;
    
    setIsLoadingColleges(true);
    try {
      const results = await parallelSearchService.searchColleges(collegeQuery, '4year');
      setCollegeResults(results);
    } catch (error) {
      console.error('Error searching colleges:', error);
    } finally {
      setIsLoadingColleges(false);
    }
  };

  const handleCareerSearch = async () => {
    if (careerQuery.length < 2) return;
    
    setIsLoadingCareers(true);
    try {
      const results = await parallelSearchService.searchCareers(careerQuery);
      setCareerResults(results);
    } catch (error) {
      console.error('Error searching careers:', error);
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
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setIsLoadingLocations(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Parallel Search Test</h1>
      
      <Tabs defaultValue="colleges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colleges">Colleges</TabsTrigger>
          <TabsTrigger value="careers">Careers</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="colleges">
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
                <Card key={college.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{college.name}</h3>
                    <p className="text-sm text-gray-600">{college.location}, {college.state}</p>
                    <p className="text-sm text-gray-500">Type: {college.type}</p>
                    <p className="text-sm text-gray-500">
                      Tuition: ${college.tuition?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="careers">
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
                <Card key={career.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{career.title}</h3>
                    <p className="text-sm text-gray-600">{career.description}</p>
                    <p className="text-sm text-gray-500">
                      Salary: ${career.salary?.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by city, state, or zip code..."
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
                <Card key={location.zip_code}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{location.city}, {location.state}</h3>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 