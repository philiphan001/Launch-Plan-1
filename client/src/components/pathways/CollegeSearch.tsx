import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface College {
  id: number;
  name: string;
  city: string;
  state: string;
  rank?: number;
  type?: string;
  degreePredominant?: number;
  location?: string;
}

interface CollegeSearchProps {
  onCollegeSelect: (collegeId: number) => void;
  educationType: '4year' | '2year' | 'vocational' | null;
}

const CollegeSearch: React.FC<CollegeSearchProps> = ({ onCollegeSelect, educationType }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<College[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>('');

  useEffect(() => {
    const searchColleges = async () => {
      if (searchQuery.length > 2) {
        setIsLoadingSearch(true);
        try {
          const response = await fetch(`/api/colleges/search?q=${encodeURIComponent(searchQuery)}&educationType=${educationType === '4year' ? '4year' : '2year'}`);
          const data = await response.json();
          setSearchResults(data);
        } catch (error) {
          console.error('Error searching colleges:', error);
          setSearchResults([]);
        } finally {
          setIsLoadingSearch(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchColleges, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, educationType]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <span className="material-icons mr-1 text-blue-500 text-sm">school</span>
              School Search
            </h4>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="material-icons text-sm">search</span>
                </span>
                <Input 
                  type="text" 
                  placeholder="Search for your school..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 flex-1 w-full"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Search for your preferred school. You can type the name of any college or university.
            </p>
          </div>
        </div>
        
        {searchQuery.length > 2 && (
          <>
            <h4 className="text-md font-medium mb-4">
              {isLoadingSearch ? 'Searching...' : 'School Search Results:'}
            </h4>
            
            {isLoadingSearch ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching schools...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {searchResults.map((school) => (
                  <Card 
                    key={school.id} 
                    className={`border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${selectedSchool === school.name ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => {
                      setSelectedSchool(school.name);
                      onCollegeSelect(school.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className={`rounded-full ${selectedSchool === school.name ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${selectedSchool === school.name ? 'text-white' : 'text-gray-600'} mr-3 flex-shrink-0`}>
                          <span className="material-icons text-sm">school</span>
                        </div>
                        <div>
                          <h5 className={`font-medium ${selectedSchool === school.name ? 'text-primary' : ''}`}>{school.name}</h5>
                          <p className="text-sm text-gray-600">{school.city}, {school.state}</p>
                          {(school.rank && school.rank > 0) && (
                            <Badge variant="outline" className="mt-1">Rank: {school.rank}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border rounded-lg mb-6">
                <p className="text-gray-500">
                  {searchQuery.length > 0 ? 'No schools found matching your search.' : 'Type to search for schools'}
                </p>
              </div>
            )}
            
            {/* Clear Search button */}
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSchool('');
                }}
              >
                <span className="material-icons text-sm mr-1">clear</span>
                Clear Search
              </Button>
            </div>
          </>
        )}
        
        {selectedSchool && (
          <div className="mb-6 p-4 border border-green-100 bg-green-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-green-600">
                <span className="material-icons">school</span>
              </div>
              <div>
                <h4 className="text-md font-medium text-green-700 mb-1">Selected School</h4>
                <p className="text-sm text-green-600 mb-3">
                  {selectedSchool}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedSchool('');
                      setSearchQuery('');
                    }}
                  >
                    <span className="material-icons text-sm mr-1">edit</span>
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeSearch; 