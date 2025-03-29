import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { College } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

// Define the types for our favorites
type FavoriteCollege = {
  id: number;
  userId: number;
  collegeId: number;
  createdAt: string;
};

const CollegeDiscovery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  
  // Parse URL query parameters when the component loads
  const parseQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || "",
      tuition: parseInt(params.get('tuition') || "80000"),
      acceptMin: parseInt(params.get('acceptMin') || "0"),
      acceptMax: parseInt(params.get('acceptMax') || "100"),
      types: params.get('types')?.split(',').filter(Boolean) || [],
      states: params.get('states')?.split(',').filter(Boolean) || [],
      sizes: params.get('sizes')?.split(',').filter(Boolean) || [],
      usNewsTop150: params.get('usNewsTop150') === 'true',
      bestLiberalArts: params.get('bestLiberalArts') === 'true',
      page: parseInt(params.get('page') || "1")
    };
  };
  
  // Initial state from URL or defaults
  const initialParams = parseQueryParams();
  const [searchQuery, setSearchQuery] = useState(initialParams.q);
  const [maxTuition, setMaxTuition] = useState(initialParams.tuition);
  const [acceptanceRange, setAcceptanceRange] = useState([initialParams.acceptMin, initialParams.acceptMax]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialParams.types);
  const [selectedStates, setSelectedStates] = useState<string[]>(initialParams.states);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialParams.sizes);
  const [usNewsTop150Filter, setUsNewsTop150Filter] = useState<boolean>(initialParams.usNewsTop150);
  const [bestLiberalArtsFilter, setBestLiberalArtsFilter] = useState<boolean>(initialParams.bestLiberalArts);
  const [currentPage, setCurrentPage] = useState(initialParams.page);
  const itemsPerPage = 10;
  
  // Update URL when filters change
  const updateUrlParams = () => {
    const params = new URLSearchParams();
    
    // Only add parameters if they're not empty/default
    if (searchQuery) params.set('q', searchQuery);
    if (maxTuition !== 80000) params.set('tuition', maxTuition.toString());
    if (acceptanceRange[0] !== 0) params.set('acceptMin', acceptanceRange[0].toString());
    if (acceptanceRange[1] !== 100) params.set('acceptMax', acceptanceRange[1].toString());
    if (selectedTypes.length) params.set('types', selectedTypes.join(','));
    if (selectedStates.length) params.set('states', selectedStates.join(','));
    if (selectedSizes.length) params.set('sizes', selectedSizes.join(','));
    if (usNewsTop150Filter) params.set('usNewsTop150', 'true');
    if (bestLiberalArtsFilter) params.set('bestLiberalArts', 'true');
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    // Construct new URL with search params
    const newUrl = `/colleges${params.toString() ? `?${params.toString()}` : ''}`;
    
    // Update URL without causing a page reload
    window.history.pushState({}, '', newUrl);
  };
  
  // For demo purposes, we'll use a temporary userId
  // In a real application, this would come from auth
  const temporaryUserId = 1;
  
  // Fetch colleges from API
  const { data: colleges = [], isLoading, isError } = useQuery<College[]>({
    queryKey: ['/api/colleges'],
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      // Log first few colleges with either flag set to check property names
      console.log("College data sample:", data[0]);
      
      // Check for colleges with US News Top 150 flag
      const usNewsTop150Colleges = data.filter(c => c.usNewsTop150 === 1);
      console.log("US News Top 150 colleges count:", usNewsTop150Colleges.length);
      if (usNewsTop150Colleges.length > 0) {
        console.log("US News Top 150 sample:", usNewsTop150Colleges[0]);
      }
      
      // Check for colleges with Best Liberal Arts flag
      const bestLiberalArtsColleges = data.filter(c => c.bestLiberalArtsColleges === 1);
      console.log("Best Liberal Arts colleges count:", bestLiberalArtsColleges.length);
      if (bestLiberalArtsColleges.length > 0) {
        console.log("Best Liberal Arts sample:", bestLiberalArtsColleges[0]);
      }
    }
  });
  
  // Fetch user's favorite colleges
  const { data: favoriteColleges = [] } = useQuery<FavoriteCollege[]>({
    queryKey: ['/api/favorites/colleges', temporaryUserId],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Check if a college is in favorites
  const isCollegeFavorite = (collegeId: number) => {
    return favoriteColleges.some((favorite) => favorite.collegeId === collegeId);
  };
  
  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: (collegeId: number) => 
      apiRequest('/api/favorites/colleges', {
        method: 'POST',
        body: JSON.stringify({ userId: temporaryUserId, collegeId }),
        headers: { 'Content-Type': 'application/json' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/colleges', temporaryUserId] });
      toast({
        title: "College added to favorites",
        description: "You can view your favorite colleges in the settings page.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error adding college to favorites:", error);
      toast({
        title: "Failed to add to favorites",
        description: "There was a problem adding this college to your favorites. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (favoriteId: number) => 
      apiRequest(`/api/favorites/colleges/${favoriteId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/colleges', temporaryUserId] });
      toast({
        title: "College removed from favorites",
        description: "The college has been removed from your favorites.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error removing college from favorites:", error);
      toast({
        title: "Failed to remove from favorites",
        description: "There was a problem removing this college from your favorites. Please try again later.",
        variant: "destructive",
      });
    }
  });
  
  // Handle adding/removing college from favorites
  const toggleFavorite = (college: College) => {
    const favorite = favoriteColleges.find((fav) => fav.collegeId === college.id);
    
    if (favorite) {
      removeFromFavoritesMutation.mutate(favorite.id);
    } else {
      addToFavoritesMutation.mutate(college.id);
    }

    // Log for debugging
    console.log(`Toggling favorite for college ID ${college.id} (${college.name}) by user ID ${temporaryUserId}`);
  };
  
  // Show error toast if API fetch fails
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error loading colleges",
        description: "There was a problem loading the college data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, toast]);
  
  // Update URL when any filter changes
  useEffect(() => {
    // Only update URL after initial data load
    if (colleges.length > 0) {
      updateUrlParams();
    }
  }, [
    searchQuery, 
    maxTuition, 
    acceptanceRange, 
    selectedTypes, 
    selectedStates, 
    selectedSizes, 
    usNewsTop150Filter,
    bestLiberalArtsFilter,
    currentPage
  ]);
  
  // Extract unique types, states and sizes from the fetched colleges
  const types = Array.from(new Set(colleges.map(college => college.type).filter(Boolean) || [])) as string[];
  const states = Array.from(new Set(colleges.map(college => college.state).filter(Boolean) || [])) as string[];
  const sizes = Array.from(new Set(colleges.map(college => college.size).filter(Boolean) || [])) as string[];
  
  // Filter colleges based on search and filters
  const filteredColleges = colleges.filter((college: College) => {
    // Basic data check - skip colleges with missing core data
    if (!college.name) return false;
    
    // Improved search with trimming and better fuzzy match
    const cleanSearchQuery = searchQuery.toLowerCase().trim();
    const cleanCollegeName = college.name.toLowerCase().trim();
    const cleanLocation = college.location ? college.location.toLowerCase().trim() : '';
    
    // If the search query is empty, consider it a match
    const matchesSearch = cleanSearchQuery === '' || 
                         cleanCollegeName.includes(cleanSearchQuery) ||
                         cleanLocation.includes(cleanSearchQuery);
                         
    const matchesTuition = college.tuition ? college.tuition <= maxTuition : true;
    const matchesAcceptance = college.acceptanceRate ? 
                            college.acceptanceRate >= acceptanceRange[0] && 
                            college.acceptanceRate <= acceptanceRange[1] : true;
    const matchesType = selectedTypes.length === 0 || 
                       (college.type && selectedTypes.includes(college.type));
    const matchesState = selectedStates.length === 0 || 
                        (college.state && selectedStates.includes(college.state));
    const matchesSize = selectedSizes.length === 0 || 
                       (college.size && selectedSizes.includes(college.size));
    
    // Check preset filter matches
    const matchesUsNewsTop150 = !usNewsTop150Filter || (college.usNewsTop150 === 1);
    const matchesBestLiberalArts = !bestLiberalArtsFilter || (college.bestLiberalArtsColleges === 1);
    
    // If we're searching for Skidmore specifically and this is Skidmore, log details
    if (cleanSearchQuery.includes('skidmore') && college.id === 2189) {
      console.log('Found Skidmore:', college);
      console.log('Search matches:', matchesSearch);
      console.log('Tuition matches:', matchesTuition);
      console.log('Acceptance matches:', matchesAcceptance);
      console.log('Type matches:', matchesType);
      console.log('State matches:', matchesState);
      console.log('Size matches:', matchesSize);
      console.log('US News Top 150 matches:', matchesUsNewsTop150);
      console.log('Best Liberal Arts matches:', matchesBestLiberalArts);
    }
    
    return matchesSearch && matchesTuition && matchesAcceptance && 
           matchesType && matchesState && matchesSize && 
           matchesUsNewsTop150 && matchesBestLiberalArts;
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
  const pageStart = (currentPage - 1) * itemsPerPage;
  const pageEnd = pageStart + itemsPerPage;
  const currentColleges = filteredColleges.slice(pageStart, pageEnd);
  
  // Function to handle pagination
  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">College Discovery</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>Maximum Tuition: ${maxTuition.toLocaleString()}</Label>
                  <Slider
                    value={[maxTuition]}
                    onValueChange={(value) => setMaxTuition(value[0])}
                    min={0}
                    max={80000}
                    step={1000}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Acceptance Rate: {acceptanceRange[0]}% - {acceptanceRange[1]}%</Label>
                  <Slider
                    value={acceptanceRange}
                    onValueChange={(value) => setAcceptanceRange(value)}
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                
                {types.length > 0 && (
                  <div>
                    <Label className="mb-2 block">College Type</Label>
                    <div className="space-y-2">
                      {types.map((type: string) => (
                        <div key={type} className="flex items-center">
                          <Checkbox 
                            id={`type-${type}`}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTypes([...selectedTypes, type]);
                              } else {
                                setSelectedTypes(selectedTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`type-${type}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {states.length > 0 && (
                  <div>
                    <Label className="mb-2 block">States</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {states.map((state: string) => (
                        <div key={state} className="flex items-center">
                          <Checkbox 
                            id={`state-${state}`}
                            checked={selectedStates.includes(state)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStates([...selectedStates, state]);
                              } else {
                                setSelectedStates(selectedStates.filter(s => s !== state));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`state-${state}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {state}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {sizes.length > 0 && (
                  <div>
                    <Label className="mb-2 block">College Size</Label>
                    <div className="space-y-2">
                      {sizes.map((size: string) => (
                        <div key={size} className="flex items-center">
                          <Checkbox 
                            id={`size-${size}`}
                            checked={selectedSizes.includes(size)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSizes([...selectedSizes, size]);
                              } else {
                                setSelectedSizes(selectedSizes.filter(s => s !== size));
                              }
                            }}
                          />
                          <label 
                            htmlFor={`size-${size}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
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
                    setMaxTuition(80000);
                    setAcceptanceRange([0, 100]);
                    setSelectedTypes([]);
                    setSelectedStates([]);
                    setSelectedSizes([]);
                    setUsNewsTop150Filter(false);
                    setBestLiberalArtsFilter(false);
                    setCurrentPage(1);
                  }}
                >
                  Reset Filters
                </Button>
                
                <div>
                  <Label className="mb-2 block">Preset Filters</Label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox 
                        id="us-news-top-150"
                        checked={usNewsTop150Filter}
                        onCheckedChange={(checked) => {
                          setUsNewsTop150Filter(checked === true);
                          setCurrentPage(1); // Reset to first page on filter change
                        }}
                      />
                      <label 
                        htmlFor="us-news-top-150"
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        US News Top 150
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Checkbox 
                        id="best-liberal-arts"
                        checked={bestLiberalArtsFilter}
                        onCheckedChange={(checked) => {
                          setBestLiberalArtsFilter(checked === true);
                          setCurrentPage(1); // Reset to first page on filter change
                        }}
                      />
                      <label 
                        htmlFor="best-liberal-arts"
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Best Liberal Arts Colleges
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <div className="mb-4">
            <div className="relative">
              <Input 
                placeholder="Search colleges by name or location..." 
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
              {currentColleges.length > 0 ? (
                <>
                  {currentColleges.map((college) => (
                    <Card key={college.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{college.name}</h4>
                          {college.rating && (
                            <div className="flex items-center">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4 text-yellow-500" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" 
                                />
                              </svg>
                              <span className="text-sm text-gray-600 ml-1">{college.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {college.location || 'Location not specified'} 
                          {college.type && ` • ${college.type}`}
                        </p>
                        <div className="flex flex-wrap items-center mt-2">
                          {college.usNewsTop150 === 1 && (
                            <div className="flex items-center text-xs text-emerald-600 mr-4 mb-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5">
                                <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                              </svg>
                              US News Top 150
                            </div>
                          )}
                          {college.bestLiberalArtsColleges === 1 && (
                            <div className="flex items-center text-xs text-indigo-600 mr-4 mb-1 bg-indigo-50 px-1.5 py-0.5 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                              </svg>
                              Best Liberal Arts
                            </div>
                          )}
                          {college.tuition !== null && college.tuition !== undefined && (
                            <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              ${college.tuition.toLocaleString()}
                            </div>
                          )}
                          {college.acceptanceRate !== null && college.acceptanceRate !== undefined && (
                            <div className="flex items-center text-xs text-gray-500 mr-4 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                              </svg>
                              {college.acceptanceRate.toFixed(1)}% acceptance
                            </div>
                          )}
                          {college.rank !== null && college.rank !== undefined && (
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-3.5 w-3.5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Rank: #{college.rank}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Button size="sm" variant="outline">View Details</Button>
                          <Button 
                            size="sm"
                            variant={isCollegeFavorite(college.id) ? "default" : "outline"}
                            className={isCollegeFavorite(college.id) ? "bg-primary" : ""}
                            onClick={() => toggleFavorite(college)}
                            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                          >
                            {isCollegeFavorite(college.id) ? (
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
                    <h3 className="text-lg font-medium text-gray-700">No colleges found</h3>
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

export default CollegeDiscovery;
