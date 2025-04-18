import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingScreen } from "@/components/ui/loading-screen";
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
type TransferOption = "yes" | "no" | "transfer" | null;

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

interface PathwaysProps extends AuthProps {
  onNext: () => void;
}

// Add type definition for college calculation
interface CollegeCalculation {
  id: number;
  collegeId: number;
  studentLoanAmount: number;
  [key: string]: any; // For other properties we might need
}

// Helper function to get time description for gap year periods
const getGapYearPeriod = (period: GapYearLength): string => {
  switch(period) {
    case '3month': return '3-month';
    case '6month': return '6-month';
    case '9month': return '9-month';
    case '12month': return 'full-year';
    default: return '';
  }
};

// Helper function to get time description for numeric years
const getYearDescription = (years: number): string => {
  if (years < 1) {
    return 'Less than a year';
  }
  if (years === 1) {
    return '1 year';
  }
  return `${years} years`;
};

// Helper function to get education level from path type
const getEducationLevelFromPathType = (pathType: string): string => {
  switch (pathType) {
    case '4year':
      return 'Bachelor\'s Degree';
    case '2year':
      return 'Associate\'s Degree';
    case 'vocational':
      return 'Vocational Certificate';
    default:
      return 'No Degree';
  }
};

const Pathways = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding,
  onNext
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
  type NumericStep = { type: 'numeric'; value: number };
  type SpecialStep = { type: 'special'; value: 'education-warning' };
  type StepType = number;
  
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [selectedPath, setSelectedPath] = useState<PathChoice | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState<boolean>(false);
  
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
  const [transferCollege, setTransferCollege] = useState<{ id: number; name: string } | null>(null);
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
      
      // Show the warning dialog if the user is in job, 2-year college without transfer, or vocational pathway
      if (selectedPath === 'job' || 
          (selectedPath === 'education' && 
           ((educationType === '2year' && transferOption !== 'yes') || 
            educationType === 'vocational'))) {
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
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
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
    setTransferCollege(null);
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
    if (currentStep >= 4) {
      setCurrentStep(3);
    }
    console.log('handleRestartExploration called - current resetCounter:', resetCounter);
    
    // Store the current exploration method to ensure we're operating on the right game
    const currentMethod = explorationMethod;
    
    // If we're on the recommendations step, go back to the game step (3)
    const step = currentStep;
    if (!isNaN(step) && step >= 4) {
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add your step 1 content here */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exploration method selection content */}
                </div>
              </Step>
            );
          } else {
            // Handle different exploration methods
            switch (explorationMethod) {
              case 'swipe':
                return (
                  <Step 
                    title="Career Interest Discovery" 
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
              default:
                return (
                  <Step 
                    title="What would you like to do after high school?" 
                    subtitle="Choose your path to begin visualizing where it might lead you"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Path selection content */}
                    </div>
                  </Step>
                );
            }
          }
        }
        return null;

      case 4:
        if (selectedPath === 'military' && militaryBranch) {
          return (
            <Step 
              title={userJourney} 
              subtitle={`How long do you plan to serve in the ${militaryBranch.charAt(0).toUpperCase()}${militaryBranch.slice(1)}?`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Military service length options */}
                {militaryBranch === 'army' && (
                  <>
                    <Button
                      onClick={() => handleServiceLengthSelect(2)}
                      variant="outline"
                      className="w-full p-6 text-left"
                    >
                      <h3 className="text-lg font-semibold">2 Years</h3>
                      <p className="text-gray-600">Minimum active duty service commitment</p>
                    </Button>
                    <Button
                      onClick={() => handleServiceLengthSelect(4)}
                      variant="outline"
                      className="w-full p-6 text-left"
                    >
                      <h3 className="text-lg font-semibold">4 Years</h3>
                      <p className="text-gray-600">Standard enlistment period</p>
                    </Button>
                  </>
                )}
                {militaryBranch === 'navy' && (
                  <>
                    <Button
                      onClick={() => handleServiceLengthSelect(4)}
                      variant="outline"
                      className="w-full p-6 text-left"
                    >
                      <h3 className="text-lg font-semibold">4 Years</h3>
                      <p className="text-gray-600">Standard enlistment period</p>
                    </Button>
                    <Button
                      onClick={() => handleServiceLengthSelect(6)}
                      variant="outline"
                      className="w-full p-6 text-left"
                    >
                      <h3 className="text-lg font-semibold">6 Years</h3>
                      <p className="text-gray-600">Extended service commitment</p>
                    </Button>
                  </>
                )}
              </div>
            </Step>
          );
        }
        return null;

      default:
        return null;
    }
  };

  const [pathwayData, setPathwayData] = useState<{
    serviceLength?: number;
    // Add other pathway data properties as needed
  }>({});

  const [selectedServiceLength, setSelectedServiceLength] = useState<number | null>(null);

  const handleServiceLengthSelect = (years: number) => {
    // Convert years to string format expected by serviceLength state
    const lengthString = `${years}year`;
    setServiceLength(lengthString);
    
    // Update adjusted starting age based on service length
    setAdjustedStartingAge(prev => prev + years);
    
    // Set military benefits based on service length
    setMilitaryBenefits({
      giBillEligible: years >= 3, // Eligible for GI Bill after 3 years
      giBillPercentage: years >= 4 ? 100 : years >= 3 ? 80 : 0,
      housingAllowance: years >= 3,
      veteransPreference: true,
      retirementEligible: years >= 20
    });

    // Move to next step
    onNext();
  };

  return renderCurrentStep();
}

export default Pathways;