import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Career {
  id: number;
  title: string;
  salary: number | null;
  description: string | null;
  growth_rate: string | null;
  education: string | null;
  category: string | null;
  alias1: string | null;
  alias2: string | null;
  alias3: string | null;
  alias4: string | null;
  alias5: string | null;
}

interface FavoriteCareer {
  id: number;
  userId: number;
  careerId: number;
  createdAt: string;
  career?: Career;
}

const CareerExploration = () => {
  // User ID - hardcoded for demo, in real app would come from auth
  const userId = 1;
  
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [minSalary, setMinSalary] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<string[]>([]);
  const [selectedGrowth, setSelectedGrowth] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const itemsPerPage = 5;
  
  // Query client for invalidating queries
  const queryClient = useQueryClient();
  
  // Query for all careers
  const { data: careers = [], isLoading } = useQuery<Career[]>({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      const response = await fetch('/api/careers');
      if (!response.ok) {
        throw new Error('Failed to fetch careers');
      }
      return response.json();
    }
  });
  
  // Query for user's favorite careers
  const { data: favoriteCareers = [] } = useQuery<FavoriteCareer[]>({
    queryKey: ['/api/favorites/careers', userId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/careers/${userId}`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    }
  });
  
  // Check if a career is favorited
  const isCareerFavorite = (careerId: number) => {
    return favoriteCareers.some(favorite => favorite.careerId === careerId);
  };
  
  // Mutation to add a career to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (careerId: number) => {
      return apiRequest('/api/favorites/careers', {
        method: 'POST',
        body: JSON.stringify({ userId, careerId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/careers', userId] });
    },
  });
  
  // Mutation to remove a career from favorites
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return apiRequest(`/api/favorites/careers/${favoriteId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/careers', userId] });
    },
  });
  
  // Extract unique categories, education levels, and growth rates without using Set
  const categories: string[] = [];
  const educationLevels: string[] = [];
  const growthRates: string[] = [];
  
  // Collect unique values
  careers.forEach(career => {
    if (career.category && !categories.includes(career.category)) {
      categories.push(career.category);
    }
    
    if (career.education && !educationLevels.includes(career.education)) {
      educationLevels.push(career.education);
    }
    
    if (career.growth_rate && !growthRates.includes(career.growth_rate)) {
      growthRates.push(career.growth_rate);
    }
  });
  
  // Filter careers based on search and filters
  const filteredCareers = careers.filter(career => {
    // Handle title and description search
    const matchesSearch = (
      (career.title && career.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (career.description && career.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (career.alias1 && career.alias1.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (career.alias2 && career.alias2.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (career.alias3 && career.alias3.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (career.alias4 && career.alias4.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (career.alias5 && career.alias5.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    // Filter by salary
    const matchesSalary = !career.salary || career.salary >= minSalary;
    
    // Filter by category
    const matchesCategory = selectedCategories.length === 0 || 
      (career.category && selectedCategories.includes(career.category));
    
    // Filter by education
    const matchesEducation = selectedEducation.length === 0 || 
      (career.education && selectedEducation.includes(career.education));
    
    // Filter by growth rate
    const matchesGrowth = selectedGrowth.length === 0 || 
      (career.growth_rate && selectedGrowth.includes(career.growth_rate));
    
    return matchesSearch && matchesSalary && matchesCategory && matchesEducation && matchesGrowth;
  });
  
  // Sort the filtered careers
  const sortedCareers = [...filteredCareers].sort((a, b) => {
    if (sortBy === 'title') {
      const aValue = a.title || '';
      const bValue = b.title || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (sortBy === 'salary') {
      const aValue = a.salary || 0;
      const bValue = b.salary || 0;
      return sortOrder === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    } else if (sortBy === 'category') {
      const aValue = a.category || '';
      const bValue = b.category || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (sortBy === 'education') {
      const aValue = a.education || '';
      const bValue = b.education || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (sortBy === 'growth_rate') {
      const aValue = a.growth_rate || '';
      const bValue = b.growth_rate || '';
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    return 0;
  });
  
  // Pagination logic
  const totalPages = Math.ceil(sortedCareers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCareers = sortedCareers.slice(startIndex, startIndex + itemsPerPage);
  
  // Function to handle page change
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Handle toggling favorites
  const toggleFavorite = (career: Career) => {
    const favorite = favoriteCareers.find(fav => fav.careerId === career.id);
    
    if (favorite) {
      removeFromFavoritesMutation.mutate(favorite.id);
    } else {
      addToFavoritesMutation.mutate(career.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-semibold text-gray-800">Career Exploration</h1>
        <Button className="flex items-center bg-green-600 text-white hover:bg-green-700" asChild>
          <a href="/career-builder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Career Builder
          </a>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="minSalary">Minimum Salary</Label>
                  <div className="flex items-center mt-2">
                    <span className="mr-2">$</span>
                    <Input 
                      id="minSalary" 
                      type="number" 
                      value={minSalary} 
                      onChange={(e) => {
                        setMinSalary(Number(e.target.value));
                        setCurrentPage(1); // Reset page when filter changes
                      }}
                    />
                  </div>
                </div>
                
                {categories.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Categories</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categories.map(category => (
                        <div key={category} className="flex items-center">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
                              }
                              setCurrentPage(1); // Reset page when filter changes
                            }}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {educationLevels.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Education Required</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {educationLevels.map(education => (
                        <div key={education} className="flex items-center">
                          <Checkbox 
                            id={`education-${education}`}
                            checked={selectedEducation.includes(education)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEducation([...selectedEducation, education]);
                              } else {
                                setSelectedEducation(selectedEducation.filter(e => e !== education));
                              }
                              setCurrentPage(1); // Reset page when filter changes
                            }}
                          />
                          <label 
                            htmlFor={`education-${education}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {education}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {growthRates.length > 0 && (
                  <div>
                    <Label className="mb-2 block">Growth Rate</Label>
                    <div className="space-y-2">
                      {growthRates.map(rate => (
                        <div key={rate} className="flex items-center">
                          <Checkbox 
                            id={`growth-${rate}`}
                            checked={selectedGrowth.includes(rate)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGrowth([...selectedGrowth, rate]);
                              } else {
                                setSelectedGrowth(selectedGrowth.filter(g => g !== rate));
                              }
                              setCurrentPage(1); // Reset page when filter changes
                            }}
                          />
                          <label 
                            htmlFor={`growth-${rate}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {rate === 'fast' ? 'Growing fast' : rate === 'stable' ? 'Stable growth' : 'Slow growth'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setMinSalary(0);
                    setSelectedCategories([]);
                    setSelectedEducation([]);
                    setSelectedGrowth([]);
                    setSortBy('title');
                    setSortOrder('asc');
                    setCurrentPage(1);
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-4 flex gap-4 flex-col md:flex-row">
            <div className="relative flex-1">
              <Input 
                placeholder="Search careers by title, description, or aliases..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="pl-10"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            
            <div className="flex gap-2">
              <div className="w-48">
                <Label htmlFor="sort-by" className="sr-only">Sort by</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1); // Reset to first page when sort changes
                  }}
                >
                  <SelectTrigger id="sort-by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="growth_rate">Growth Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-32">
                <Label htmlFor="sort-order" className="sr-only">Sort order</Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value) => {
                    setSortOrder(value);
                    setCurrentPage(1); // Reset to first page when sort order changes
                  }}
                >
                  <SelectTrigger id="sort-order">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            // Loading skeleton UI
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-10" />
                    </div>
                    <Skeleton className="h-4 w-1/2 mt-2" />
                    <div className="flex flex-wrap mt-3 space-x-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {currentCareers.length > 0 ? (
                <>
                  {currentCareers.map((career) => (
                    <Card key={career.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{career.title}</h4>
                          {career.salary && (
                            <span className="text-sm font-mono text-gray-600">${career.salary.toLocaleString()}</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{career.description}</p>
                        <div className="flex flex-wrap items-center mt-2">
                          {career.growth_rate && (
                            <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {career.growth_rate === 'fast' ? 'Growing fast' : career.growth_rate === 'stable' ? 'Stable growth' : 'Slow growth'}
                            </div>
                          )}
                          {career.education && (
                            <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" 
                                />
                              </svg>
                              {career.education}
                            </div>
                          )}
                          {career.category && (
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                              </svg>
                              {career.category}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button 
                            size="sm"
                            variant={isCareerFavorite(career.id) ? "default" : "outline"}
                            className={isCareerFavorite(career.id) ? "bg-primary" : ""}
                            onClick={() => toggleFavorite(career)}
                            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                          >
                            {isCareerFavorite(career.id) ? (
                              <>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4 mr-1" 
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                                Favorited
                              </>
                            ) : (
                              "Add to Favorites"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center px-3">
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-12 w-12 mx-auto text-gray-400 mb-4" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-700">No careers found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerExploration;
