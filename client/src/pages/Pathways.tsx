import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add type declaration for our global variable to prevent TypeScript errors
declare global {
  interface Window {
    _lastAddedCareerId?: number;
  }
}
import SwipeableScenarios from "@/components/pathways/SwipeableScenarios";
import RecommendationEngine from "@/components/pathways/RecommendationEngine";
import IdentityWheel from "@/components/pathways/IdentityWheel";
import AdvancedWheel from "@/components/pathways/AdvancedWheel";
import AvatarCreator from "@/components/pathways/AvatarCreator";
import QuickSpinWheel from "@/components/pathways/QuickSpinWheel";
import { MilitaryPathway } from "@/components/pathways/MilitaryPathways";
import { GapYearPathway } from "@/components/pathways/GapYearPathways";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PathChoice = "education" | "job" | "military" | "gap";

// Create a type specifically for the "education" path
type EducationPathChoice = "education";

// Other paths
type OtherPathChoice = "job" | "military" | "gap";

type EducationType = "4year" | "2year" | "vocational" | null;
type JobType = "fulltime" | "parttime" | null;
type MilitaryBranch = "army" | "navy" | "airforce" | "marines" | "coastguard" | "spaceguard" | null;
type GapYearActivity = "travel" | "volunteer" | "work" | "other" | null;
type GapYearLength = "3month" | "6month" | "9month" | "12month" | null;
// For the transfer option
type TransferOption = "yes" | "no" | null;

interface StepProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

interface CareerPath {
  id: number;
  field_of_study: string;
  career_title: string;
  option_rank: number;
}

const Step = ({ children, title, subtitle }: StepProps) => (
  <div className="mb-8 animate-fadeIn">
    <h3 className="text-2xl font-display font-bold text-primary mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{title}</h3>
    {subtitle && <p className="text-base text-gray-600 mb-4 max-w-2xl">{subtitle}</p>}
    <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
      {children}
    </div>
  </div>
);

import { User, AuthProps } from "@/interfaces/auth";

interface PathwaysProps extends AuthProps {}

const Pathways = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}: PathwaysProps) => {
  const { toast } = useToast();
  
  // Helper function to format salary with commas and currency symbol
  const formatSalary = (salary: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(salary);
  };
  
  // Format any amount as currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<PathChoice | null>(null);
  
  // A type guard function to check if the path is education
  const isEducationPath = (path: PathChoice | null): path is EducationPathChoice => {
    return path === 'education';
  };
  const [educationType, setEducationType] = useState<EducationType>(null);
  const [jobType, setJobType] = useState<JobType>(null);
  const [isPartTime, setIsPartTime] = useState<boolean>(false);
  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [militaryBranch, setMilitaryBranch] = useState<MilitaryBranch>(null);
  const [serviceLength, setServiceLength] = useState<string>('4year'); // Default 4 years
  const [postMilitaryPath, setPostMilitaryPath] = useState<'education' | 'job' | null>(null);
  const [militaryToEducation, setMilitaryToEducation] = useState<boolean>(false);
  const [militaryToJob, setMilitaryToJob] = useState<boolean>(false);
  const [adjustedStartingAge, setAdjustedStartingAge] = useState<number>(18); // Default starting age
  const [militaryBenefits, setMilitaryBenefits] = useState<{
    giBillEligible: boolean;
    giBillPercentage: number;
    housingAllowance: boolean;
    veteransPreference: boolean;
    retirementEligible: boolean;
  } | null>(null);
  const [gapYearActivity, setGapYearActivity] = useState<GapYearActivity>(null);
  const [gapYearLength, setGapYearLength] = useState<GapYearLength>(null);
  const [gapYearBudget, setGapYearBudget] = useState<number>(10000); // Default $10,000 budget
  const [needsGuidance, setNeedsGuidance] = useState<boolean | null>(null);
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState<string | null>(null);
  const [hasSpecificSchool, setHasSpecificSchool] = useState<boolean | null>(null);
  
  // For 2-year college transfer options
  const [transferOption, setTransferOption] = useState<TransferOption>(null);
  const [transferCollege, setTransferCollege] = useState<string>('');
  const [transferCollegeSearchQuery, setTransferCollegeSearchQuery] = useState<string>('');
  const [transferFieldOfStudy, setTransferFieldOfStudy] = useState<string>('');
  const [transferFieldOptions, setTransferFieldOptions] = useState<string[]>([]);
  
  // Track whether the user came through the guided path for proper flow separation
  const [guidedPathComplete, setGuidedPathComplete] = useState<boolean>(false);
  
  // This will store the personalized narrative based on user selections
  const [userJourney, setUserJourney] = useState<string>("After high school, I am interested in...");
  const [specificSchool, setSpecificSchool] = useState<string>('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [careerSearchQuery, setCareerSearchQuery] = useState<string>('');
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [filteredCareerPaths, setFilteredCareerPaths] = useState<CareerPath[] | null>(null);
  const [globalCareerSearch, setGlobalCareerSearch] = useState<boolean>(false);
  
  // Function to check if a career requires higher education
  const checkCareerEducationRequirement = (careerId: number) => {
    if (!allCareers || !Array.isArray(allCareers)) return;
    
    const career = allCareers.find(c => c.id === careerId);
    if (!career) return;
    
    // Check education field for degree requirements
    const educationReq = career.education;
    
    if (educationReq && (
        educationReq.toLowerCase().includes("bachelor") || 
        educationReq.toLowerCase().includes("degree") ||
        educationReq.toLowerCase().includes("master") ||
        educationReq.toLowerCase().includes("phd") ||
        educationReq.toLowerCase().includes("doctorate")
    )) {
      console.log(`Career "${career.title}" requires higher education: ${educationReq}`);
      setSelectedCareerEducation(educationReq);
      
      // Show the warning dialog if the user is in job, 2-year college, or vocational pathway
      if (selectedPath === 'job' || 
          (selectedPath === 'education' && (educationType === '2year' || educationType === 'vocational'))) {
        setShowEducationWarning(true);
      }
    } else {
      console.log(`Career "${career.title}" doesn't require higher education or requirement not specified`);
      setSelectedCareerEducation(null);
      setShowEducationWarning(false);
    }
  };

  // Function to search careers with a given term - directly matching Go To Work pathway
  const searchCareers = (searchTerm: string, showWarnings = false) => {
    if (!searchTerm.trim()) {
      setFilteredCareerPaths(null);
      return;
    }
    
    const term = searchTerm.trim().toLowerCase();
    console.log('Searching careers with term:', term);
    
    // EXACTLY matching the Go To Work pathway - filter careers directly from allCareers
    if (allCareers && Array.isArray(allCareers) && allCareers.length > 0) {
      console.log('Filtering careers with exact same logic as Go To Work pathway');
      
      // First get all matching careers with their original properties
      const matchingCareers = allCareers
        .filter(career => {
          // Match search query - EXACT same logic as Go To Work pathway
          const matchesQuery = 
            (career.title && career.title.toLowerCase().includes(term)) || 
            (career.description && career.description.toLowerCase().includes(term)) ||
            (career.alias1 && career.alias1.toLowerCase().includes(term)) ||
            (career.alias2 && career.alias2.toLowerCase().includes(term)) ||
            (career.alias3 && career.alias3.toLowerCase().includes(term)) ||
            (career.alias4 && career.alias4.toLowerCase().includes(term)) ||
            (career.alias5 && career.alias5.toLowerCase().includes(term));
            
          // Filter by field of study if not in global search mode
          if (!globalCareerSearch && selectedFieldOfStudy) {
            return matchesQuery && 
                  (career.category === selectedFieldOfStudy || 
                   career.field === selectedFieldOfStudy);
          }
          
          return matchesQuery;
        })
        .slice(0, 10); // Limit results like in Go To Work pathway
      
      console.log(`Found ${matchingCareers.length} careers matching "${term}" from careers table`);
      
      // If we found matches, convert to the CareerPath format and set selectedCareerId
      if (matchingCareers.length > 0) {
        // Map to CareerPath format for display
        const mappedResults = matchingCareers.map((career, index) => ({
          id: career.id,
          field_of_study: globalCareerSearch ? 
                      (career.category || career.field || "General") : 
                      selectedFieldOfStudy,
          career_title: career.title,
          option_rank: index + 1,
          // Include original career properties for display
          salary: career.salary,
          description: career.description
        }));
        
        setFilteredCareerPaths(mappedResults);
        
        // Auto-select the first career (critical for financial planning)
        setSelectedCareerId(matchingCareers[0].id);
        
        // Only check for education warnings when explicitly requested
        // This prevents warnings from showing during typing in the search field
        if (showWarnings) {
          // Check if this career needs education warning
          checkCareerEducationRequirement(matchingCareers[0].id);
        }
      } else {
        setFilteredCareerPaths([]);
      }
    } else {
      console.log('Career data not loaded yet, cannot search');
      setFilteredCareerPaths([]);
    }
  };
  
  // Location data type
  interface LocationData {
    id?: number;              // Added id property
    zip_code: string;
    city: string;
    state: string;
    county?: string;
    cost_of_living_index?: number;
    median_income?: number;
    income_adjustment_factor?: number;
    housing?: number;
    food?: number;
    transportation?: number;
    utilities?: number;
    healthcare?: number;
    other?: number;
  }
  
  // US states array for dropdown
  const usStates = [
    { name: "Alabama", code: "AL" },
    { name: "Alaska", code: "AK" },
    { name: "Arizona", code: "AZ" },
    { name: "Arkansas", code: "AR" },
    { name: "California", code: "CA" },
    { name: "Colorado", code: "CO" },
    { name: "Connecticut", code: "CT" },
    { name: "Delaware", code: "DE" },
    { name: "Florida", code: "FL" },
    { name: "Georgia", code: "GA" },
    { name: "Hawaii", code: "HI" },
    { name: "Idaho", code: "ID" },
    { name: "Illinois", code: "IL" },
    { name: "Indiana", code: "IN" },
    { name: "Iowa", code: "IA" },
    { name: "Kansas", code: "KS" },
    { name: "Kentucky", code: "KY" },
    { name: "Louisiana", code: "LA" },
    { name: "Maine", code: "ME" },
    { name: "Maryland", code: "MD" },
    { name: "Massachusetts", code: "MA" },
    { name: "Michigan", code: "MI" },
    { name: "Minnesota", code: "MN" },
    { name: "Mississippi", code: "MS" },
    { name: "Missouri", code: "MO" },
    { name: "Montana", code: "MT" },
    { name: "Nebraska", code: "NE" },
    { name: "Nevada", code: "NV" },
    { name: "New Hampshire", code: "NH" },
    { name: "New Jersey", code: "NJ" },
    { name: "New Mexico", code: "NM" },
    { name: "New York", code: "NY" },
    { name: "North Carolina", code: "NC" },
    { name: "North Dakota", code: "ND" },
    { name: "Ohio", code: "OH" },
    { name: "Oklahoma", code: "OK" },
    { name: "Oregon", code: "OR" },
    { name: "Pennsylvania", code: "PA" },
    { name: "Rhode Island", code: "RI" },
    { name: "South Carolina", code: "SC" },
    { name: "South Dakota", code: "SD" },
    { name: "Tennessee", code: "TN" },
    { name: "Texas", code: "TX" },
    { name: "Utah", code: "UT" },
    { name: "Vermont", code: "VT" },
    { name: "Virginia", code: "VA" },
    { name: "Washington", code: "WA" },
    { name: "West Virginia", code: "WV" },
    { name: "Wisconsin", code: "WI" },
    { name: "Wyoming", code: "WY" },
    { name: "District of Columbia", code: "DC" }
  ];
  
  // Location selection state variables
  const [searchByZip, setSearchByZip] = useState<boolean>(true);
  const [selectedZipCode, setSelectedZipCode] = useState<string>('');
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('CA');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [fetchingLocation, setFetchingLocation] = useState<boolean>(false);
  
  // Education requirement warning state
  
  // Education requirement warning state
  const [showEducationWarning, setShowEducationWarning] = useState<boolean>(false);
  const [selectedCareerEducation, setSelectedCareerEducation] = useState<string | null>(null);
  
  // Add location to favorites mutation
  const addLocationToFavorites = useMutation({
    mutationFn: async (location: { zipCode: string; city: string; state: string }) => {
      return apiRequest('/api/favorites/locations', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 1, // Use current user ID or default to 1 for demo
          ...location
        })
      });
    }
  });
  
  // Add college to favorites mutation
  const addCollegeToFavorites = useMutation({
    mutationFn: async (collegeId: number) => {
      return apiRequest('/api/favorites/colleges', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user?.id || 1, // Use current user ID or default to 1 for demo
          collegeId 
        })
      });
    }
  });
  
  // Add career to favorites mutation
  const addCareerToFavorites = useMutation({
    mutationFn: async (careerId: number) => {
      // Prevent duplicate API calls with a module-level variable
      if (window._lastAddedCareerId === careerId) {
        console.log(`Preventing duplicate career favorite add for ID ${careerId}`);
        return Promise.resolve({ alreadyAdded: true });
      }
      
      // Set this career as the last added one
      window._lastAddedCareerId = careerId;
      
      console.log(`Actually adding career ${careerId} to favorites`);
      return apiRequest('/api/favorites/careers', {
        method: 'POST',
        body: JSON.stringify({ 
          userId: user?.id || 1, // Use current user ID or default to 1 for demo
          careerId 
        })
      });
    }
  });
  
  // Create career calculation mutation
  const createCareerCalculation = useMutation({
    mutationFn: async ({ careerId, locationId }: { careerId: number, locationId: number }) => {
      console.log(`Creating career calculation for career ${careerId} at location ${locationId}`);
      return apiRequest('/api/financial-calculations/careers', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id || 1,
          careerId,
          locationId,
          includeInProjections: true // Automatically include in projections
        })
      });
    },
    onSuccess: () => {
      // Invalidate any queries that depend on calculations
      queryClient.invalidateQueries({ queryKey: ['/api/financial-calculations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial-projections'] });
    }
  });
  
  // Function to create a career plan (add to favorites, create calculation, and include in projections)
  const createCareerPlan = async (careerId: number, locationId: number) => {
    try {
      // Step 1: Add career to favorites (if not already added)
      await addCareerToFavorites.mutateAsync(careerId);
      
      // Step 2: Create career calculation (this will automatically include in projections)
      await createCareerCalculation.mutateAsync({ careerId, locationId });
      
      return true;
    } catch (error) {
      console.error('Error creating career plan:', error);
      toast({
        title: "Error creating career plan",
        description: "There was a problem creating your career plan. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // This function will set the education type and advance to the specific school question
  const selectEducationType = (type: EducationType) => {
    setEducationType(type);
    
    // Update the narrative based on the education type selection
    if (type === '4year') {
      setUserJourney("After high school, I am interested in attending a 4-year college or university where...");
    } else if (type === '2year') {
      setUserJourney("After high school, I am interested in attending a 2-year community college where...");
    } else if (type === 'vocational') {
      setUserJourney("After high school, I am interested in attending a vocational/trade school where...");
    }
    
    // Move to the school selection step
    setCurrentStep(4);
  };
  const [swipeResults, setSwipeResults] = useState<Record<string, boolean>>({});
  const [wheelResults, setWheelResults] = useState<Record<string, string>>({});
  const [explorationMethod, setExplorationMethod] = useState<'swipe' | 'wheel' | 'advancedWheel' | 'avatar' | 'quickSpin' | null>(null);
  const [avatarResults, setAvatarResults] = useState<Record<string, string>>({});
  const [quickSpinResults, setQuickSpinResults] = useState<Record<string, string>>({
    superpower: '',
    ideal_day: '',
    values: '',
    activities: '',
    feelings: '',
    location: '',
    team_role: '',
    wildcard: ''
  });
  
  // Fetch all career paths for the field selection dropdown
  const { data: allCareerPaths, isLoading: isLoadingAllPaths } = useQuery({
    queryKey: ['/api/career-paths'],
    enabled: currentStep === 5 || currentStep === 6 // Enable when on field of study step (5) or profession step (6)
  });
  
  // Get unique fields of study from the career paths
  const fieldsOfStudy = allCareerPaths && Array.isArray(allCareerPaths)
    ? Array.from(new Set(allCareerPaths.map((path: CareerPath) => path.field_of_study))).sort() 
    : [];
  
  // Fetch career paths for a specific field when selected
  const { data: fieldCareerPaths, isLoading: isLoadingFieldPaths } = useQuery<CareerPath[]>({
    queryKey: ['/api/career-paths/field', selectedFieldOfStudy],
    queryFn: async () => {
      if (!selectedFieldOfStudy) return [];
      console.log(`Fetching career paths for field: ${selectedFieldOfStudy}`);
      const response = await fetch(`/api/career-paths/field/${encodeURIComponent(selectedFieldOfStudy)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch career paths');
      }
      return response.json();
    },
    enabled: !!selectedFieldOfStudy && (currentStep === 5 || currentStep === 6)
  });
  
  // Fetch all careers for global search
  const { data: allCareers, isLoading: isLoadingAllCareers } = useQuery<any[]>({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      console.log('Fetching all careers for search');
      const response = await fetch('/api/careers');
      if (!response.ok) {
        throw new Error('Failed to fetch careers');
      }
      return response.json();
    },
    enabled: (selectedPath === 'job' && currentStep === 3) || currentStep === 5 || currentStep === 6
  });
  
  // Fetch location data when zip code is entered
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ['/api/location-cost-of-living/zip', selectedZipCode],
    queryFn: async () => {
      if (!selectedZipCode || selectedZipCode.length !== 5) return null;
      console.log(`Fetching location data for zip: ${selectedZipCode}`);
      const response = await fetch(`/api/location-cost-of-living/zip/${selectedZipCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      return response.json();
    },
    enabled: !!selectedZipCode && selectedZipCode.length === 5 && currentStep === 7
  });
  
  // Query to fetch all colleges for local filtering
  const { data: allColleges = [], isLoading: isLoadingColleges } = useQuery<any[]>({
    queryKey: ['/api/colleges'],
    queryFn: async () => {
      const response = await fetch('/api/colleges');
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      return response.json();
    },
    // Only fetch when on college selection step and for 2-year/vocational education types
    enabled: currentStep === 8 && (educationType === '2year' || educationType === 'vocational')
  });
  
  // School search query - search from API for 4-year colleges, filter locally for 2-year/vocational
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery<any[]>({
    queryKey: ['/api/colleges/search', searchQuery, educationType, allColleges],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      // For 2-year colleges and vocational schools, filter from the fetched colleges locally
      if ((educationType === '2year' || educationType === 'vocational') && allColleges.length > 0) {
        console.log(`Local search for ${searchQuery} in ${educationType} colleges from ${allColleges.length} total colleges`);
        
        // First, filter by education type
        let filteredColleges = allColleges.filter(college => {
          if (!college.type) return false;
          
          const collegeType = college.type.toLowerCase();
          
          // Filter based on education type
          if (educationType === '2year') {
            // Filter for 2-year/community colleges by type or degreePredominant=2
            return (
              collegeType.includes('community') || 
              collegeType.includes('2-year') || 
              collegeType.includes('2 year') || 
              collegeType.includes('junior') ||
              college.degreePredominant === 2 ||
              (college.name && college.name.toLowerCase().includes('community college'))
            );
          } else if (educationType === 'vocational') {
            // Filter for vocational/technical schools by type or degreePredominant=1
            return (
              collegeType.includes('vocational') || 
              collegeType.includes('technical') || 
              collegeType.includes('trade') || 
              collegeType.includes('career') ||
              college.degreePredominant === 1 ||
              (college.name && (
                college.name.toLowerCase().includes('technical') ||
                college.name.toLowerCase().includes('vocational') ||
                college.name.toLowerCase().includes('trade') ||
                college.name.toLowerCase().includes('career') ||
                college.name.toLowerCase().includes('institute')
              ))
            );
          }
          
          return false;
        });
        
        // Then, search by name/location from the filtered set
        const searchLower = searchQuery.toLowerCase();
        const searchResults = filteredColleges.filter(college => {
          const collegeName = college.name ? college.name.toLowerCase() : '';
          const collegeLocation = college.location ? college.location.toLowerCase() : '';
          
          return collegeName.includes(searchLower) || collegeLocation.includes(searchLower);
        });
        
        // Transform results to match API format and return top 10
        return searchResults.slice(0, 10).map(college => ({
          id: college.id,
          name: college.name,
          city: college.location?.split(',')[0]?.trim() || '',
          state: college.state || '',
          type: college.type
        }));
      } 
      
      // Default behavior for other education types: use API search
      const url = `/api/colleges/search?q=${encodeURIComponent(searchQuery)}${educationType ? `&educationType=${educationType}` : ''}`;
      console.log(`API search for ${searchQuery}, educationType: ${educationType || 'all'}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search colleges');
      }
      return response.json();
    },
    enabled: !!searchQuery && searchQuery.length > 2
  });
  
  // Transfer college search query - specifically for 4-year colleges when transferring
  const { data: transferCollegeResults, isLoading: isLoadingTransferSearch } = useQuery<any[]>({
    queryKey: ['/api/colleges/search', transferCollegeSearchQuery, '4year'],
    queryFn: async () => {
      if (!transferCollegeSearchQuery || transferCollegeSearchQuery.length < 2) return [];
      const url = `/api/colleges/search?q=${encodeURIComponent(transferCollegeSearchQuery)}&educationType=4year`;
      console.log(`Searching 4-year colleges for transfer with query: ${transferCollegeSearchQuery}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search transfer colleges');
      }
      return response.json();
    },
    enabled: !!transferCollegeSearchQuery && transferCollegeSearchQuery.length > 2 && transferOption === 'yes' && currentStep === 5.5
  });

  const handlePathSelect = (path: PathChoice) => {
    setSelectedPath(path);
    // Automatically set default sub-types based on selection
    if (isEducationPath(path)) {
      setEducationType('4year'); // Default to 4-year college
    } else if (path === 'job') {
      setJobType('fulltime'); // Default to full-time job
      setIsPartTime(false);    // Default to full-time
      setWeeklyHours(40);      // Default to 40 hours
    } else if (path === 'military') {
      setMilitaryBranch('army'); // Default to Army
    } else if (path === 'gap') {
      setGapYearActivity('travel'); // Default to travel
    }
  };
  
  const handleNext = () => {
    // Special handling for gap year pathway - add a step for post-gap year navigation
    if (selectedPath === 'gap' && gapYearActivity && currentStep === 4) {
      setCurrentStep(4.5); // Use a decimal step to insert a new step between 4 and 5
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Function to fetch location data by zip code
  const fetchLocationByZipCode = async (zipCode: string) => {
    if (!zipCode || zipCode.length !== 5 || !/^\d+$/.test(zipCode)) {
      return;
    }
    
    setFetchingLocation(true);
    
    try {
      const response = await fetch(`/api/location-cost-of-living/zip/${zipCode}`);
      if (response.ok) {
        const locationData = await response.json();
        // Create a proper LocationData object with all properties
        setSelectedLocation(locationData);
        
        // Update the narrative to include location
        const updatedNarrative = `${userJourney} and live in ${locationData.city}, ${locationData.state}.`;
        setUserJourney(updatedNarrative);
      } else {
        // If location not found, clear the location
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setSelectedLocation(null);
    } finally {
      setFetchingLocation(false);
    }
  };
  
  // Function to fetch location data by city and state
  const fetchLocationByCityState = async (city: string, state: string) => {
    if (!city || !state) {
      return;
    }
    
    setFetchingLocation(true);
    
    try {
      // Query the API for location by city and state
      const response = await fetch(`/api/location-cost-of-living/city?city=${encodeURIComponent(city)}&state=${state}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Check if we got results back
        if (data && data.length > 0) {
          // Use the first result
          const locationData = data[0];
          
          // Use the complete LocationData object
          setSelectedLocation(locationData);
          
          // If there's a zip code in the result, store it
          if (locationData.zip_code) {
            setSelectedZipCode(locationData.zip_code);
          }
          
          // Update the narrative to include location
          const updatedNarrative = `${userJourney} and live in ${locationData.city}, ${locationData.state}.`;
          setUserJourney(updatedNarrative);
        } else {
          // No locations found
          setSelectedLocation(null);
        }
      } else {
        // API error
        setSelectedLocation(null);
      }
    } catch (error) {
      console.error("Error fetching location data by city/state:", error);
      setSelectedLocation(null);
    } finally {
      setFetchingLocation(false);
    }
  };
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedPath(null);
    setEducationType(null);
    setJobType(null);
    setMilitaryBranch(null);
    setServiceLength('4year');
    setPostMilitaryPath(null);
    setMilitaryToEducation(false);
    setMilitaryToJob(false);
    setAdjustedStartingAge(18);
    setMilitaryBenefits(null);
    setGapYearActivity(null);
    setGapYearLength(null);
    setGapYearBudget(10000);
    setNeedsGuidance(null);
    setSelectedFieldOfStudy(null);
    setHasSpecificSchool(null);
    setSpecificSchool('');
    setSelectedSchoolId(null);
    setSearchQuery('');
    setSelectedProfession(null);
    setSelectedCareerId(null);
    setExplorationMethod(null);
    setGuidedPathComplete(false); // Reset the guided path completion flag
    
    // Reset transfer options for 2-year college
    setTransferOption(null);
    setTransferCollege('');
    setTransferCollegeSearchQuery('');
    setTransferFieldOfStudy('');
    setTransferFieldOptions([]);
    
    // Reset location selection
    setSearchByZip(true);
    setSelectedZipCode('');
    setCitySearchQuery('');
    setSelectedState('CA');
    setSelectedLocation(null);
    
    // Reset game results
    setSwipeResults({});
    setWheelResults({});
    setAvatarResults({});
    setQuickSpinResults({
      superpower: '',
      ideal_day: '',
      values: '',
      activities: '',
      feelings: '',
      location: '',
      team_role: '',
      wildcard: ''
    });
  };
  
  // State to track reset triggers for each game
  const [resetCounter, setResetCounter] = useState(0);
  
  // This function restarts just the current exploration method
  // This function completely resets and remounts the active game component
  const handleRestartExploration = () => {
    console.log('handleRestartExploration called - current resetCounter:', resetCounter);
    
    // Store the current exploration method to ensure we're operating on the right game
    const currentMethod = explorationMethod;
    
    // If we're on the recommendations step, go back to the game step (3)
    if (currentStep >= 4) {
      setCurrentStep(3);
    }
    
    // Simple approach: just increment the reset counter which will cause the key prop to change
    // and all components to completely remount
    setResetCounter(prev => {
      const newCounter = prev + 1;
      console.log('Incrementing resetCounter from', prev, 'to', newCounter);
      return newCounter;
    });
    
    // Also reset the results state variables for extra safety
    if (currentMethod === 'swipe') {
      setSwipeResults({});
    } else if (currentMethod === 'wheel' || currentMethod === 'advancedWheel') {
      setWheelResults({});
    } else if (currentMethod === 'avatar') {
      setAvatarResults({});
    } else if (currentMethod === 'quickSpin') {
      setQuickSpinResults({
        superpower: '',
        ideal_day: '',
        values: '',
        activities: '',
        feelings: '',
        location: '',
        team_role: '',
        wildcard: ''
      });
    }
    
    // Force a rerender after a short delay to ensure state changes are processed
    setTimeout(() => {
      console.log('Game reset complete - counter is now:', resetCounter + 1);
      // This empty setState forces a rerender
      setCurrentStep(currentStep);
    }, 50);
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step 
            title="How would you like to plan your future?" 
            subtitle="Your journey to an empowered future begins with understanding your current direction"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
              <div 
                className={`group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative ${needsGuidance === false ? 'ring-4 ring-green-400 ring-opacity-50' : ''}`}
                onClick={() => {
                  setNeedsGuidance(false);
                  handleNext(); // Automatically proceed to next step
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/90 to-blue-500/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
                <div className="relative p-8 text-center text-white z-10">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                    <span className="material-icons text-3xl">map</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3 text-white">I know what I want to do</h3>
                  <p className="text-white/80 mb-4">I have a clear path in mind after high school and want to see where it leads</p>
                  
                  {/* Storyboard path visualization */}
                  <div className="relative my-4 py-2 px-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      {/* Education icon */}
                      <div className="relative">
                        <div className="bg-blue-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                          <span className="material-icons text-white text-xl">school</span>
                        </div>
                        <div className="text-xs text-white/80 mt-1">Education</div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex-grow h-0.5 mx-1 bg-white/20 relative">
                        <div className="absolute -top-1 animate-ping-slow w-1.5 h-1.5 bg-white rounded-full" style={{ left: '20%' }}></div>
                        <div className="absolute -top-1 animate-ping-slow animation-delay-1000 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '50%' }}></div>
                        <div className="absolute -top-1 animate-ping-slow animation-delay-2000 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '80%' }}></div>
                      </div>
                      
                      {/* Career icon */}
                      <div className="relative">
                        <div className="bg-green-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                          <span className="material-icons text-white text-xl">work</span>
                        </div>
                        <div className="text-xs text-white/80 mt-1">Career</div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex-grow h-0.5 mx-1 bg-white/20 relative">
                        <div className="absolute -top-1 animate-ping-slow w-1.5 h-1.5 bg-white rounded-full" style={{ left: '30%' }}></div>
                        <div className="absolute -top-1 animate-ping-slow animation-delay-1500 w-1.5 h-1.5 bg-white rounded-full" style={{ left: '70%' }}></div>
                      </div>
                      
                      {/* Success icon */}
                      <div className="relative">
                        <div className="bg-yellow-400/30 rounded-full h-12 w-12 flex items-center justify-center">
                          <span className="material-icons text-white text-xl">emoji_events</span>
                        </div>
                        <div className="text-xs text-white/80 mt-1">Success</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
                    Direct Path
                  </div>
                  
                  <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="material-icons text-xl">arrow_forward</span>
                  </div>
                </div>
              </div>
              
              <div 
                className={`group cursor-pointer transition-all duration-300 ease-in-out rounded-xl overflow-hidden shadow-lg hover:shadow-xl relative ${needsGuidance === true ? 'ring-4 ring-green-400 ring-opacity-50' : ''}`}
                onClick={() => {
                  setNeedsGuidance(true);
                  handleNext(); // Automatically proceed to next step
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-purple-600/90 transform transition-all duration-300 ease-in-out group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] group-hover:backdrop-blur-[0px] transition-all duration-300"></div>
                <div className="relative p-8 text-center text-white z-10">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-5 shadow-glow transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                    <span className="material-icons text-3xl">explore</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-3 text-white">Help me explore options</h3>
                  <p className="text-white/80 mb-4">I'm open to discovering possibilities that align with my interests and values</p>
                  
                  {/* Games and exploration interactive visualization */}
                  <div className="relative my-4 py-2 px-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                      {/* Spinning wheel visualization */}
                      <div className="relative h-20 w-20">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-400/60 animate-spin-slow"></div>
                        {/* Wheel segments */}
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-400/30 origin-bottom-right rotate-0"></div>
                          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-400/30 origin-bottom-left rotate-0"></div>
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-400/30 origin-top-left rotate-0"></div>
                          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-pink-400/30 origin-top-right rotate-0"></div>
                          <div className="absolute inset-0 rounded-full border-2 border-white/20"></div>
                        </div>
                        {/* Spinner needle */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-glow z-10"></div>
                        <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Spin</div>
                      </div>
                      
                      {/* Swipe cards visualization */}
                      <div className="relative h-20 w-20 mx-2">
                        <div className="absolute top-2 left-2 w-12 h-16 bg-green-400/20 rounded-md border border-green-400/40 transform -rotate-6 shadow-md"></div>
                        <div className="absolute top-1 left-4 w-12 h-16 bg-blue-400/20 rounded-md border border-blue-400/40 transform rotate-3 shadow-md"></div>
                        <div className="absolute top-0 left-6 w-12 h-16 bg-purple-400/20 rounded-md border border-purple-400/40 shadow-md">
                          <div className="h-full flex flex-col justify-center items-center">
                            <span className="material-icons text-white text-sm">thumb_up</span>
                          </div>
                        </div>
                        <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Swipe</div>
                      </div>
                      
                      {/* Avatar visualization */}
                      <div className="relative h-20 w-20">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-orange-400/20 rounded-full border border-orange-400/40 flex items-center justify-center">
                          <span className="material-icons text-white text-sm">face</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-blue-400/20 rounded-lg border border-blue-400/40"></div>
                        <div className="absolute text-xs text-white/80 mt-1 w-full text-center top-full">Create</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1 px-4 bg-white/20 rounded-full w-fit mx-auto backdrop-blur-sm text-sm font-medium">
                    Guided Discovery
                  </div>
                  
                  <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="material-icons text-xl">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </Step>
        );
      
      case 2:
        if (needsGuidance) {
          if (explorationMethod === null) {
            return (
              <Step 
                title="Choose Your Exploration Method" 
                subtitle="Select a fun activity to help discover your interests and values"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
                    onClick={() => {
                      setExplorationMethod('swipe');
                      // Clear previous results
                      setSwipeResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 py-5">
                      <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="material-icons text-2xl text-blue-500">swipe</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">Swipe Cards</h3>
                      <p className="text-sm text-gray-600">Swipe left or right on different interests, values and lifestyle options</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
                    onClick={() => {
                      setExplorationMethod('wheel');
                      // Clear previous results
                      setWheelResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 py-5">
                      <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="material-icons text-2xl text-purple-500">casino</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">Identity Wheel</h3>
                      <p className="text-sm text-gray-600">Spin a wheel to discover prompts about your values, talents, fears and wishes</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
                    onClick={() => {
                      setExplorationMethod('advancedWheel');
                      // Clear previous results
                      setWheelResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 py-5">
                      <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="material-icons text-2xl text-indigo-500">psychology</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">Advanced Identity Wheel</h3>
                      <p className="text-sm text-gray-600">Explore deeper aspects of your identity with fun prompts and mini-games</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
                    onClick={() => {
                      setExplorationMethod('avatar');
                      // Clear previous results
                      setAvatarResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 py-5">
                      <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="material-icons text-2xl text-green-500">face</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">Future Self Avatar</h3>
                      <p className="text-sm text-gray-600">Create a personalized avatar that represents your future self</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary overflow-hidden"
                    onClick={() => {
                      setExplorationMethod('quickSpin');
                      // Clear previous results
                      setQuickSpinResults({
                        superpower: '',
                        ideal_day: '',
                        values: '',
                        activities: '',
                        feelings: '',
                        location: '',
                        team_role: '',
                        wildcard: ''
                      });
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 py-5">
                      <div className="rounded-full bg-white h-16 w-16 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <span className="material-icons text-2xl text-amber-500">toys</span>
                      </div>
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold mb-2 text-gray-800">Quick Spin Game</h3>
                      <p className="text-sm text-gray-600">Play a quick spinning wheel game to explore your future identity</p>
                    </CardContent>
                  </Card>
                </div>
              </Step>
            );
          } else if (explorationMethod === 'swipe') {
            return (
              <Step 
                title="Find Your Perfect Path" 
                subtitle="Swipe through cards to tell us what you like and don't like"
              >
                <Card>
                  <CardContent className="p-6">
                    <SwipeableScenarios 
                      key={`swipe-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setSwipeResults(results);
                        handleNext();
                      }} 
                    />
                    <div className="flex justify-center mt-6">
                      <Button variant="outline" onClick={handleRestartExploration}>
                        <span className="material-icons text-sm mr-1">sports_esports</span>
                        Play Game Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Step>
            );
          // The wheel case is now handled with the conditional rendering check below
          // The advancedWheel case is now handled with the conditional rendering check below
          // The avatar case is now handled with the conditional rendering check below
          // The quickSpin case is now handled with the conditional rendering check above
          }
        } else {
          return (
            <Step 
              title="What would you like to do after high school?" 
              subtitle="Choose your path to begin visualizing where it might lead you"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Education pathway card */}
                <div 
                  className={`group cursor-pointer transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl relative h-64 ${isEducationPath(selectedPath) ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => {
                    handlePathSelect('education');
                    handleNext(); // Auto-progress to next step
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-cyan-600/90 transform transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <span className="material-icons text-2xl">school</span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">Continue Education</h3>
                    <p className="text-white/80 text-center">Pursue higher education to unlock academic and career opportunities</p>
                    
                    <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="material-icons">arrow_forward</span>
                    </div>
                  </div>
                </div>
                
                {/* Job pathway card */}
                <div 
                  className={`group cursor-pointer transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl relative h-64 ${selectedPath === 'job' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => {
                    handlePathSelect('job');
                    handleNext(); // Auto-progress to next step
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-green-600/90 transform transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <span className="material-icons text-2xl">work</span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">Get a Job</h3>
                    <p className="text-white/80 text-center">Enter the workforce and gain valuable experience and financial independence</p>
                    
                    <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="material-icons">arrow_forward</span>
                    </div>
                  </div>
                </div>
                
                {/* Military pathway card */}
                <div 
                  className={`group cursor-pointer transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl relative h-64 ${selectedPath === 'military' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => {
                    handlePathSelect('military');
                    handleNext(); // Auto-progress to next step
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600/90 to-gray-700/90 transform transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <span className="material-icons text-2xl">military_tech</span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">Join Military</h3>
                    <p className="text-white/80 text-center">Serve your country while gaining skills, discipline, and educational benefits</p>
                    
                    <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="material-icons">arrow_forward</span>
                    </div>
                  </div>
                </div>
                
                {/* Gap Year pathway card */}
                <div 
                  className={`group cursor-pointer transition-all duration-300 rounded-lg overflow-hidden shadow-md hover:shadow-xl relative h-64 ${selectedPath === 'gap' ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => {
                    handlePathSelect('gap');
                    handleNext(); // Auto-progress to next step
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/90 to-violet-600/90 transform transition-all duration-300 group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-300"></div>
                  <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <span className="material-icons text-2xl">explore</span>
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">Take a Gap Year</h3>
                    <p className="text-white/80 text-center">Explore the world, volunteer, or work before deciding your long-term path</p>
                    
                    <div className="absolute bottom-3 right-3 bg-white/10 rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="material-icons">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Next button removed as cards now auto-progress */}
            </Step>
          );
        }
      
      case 3:
        // When starting over, make sure to reset the guidedPathComplete flag
        if (currentStep === 3 && guidedPathComplete && !needsGuidance) {
          // Reset the guidedPathComplete flag when explicitly returning to step 3 in direct path
          setGuidedPathComplete(false);
        }
        
        if (needsGuidance) {
          const handleSelectPath = (pathType: 'education' | 'career' | 'lifestyle', id: string) => {
            // Mark that this selection came from the guided path
            setGuidedPathComplete(true);
            
            // Here we could map the recommendations back to our app paths
            if (pathType === 'education') {
              setSelectedPath('education');
              
              // Determine education type based on recommendation
              if (['liberal_arts', 'stem_college', 'business_school'].includes(id)) {
                setEducationType('4year');
              } else if (id === 'community_college') {
                setEducationType('2year');
              } else if (id === 'trade_school') {
                setEducationType('vocational');
              }
              
              // Update the narrative based on the education type selection
              if (['liberal_arts', 'stem_college', 'business_school'].includes(id)) {
                setUserJourney("Based on my interests, I'm considering a 4-year college or university where...");
              } else if (id === 'community_college') {
                setUserJourney("Based on my interests, I'm considering a 2-year community college where...");
              } else if (id === 'trade_school') {
                setUserJourney("Based on my interests, I'm considering a trade school where...");
              }
              
              // Jump to the appropriate next step
              setCurrentStep(4);
            } else if (pathType === 'career') {
              setSelectedPath('job');
              
              // Set job type to full-time as default
              setJobType('fulltime');
              
              // For trades, indicate part-time
              if (id === 'trades') {
                setIsPartTime(true);
                setWeeklyHours(25); // Default part-time hours for trades
              } else {
                setIsPartTime(false);
                setWeeklyHours(40);
              }
              
              // Jump to the appropriate next step
              setCurrentStep(4);
            } else {
              // For lifestyle recommendations, we could set some other state
              // or just show more information
              setSelectedPath('gap');
              setGapYearActivity(id === 'digital_nomad' ? 'travel' : 'work');
              setCurrentStep(4);
            }
          };
          
          // Convert wheel results to a format compatible with RecommendationEngine
          const convertWheelResultsToPreferences = () => {
            // This maps the wheel choices to equivalent card preferences
            const wheelPreferences: Record<string, boolean> = {};
            
            if ((explorationMethod === 'wheel' || explorationMethod === 'advancedWheel') && wheelResults && Object.keys(wheelResults).length > 0) {
              // Map values responses to preferences
              if (wheelResults['success_meaning'] === 'freedom') {
                wheelPreferences['innovation'] = true;
                wheelPreferences['entrepreneurship'] = true;
              } else if (wheelResults['success_meaning'] === 'respect') {
                wheelPreferences['team_collaboration'] = true;
                wheelPreferences['strategic_thinking'] = true;
              } else if (wheelResults['success_meaning'] === 'wealth') {
                wheelPreferences['strategic_thinking'] = true;
                wheelPreferences['numbers_data'] = true;
              } else if (wheelResults['success_meaning'] === 'impact') {
                wheelPreferences['helping_others'] = true;
                wheelPreferences['working_with_people'] = true;
              }
              
              // Map work environment preferences
              if (wheelResults['dream_environment'] === 'office') {
                wheelPreferences['strategic_thinking'] = true;
                wheelPreferences['numbers_data'] = true;
              } else if (wheelResults['dream_environment'] === 'remote') {
                wheelPreferences['digital_work'] = true;
                wheelPreferences['technical_skills'] = true;
              } else if (wheelResults['dream_environment'] === 'outdoors') {
                wheelPreferences['outdoor_work'] = true;
                wheelPreferences['nature_environment'] = true;
              } else if (wheelResults['dream_environment'] === 'creative') {
                wheelPreferences['artistic_expression'] = true;
                wheelPreferences['building_creating'] = true;
              }
              
              // Map talents
              if (wheelResults['talent_recognition'] === 'solve') {
                wheelPreferences['problem_solving'] = true;
                wheelPreferences['strategic_thinking'] = true;
              } else if (wheelResults['talent_recognition'] === 'create') {
                wheelPreferences['artistic_expression'] = true;
                wheelPreferences['building_creating'] = true;
              } else if (wheelResults['talent_recognition'] === 'communicate') {
                wheelPreferences['working_with_people'] = true;
                wheelPreferences['team_collaboration'] = true;
              } else if (wheelResults['talent_recognition'] === 'organize') {
                wheelPreferences['strategic_thinking'] = true;
                wheelPreferences['numbers_data'] = true;
              }
              
              // Map fears (reverse mapping - things they want to avoid)
              if (wheelResults['biggest_fear'] === 'financial') {
                wheelPreferences['strategic_thinking'] = true;
                wheelPreferences['numbers_data'] = true;
              } else if (wheelResults['biggest_fear'] === 'unfulfilled') {
                wheelPreferences['innovation'] = true;
                wheelPreferences['helping_others'] = true;
              }
              
              // Map goals
              if (wheelResults['ten_years'] === 'expert') {
                wheelPreferences['technical_skills'] = true;
                wheelPreferences['problem_solving'] = true;
              } else if (wheelResults['ten_years'] === 'leader') {
                wheelPreferences['strategic_thinking'] = true;
                wheelPreferences['team_collaboration'] = true;
              } else if (wheelResults['ten_years'] === 'balance') {
                wheelPreferences['working_with_people'] = true;
                wheelPreferences['outdoor_work'] = true;
              } else if (wheelResults['ten_years'] === 'entrepreneur') {
                wheelPreferences['innovation'] = true;
                wheelPreferences['entrepreneurship'] = true;
              }
            }
            
            return wheelPreferences;
          };
          
          // Convert avatar results to preferences
          // Convert quickSpin results to preferences
          const convertQuickSpinResultsToPreferences = () => {
            const quickSpinPreferences: Record<string, boolean> = {};
            
            if (quickSpinResults && Object.keys(quickSpinResults).length > 0) {
              // Map superpower responses
              if (quickSpinResults.superpower) {
                // Creative abilities
                if (quickSpinResults.superpower.toLowerCase().includes('creat') || 
                    quickSpinResults.superpower.toLowerCase().includes('art')) {
                  quickSpinPreferences['artistic_expression'] = true;
                  quickSpinPreferences['building_creating'] = true;
                }
                
                // Technical abilities
                if (quickSpinResults.superpower.toLowerCase().includes('tech') || 
                    quickSpinResults.superpower.toLowerCase().includes('program') ||
                    quickSpinResults.superpower.toLowerCase().includes('code')) {
                  quickSpinPreferences['technical_skills'] = true;
                  quickSpinPreferences['digital_work'] = true;
                }
                
                // People skills
                if (quickSpinResults.superpower.toLowerCase().includes('people') || 
                    quickSpinResults.superpower.toLowerCase().includes('communicat') ||
                    quickSpinResults.superpower.toLowerCase().includes('speak')) {
                  quickSpinPreferences['working_with_people'] = true;
                  quickSpinPreferences['team_collaboration'] = true;
                }
                
                // Problem solving
                if (quickSpinResults.superpower.toLowerCase().includes('solv') || 
                    quickSpinResults.superpower.toLowerCase().includes('analyz') ||
                    quickSpinResults.superpower.toLowerCase().includes('logic')) {
                  quickSpinPreferences['problem_solving'] = true;
                  quickSpinPreferences['strategic_thinking'] = true;
                }
              }
              
              // Map ideal day responses
              if (quickSpinResults.ideal_day) {
                // Outdoor preferences
                if (quickSpinResults.ideal_day.toLowerCase().includes('outdoor') || 
                    quickSpinResults.ideal_day.toLowerCase().includes('nature')) {
                  quickSpinPreferences['outdoor_work'] = true;
                  quickSpinPreferences['nature_environment'] = true;
                }
                
                // Office environment
                if (quickSpinResults.ideal_day.toLowerCase().includes('office') || 
                    quickSpinResults.ideal_day.toLowerCase().includes('professional')) {
                  quickSpinPreferences['strategic_thinking'] = true;
                }
                
                // Remote work
                if (quickSpinResults.ideal_day.toLowerCase().includes('remote') || 
                    quickSpinResults.ideal_day.toLowerCase().includes('home')) {
                  quickSpinPreferences['digital_work'] = true;
                }
              }
              
              // Map values
              if (quickSpinResults.values) {
                if (quickSpinResults.values.toLowerCase().includes('help') || 
                    quickSpinResults.values.toLowerCase().includes('others')) {
                  quickSpinPreferences['helping_others'] = true;
                }
                
                if (quickSpinResults.values.toLowerCase().includes('creat')) {
                  quickSpinPreferences['artistic_expression'] = true;
                }
                
                if (quickSpinResults.values.toLowerCase().includes('innovat') || 
                    quickSpinResults.values.toLowerCase().includes('new')) {
                  quickSpinPreferences['innovation'] = true;
                }
                
                if (quickSpinResults.values.toLowerCase().includes('freedom')) {
                  quickSpinPreferences['entrepreneurship'] = true;
                }
                
                if (quickSpinResults.values.toLowerCase().includes('secur') || 
                    quickSpinResults.values.toLowerCase().includes('stable')) {
                  quickSpinPreferences['strategic_thinking'] = true;
                }
              }
              
              // Map activities
              if (quickSpinResults.activities) {
                if (quickSpinResults.activities.toLowerCase().includes('outdoor') || 
                    quickSpinResults.activities.toLowerCase().includes('hike')) {
                  quickSpinPreferences['outdoor_work'] = true;
                }
                
                if (quickSpinResults.activities.toLowerCase().includes('art') || 
                    quickSpinResults.activities.toLowerCase().includes('draw') || 
                    quickSpinResults.activities.toLowerCase().includes('paint')) {
                  quickSpinPreferences['artistic_expression'] = true;
                }
                
                if (quickSpinResults.activities.toLowerCase().includes('code') || 
                    quickSpinResults.activities.toLowerCase().includes('tech')) {
                  quickSpinPreferences['technical_skills'] = true;
                }
                
                if (quickSpinResults.activities.toLowerCase().includes('people') || 
                    quickSpinResults.activities.toLowerCase().includes('team')) {
                  quickSpinPreferences['working_with_people'] = true;
                }
              }
            }
            
            return quickSpinPreferences;
          };
          
          const convertAvatarResultsToPreferences = () => {
            const avatarPreferences: Record<string, boolean> = {};
            
            // This maps the avatar attributes to equivalent card preferences
            if (avatarResults && Object.keys(avatarResults).length > 0) {
              // Map occupation field to interests
              if (avatarResults.avatar_occupation === 'tech') {
                avatarPreferences['technical_skills'] = true;
                avatarPreferences['problem_solving'] = true;
                avatarPreferences['digital_work'] = true;
              } else if (avatarResults.avatar_occupation === 'creative') {
                avatarPreferences['artistic_expression'] = true;
                avatarPreferences['building_creating'] = true;
              } else if (avatarResults.avatar_occupation === 'health') {
                avatarPreferences['helping_others'] = true;
                avatarPreferences['working_with_people'] = true;
              } else if (avatarResults.avatar_occupation === 'business') {
                avatarPreferences['strategic_thinking'] = true;
                avatarPreferences['team_collaboration'] = true;
                avatarPreferences['entrepreneurship'] = true;
              } else if (avatarResults.avatar_occupation === 'education') {
                avatarPreferences['helping_others'] = true;
                avatarPreferences['working_with_people'] = true;
              } else if (avatarResults.avatar_occupation === 'trades') {
                avatarPreferences['building_creating'] = true;
                avatarPreferences['outdoor_work'] = true;
              }
              
              // Map location preferences
              if (avatarResults.avatar_location === 'city') {
                avatarPreferences['urban_environment'] = true;
              } else if (avatarResults.avatar_location === 'rural' || avatarResults.avatar_location === 'mountains') {
                avatarPreferences['nature_environment'] = true;
                avatarPreferences['outdoor_work'] = true;
              }
              
              // Map personality traits
              if (avatarResults.avatar_personality === 'creative') {
                avatarPreferences['artistic_expression'] = true;
                avatarPreferences['innovation'] = true;
              } else if (avatarResults.avatar_personality === 'analytical') {
                avatarPreferences['problem_solving'] = true;
                avatarPreferences['numbers_data'] = true;
              } else if (avatarResults.avatar_personality === 'social') {
                avatarPreferences['working_with_people'] = true;
                avatarPreferences['team_collaboration'] = true;
              } else if (avatarResults.avatar_personality === 'caring') {
                avatarPreferences['helping_others'] = true;
              } else if (avatarResults.avatar_personality === 'ambitious') {
                avatarPreferences['entrepreneurship'] = true;
                avatarPreferences['strategic_thinking'] = true;
              }
              
              // Map values
              if (avatarResults.avatar_values === 'achievement') {
                avatarPreferences['strategic_thinking'] = true;
              } else if (avatarResults.avatar_values === 'creativity') {
                avatarPreferences['artistic_expression'] = true;
                avatarPreferences['building_creating'] = true;
              } else if (avatarResults.avatar_values === 'helping') {
                avatarPreferences['helping_others'] = true;
              } else if (avatarResults.avatar_values === 'freedom') {
                avatarPreferences['entrepreneurship'] = true;
              } else if (avatarResults.avatar_values === 'learning') {
                avatarPreferences['technical_skills'] = true;
              }
              
              // Map lifestyle preferences
              if (avatarResults.avatar_lifestyle === 'adventurous') {
                avatarPreferences['outdoor_work'] = true;
              } else if (avatarResults.avatar_lifestyle === 'balanced') {
                avatarPreferences['working_with_people'] = true;
              } else if (avatarResults.avatar_lifestyle === 'social') {
                avatarPreferences['team_collaboration'] = true;
                avatarPreferences['working_with_people'] = true;
              }
            }
            
            return avatarPreferences;
          };
          
          // If the exploration method is 'swipe', we need to check if we have swipe results
          // If no swipe results yet, show the swipe cards component first
          if (explorationMethod === 'swipe' && Object.keys(swipeResults).length === 0) {
            return (
              <Step 
                title="Find Your Perfect Path" 
                subtitle="Swipe through cards to tell us what you like and don't like"
              >
                <Card>
                  <CardContent className="p-6">
                    <SwipeableScenarios 
                      key={`swipe-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setSwipeResults(results);
                        // Don't automatically move to the next step
                        // Let this same case 3 handle it with the swipe results
                      }} 
                    />
                  </CardContent>
                </Card>
              </Step>
            );
          }
          
          // If the exploration method is 'quickSpin', check if we have quickSpin results
          // If no quickSpin results yet, show the QuickSpinWheel component first
          if (explorationMethod === 'quickSpin' && 
              (!quickSpinResults || quickSpinResults.superpower === '')) {
            return (
              <Step 
                title="Spin the Identity Wheel" 
                subtitle="Discover what makes you unique through this fun wheel game"
              >
                <Card>
                  <CardContent className="p-6">
                    <QuickSpinWheel 
                      key={`quick-spin-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setQuickSpinResults(results);
                        // Don't automatically move to the next step
                        // Let this same case 3 handle it with the quickSpin results
                      }}
                    />
                    <div className="flex justify-center mt-6">
                      <Button variant="outline" onClick={handleRestartExploration}>
                        <span className="material-icons text-sm mr-1">sports_esports</span>
                        Play Game Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Step>
            );
          }
          
          // If the exploration method is 'wheel', check if we have wheel results
          // If no wheel results yet, show the Identity Wheel component first
          if (explorationMethod === 'wheel' && 
              (!wheelResults || Object.keys(wheelResults).length === 0)) {
            return (
              <Step 
                title="Spin the Wheel of Identity" 
                subtitle="Discover what matters most to you through fun prompts and questions"
              >
                <Card>
                  <CardContent className="p-6">
                    <IdentityWheel 
                      key={`wheel-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setWheelResults(results);
                        // Don't automatically move to the next step
                        // Let this same case 3 handle it with the wheel results
                      }}
                    />
                    <div className="flex justify-center mt-6">
                      <Button variant="outline" onClick={handleRestartExploration}>
                        <span className="material-icons text-sm mr-1">sports_esports</span>
                        Play Game Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Step>
            );
          }
          
          // If the exploration method is 'advancedWheel', check if we have wheel results
          // If no wheel results yet, show the Advanced Wheel component first
          if (explorationMethod === 'advancedWheel' && 
              (!wheelResults || Object.keys(wheelResults).length === 0)) {
            return (
              <Step 
                title="Spin the Advanced Identity Wheel" 
                subtitle="Explore deeper aspects of your identity with fun prompts and mini-games"
              >
                <Card>
                  <CardContent className="p-6">
                    <AdvancedWheel 
                      key={`advanced-wheel-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setWheelResults(results);
                        // Don't automatically move to the next step
                        // Let this same case 3 handle it with the wheel results
                      }}
                    />
                    <div className="flex justify-center mt-6">
                      <Button variant="outline" onClick={handleRestartExploration}>
                        <span className="material-icons text-sm mr-1">sports_esports</span>
                        Play Game Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Step>
            );
          }
          
          // If the exploration method is 'avatar', check if we have avatar results
          // If no avatar results yet, show the Avatar Creator component first
          if (explorationMethod === 'avatar' && 
              (!avatarResults || Object.keys(avatarResults).length === 0)) {
            return (
              <Step 
                title="Create Your Future Self" 
                subtitle="Design an avatar that represents who you want to become"
              >
                <Card>
                  <CardContent className="p-6">
                    <AvatarCreator 
                      key={`avatar-${resetCounter}`}
                      resetKey={resetCounter}
                      onComplete={(results) => {
                        setAvatarResults(results);
                        // Don't automatically move to the next step
                        // Let this same case 3 handle it with the avatar results
                      }}
                    />
                    <div className="flex justify-center mt-6">
                      <Button variant="outline" onClick={handleRestartExploration}>
                        <span className="material-icons text-sm mr-1">sports_esports</span>
                        Play Game Again
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Step>
            );
          }
          
          // Determine which results to use based on the exploration method
          let preferences: Record<string, boolean>;
          
          if (explorationMethod === 'wheel' || explorationMethod === 'advancedWheel') {
            preferences = convertWheelResultsToPreferences();
          } else if (explorationMethod === 'avatar') {
            preferences = convertAvatarResultsToPreferences();
          } else if (explorationMethod === 'quickSpin') {
            preferences = convertQuickSpinResultsToPreferences();
          } else {
            preferences = swipeResults;
          }
          
          // Determine the activity name for the subtitle
          let activityName: string;
          
          if (explorationMethod === 'wheel') {
            activityName = 'Identity Wheel';
          } else if (explorationMethod === 'advancedWheel') {
            activityName = 'Advanced Identity Wheel';
          } else if (explorationMethod === 'avatar') {
            activityName = 'Future Self Avatar';
          } else if (explorationMethod === 'quickSpin') {
            activityName = 'Quick Spin Game';
          } else {
            activityName = 'Card Preferences';
          }
            
          return (
            <Step 
              title="Your Personalized Recommendations" 
              subtitle={`Based on your ${activityName} results, here are paths that might be the best fit for you`}
            >
              <Card>
                <CardContent className="p-6">
                  <RecommendationEngine 
                    preferences={preferences} 
                    onSelectPath={handleSelectPath} 
                  />
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      <span className="material-icons text-sm mr-1">sports_esports</span>
                      Play Game Again
                    </Button>
                    <Button onClick={handleNext}>Continue to Pathways</Button>
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        } else if (isEducationPath(selectedPath)) {
          return (
            <Step title="After high school, I am interested in...">
              {/* User journey narrative starts here */}
              <div className="mb-4 text-gray-600 text-sm">
                <p>Choose the type of education that aligns with your goals</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border ${educationType === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => selectEducationType('4year')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${educationType === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${educationType === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">school</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${educationType === '4year' ? 'text-primary' : ''}`}>4-Year College/University</h5>
                      <p className="text-sm text-gray-600">Bachelor's degree programs</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${educationType === '2year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => selectEducationType('2year')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${educationType === '2year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${educationType === '2year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">menu_book</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${educationType === '2year' ? 'text-primary' : ''}`}>2-Year College</h5>
                      <p className="text-sm text-gray-600">Associate's degree programs</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${educationType === 'vocational' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => selectEducationType('vocational')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${educationType === 'vocational' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${educationType === 'vocational' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">build</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${educationType === 'vocational' ? 'text-primary' : ''}`}>Vocational School</h5>
                      <p className="text-sm text-gray-600">Specialized training programs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>Back</Button>
              </div>
            </Step>
          );
        } else if (selectedPath === 'job') {
          return (
            <Step title="Your Employment Options">
              <div className="border border-gray-200 rounded-lg p-6 mb-8 bg-white">
                <div className="flex items-center mb-5">
                  <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-3">
                    <span className="material-icons text-sm">business_center</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-lg">Full-Time Employment</h5>
                    <p className="text-sm text-gray-600">Find a job after high school and start earning right away</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="part-time-checkbox"
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={isPartTime}
                      onChange={(e) => {
                        setIsPartTime(e.target.checked);
                        setJobType(e.target.checked ? 'parttime' : 'fulltime');
                        // If changing to full-time, reset to 40 hours
                        if (!e.target.checked) {
                          setWeeklyHours(40);
                        }
                      }}
                    />
                    <label htmlFor="part-time-checkbox" className="ml-2 text-sm font-medium text-gray-700">
                      I plan to work part-time
                    </label>
                  </div>
                  
                  {isPartTime && (
                    <div className="ml-6 mt-3">
                      <label htmlFor="weekly-hours" className="block text-sm font-medium text-gray-700 mb-1">
                        Hours per week
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          id="weekly-hours"
                          min="1"
                          max="39"
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                          value={weeklyHours}
                          onChange={(e) => {
                            const hours = Math.min(39, Math.max(1, parseInt(e.target.value) || 20));
                            setWeeklyHours(hours);
                          }}
                        />
                        <span className="text-sm text-gray-500">hours</span>
                        
                        <div className="ml-4 text-sm text-gray-600">
                          {weeklyHours > 0 && (
                            <span>({Math.round((weeklyHours / 40) * 100)}% of full-time earnings)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {jobType && (
                <>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                    <h4 className="text-sm font-semibold mb-2 flex items-center">
                      <span className="material-icons mr-1 text-blue-500 text-sm">work</span>
                      Career Search
                    </h4>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <span className="material-icons text-sm">search</span>
                        </span>
                        <Input 
                          type="text" 
                          placeholder="Search for careers or occupations..." 
                          value={careerSearchQuery}
                          onChange={(e) => {
                            setCareerSearchQuery(e.target.value);
                            // Set a narrative if they select a career
                            if (e.target.value.trim()) {
                              setUserJourney(`After high school, I am interested in finding a ${
                                jobType === 'fulltime' ? 'full-time job' : 'part-time job'
                              } as a ${e.target.value.trim()}.`);
                            }
                          }}
                          className="pl-9 flex-1 w-full"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Search for careers that interest you. You can search for specific job titles or broader categories.
                    </p>
                  </div>
                  
                  {careerSearchQuery.length > 2 && (
                    <>
                      <h4 className="text-md font-medium mb-4">
                        {isLoadingAllCareers ? 'Searching...' : 'Career Search Results:'}
                      </h4>
                      
                      {isLoadingAllCareers ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-4 text-gray-600">Searching careers...</p>
                        </div>
                      ) : allCareers && allCareers.length > 0 ? (
                        <div className="space-y-4 mb-6">
                          {allCareers
                            .filter(career => {
                              // Match search query
                              const matchesQuery = 
                                (career.title && career.title.toLowerCase().includes(careerSearchQuery.toLowerCase())) || 
                                (career.description && career.description.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                (career.alias1 && career.alias1.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                (career.alias2 && career.alias2.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                (career.alias3 && career.alias3.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                (career.alias4 && career.alias4.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                (career.alias5 && career.alias5.toLowerCase().includes(careerSearchQuery.toLowerCase()));
                              
                              // Match job type (simple filtering)
                              const matchesJobType = 
                                jobType === 'fulltime' ? true : // most careers are full-time eligible
                                jobType === 'parttime' ? 
                                  career.category?.toLowerCase().includes('service') || 
                                  career.category?.toLowerCase().includes('retail') ||
                                  career.category?.toLowerCase().includes('food') ||
                                  career.category?.toLowerCase().includes('hospitality') || 
                                  // Part-time jobs can be in most categories
                                  true : 
                                true;
                              
                              return matchesQuery && matchesJobType;
                            })
                            .slice(0, 5) // Limit results to 5
                            .map(career => (
                              <Card 
                                key={career.id} 
                                className="border cursor-pointer transition-all hover:shadow-md hover:scale-105"
                                onClick={() => {
                                  setSelectedProfession(career.title);
                                  setCareerSearchQuery(career.title);
                                  setSelectedCareerId(career.id);
                                  
                                  // Check for education requirements
                                  checkCareerEducationRequirement(career.id);
                                  
                                  // Update narrative
                                  setUserJourney(`After high school, I am interested in finding a ${
                                    jobType === 'fulltime' ? 'full-time job' : 'part-time job'
                                  } as a ${career.title}.`);
                                  
                                  // Don't automatically advance yet - let user see location selection
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center">
                                    <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-3 flex-shrink-0">
                                      <span className="material-icons text-sm">work</span>
                                    </div>
                                    <div>
                                      <h5 className="font-medium">{career.title}</h5>
                                      <p className="text-sm text-gray-600">
                                        {career.category || 'General'}
                                        {career.salary ? ` • ${formatSalary(career.salary)}` : ''}
                                      </p>
                                      {career.growth_rate && (
                                        <Badge variant="outline" className="mt-1">
                                          {career.growth_rate === 'fast' ? 'Growing Fast' : 
                                          career.growth_rate === 'average' ? 'Stable Growth' : 'Slow Growth'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          
                          <div className="flex justify-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCareerSearchQuery('');
                              }}
                            >
                              <span className="material-icons text-sm mr-1">clear</span>
                              Clear Search
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 border rounded-lg mb-6">
                          <p className="text-gray-500">
                            No careers found matching your search.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {selectedProfession && (
                    <div className="mt-6 border-t pt-6 border-gray-200">
                      <h3 className="text-lg font-semibold mb-4">Where would you like to work?</h3>
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                        <h4 className="text-sm font-semibold mb-2 flex items-center">
                          <span className="material-icons mr-1 text-blue-500 text-sm">location_on</span>
                          Location Search
                        </h4>
                        
                        {/* Location search type toggle */}
                        <div className="flex gap-2 mb-4">
                          <Button 
                            variant={searchByZip ? "default" : "outline"}
                            className={`flex-1 ${searchByZip ? "bg-primary" : ""}`}
                            onClick={() => setSearchByZip(true)}
                          >
                            <span className="flex items-center gap-1">
                              <span className="material-icons text-sm">pin_drop</span>
                              Search by Zip Code
                            </span>
                          </Button>
                          <Button 
                            variant={!searchByZip ? "default" : "outline"} 
                            className={`flex-1 ${!searchByZip ? "bg-primary" : ""}`}
                            onClick={() => setSearchByZip(false)}
                          >
                            <span className="flex items-center gap-1">
                              <span className="material-icons text-sm">location_city</span>
                              Search by City
                            </span>
                          </Button>
                        </div>
                        
                        {searchByZip ? (
                          <div className="mb-3">
                            <label htmlFor="location-zip-job" className="block text-sm font-medium mb-2">Zip Code</label>
                            <div className="flex gap-2">
                              <Input
                                id="location-zip-job"
                                placeholder="Enter zip code (e.g. 90210, 02142, 94103)"
                                className="flex-1"
                                value={selectedZipCode}
                                onChange={(e) => setSelectedZipCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
                                maxLength={5}
                              />
                              <Button 
                                variant="outline" 
                                className="flex gap-2 items-center"
                                disabled={selectedZipCode.length !== 5 || fetchingLocation}
                                onClick={() => fetchLocationByZipCode(selectedZipCode)}
                              >
                                {fetchingLocation ? (
                                  <>
                                    <span className="material-icons animate-spin text-sm">refresh</span>
                                    <span>Searching...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-icons text-sm">search</span>
                                    <span>Find</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-2">
                              Try 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San Francisco), or 30328 (Atlanta)
                            </p>
                          </div>
                        ) : (
                          <div className="mb-3">
                            <label htmlFor="location-city-job" className="block text-sm font-medium mb-2">City and State</label>
                            <div className="flex gap-2">
                              <Input
                                id="location-city-job"
                                placeholder="Enter city name (e.g. San Francisco)"
                                className="flex-1"
                                value={citySearchQuery}
                                onChange={(e) => setCitySearchQuery(e.target.value)}
                              />
                              <Select value={selectedState} onValueChange={(value) => setSelectedState(value)}>
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {usStates.map(state => (
                                      <SelectItem key={state.code} value={state.code}>{state.code}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                className="flex gap-2 items-center"
                                disabled={!citySearchQuery || !selectedState || fetchingLocation}
                                onClick={() => fetchLocationByCityState(citySearchQuery, selectedState)}
                              >
                                {fetchingLocation ? (
                                  <>
                                    <span className="material-icons animate-spin text-sm">refresh</span>
                                    <span>Searching...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="material-icons text-sm">search</span>
                                    <span>Find</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedLocation && (
                        <div className="p-4 border border-green-100 bg-green-50 rounded-lg mb-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-green-600">
                              <span className="material-icons">place</span>
                            </div>
                            <div>
                              <h4 className="text-md font-medium text-green-700 mb-1">Location Found</h4>
                              <p className="text-sm text-green-600 mb-3">
                                {selectedLocation.city}, {selectedLocation.state}
                              </p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Cost of Living Index:</p>
                                  <p className="text-sm font-medium">{selectedLocation.cost_of_living_index ? selectedLocation.cost_of_living_index.toFixed(2) : 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1">Median Income:</p>
                                  <p className="text-sm font-medium">{selectedLocation.median_income ? formatCurrency(selectedLocation.median_income) : 'N/A'}</p>
                                </div>
                              </div>
                              
                              <h5 className="text-xs font-medium text-gray-700 border-b border-gray-200 pb-1 mb-2">Monthly Expense Estimates</h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {selectedLocation.housing && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Housing:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.housing)}</p>
                                  </div>
                                )}
                                {selectedLocation.food && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Food:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.food)}</p>
                                  </div>
                                )}
                                {selectedLocation.transportation && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Transportation:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.transportation)}</p>
                                  </div>
                                )}
                                {selectedLocation.utilities && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Utilities:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.utilities)}</p>
                                  </div>
                                )}
                                {selectedLocation.healthcare && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Healthcare:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.healthcare)}</p>
                                  </div>
                                )}
                                {selectedLocation.other && (
                                  <div>
                                    <p className="text-xs text-gray-600 mb-1">Other:</p>
                                    <p className="text-sm font-medium">{formatCurrency(selectedLocation.other)}</p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Location card information only - removed "Create Plan" button */}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {fetchingLocation && (
                        <div className="text-center py-6 border rounded-lg mb-6">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-4 text-gray-600">Searching for location data...</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    {selectedLocation && selectedCareerId && selectedProfession && (
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={async () => {
                          // Auto-generate career calculation if user is authenticated
                          if (isAuthenticated && user) {
                            // First, deselect any previously selected college calculation
                            fetch(`/api/college-calculations/user/${user.id}`)
                              .then(res => res.json())
                              .then(calculations => {
                                // Find any currently included calculation
                                const includedCalculation = calculations.find((calc: {id: number, includedInProjection: boolean}) => calc.includedInProjection);
                                
                                // If one exists, use our new endpoint to explicitly exclude it from projections
                                if (includedCalculation) {
                                  console.log("Excluding college calculation from projection:", includedCalculation.id);
                                  
                                  // Notify the user that we're excluding college data
                                  toast({
                                    title: "College data excluded",
                                    description: "Since you're choosing a job pathway, we've excluded any college costs from your financial projection.",
                                    variant: "default"
                                  });
                                  
                                  // Use our dedicated endpoint for excluding college calculations
                                  return fetch(`/api/college-calculations/${includedCalculation.id}/exclude-from-projection`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user.id })
                                  });
                                }
                                return new Response(null, { status: 200 });
                              })
                              .then(() => {
                                // Step 1: Add career to favorites if not already added
                                if (selectedCareerId) {
                                  addCareerToFavorites.mutate(selectedCareerId, {
                                    onSuccess: () => {
                                      console.log('Career added to favorites successfully');
                                      toast({
                                        title: "Added to favorites",
                                        description: `${selectedProfession} has been added to your favorite careers.`,
                                        variant: "default",
                                      });
                                    },
                                    onError: (error) => {
                                      console.error('Failed to add career to favorites:', error);
                                    }
                                  });
                                }

                                // Step 2: Create a career calculation if a career was selected
                                if (selectedCareerId && selectedProfession) {
                                  fetch(`/api/careers/${selectedCareerId}`)
                                    .then(res => res.json())
                                    .then(career => {
                                      // Use salary data from the career, with fallbacks
                                      const projectedSalary = career.salary || 50000;
                                      const entryLevelSalary = career.salary_pct_10 || projectedSalary * 0.8;
                                      const midCareerSalary = career.salary_pct_50 || projectedSalary * 1.5;
                                      const experiencedSalary = career.salary_pct_90 || projectedSalary * 2;

                                      // Create the career calculation
                                      const careerCalculation = {
                                        userId: user.id,
                                        careerId: selectedCareerId,
                                        projectedSalary: projectedSalary,
                                        entryLevelSalary: entryLevelSalary,
                                        midCareerSalary: midCareerSalary,
                                        experiencedSalary: experiencedSalary,
                                        education: 'direct_entry', // Since this is the "get a job" pathway
                                        additionalNotes: `Auto-generated from Pathways for ${selectedProfession}`,
                                        includedInProjection: true, // Auto-include in projection
                                        locationZip: selectedZipCode,
                                        adjustedForLocation: true // Since we have location data
                                      };

                                      console.log('Auto-generating career calculation:', careerCalculation);

                                      // Save the career calculation
                                      fetch('/api/career-calculations', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(careerCalculation),
                                      })
                                        .then(res => {
                                          if (!res.ok) {
                                            throw new Error('Failed to save career calculation');
                                          }
                                          return res.json();
                                        })
                                        .then(savedCalculation => {
                                          console.log('Career calculation saved:', savedCalculation);
                                          toast({
                                            title: "Career Calculation Saved",
                                            description: `Financial calculation for ${selectedProfession} has been created.`,
                                            variant: "default"
                                          });
                                        })
                                        .catch(err => {
                                          console.error('Error saving career calculation:', err);
                                          toast({
                                            title: "Error",
                                            description: "Failed to save career calculation. Please try again.",
                                            variant: "destructive"
                                          });
                                        });
                                    })
                                    .catch(err => {
                                      console.error('Error fetching career data:', err);
                                    });
                                }
                              })
                              .catch(err => {
                                console.error('Error managing college calculations:', err);
                              });
                          }

                          // Collect pathway data with enhanced location info
                          const pathwayDataForFinancialPlan = {
                            selectedProfession,
                            location: selectedLocation ? {
                              zipCode: selectedZipCode,
                              city: selectedLocation.city,
                              state: selectedLocation.state
                            } : null,
                            userJourney,
                            // Add these additional fields for better compatibility
                            zipCode: selectedZipCode,
                            selectedCareer: selectedCareerId,
                            jobType,
                            // Mark that this is from job pathway to ensure consistency
                            fromJobPathway: true
                          };

                          console.log("Storing enhanced pathway data for financial planning:", pathwayDataForFinancialPlan);
                          localStorage.setItem('pathwayData', JSON.stringify(pathwayDataForFinancialPlan));

                          // Redirect to the financial projections page with auto-generate flag
                          // Add a longer delay to ensure college calculations are fully excluded before generating projection
                          console.log("Setting timeout before navigation to ensure college data is excluded");
                          setTimeout(() => {
                            console.log("Navigating to projections with all college data excluded");
                            navigate('/projections?autoGenerate=true&fromJobPathway=true');
                          }, 800);
                        }}
                        disabled={!selectedLocation || !selectedCareerId || !selectedProfession}
                      >
                        Create Financial Plan
                      </Button>
                    )}
                  </div>
                </>
              )}
            </Step>
          );
        } else if (selectedPath === 'military') {
          // First step: choose military branch
          return (
            <Step title="Which military branch are you interested in?">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border ${militaryBranch === 'army' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => {
                    setMilitaryBranch('army');
                    setUserJourney("After high school, I am interested in joining the Army...");
                  }}
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
                  onClick={() => {
                    setMilitaryBranch('navy');
                    setUserJourney("After high school, I am interested in joining the Navy...");
                  }}
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
                  onClick={() => {
                    setMilitaryBranch('airforce');
                    setUserJourney("After high school, I am interested in joining the Air Force...");
                  }}
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
                  onClick={() => {
                    setMilitaryBranch('marines');
                    setUserJourney("After high school, I am interested in joining the Marines...");
                  }}
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
                  onClick={() => {
                    setMilitaryBranch('coastguard');
                    setUserJourney("After high school, I am interested in joining the Coast Guard...");
                  }}
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
                  onClick={() => {
                    setMilitaryBranch('spaceguard');
                    setUserJourney("After high school, I am interested in joining the Space Force...");
                  }}
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
              
              {militaryBranch && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Next Step
                  </Button>
                </div>
              )}
            </Step>
          );
        } else if (selectedPath === 'gap') {
          return (
            <Step title="What do you plan to do during your gap year?" subtitle="Choose an activity and plan your gap year experience">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div 
                    className={`border ${gapYearActivity === 'travel' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-5 cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => {
                      setGapYearActivity('travel');
                      setUserJourney("After high school, I am interested in taking a gap year to travel and explore new places and cultures.");
                    }}
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-blue-100 text-blue-700 w-12 h-12 flex items-center justify-center mr-4 shadow-sm">
                        <span className="material-icons">explore</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Travel</h3>
                        <p className="text-sm text-gray-500">Explore new places and cultures</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border ${gapYearActivity === 'volunteer' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-5 cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => {
                      setGapYearActivity('volunteer');
                      setUserJourney("After high school, I am interested in taking a gap year to volunteer and give back to the community.");
                    }}
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-green-100 text-green-700 w-12 h-12 flex items-center justify-center mr-4 shadow-sm">
                        <span className="material-icons">volunteer_activism</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Volunteer</h3>
                        <p className="text-sm text-gray-500">Give back to the community</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border ${gapYearActivity === 'work' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-5 cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => {
                      setGapYearActivity('work');
                      setUserJourney("After high school, I am interested in taking a gap year to work and gain real-world experience.");
                    }}
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-amber-100 text-amber-700 w-12 h-12 flex items-center justify-center mr-4 shadow-sm">
                        <span className="material-icons">work</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Work</h3>
                        <p className="text-sm text-gray-500">Gain real-world experience</p>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`border ${gapYearActivity === 'other' ? 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-5 cursor-pointer transition-all hover:shadow-md`}
                    onClick={() => {
                      setGapYearActivity('other');
                      setUserJourney("After high school, I am interested in taking a gap year to learn new skills and pursue my personal interests and hobbies.");
                    }}
                  >
                    <div className="flex items-center">
                      <div className="rounded-full bg-purple-100 text-purple-700 w-12 h-12 flex items-center justify-center mr-4 shadow-sm">
                        <span className="material-icons">self_improvement</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Personal Growth</h3>
                        <p className="text-sm text-gray-500">Learn new skills and pursue hobbies</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {gapYearActivity && (
                  <>
                    <div className="border rounded-lg p-5 bg-slate-50">
                      <h3 className="text-lg font-semibold mb-4">Gap Year Planning</h3>
                      
                      <div className="space-y-6">
                        {/* Time Length Selection */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">How long do you plan to take for your gap year?</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div 
                              className={`border rounded-lg px-4 py-3 cursor-pointer text-center ${gapYearLength === '3month' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white hover:bg-blue-50 border-gray-200'}`}
                              onClick={() => setGapYearLength('3month')}
                            >
                              <div className="font-medium">3 Months</div>
                              <div className="text-xs text-gray-500">Summer Break</div>
                            </div>
                            
                            <div 
                              className={`border rounded-lg px-4 py-3 cursor-pointer text-center ${gapYearLength === '6month' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white hover:bg-blue-50 border-gray-200'}`}
                              onClick={() => setGapYearLength('6month')}
                            >
                              <div className="font-medium">6 Months</div>
                              <div className="text-xs text-gray-500">Half Year</div>
                            </div>
                            
                            <div 
                              className={`border rounded-lg px-4 py-3 cursor-pointer text-center ${gapYearLength === '9month' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white hover:bg-blue-50 border-gray-200'}`}
                              onClick={() => setGapYearLength('9month')}
                            >
                              <div className="font-medium">9 Months</div>
                              <div className="text-xs text-gray-500">Academic Year</div>
                            </div>
                            
                            <div 
                              className={`border rounded-lg px-4 py-3 cursor-pointer text-center ${gapYearLength === '12month' ? 'bg-blue-100 border-blue-400 shadow-sm' : 'bg-white hover:bg-blue-50 border-gray-200'}`}
                              onClick={() => setGapYearLength('12month')}
                            >
                              <div className="font-medium">12 Months</div>
                              <div className="text-xs text-gray-500">Full Year</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Budget Planning */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">What's your budget for your gap year?</h4>
                          <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-full md:w-2/3">
                              <input
                                type="range"
                                min="1000"
                                max="30000"
                                step="1000"
                                value={gapYearBudget}
                                onChange={(e) => setGapYearBudget(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>$1,000</span>
                                <span>$15,000</span>
                                <span>$30,000</span>
                              </div>
                            </div>
                            <div className="w-full md:w-1/3">
                              <div className="border border-gray-200 rounded-lg bg-white p-3 text-center">
                                <div className="text-gray-500 text-sm">Budget</div>
                                <div className="text-2xl font-bold text-primary">{formatCurrency(gapYearBudget)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            {gapYearBudget < 5000 ? 
                              "Budget traveler: You'll need to be frugal and may want to consider work opportunities." :
                              gapYearBudget < 15000 ? 
                                "Moderate budget: Good for most gap year activities with careful planning." :
                                "Comfortable budget: You'll have flexibility for higher-cost programs and experiences."
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={handleBack}>
                        <span className="material-icons mr-2">arrow_back</span>
                        Back
                      </Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white" 
                        onClick={handleNext}
                        disabled={!gapYearLength}
                      >
                        Continue
                        <span className="material-icons ml-2">arrow_forward</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Step>
          );
        }
        return null;
      
      case 4:
        // Military service length selection
        if (selectedPath === 'military' && militaryBranch) {
          return (
            <Step 
              title={userJourney} 
              subtitle={`How long do you plan to serve in the ${militaryBranch?.charAt(0).toUpperCase()}${militaryBranch?.slice(1)}?`}
            >
              {/* Dynamically show appropriate service length options based on branch */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Different branches have different typical service lengths */}
                {militaryBranch === 'army' && (
                  <>
                    <div 
                      className={`border ${serviceLength === '3year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('3year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 60, // 60% for 3 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(21); // 18 + 3 years service
                        setUserJourney(userJourney + " for a 3-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '3year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '3year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '3year' ? 'text-primary' : ''}`}>3-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Standard Army initial term</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Partial GI Bill (60%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Housing stipend available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-red-500 mr-2 text-sm">cancel</span>
                          <span>No retirement eligibility</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border ${serviceLength === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('4year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 100, // 100% for 4 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(22); // 18 + 4 years service
                        setUserJourney(userJourney + " for a 4-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '4year' ? 'text-primary' : ''}`}>4-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Extended commitment with full benefits</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Full GI Bill (100%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Housing stipend available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Potential enlistment bonus</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {militaryBranch === 'navy' && (
                  <>
                    <div 
                      className={`border ${serviceLength === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('4year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 80, // 80% for 4 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(22); // 18 + 4 years service
                        setUserJourney(userJourney + " for a 4-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '4year' ? 'text-primary' : ''}`}>4-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Standard Navy contract</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Partial GI Bill (80%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Housing stipend available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-red-500 mr-2 text-sm">cancel</span>
                          <span>No retirement eligibility</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border ${serviceLength === '5year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('5year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 100, // 100% for 5 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(23); // 18 + 5 years service
                        setUserJourney(userJourney + " for a 5-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '5year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '5year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '5year' ? 'text-primary' : ''}`}>5-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Extended Navy commitment</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Full GI Bill (100%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Enhanced housing stipend</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Technical training opportunities</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {militaryBranch === 'airforce' && (
                  <>
                    <div 
                      className={`border ${serviceLength === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('4year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 80, // 80% for 4 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(22); // 18 + 4 years service
                        setUserJourney(userJourney + " for a 4-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '4year' ? 'text-primary' : ''}`}>4-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Minimum Air Force term</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Partial GI Bill (80%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Housing allowance</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Technical training</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border ${serviceLength === '6year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('6year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 100, // 100% for 6 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(24); // 18 + 6 years service
                        setUserJourney(userJourney + " for a 6-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '6year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '6year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '6year' ? 'text-primary' : ''}`}>6-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Extended Air Force commitment</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Full GI Bill (100%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Enhanced enlistment bonus</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Advanced training options</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {(militaryBranch === 'marines' || militaryBranch === 'coastguard' || militaryBranch === 'spaceguard') && (
                  <>
                    <div 
                      className={`border ${serviceLength === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('4year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 80, // 80% for 4 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(22); // 18 + 4 years service
                        setUserJourney(userJourney + " for a 4-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '4year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '4year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '4year' ? 'text-primary' : ''}`}>4-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Standard commitment</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Partial GI Bill (80%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Housing stipend available</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-red-500 mr-2 text-sm">cancel</span>
                          <span>No retirement eligibility</span>
                        </div>
                      </div>
                    </div>

                    <div 
                      className={`border ${serviceLength === '5year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors`}
                      onClick={() => {
                        setServiceLength('5year');
                        // Update benefits
                        setMilitaryBenefits({
                          giBillEligible: true,
                          giBillPercentage: 100, // 100% for 5 years
                          housingAllowance: true,
                          veteransPreference: true,
                          retirementEligible: false
                        });
                        setAdjustedStartingAge(23); // 18 + 5 years service
                        setUserJourney(userJourney + " for a 5-year enlistment");
                      }}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`rounded-full ${serviceLength === '5year' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === '5year' ? 'text-white' : 'text-gray-600'} mr-3`}>
                          <span className="material-icons text-sm">timer</span>
                        </div>
                        <h5 className={`font-medium ${serviceLength === '5year' ? 'text-primary' : ''}`}>5-Year Enlistment</h5>
                      </div>
                      <p className="text-sm text-gray-600">Extended commitment with full benefits</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Full GI Bill (100%)</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Enhanced housing stipend</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                          <span>Specialized training opportunities</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Career option available for all branches */}
                <div 
                  className={`border ${serviceLength === 'career' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors col-span-1 md:col-span-2`}
                  onClick={() => {
                    setServiceLength('career');
                    // Update benefits
                    setMilitaryBenefits({
                      giBillEligible: true,
                      giBillPercentage: 100, // 100% for career
                      housingAllowance: true,
                      veteransPreference: true,
                      retirementEligible: true
                    });
                    setAdjustedStartingAge(38); // 18 + 20 years service (retirement eligible)
                    setUserJourney(userJourney + " as a career service member");
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`rounded-full ${serviceLength === 'career' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${serviceLength === 'career' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">military_tech</span>
                    </div>
                    <h5 className={`font-medium ${serviceLength === 'career' ? 'text-primary' : ''}`}>Career Service (20+ years)</h5>
                  </div>
                  <p className="text-sm text-gray-600">Full career with retirement benefits</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                        <span>Full GI Bill (100%)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                        <span>Full housing benefits</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                        <span>Military pension (50%+ of base pay)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                        <span>Lifetime healthcare (Tricare)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  <span className="material-icons mr-2">arrow_back</span>
                  Back
                </Button>

                <Button
                  onClick={() => {
                    if (serviceLength !== 'career') {
                      // For non-career, go to post-military path selection
                      handleNext();
                    } else {
                      // For career, go to location selection (skip post-military)
                      setCurrentStep(6);
                    }
                  }}
                  disabled={!serviceLength}
                >
                  Continue
                  <span className="material-icons ml-2">arrow_forward</span>
                </Button>
              </div>
            </Step>
          );
        }
        // Job pathway - Don't do anything special here, let it continue to the regular flow
        else if (selectedPath === 'job' && jobType) {
          // Simply continue with the regular flow from handleNext
          // This will allow proper job search -> location selection -> create plan
          return renderCurrentStep();
        }
        // Gap year pathway diagram
        else if (selectedPath === 'gap' && gapYearActivity) {
          // Get friendly time description for subtitle
          const getTimeDescription = () => {
            switch(gapYearLength) {
              case '3month': return '3-month';
              case '6month': return '6-month';
              case '9month': return '9-month';
              case '12month': return 'full-year';
              default: return '';
            }
          };
          
          return (
            <Step 
              title={userJourney} 
              subtitle={`${getTimeDescription()} gap year for ${gapYearActivity.charAt(0).toUpperCase()}${gapYearActivity.slice(1)} activities | Budget: ${formatCurrency(gapYearBudget)}`}
            >
              <GapYearPathway 
                activity={gapYearActivity}
                length={gapYearLength}
                budget={gapYearBudget}
                handleBack={handleBack}
                handleNext={handleNext}
                handleSelectPathway={(pathway: string) => {
                  // This function will handle transitioning to a new pathway after gap year
                  if (pathway === 'education') {
                    setSelectedPath('education');
                    setEducationType('4year'); // Default to 4-year college
                    setCurrentStep(4); // Go to education path
                  } else if (pathway === 'job') {
                    setSelectedPath('job');
                    setJobType('fulltime'); // Default to full-time job
                    setCurrentStep(3); // Go to job type selection
                  } else if (pathway === 'military') {
                    setSelectedPath('military');
                    setMilitaryBranch('army'); // Default to Army
                    setCurrentStep(3); // Go to military branch selection
                  }
                }}
              />
            </Step>
          );
        }
        // Do you have a specific school in mind?
        else if (isEducationPath(selectedPath) && educationType) {
          // Set a different title based on whether we came from guided or direct path
          const stepTitle = guidedPathComplete 
            ? userJourney
            : `After high school, I am interested in attending a ${educationType === '4year' 
                ? '4-year college or university' 
                : educationType === '2year' 
                ? '2-year community college' 
                : 'vocational/trade school'} where...`;
          return (
            <Step 
              title={stepTitle}
              subtitle={`Finding the right ${educationType === '4year' ? '4-year college' : educationType === '2year' ? '2-year college' : 'vocational school'} for you`}
            >
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              setSearchQuery(e.target.value);
                              setHasSpecificSchool(true);
                            }}
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
                      ) : searchResults && Array.isArray(searchResults) && searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {searchResults.map((school: any) => (
                            <Card 
                              key={school.id} 
                              className={`border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${specificSchool === school.name ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                              onClick={() => {
                                setSpecificSchool(school.name);
                                setSelectedSchoolId(school.id);
                                
                                // Update the narrative to include the selected school
                                const schoolType = educationType === '4year' ? 'attending' : 
                                                  educationType === '2year' ? 'attending' : 
                                                  'attending';
                                setUserJourney(`After high school, I am interested in ${schoolType} ${school.name} where I am interested in studying...`);
                                
                                // Automatically proceed to field of study step
                                handleNext();
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center">
                                  <div className={`rounded-full ${specificSchool === school.name ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${specificSchool === school.name ? 'text-white' : 'text-gray-600'} mr-3 flex-shrink-0`}>
                                    <span className="material-icons text-sm">school</span>
                                  </div>
                                  <div>
                                    <h5 className={`font-medium ${specificSchool === school.name ? 'text-primary' : ''}`}>{school.name}</h5>
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
                          }}
                        >
                          <span className="material-icons text-sm mr-1">clear</span>
                          Clear Search
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {specificSchool && (
                    <div className="mb-6 p-4 border border-green-100 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 text-green-600">
                          <span className="material-icons">school</span>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-green-700 mb-1">Selected School</h4>
                          <p className="text-sm text-green-600 mb-3">
                            {specificSchool}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSpecificSchool('');
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
                  
                  <div className="mt-6">
                    <Button 
                      className="bg-green-500 hover:bg-green-600 text-white w-full"
                      onClick={() => {
                        handleNext(); // Continue to the field of study selection
                      }}
                    >
                      Next
                    </Button>
                    <p className="text-gray-500 text-sm text-center mt-2">
                      {specificSchool ? 'Continue to choose your field of study' : 'Otherwise, click Next to continue'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                </div>
              </div>
            </Step>
          );
        }
      
      case 5:
        // Post-military path selection
        if (selectedPath === 'military' && militaryBranch && serviceLength !== 'career') {
          return (
            <Step 
              title={userJourney} 
              subtitle="What would you like to do after your military service?"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div 
                  className={`border ${postMilitaryPath === 'education' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors h-full`}
                  onClick={() => {
                    setPostMilitaryPath('education');
                    setMilitaryToEducation(true);
                    setUserJourney(userJourney + " and afterward, I plan to attend college using my military benefits");
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`rounded-full ${postMilitaryPath === 'education' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${postMilitaryPath === 'education' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">school</span>
                    </div>
                    <h5 className={`font-medium ${postMilitaryPath === 'education' ? 'text-primary' : ''}`}>Attend College</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Use your GI Bill benefits to pursue higher education</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>GI Bill covers tuition and fees</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Monthly housing allowance</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Books and supplies stipend</span>
                    </div>
                    {militaryBenefits?.giBillPercentage && militaryBenefits.giBillPercentage < 100 && (
                      <div className="flex items-center text-sm">
                        <span className="material-icons text-amber-500 mr-2 text-sm">warning</span>
                        <span>You qualify for {militaryBenefits.giBillPercentage}% of GI Bill benefits</span>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className={`border ${postMilitaryPath === 'job' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-6 cursor-pointer transition-colors h-full`}
                  onClick={() => {
                    setPostMilitaryPath('job');
                    setMilitaryToJob(true);
                    setUserJourney(userJourney + " and afterward, I plan to enter the workforce using my military experience");
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className={`rounded-full ${postMilitaryPath === 'job' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${postMilitaryPath === 'job' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">work</span>
                    </div>
                    <h5 className={`font-medium ${postMilitaryPath === 'job' ? 'text-primary' : ''}`}>Enter Workforce</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Utilize your military skills and experience in the civilian job market</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Veterans preference in government jobs</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Access to veteran employment services</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Valuable military experience on resume</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                      <span>Higher starting salary potential</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <span className="material-icons text-blue-500 mr-2 mt-0.5">info</span>
                  <div>
                    <h6 className="font-medium text-sm">Your Military Benefits</h6>
                    <p className="text-sm text-gray-600">
                      Based on your {serviceLength === '2year' ? '2-year' : serviceLength === '4year' ? '4-year' : '6-year'} service, 
                      you'll qualify for {militaryBenefits?.giBillPercentage}% of GI Bill benefits, 
                      veterans preference in hiring, and more.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                >
                  <span className="material-icons mr-2">arrow_back</span>
                  Back
                </Button>

                <Button
                  onClick={() => {
                    if (postMilitaryPath === 'education') {
                      // Set up for education pathway with military benefits
                      setSelectedPath('education');
                      setEducationType('4year'); // Default to 4-year with GI Bill
                      
                      // Set military-to-education flag for benefits tracking
                      setMilitaryToEducation(true);
                      
                      // Update user journey to reflect path
                      setUserJourney(`After serving in the ${militaryBranch?.charAt(0).toUpperCase()}${militaryBranch?.slice(1)} for ${
                        serviceLength === '3year' ? '3 years' : 
                        serviceLength === '4year' ? '4 years' : 
                        serviceLength === '5year' ? '5 years' : 
                        serviceLength === '6year' ? '6 years' : 'several years'
                      }, I plan to attend college using my GI Bill benefits`);
                      
                      // Go to college selection for education path (step 3)
                      setCurrentStep(3);
                      
                    } else if (postMilitaryPath === 'job') {
                      // Set up for job pathway with military experience
                      setSelectedPath('job');
                      setJobType('fulltime');
                      setIsPartTime(false);
                      setWeeklyHours(40);
                      
                      // Set military-to-job flag for veteran preference
                      setMilitaryToJob(true);
                      
                      // Update user journey
                      setUserJourney(`After serving in the ${militaryBranch?.charAt(0).toUpperCase()}${militaryBranch?.slice(1)} for ${
                        serviceLength === '3year' ? '3 years' : 
                        serviceLength === '4year' ? '4 years' : 
                        serviceLength === '5year' ? '5 years' : 
                        serviceLength === '6year' ? '6 years' : 'several years'
                      }, I plan to enter the workforce using my military experience`);
                      
                      // Go to job type selection for job path (step 3)
                      setCurrentStep(3);
                    }
                  }}
                  disabled={!postMilitaryPath}
                >
                  Continue
                  <span className="material-icons ml-2">arrow_forward</span>
                </Button>
              </div>
            </Step>
          );
        }
        // Field of Study selection step
        else if (isEducationPath(selectedPath)) {
          return (
            <Step title={userJourney} subtitle="Choose a field of study that interests you">
              <Card>
                <CardContent className="p-6">
                  {isLoadingAllPaths ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading fields of study...</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <label htmlFor="field-select" className="block text-sm font-medium mb-2">Field of Study</label>
                        
                        {/* Add a state to track if we're in custom input mode */}
                        {!selectedFieldOfStudy || selectedFieldOfStudy !== "custom" ? (
                          <>
                            <Select 
                              value={selectedFieldOfStudy || ""}
                              onValueChange={(value) => {
                                // Handle custom input option
                                if (value === "custom") {
                                  setSelectedFieldOfStudy("custom");
                                  return;
                                }
                                
                                setSelectedFieldOfStudy(value);
                                
                                // Complete the narrative with the field of study
                                if (specificSchool) {
                                  setUserJourney(`After high school, I am interested in attending ${specificSchool} where I am interested in studying ${value}.`);
                                } else {
                                  const schoolType = educationType === '4year' ? 'a 4-year college' : 
                                    educationType === '2year' ? 'a 2-year college' : 'a vocational school';
                                  setUserJourney(`After high school, I am interested in attending ${schoolType} where I am interested in studying ${value}.`);
                                }
                                
                                console.log(`Selected field of study: ${value}`);
                                // Career paths will automatically load due to the useQuery dependency
                              }}
                            >
                              <SelectTrigger id="field-select" className="w-full">
                                <SelectValue placeholder="Select a field of study" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Enter my own field of study...</SelectItem>
                                {fieldsOfStudy.map((field) => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          // Custom field of study input (shown when "custom" is selected)
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-blue-600 font-medium">Custom Field of Study</span>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedFieldOfStudy("")}
                                className="text-xs"
                              >
                                Back to List
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Input 
                                id="custom-field"
                                placeholder="e.g. Digital Media, Astronomy, etc." 
                                className="flex-1"
                                autoFocus
                                onChange={(e) => {
                                  const customField = e.target.value;
                                  if (customField.trim()) {
                                    // Only update when there's actual content
                                    if (specificSchool) {
                                      setUserJourney(`After high school, I am interested in attending ${specificSchool} where I am interested in studying ${customField}.`);
                                    } else {
                                      const schoolType = educationType === '4year' ? 'a 4-year college' : 
                                        educationType === '2year' ? 'a 2-year college' : 'a vocational school';
                                      setUserJourney(`After high school, I am interested in attending ${schoolType} where I am interested in studying ${customField}.`);
                                    }
                                  }
                                }}
                              />
                              <Button 
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById('custom-field') as HTMLInputElement;
                                  if (input && input.value.trim()) {
                                    setSelectedFieldOfStudy(input.value);
                                  }
                                }}
                              >
                                Set
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Enter your field of study and click "Set" to continue
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {selectedFieldOfStudy && (
                        <div className="mt-6">

                        </div>
                      )}
                      
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        {selectedFieldOfStudy && (
                          <Button 
                            onClick={() => {
                              // For 2-year college path, go to transfer option first
                              if (educationType === '2year') {
                                setCurrentStep(5.5);
                              } else {
                                // Otherwise go directly to profession selection
                                handleNext();
                              }
                            }}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Next
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </Step>
          );
        } else {
          return (
            <Step title="Next Steps" subtitle="Here's what you need to know">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="rounded-full bg-green-100 text-green-800 h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <span className="material-icons text-2xl">check_circle</span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">You've chosen your path!</h3>
                    <p className="text-gray-600">
                      {isEducationPath(selectedPath) && educationType === '4year' && 'Pursuing a 4-year college degree can open up many career opportunities and provide a well-rounded education.'}
                      {isEducationPath(selectedPath) && educationType === '2year' && 'Pursuing a 2-year college degree can be a great way to enter the workforce quickly or transfer to a 4-year program later.'}
                      {isEducationPath(selectedPath) && educationType === 'vocational' && 'Vocational training provides specialized skills that are in high demand in many industries.'}
                      {selectedPath === 'job' && 'Entering the workforce directly can provide valuable experience and help you save money.'}
                      {selectedPath === 'military' && 'Military service offers training, education benefits, and the opportunity to serve your country.'}
                      {selectedPath === 'gap' && 'A gap year can provide time for personal growth and clarity about your future goals.'}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium">Resources to explore:</h4>
                    <ul className="space-y-2 text-sm">
                      {isEducationPath(selectedPath) && educationType === '4year' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>College Search: Find the right university for you</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Financial Aid Resources: Learn about scholarships and grants</span>
                          </li>
                        </>
                      )}
                      
                      {isEducationPath(selectedPath) && educationType === '2year' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Community College Finder: Find colleges in your area</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Financial Aid Information: Learn about grants and scholarships</span>
                          </li>
                        </>
                      )}
                      
                      {isEducationPath(selectedPath) && educationType === 'vocational' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Trade School Directory: Find vocational schools by program</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Industry Certifications: Credentials that boost your resume</span>
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'job' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Resume Builder: Create a professional resume</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Job Search Platforms: Find opportunities in your area</span>
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'military' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Military Recruiter Locator: Connect with a recruiter</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>ASVAB Practice Tests: Prepare for the entrance exam</span>
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'gap' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Gap Year Programs: Structured experiences with travel, service, or work</span>
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">arrow_right</span>
                            <span>Volunteer Opportunities: Make a difference while gaining experience</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button onClick={handleRestartExploration}>
                      <span className="material-icons text-sm mr-1">sports_esports</span>
                      Play Game Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        }
      
      case 5.5:
        // Transfer option step for 2-year college
        if (isEducationPath(selectedPath) && educationType === '2year' && selectedFieldOfStudy) {
          return (
            <Step
              title={userJourney}
              subtitle="Considering transfer to a 4-year college?"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <span className="material-icons mr-2 text-blue-500">school</span>
                        Transfer Options
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Many students start at a 2-year community college and then transfer to a 4-year college 
                        to complete their bachelor's degree. This can be a cost-effective way to earn your degree.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div 
                          className={`border rounded-lg p-5 cursor-pointer transition-all ${
                            transferOption === 'yes' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'
                          }`}
                          onClick={() => setTransferOption('yes')}
                        >
                          <div className="flex items-center mb-3">
                            <div className={`rounded-full ${
                              transferOption === 'yes' ? 'bg-primary' : 'bg-gray-200'
                            } h-10 w-10 flex items-center justify-center ${
                              transferOption === 'yes' ? 'text-white' : 'text-gray-600'
                            } mr-3`}>
                              <span className="material-icons">check</span>
                            </div>
                            <h5 className={`font-medium ${transferOption === 'yes' ? 'text-primary' : ''}`}>
                              Yes, I plan to transfer
                            </h5>
                          </div>
                          <p className="text-gray-600 text-sm ml-13 pl-10">
                            After completing my associate's degree, I plan to transfer to a 4-year college to earn a bachelor's degree.
                          </p>
                          
                          {transferOption === 'yes' && (
                            <div className="mt-4 ml-13 pl-10">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Find a 4-year college to transfer to:
                              </label>
                              
                              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4">
                                <div className="relative mb-3">
                                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <span className="material-icons text-sm">search</span>
                                  </span>
                                  <Input 
                                    placeholder="Search for 4-year colleges..." 
                                    className="pl-9 w-full"
                                    value={transferCollegeSearchQuery}
                                    onChange={(e) => setTransferCollegeSearchQuery(e.target.value)}
                                  />
                                </div>
                                
                                {transferCollege && (
                                  <div className="flex items-center justify-between bg-white p-3 rounded-lg mb-4">
                                    <div>
                                      <p className="font-medium">Selected College:</p>
                                      <p>{transferCollege}</p>
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        setTransferCollege('');
                                      }}
                                    >
                                      Change
                                    </Button>
                                  </div>
                                )}
                                
                                {isLoadingTransferSearch ? (
                                  <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-2 text-gray-600 text-sm">Searching colleges...</p>
                                  </div>
                                ) : transferCollegeResults && Array.isArray(transferCollegeResults) && transferCollegeResults.length > 0 ? (
                                  <div className="mt-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                                    {transferCollegeResults.map((college: any) => (
                                      <div 
                                        key={college.id} 
                                        className={`p-3 cursor-pointer transition-all hover:bg-blue-50 border-b last:border-b-0 border-gray-200 ${transferCollege === college.name ? 'bg-blue-50' : ''}`}
                                        onClick={() => setTransferCollege(college.name)}
                                      >
                                        <div className="flex items-center">
                                          <div className={`rounded-full ${transferCollege === college.name ? 'bg-primary' : 'bg-gray-200'} h-6 w-6 flex items-center justify-center ${transferCollege === college.name ? 'text-white' : 'text-gray-600'} mr-3`}>
                                            <span className="material-icons text-sm">{transferCollege === college.name ? 'check' : 'school'}</span>
                                          </div>
                                          <div>
                                            <p className="font-medium">{college.name}</p>
                                            <p className="text-xs text-gray-600">{college.city}, {college.state}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : transferCollegeSearchQuery.length > 2 ? (
                                  <div className="text-center py-4">
                                    <p className="text-gray-600 text-sm">No colleges found matching your search.</p>
                                  </div>
                                ) : null}
                                
                                <p className="text-xs text-gray-500 mt-2">
                                  You can search for colleges or enter a college name manually.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-5 cursor-pointer transition-all ${
                            transferOption === 'no' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'
                          }`}
                          onClick={() => setTransferOption('no')}
                        >
                          <div className="flex items-center mb-3">
                            <div className={`rounded-full ${
                              transferOption === 'no' ? 'bg-primary' : 'bg-gray-200'
                            } h-10 w-10 flex items-center justify-center ${
                              transferOption === 'no' ? 'text-white' : 'text-gray-600'
                            } mr-3`}>
                              <span className="material-icons">close</span>
                            </div>
                            <h5 className={`font-medium ${transferOption === 'no' ? 'text-primary' : ''}`}>
                              No, I'll complete my 2-year degree
                            </h5>
                          </div>
                          <p className="text-gray-600 text-sm ml-13 pl-10">
                            I plan to enter the workforce directly after earning my associate's degree.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    {transferOption && (
                      <Button 
                        onClick={() => {
                          // Update the narrative to include transfer plans
                          if (transferOption === 'yes') {
                            const updatedNarrative = transferCollege 
                              ? `${userJourney} and plan to transfer to ${transferCollege} to complete my bachelor's degree.`
                              : `${userJourney} and plan to transfer to a 4-year college to complete my bachelor's degree.`;
                            setUserJourney(updatedNarrative);
                            
                            // After selecting a transfer college, go to new step for choosing field of study at transfer college
                            setCurrentStep(5.6); // New step for transfer field of study
                            
                            // Set transfer field options from global fields
                            if (fieldsOfStudy && fieldsOfStudy.length > 0) {
                              setTransferFieldOptions(fieldsOfStudy);
                            }
                          } else {
                            const updatedNarrative = `${userJourney} and plan to enter the workforce after completing my associate's degree.`;
                            setUserJourney(updatedNarrative);
                            
                            // Set a default field of study for 2-year degree paths
                            // This allows the career selection UI to work properly
                            if (educationType === '2year') {
                              // Use the already selected field of study from step 5
                              // This ensures career options are appropriate for their field
                              if (!selectedFieldOfStudy) {
                                // If somehow no field was selected, use a general business field
                                setSelectedFieldOfStudy("Business, Management, Marketing, and Related Support Services");
                              }
                              // Skip to profession selection step
                              setCurrentStep(6);
                            } else {
                              // For other education types, just move to the next step
                              handleNext();
                            }
                          }
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {transferOption === 'yes' ? 'Next: Choose Field of Study' : 'Next'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        }
      
      case 5.6:
        // Transfer Field of Study selection for 2-year college students
        if (isEducationPath(selectedPath) && educationType === '2year' && transferOption === 'yes') {
          return (
            <Step
              title={userJourney}
              subtitle="Select the field of study at your 4-year transfer college"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold mb-2 flex items-center">
                        <span className="material-icons mr-2 text-blue-500">school</span>
                        Choose Your Field of Study at {transferCollege || "Your Transfer College"}
                      </h4>
                      <p className="text-gray-700 mb-4">
                        Your field of study at your transfer college may be different from your community college major. 
                        This choice will help determine potential career paths after you complete your bachelor's degree.
                      </p>
                      
                      {/* Current 2-year field display */}
                      <div className="bg-white p-3 rounded-md border border-blue-200 mb-4">
                        <p className="font-medium text-gray-600">Current 2-Year College Field of Study:</p>
                        <p className="text-primary font-semibold">{selectedFieldOfStudy}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          You may choose a different field for your bachelor's degree or continue in the same area.
                        </p>
                      </div>
                      
                      {/* Field of study selector */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select a field of study for your bachelor's degree:
                        </label>
                        
                        <Select
                          value={transferFieldOfStudy}
                          onValueChange={(value) => {
                            setTransferFieldOfStudy(value);
                            
                            // Update the narrative with the new field of study
                            const updatedNarrative = transferCollege 
                              ? `After high school, I plan to attend a 2-year college studying ${selectedFieldOfStudy} and then transfer to ${transferCollege} to study ${value} for my bachelor's degree.`
                              : `After high school, I plan to attend a 2-year college studying ${selectedFieldOfStudy} and then transfer to a 4-year college to study ${value} for my bachelor's degree.`;
                            
                            setUserJourney(updatedNarrative);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a field of study" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="header" disabled>Available Fields of Study</SelectItem>
                              {transferFieldOptions.map((field) => (
                                <SelectItem key={field} value={field}>
                                  {field}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        
                        {/* Show the selected transfer field of study */}
                        {transferFieldOfStudy && (
                          <div className="mt-4 bg-green-50 p-3 rounded-md border border-green-200">
                            <div className="flex items-center">
                              <div className="rounded-full bg-green-500 h-8 w-8 flex items-center justify-center text-white mr-3">
                                <span className="material-icons text-sm">check_circle</span>
                              </div>
                              <div>
                                <p className="font-medium">Selected Field at Transfer College:</p>
                                <p className="text-green-700">{transferFieldOfStudy}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    {transferFieldOfStudy && (
                      <Button 
                        onClick={() => {
                          // We use the transfer field of study for career selection
                          setSelectedFieldOfStudy(transferFieldOfStudy);
                          
                          // Move to profession selection step
                          setCurrentStep(6);
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        }
      
      case 6:
        // Profession selection step
        if (isEducationPath(selectedPath) && selectedFieldOfStudy) {
          return (
            <Step title={userJourney} subtitle="Select a career that interests you">
              <Card>
                <CardContent className="p-6">
                  {isLoadingFieldPaths ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading career paths...</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-4">Careers in {selectedFieldOfStudy}</h3>
                      
                      <div className="mb-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                          <h4 className="text-sm font-semibold mb-2 flex items-center">
                            <span className="material-icons mr-1 text-blue-500 text-sm">search</span>
                            Career Search
                          </h4>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                <span className="material-icons text-sm">search</span>
                              </span>
                              <Input 
                                id="career-search"
                                placeholder="Search for a career" 
                                className="pl-9 flex-1 w-full"
                                value={careerSearchQuery}
                                onChange={(e) => {
                                  setCareerSearchQuery(e.target.value);
                                  
                                  // For search term longer than 2 characters
                                  if (e.target.value.trim() && e.target.value.trim().length >= 2) {
                                    // Use the API-based search function - but don't show warnings during typing
                                    searchCareers(e.target.value.trim(), false);
                                  } else {
                                    // Clear filtered paths when search is empty
                                    setFilteredCareerPaths(null);
                                  }
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                type="button"
                                onClick={() => {
                                  if (careerSearchQuery.trim()) {
                                    // Re-execute search with warnings enabled
                                    searchCareers(careerSearchQuery.trim(), true);
                                    
                                    // Set the profession name
                                    setSelectedProfession(careerSearchQuery.trim());
                                    
                                    // Try to find a matching career ID from the filtered results
                                    if (filteredCareerPaths && filteredCareerPaths.length > 0) {
                                      // Use the first filtered career's ID
                                      setSelectedCareerId(filteredCareerPaths[0].id);
                                      console.log(`Using career ID ${filteredCareerPaths[0].id} for custom career: ${careerSearchQuery.trim()}`);
                                      
                                      // Also check for education requirements now that a career is actively selected
                                      checkCareerEducationRequirement(filteredCareerPaths[0].id);
                                    } else {
                                      // If no matches, we can't set a career ID, which may affect financial planning
                                      console.log('Warning: No career ID found for custom career - this may affect financial calculations');
                                    }
                                    
                                    // Complete the narrative with the searched career
                                    let narrative = '';
                                    if (educationType === '2year' && transferOption === 'yes') {
                                      narrative = `After high school, I plan to attend a 2-year college studying ${selectedFieldOfStudy === transferFieldOfStudy ? selectedFieldOfStudy : selectedFieldOfStudy + " initially"} and then transfer to ${transferCollege || 'a 4-year college'} where I will study ${transferFieldOfStudy} to become a ${careerSearchQuery.trim()}.`;
                                    } else {
                                      narrative = `After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${careerSearchQuery.trim()}.`;
                                    }
                                    setUserJourney(narrative);
                                    localStorage.setItem('userPathwayNarrative', narrative);
                                  }
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                Search Careers
                              </Button>
                              <Button 
                                type="button"
                                onClick={() => setGlobalCareerSearch(!globalCareerSearch)}
                                variant="outline"
                                className={globalCareerSearch ? "bg-blue-100" : ""}
                              >
                                {globalCareerSearch ? "Searching All Careers" : "Search All Careers"}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Don't see your preferred career? Enter it yourself, and we'll generate a custom financial plan.
                          </p>
                        </div>
                      
                        {selectedProfession && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg mb-4">
                            <div>
                              <p className="font-medium">Selected Career:</p>
                              <p>{selectedProfession}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProfession(null);
                                setSelectedCareerId(null);
                                // Maintain consistency with search query
                                setCareerSearchQuery('');
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-md font-medium mb-4">
                        {careerSearchQuery.length > 2 ? 'Search Results:' : 'Available Career Options:'}
                      </h4>
                      
                      {/* CAREER SEARCH SECTION - This is where we need to match the Go To Work pathway exactly */}
                      {careerSearchQuery.length > 2 ? (
                        // When search query is active, we need to directly filter allCareers like in job pathway
                        isLoadingAllCareers ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-gray-600">Searching careers...</p>
                          </div>
                        ) : allCareers && allCareers.length > 0 ? (
                          <div className="space-y-4 mb-6">
                            {/* Filter careers EXACTLY as in Go To Work pathway */}
                            {allCareers
                              .filter(career => {
                                // Match search query
                                const matchesQuery = 
                                  (career.title && career.title.toLowerCase().includes(careerSearchQuery.toLowerCase())) || 
                                  (career.description && career.description.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                  (career.alias1 && career.alias1.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                  (career.alias2 && career.alias2.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                  (career.alias3 && career.alias3.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                  (career.alias4 && career.alias4.toLowerCase().includes(careerSearchQuery.toLowerCase())) ||
                                  (career.alias5 && career.alias5.toLowerCase().includes(careerSearchQuery.toLowerCase()));
                                
                                // Filter by field of study if not in global search mode
                                if (!globalCareerSearch && selectedFieldOfStudy) {
                                  return matchesQuery && 
                                        (career.category === selectedFieldOfStudy || 
                                        career.field === selectedFieldOfStudy);
                                }
                                
                                return matchesQuery;
                              })
                              .slice(0, 5) // Limit results to 5
                              .map(career => (
                                <Card 
                                  key={career.id} 
                                  className="border cursor-pointer transition-all hover:shadow-md hover:scale-105"
                                  onClick={() => {
                                    setSelectedProfession(career.title);
                                    setCareerSearchQuery(career.title);
                                    setSelectedCareerId(career.id);
                                    
                                    // Check for education requirements when selecting from search results
                                    checkCareerEducationRequirement(career.id);
                                    
                                    // Complete the narrative with the selected profession
                                    let narrative = '';
                                    if (educationType === '2year' && transferOption === 'yes') {
                                      narrative = `After high school, I plan to attend a 2-year college studying ${selectedFieldOfStudy === transferFieldOfStudy ? selectedFieldOfStudy : selectedFieldOfStudy + " initially"} and then transfer to ${transferCollege || 'a 4-year college'} where I will study ${transferFieldOfStudy} to become a ${career.title}.`;
                                    } else {
                                      narrative = `After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${career.title}.`;
                                    }
                                    setUserJourney(narrative);
                                    localStorage.setItem('userPathwayNarrative', narrative);
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center">
                                      <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-3 flex-shrink-0">
                                        <span className="material-icons text-sm">work</span>
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{career.title}</h5>
                                        <p className="text-sm text-gray-600">
                                          {career.category || 'General'}
                                          {career.salary ? ` • ${formatSalary(career.salary)}` : ''}
                                        </p>
                                        {career.growth_rate && (
                                          <Badge variant="outline" className="mt-1">
                                            {career.growth_rate === 'fast' ? 'Growing Fast' : 
                                             career.growth_rate === 'average' ? 'Stable Growth' : 'Slow Growth'}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            
                            {/* Clear Search button */}
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setCareerSearchQuery('');
                                }}
                              >
                                <span className="material-icons text-sm mr-1">clear</span>
                                Clear Search
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6 border rounded-lg mb-6">
                            <p className="text-gray-500">
                              No careers found matching your search.
                            </p>
                          </div>
                        )
                      ) : fieldCareerPaths?.length ? (
                        // When no search is active, show field career paths
                        <div className="space-y-4 mb-6">
                          {fieldCareerPaths.map((path: CareerPath) => (
                            <Card 
                              key={path.id} 
                              className="border cursor-pointer transition-all hover:shadow-md hover:scale-105"
                              onClick={() => {
                                // Check for education requirements when selecting a career from career paths
                                checkCareerEducationRequirement(path.id);
                                
                                // Auto-fill the search box with the selected career title from career_paths
                                setCareerSearchQuery(path.career_title);
                                
                                // Initially set these values temporarily
                                setSelectedProfession(path.career_title);
                                
                                // Search for matching careers in the careers database
                                console.log(`Selected career path "${path.career_title}" - searching careers table for matches`);
                                
                                // Enable global search mode to find this career anywhere
                                setGlobalCareerSearch(true);
                                
                                // Search for this career title to get actual career ID
                                // We want to show warnings when a user actively selects a career
                                searchCareers(path.career_title, true);
                                
                                // Complete the narrative with the selected profession
                                let narrative = '';
                                if (educationType === '2year' && transferOption === 'yes') {
                                  narrative = `After high school, I plan to attend a 2-year college studying ${selectedFieldOfStudy === transferFieldOfStudy ? selectedFieldOfStudy : selectedFieldOfStudy + " initially"} and then transfer to ${transferCollege || 'a 4-year college'} where I will study ${transferFieldOfStudy} to become a ${path.career_title}.`;
                                } else {
                                  narrative = `After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${path.career_title}.`;
                                }
                                setUserJourney(narrative);
                                localStorage.setItem('userPathwayNarrative', narrative);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center">
                                  <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-3 flex-shrink-0">
                                    <span className="material-icons text-sm">work</span>
                                  </div>
                                  <div>
                                    <h5 className="font-medium">{path.career_title}</h5>
                                    <p className="text-sm text-gray-600">
                                      {path.field_of_study || 'General'}
                                      {path.option_rank ? ` • Rank: ${path.option_rank}` : ''}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border rounded-lg mb-6">
                          <p className="text-gray-500">
                            No career options found. Try a different search or field of study.
                          </p>
                        </div>
                      )}
                      
                      {/* No need for this extra Clear Search button anymore - it's already in the search results */}
                      
                      {/* Save to Profile section */}
                      {selectedProfession && (
                        <div className="mb-6 p-4 border border-green-100 bg-green-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 text-green-600">
                              <span className="material-icons">bookmark</span>
                            </div>
                            <div>
                              <h4 className="text-md font-medium text-green-700 mb-1">Save Your Pathway</h4>
                              <p className="text-sm text-green-600 mb-3">
                                Save this pathway to your profile for future reference and easy comparison.
                              </p>
                              <div className="flex gap-2">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    // In a real implementation, this would call an API to save to user profile
                                    // For now, we'll just show a success message using localStorage
                                    localStorage.setItem('savedPathway', JSON.stringify({
                                      educationType,
                                      school: specificSchool || null,
                                      transferOption: educationType === '2year' ? transferOption : null,
                                      transferCollege: (educationType === '2year' && transferOption === 'yes') ? transferCollege : null,
                                      fieldOfStudy: selectedFieldOfStudy,
                                      transferFieldOfStudy: (educationType === '2year' && transferOption === 'yes') ? transferFieldOfStudy : null,
                                      profession: selectedProfession,
                                      narrative: userJourney
                                    }));
                                    
                                    // Update UI to show it was saved
                                    alert("Your pathway has been saved to your profile!");
                                  }}
                                >
                                  <span className="material-icons text-sm mr-1">bookmark_add</span>
                                  Save to Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        {selectedProfession && (
                          <Button 
                            className="bg-green-500 hover:bg-green-600"
                            onClick={handleNext}
                          >
                            Next: Choose Location
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </Step>
          );
        }
        
      case 7:
        // Location selection step
        if (isEducationPath(selectedPath) && selectedFieldOfStudy && selectedProfession) {
          return (
            <Step title={userJourney} subtitle="Where would you like to live after completing your education?">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Select Your Future Location</h3>
                    
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
                      <div className="flex items-start gap-2">
                        <div className="text-blue-500 mt-0.5">
                          <span className="material-icons">place</span>
                        </div>
                        <div>
                          <h4 className="text-md font-medium text-blue-700 mb-1">Where You Live Matters</h4>
                          <p className="text-sm text-blue-600 mb-2">
                            Location affects cost of living, career opportunities, and overall quality of life.
                            Enter a zip code to get location-specific financial projections.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Button 
                        variant={searchByZip ? "default" : "outline"}
                        className={`flex-1 ${searchByZip ? "bg-primary" : ""}`}
                        onClick={() => setSearchByZip(true)}
                      >
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-sm">pin_drop</span>
                          Search by Zip Code
                        </span>
                      </Button>
                      <Button 
                        variant={!searchByZip ? "default" : "outline"} 
                        className={`flex-1 ${!searchByZip ? "bg-primary" : ""}`}
                        onClick={() => setSearchByZip(false)}
                      >
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-sm">location_city</span>
                          Search by City
                        </span>
                      </Button>
                    </div>
                    
                    {searchByZip ? (
                      <div className="mb-6">
                        <label htmlFor="location-zip" className="block text-sm font-medium mb-2">Zip Code</label>
                        <div className="flex gap-2">
                          <Input
                            id="location-zip"
                            placeholder="Enter zip code (e.g. 90210, 02142, 94103)"
                            className="flex-1"
                            value={selectedZipCode}
                            onChange={(e) => setSelectedZipCode(e.target.value)}
                            maxLength={5}
                          />
                          <Button 
                            variant="outline" 
                            className="flex gap-2 items-center"
                            disabled={selectedZipCode.length !== 5 || fetchingLocation}
                            onClick={() => fetchLocationByZipCode(selectedZipCode)}
                          >
                            {fetchingLocation ? (
                              <>
                                <span className="material-icons animate-spin text-sm">refresh</span>
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-icons text-sm">search</span>
                                <span>Find</span>
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Try 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San Francisco), or 30328 (Atlanta)
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <label htmlFor="location-city" className="block text-sm font-medium mb-2">City and State</label>
                        <div className="flex gap-2">
                          <Input
                            id="location-city"
                            placeholder="Enter city name (e.g. San Francisco)"
                            className="flex-1"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                          />
                          <Select value={selectedState} onValueChange={(value) => setSelectedState(value)}>
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {usStates.map(state => (
                                  <SelectItem key={state.code} value={state.code}>{state.code}</SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="outline" 
                            className="flex gap-2 items-center"
                            disabled={!citySearchQuery || !selectedState || fetchingLocation}
                            onClick={() => fetchLocationByCityState(citySearchQuery, selectedState)}
                          >
                            {fetchingLocation ? (
                              <>
                                <span className="material-icons animate-spin text-sm">refresh</span>
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <span className="material-icons text-sm">search</span>
                                <span>Find</span>
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Try popular cities like "San Francisco, CA", "New York, NY", or "Chicago, IL"
                        </p>
                      </div>
                    )}
                    
                    {selectedLocation && (
                      <div className="bg-green-50 border border-green-100 p-4 rounded-lg mb-6">
                        <div className="flex items-start gap-2">
                          <div className="text-green-500 mt-0.5">
                            <span className="material-icons">check_circle</span>
                          </div>
                          <div>
                            <h4 className="text-md font-medium text-green-700 mb-1">Location Found</h4>
                            <p className="text-sm text-green-600 mb-2">
                              {selectedLocation.city}, {selectedLocation.state}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={handleBack}>Back</Button>
                      <Button 
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => {
                          // Collect all the pathway data to auto-generate a financial plan
                          const pathwayDataToSave = {
                            educationType,
                            selectedFieldOfStudy,
                            specificSchool: specificSchool || "",
                            selectedProfession,
                            transferOption,
                            transferCollege,
                            transferFieldOfStudy,
                            location: selectedLocation ? {
                              zipCode: selectedZipCode,
                              city: selectedLocation.city,
                              state: selectedLocation.state
                            } : null,
                            userJourney
                          };
                          
                          console.log("Storing pathway data for financial planning:", pathwayDataToSave);
                          
                          // Store all the pathway data
                          localStorage.setItem('pathwayData', JSON.stringify(pathwayDataToSave));
                          
                          // Store the narrative for the calculator
                          localStorage.setItem('userPathwayNarrative', userJourney);
                          
                          // Store the location data and add to favorites
                          if (selectedLocation) {
                            const locationData = {
                              zipCode: selectedZipCode,
                              city: selectedLocation.city,
                              state: selectedLocation.state
                            };
                            
                            localStorage.setItem('selectedLocation', JSON.stringify(locationData));
                            
                            // Add location to favorites if user is authenticated
                            if (isAuthenticated && user) {
                              addLocationToFavorites.mutate(locationData, {
                                onSuccess: () => {
                                  console.log('Location added to favorites successfully');
                                  // Show success toast to the user
                                  toast({
                                    title: "Added to favorites",
                                    description: `${locationData.city}, ${locationData.state} has been added to your favorite locations.`,
                                    variant: "default",
                                  });
                                },
                                onError: (error) => {
                                  console.error('Failed to add location to favorites:', error);
                                  // Show error toast to the user
                                  toast({
                                    title: "Error adding to favorites",
                                    description: "The location could not be added to your favorites. It might already exist in your favorites.",
                                    variant: "destructive",
                                  });
                                }
                              });
                            }
                          }
                          
                          // Log pathway data for debugging
                          console.log('Pathway data for debugging:', {
                            isAuthenticated,
                            user,
                            selectedSchoolId,
                            specificSchool,
                            selectedCareerId,
                            selectedProfession
                          });
                          
                          // Add selected college to favorites if user is authenticated
                          if (isAuthenticated && user && selectedSchoolId) {
                            // Store the college ID in localStorage to prevent duplicate additions
                            const alreadyAdded = localStorage.getItem('lastAddedCollegeId') === String(selectedSchoolId);
                            
                            if (!alreadyAdded) {
                              console.log(`Adding college to favorites: ID=${selectedSchoolId}, Name=${specificSchool}`);
                              
                              // Mark this college as added in localStorage
                              localStorage.setItem('lastAddedCollegeId', String(selectedSchoolId));
                              
                              addCollegeToFavorites.mutate(selectedSchoolId, {
                                onSuccess: () => {
                                  console.log('College added to favorites successfully');
                                  // Show success toast to the user
                                  toast({
                                    title: "Added to favorites",
                                    description: `${specificSchool} has been added to your favorite colleges.`,
                                    variant: "default",
                                  });
                                },
                                onError: (error) => {
                                  console.error('Failed to add college to favorites:', error);
                                  // Show error toast to the user
                                  toast({
                                    title: "Error adding to favorites",
                                    description: "The college could not be added to your favorites. It might already exist in your favorites.",
                                    variant: "destructive",
                                  });
                                }
                              });
                            } else {
                              console.log(`College ${selectedSchoolId} (${specificSchool}) already added to favorites, skipping`);
                            }
                          } else {
                            console.log('Not adding college to favorites. Condition failed:', {
                              isAuthenticated,
                              hasUser: !!user,
                              selectedSchoolId 
                            });
                          }
                          
                          // Add selected career to favorites if user is authenticated
                          if (isAuthenticated && user && selectedCareerId) {
                            // Store the career ID in localStorage to prevent duplicate additions
                            const alreadyAdded = localStorage.getItem('lastAddedCareerId') === String(selectedCareerId);
                            
                            if (!alreadyAdded) {
                              console.log(`Adding career to favorites: ID=${selectedCareerId}, Title=${selectedProfession}`);
                              
                              // Mark this career as added in localStorage
                              localStorage.setItem('lastAddedCareerId', String(selectedCareerId));
                              
                              addCareerToFavorites.mutate(selectedCareerId, {
                                onSuccess: () => {
                                  console.log('Career added to favorites successfully');
                                  // Show success toast to the user
                                  toast({
                                    title: "Added to favorites",
                                    description: `${selectedProfession} has been added to your favorite careers.`,
                                    variant: "default",
                                  });
                                },
                                onError: (error) => {
                                  console.error('Failed to add career to favorites:', error);
                                  // Show error toast to the user
                                  toast({
                                    title: "Error adding to favorites",
                                    description: "The career could not be added to your favorites. It might already exist in your favorites.",
                                    variant: "destructive",
                                  });
                                }
                              });
                            } else {
                              console.log(`Career ${selectedCareerId} (${selectedProfession}) already added to favorites, skipping`);
                            }
                          } else {
                            console.log('Not adding career to favorites. Condition failed:', {
                              isAuthenticated,
                              hasUser: !!user,
                              selectedCareerId 
                            });
                          }
                          
                          // Auto-generate college and career calculations if user is authenticated
                          if (isAuthenticated && user) {
                            // Step 1: Create a college calculation if a college was selected
                            if (selectedSchoolId && specificSchool) {
                              // Fetch the financial profile to get household income and size
                              fetch(`/api/financial-profiles/user/${user.id}`)
                                .then(res => res.json())
                                .then(profile => {
                                  // Get the college data to access tuition and room/board info
                                  fetch(`/api/colleges/${selectedSchoolId}`)
                                    .then(res => res.json())
                                    .then(college => {
                                      // Default values if not available in financial profile
                                      const householdIncome = profile?.householdIncome || 80000;
                                      const householdSize = profile?.householdSize || 4;
                                      // Use profile or fetch from localStorage if the user object doesn't have zipCode
                                      let userZipCode = '00000';
                                      if (profile?.zip) {
                                        userZipCode = profile.zip;
                                      } else {
                                        try {
                                          const savedProfile = localStorage.getItem('userProfile');
                                          if (savedProfile) {
                                            const parsedProfile = JSON.parse(savedProfile);
                                            userZipCode = parsedProfile.zipCode || '00000';
                                          }
                                        } catch (err) {
                                          console.error('Error getting zip code from localStorage:', err);
                                        }
                                      }
                                      
                                      // Calculate a reasonable net price and loan amount
                                      // These are simplified defaults - in a real app, you'd use
                                      // a more sophisticated formula based on income, college costs, etc.
                                      const tuitionAmount = college.tuition || 30000;
                                      const roomAndBoardAmount = college.roomAndBoard || 12000;
                                      const totalCost = tuitionAmount + roomAndBoardAmount;
                                      
                                      // Simplified financial aid calculation (very basic)
                                      // In reality, this would use a much more complex formula
                                      let financialAid = 0;
                                      if (householdIncome < 50000) financialAid = totalCost * 0.8;
                                      else if (householdIncome < 80000) financialAid = totalCost * 0.5;
                                      else if (householdIncome < 120000) financialAid = totalCost * 0.3;
                                      else financialAid = totalCost * 0.1;
                                      
                                      const netPrice = Math.max(totalCost - financialAid, 0);
                                      // Assume roughly 70% of net price becomes student loan
                                      const studentLoanAmount = Math.round(netPrice * 0.7);
                                      
                                      // Process in-state/out-of-state tuition determination
                                      // For this, we need to check if the user's state matches the college's state
                                      // This is an asynchronous process since we need to fetch the state from the zip code
                                      
                                      // Define a function to create and save the college calculation
                                      const createAndSaveCollegeCalculation = (isInState: boolean = true) => {
                                        // Check if this college calculation was already created in this session
                                        const lastCalculatedCollegeId = localStorage.getItem('lastCalculatedCollegeId');
                                        if (lastCalculatedCollegeId === String(selectedSchoolId)) {
                                          console.log(`College calculation for ${specificSchool} (ID: ${selectedSchoolId}) was already created in this session, skipping`);
                                          return;
                                        }
                                        
                                        let finalTuitionAmount = tuitionAmount;
                                        let finalTotalCost = totalCost;
                                        let finalFinancialAid = financialAid;
                                        let finalNetPrice = netPrice;
                                        let finalStudentLoanAmount = studentLoanAmount;
                                        
                                        // If public college and out of state, apply multiplier to tuition
                                        if (college && college.type && 
                                            college.type.toLowerCase().includes('public') && 
                                            !isInState && college.tuition) {
                                            
                                          // Apply out-of-state multiplier (typically 2.5-3x)
                                          const outOfStateMultiplier = 3;
                                          finalTuitionAmount = college.tuition * outOfStateMultiplier;
                                          finalTotalCost = finalTuitionAmount + roomAndBoardAmount;
                                          
                                          // Recalculate financial aid and net price with new tuition
                                          if (householdIncome < 50000) finalFinancialAid = finalTotalCost * 0.8;
                                          else if (householdIncome < 80000) finalFinancialAid = finalTotalCost * 0.5;
                                          else if (householdIncome < 120000) finalFinancialAid = finalTotalCost * 0.3;
                                          else finalFinancialAid = finalTotalCost * 0.1;
                                          
                                          finalNetPrice = Math.max(finalTotalCost - finalFinancialAid, 0);
                                          finalStudentLoanAmount = Math.round(finalNetPrice * 0.7);
                                          
                                          console.log('Using OUT-OF-STATE tuition for this calculation');
                                        } else {
                                          console.log('Using IN-STATE tuition for this calculation');
                                        }
                                        
                                        // Create the college calculation
                                        const collegeCalculation = {
                                          userId: user.id,
                                          collegeId: selectedSchoolId,
                                          netPrice: finalNetPrice,
                                          inState: isInState,
                                          householdIncome: householdIncome,
                                          householdSize: householdSize,
                                          zip: userZipCode || '00000', // Ensure zip is never null
                                          tuitionUsed: finalTuitionAmount,
                                          roomAndBoardUsed: roomAndBoardAmount,
                                          onCampusHousing: true, // Default to on-campus
                                          totalCost: finalTotalCost,
                                          studentLoanAmount: finalStudentLoanAmount,
                                          financialAid: finalFinancialAid,
                                          familyContribution: Math.floor(householdIncome * 0.1), // Add this required field
                                          workStudy: 0, // Add default value for this field
                                          includedInProjection: true, // Auto-include in projection
                                          notes: `Auto-generated from Pathways for ${specificSchool || 'selected college'}`
                                        };
                                        
                                        console.log('Auto-generating college calculation:', collegeCalculation);
                                        
                                        // Save the calculation to the database
                                        // First, reset any existing included calculations
                                        fetch(`/api/college-calculations/user/${user.id}`)
                                          .then(res => res.json())
                                          .then(calculations => {
                                            // Find any currently included calculation
                                            const includedCalculation = calculations.find((calc: {id: number, includedInProjection: boolean}) => calc.includedInProjection);
                                            
                                            // If one exists, un-include it first
                                            if (includedCalculation) {
                                              return fetch(`/api/college-calculations/${includedCalculation.id}/toggle-projection`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: user.id })
                                              });
                                            }
                                            // Create a dummy response to keep the chain properly typed
                                            return new Response(null, { status: 200 });
                                          })
                                          .then(() => {
                                            // Then create our new calculation that will be included
                                            // Log exactly what we're sending
                                            const requestPayload = JSON.stringify(collegeCalculation);
                                            console.log('Sending college calculation payload:', requestPayload);
                                            return fetch('/api/college-calculations', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: requestPayload
                                            });
                                          })
                                          .then(async res => {
                                            if (!res.ok) {
                                              // Get the error details from the response
                                              const errorData = await res.json();
                                              console.error('Server validation error:', errorData);
                                              throw new Error(`Failed to create college calculation: ${JSON.stringify(errorData)}`);
                                            }
                                            return res.json();
                                          })
                                          .then(data => {
                                            console.log('Successfully created college calculation with projection inclusion:', data);
                                            // Show success toast to notify user
                                            toast({
                                              title: "College costs calculated",
                                              description: `College cost calculation for ${specificSchool} has been created and saved to your profile.`,
                                              variant: "default",
                                            });
                                            
                                            // Record that we've calculated this college in this session
                                            localStorage.setItem('lastCalculatedCollegeId', String(selectedSchoolId));
                                          })
                                          .catch(err => {
                                            console.error('Error creating college calculation:', err);
                                            // Show error toast
                                            toast({
                                              title: "Error creating college calculation",
                                              description: "There was a problem saving your college cost calculation.",
                                              variant: "destructive",
                                            });
                                          });
                                      };
                                      
                                      // Check if we need to consider in-state vs out-of-state tuition
                                      if (college && college.type && college.type.toLowerCase().includes('public')) {
                                        // For public colleges, we need to compare states
                                        const collegeState = college.state || '';
                                        
                                        console.log(`Determining in-state status for ${college.name} (${collegeState})`);
                                        
                                        // Try to get user state from zip code data
                                        fetch(`/api/zip-code-income/zip/${userZipCode}`)
                                          .then(response => response.ok ? response.json() : null)
                                          .then(data => {
                                            if (data && data.state) {
                                              const userState = data.state;
                                              
                                              // Compare states to determine in-state status
                                              const isInState = userState.toUpperCase() === collegeState.toUpperCase();
                                              console.log(`College in ${collegeState}, user in ${userState}: in-state = ${isInState}`);
                                              
                                              // Create and save the calculation with the right in-state status
                                              createAndSaveCollegeCalculation(isInState);
                                            } else {
                                              // No state data found - default to out-of-state for public colleges
                                              console.log('No state data found for zip code, defaulting to out-of-state for public college');
                                              createAndSaveCollegeCalculation(false);
                                            }
                                          })
                                          .catch(err => {
                                            console.error('Error fetching state from zip code:', err);
                                            // If error, default to out-of-state for public colleges
                                            createAndSaveCollegeCalculation(false);
                                          });
                                      } else {
                                        // For private colleges, in-state status doesn't matter
                                        console.log('College is private/non-public, in-state status does not apply');
                                        createAndSaveCollegeCalculation(true);
                                      }
                                    })
                                    .catch(err => {
                                      console.error('Error fetching college data:', err);
                                    });
                                })
                                .catch(err => {
                                  console.error('Error fetching financial profile:', err);
                                });
                            }
                            
                            // Step 2: Create a career calculation if a career was selected
                            if (selectedCareerId && selectedProfession) {
                              // Get the career data to access salary information
                              fetch(`/api/careers/${selectedCareerId}`)
                                .then(res => res.json())
                                .then(career => {
                                  // Use salary data from the career, with fallbacks
                                  const entryLevelSalary = career.salaryPct25 || career.salaryMedian * 0.8 || 50000;
                                  const midCareerSalary = career.salaryMedian || 65000;
                                  const experiencedSalary = career.salaryPct75 || career.salaryMedian * 1.2 || 80000;
                                  
                                  // Calculate location-adjusted salary if we have location data
                                  let projectedSalary = midCareerSalary;
                                  let adjustedForLocation = false;
                                  let locationZip = null;
                                  
                                  if (selectedLocation) {
                                    locationZip = selectedZipCode;
                                    // The location might have income_adjustment_factor or we can calculate from cost_of_living_index
                                    const locationFactor = (selectedLocation as any).income_adjustment_factor || 
                                                          (selectedLocation.cost_of_living_index ? selectedLocation.cost_of_living_index / 100 : 1.0);
                                    projectedSalary = Math.round(midCareerSalary * locationFactor);
                                    adjustedForLocation = true;
                                  }
                                  
                                  const careerCalculation = {
                                    userId: user.id,
                                    careerId: selectedCareerId,
                                    projectedSalary: projectedSalary,
                                    entryLevelSalary: entryLevelSalary,
                                    midCareerSalary: midCareerSalary,
                                    experiencedSalary: experiencedSalary,
                                    education: getEducationLevelFromPathType(educationType),
                                    additionalNotes: `Auto-generated from Pathways for ${selectedProfession}`,
                                    includedInProjection: true, // Auto-include in projection
                                    locationZip: locationZip,
                                    adjustedForLocation: adjustedForLocation
                                  };
                                  
                                  console.log('Auto-generating career calculation:', careerCalculation);
                                  
                                  // First, reset any existing included calculations
                                  fetch(`/api/career-calculations/user/${user.id}`)
                                    .then(res => res.json())
                                    .then(calculations => {
                                      // Find any currently included calculation
                                      const includedCalculation = calculations.find((calc: {id: number, includedInProjection: boolean}) => calc.includedInProjection);
                                      
                                      // If one exists, un-include it first
                                      if (includedCalculation) {
                                        return fetch(`/api/career-calculations/${includedCalculation.id}/toggle-projection`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ userId: user.id })
                                        });
                                      }
                                      // Create a dummy response to keep the chain properly typed
                                      return new Response(null, { status: 200 });
                                    })
                                    .then(() => {
                                      // Then create our new calculation that will be included
                                      return fetch('/api/career-calculations', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(careerCalculation)
                                      });
                                    })
                                    .then(res => {
                                      if (!res.ok) throw new Error('Failed to create career calculation');
                                      return res.json();
                                    })
                                    .then(data => {
                                      console.log('Successfully created career calculation with projection inclusion:', data);
                                      // Show success toast to notify user
                                      toast({
                                        title: "Career earnings calculated",
                                        description: `Career earnings calculation for ${selectedProfession} has been created and saved to your profile.`,
                                        variant: "default",
                                      });
                                    })
                                    .catch(err => {
                                      console.error('Error creating career calculation:', err);
                                      // Show error toast
                                      toast({
                                        title: "Error creating career calculation",
                                        description: "There was a problem saving your career earnings calculation.",
                                        variant: "destructive",
                                      });
                                    });
                                })
                                .catch(err => {
                                  console.error('Error fetching career data:', err);
                                });
                            }
                          }
                          
                          // Helper function to map education type to standardized education level
                          const getEducationLevelFromPathType = (pathType: string | null): string => {
                            switch(pathType) {
                              case '4year': return 'bachelor';
                              case '2year': 
                                // If they transferred to 4-year, they'll end with a bachelor's
                                return transferOption === 'yes' ? 'bachelor' : 'associate';
                              case 'vocational': return 'vocational';
                              default: return 'bachelor';
                            }
                          };
                          
                          // Collect pathway data with enhanced location info
                          const pathwayDataForFinancialPlan = {
                            educationType,
                            selectedFieldOfStudy,
                            specificSchool: specificSchool || "",
                            selectedProfession,
                            transferOption,
                            transferCollege,
                            transferFieldOfStudy,
                            location: selectedLocation ? {
                              zipCode: selectedZipCode,
                              city: selectedLocation.city,
                              state: selectedLocation.state
                            } : null,
                            userJourney,
                            // Add these additional fields for better compatibility
                            zipCode: selectedZipCode,
                            selectedCareer: selectedCareerId
                          };
                          
                          console.log("Storing enhanced pathway data for financial planning:", pathwayDataForFinancialPlan);
                          localStorage.setItem('pathwayData', JSON.stringify(pathwayDataForFinancialPlan));
                          
                          // Redirect to the financial projections page with auto-generate flag
                          navigate('/projections?autoGenerate=true');
                        }}
                        disabled={!selectedLocation || selectedZipCode.length !== 5}
                      >
                        Create Financial Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        }
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/70 to-primary-dark/70 shadow-sm mb-6 p-4">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIgZD0iTTYwMCAwdjYwMEgwVjBaIi8+PHBhdGggc3Ryb2tlPSIjZmZmZmZmMTAiIGZpbGw9Im5vbmUiIGQ9Ik02MDAgMEgwdjYwMGg2MDBWMFoiLz48cGF0aCBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIgZD0iTTAgMzAwaDYwME0zMDAgMHY2MDAiLz48cGF0aCBkPSJNMCAwdjYwMGw2MDAtNjAwSDBaIiBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik02MDAgMHY2MDBMODAwIDYwMFYwSDYwMFoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBmaWxsPSJub25lIi8+PC9zdmc+')]"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 text-white">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-display font-medium mb-1">Explore Your Pathways</h1>
            <p className="text-white/80 text-sm max-w-xl">
              Chart your course to an empowered future by making informed choices that align with your unique talents and aspirations.
            </p>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={handleStartOver}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-sm shadow-sm flex items-center gap-1 transition-all"
            >
              <span className="material-icons text-sm">refresh</span>
              Start Over
            </Button>
          </div>
        </div>
      </div>
      
      {/* Progress indicator removed as requested */}
      
      {renderCurrentStep()}
      
      {/* Education Requirement Warning Dialog */}
      <AlertDialog open={showEducationWarning} onOpenChange={setShowEducationWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="pb-2">
            <div className="flex items-center gap-2 text-orange-600">
              <span className="material-icons">school</span>
              <AlertDialogTitle>Education Requirement Notice</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="mt-2">
              <div className="bg-orange-50 p-3 border border-orange-100 rounded-md mb-3">
                <p className="text-sm font-medium text-orange-800">
                  This career typically requires: <span className="font-bold">{selectedCareerEducation}</span>
                </p>
              </div>
              
              {selectedPath === 'job' ? (
                <p className="text-sm text-gray-600 mb-2">
                  The job market for this career may be competitive without the recommended education. Consider exploring the college pathway for better opportunities.
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  {selectedPath === 'education' && educationType === '2year' ? 
                    'A 2-year associate degree may not provide sufficient education for this career path, which typically requires a 4-year bachelor\'s degree or higher.' : 
                    'A vocational certificate may not provide sufficient education for this career path, which typically requires a 4-year bachelor\'s degree or higher.'}
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel 
              className="text-sm"
              onClick={() => {
                // Continue with current pathway despite education warning
                setShowEducationWarning(false);
              }}
            >
              Continue Anyway
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={() => {
                // Switch to 4-year college pathway
                setShowEducationWarning(false);
                setSelectedPath("education");
                setEducationType("4year");
                setCurrentStep(4);
                setUserJourney("After high school, I am interested in attending a 4-year college or university where...");
              }}
            >
              Switch to 4-Year College
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Pathways;