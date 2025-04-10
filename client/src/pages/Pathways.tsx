import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwipeableScenarios from "@/components/pathways/SwipeableScenarios";
import RecommendationEngine from "@/components/pathways/RecommendationEngine";
import IdentityWheel from "@/components/pathways/IdentityWheel";
import AdvancedWheel from "@/components/pathways/AdvancedWheel";
import AvatarCreator from "@/components/pathways/AvatarCreator";
import QuickSpinWheel from "@/components/pathways/QuickSpinWheel";
import { MilitaryPathway } from "@/components/pathways/MilitaryPathways";
import { GapYearPathway } from "@/components/pathways/GapYearPathways";
import { useLocation } from "wouter";

type PathChoice = "education" | "job" | "military" | "gap";

// Create a type specifically for the "education" path
type EducationPathChoice = "education";

// Other paths
type OtherPathChoice = "job" | "military" | "gap";

type EducationType = "4year" | "2year" | "vocational" | null;
type JobType = "fulltime" | "parttime" | "apprenticeship" | null;
type MilitaryBranch = "army" | "navy" | "airforce" | "marines" | "coastguard" | "spaceguard" | null;
type GapYearActivity = "travel" | "volunteer" | "work" | "other" | null;

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
  // Helper function to format salary with commas and currency symbol
  const formatSalary = (salary: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(salary);
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
  const [militaryBranch, setMilitaryBranch] = useState<MilitaryBranch>(null);
  const [gapYearActivity, setGapYearActivity] = useState<GapYearActivity>(null);
  const [needsGuidance, setNeedsGuidance] = useState<boolean | null>(null);
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState<string | null>(null);
  const [hasSpecificSchool, setHasSpecificSchool] = useState<boolean | null>(null);
  
  // Track whether the user came through the guided path for proper flow separation
  const [guidedPathComplete, setGuidedPathComplete] = useState<boolean>(false);
  
  // This will store the personalized narrative based on user selections
  const [userJourney, setUserJourney] = useState<string>("After high school, I am interested in...");
  const [specificSchool, setSpecificSchool] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [careerSearchQuery, setCareerSearchQuery] = useState<string>('');
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [filteredCareerPaths, setFilteredCareerPaths] = useState<CareerPath[] | null>(null);
  const [globalCareerSearch, setGlobalCareerSearch] = useState<boolean>(false);
  
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
  
  // School search query using our new college search API with education type filter
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery<any[]>({
    queryKey: ['/api/colleges/search', searchQuery, educationType],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const url = `/api/colleges/search?q=${encodeURIComponent(searchQuery)}${educationType ? `&educationType=${educationType}` : ''}`;
      console.log(`Searching colleges with query: ${searchQuery}, educationType: ${educationType || 'all'}`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search colleges');
      }
      return response.json();
    },
    enabled: !!searchQuery && searchQuery.length > 2
  });

  const handlePathSelect = (path: PathChoice) => {
    setSelectedPath(path);
    // Automatically set default sub-types based on selection
    if (isEducationPath(path)) {
      setEducationType('4year'); // Default to 4-year college
    } else if (path === 'job') {
      setJobType('fulltime'); // Default to full-time job
    } else if (path === 'military') {
      setMilitaryBranch('army'); // Default to Army
    } else if (path === 'gap') {
      setGapYearActivity('travel'); // Default to travel
    }
  };
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStartOver = () => {
    setCurrentStep(1);
    setSelectedPath(null);
    setEducationType(null);
    setJobType(null);
    setMilitaryBranch(null);
    setGapYearActivity(null);
    setNeedsGuidance(null);
    setSelectedFieldOfStudy(null);
    setHasSpecificSchool(null);
    setSpecificSchool('');
    setSearchQuery('');
    setSelectedProfession(null);
    setExplorationMethod(null);
    setGuidedPathComplete(false); // Reset the guided path completion flag
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
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary"
                    onClick={() => {
                      setExplorationMethod('swipe');
                      // Clear previous results
                      setSwipeResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-green-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">swipe</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Swipe Cards</h3>
                      <p className="text-sm text-gray-600">Swipe left or right on different interests, values and lifestyle options</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary"
                    onClick={() => {
                      setExplorationMethod('wheel');
                      // Clear previous results
                      setWheelResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-secondary h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">casino</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Identity Wheel</h3>
                      <p className="text-sm text-gray-600">Spin a wheel to discover prompts about your values, talents, fears and wishes</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary"
                    onClick={() => {
                      setExplorationMethod('advancedWheel');
                      // Clear previous results
                      setWheelResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-purple-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">psychology</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Advanced Identity Wheel</h3>
                      <p className="text-sm text-gray-600">Explore deeper aspects of your identity with fun prompts and mini-games</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary"
                    onClick={() => {
                      setExplorationMethod('avatar');
                      // Clear previous results
                      setAvatarResults({});
                      // Increment reset counter to ensure component remounts with fresh state
                      setResetCounter(prev => prev + 1);
                      handleNext(); // Automatically proceed to next step
                    }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-green-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">face</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Future Self Avatar</h3>
                      <p className="text-sm text-gray-600">Create a personalized avatar that represents your future self</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-primary"
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
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-yellow-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">toys</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Quick Spin Game</h3>
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
              
              // Determine job type based on recommendation
              if (id === 'trades') {
                setJobType('apprenticeship');
              } else {
                setJobType('fulltime');
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
            <Step title="What type of job are you looking for?">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div 
                  className={`border ${jobType === 'fulltime' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setJobType('fulltime')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${jobType === 'fulltime' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${jobType === 'fulltime' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">business_center</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${jobType === 'fulltime' ? 'text-primary' : ''}`}>Full-Time Job</h5>
                      <p className="text-sm text-gray-600">40+ hours per week</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${jobType === 'parttime' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setJobType('parttime')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${jobType === 'parttime' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${jobType === 'parttime' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">schedule</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${jobType === 'parttime' ? 'text-primary' : ''}`}>Part-Time Job</h5>
                      <p className="text-sm text-gray-600">Less than 40 hours per week</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${jobType === 'apprenticeship' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setJobType('apprenticeship')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${jobType === 'apprenticeship' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${jobType === 'apprenticeship' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">construction</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${jobType === 'apprenticeship' ? 'text-primary' : ''}`}>Apprenticeship</h5>
                      <p className="text-sm text-gray-600">On-the-job training</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {jobType && (
                <>
                  <div className="mt-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
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
                                  jobType === 'fulltime' ? 'full-time job' : 
                                  jobType === 'parttime' ? 'part-time job' : 'apprenticeship'
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
                          {/* Filter careers that match the query AND job type */}
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
                              
                              // Match job type (this could be expanded with more accurate filtering)
                              // For now, we'll simplify by assuming category or education hints at job type
                              const matchesJobType = 
                                jobType === 'fulltime' ? true : // most careers are full-time eligible
                                jobType === 'parttime' ? 
                                  career.category?.toLowerCase().includes('service') || 
                                  career.category?.toLowerCase().includes('retail') ||
                                  career.category?.toLowerCase().includes('food') ||
                                  career.category?.toLowerCase().includes('hospitality') : 
                                jobType === 'apprenticeship' ?
                                  career.category?.toLowerCase().includes('trade') ||
                                  career.category?.toLowerCase().includes('construction') ||
                                  career.category?.toLowerCase().includes('manufacturing') ||
                                  career.education?.toLowerCase().includes('vocational') ||
                                  career.education?.toLowerCase().includes('certificate') : 
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
                                  
                                  // Update narrative
                                  setUserJourney(`After high school, I am interested in finding a ${
                                    jobType === 'fulltime' ? 'full-time job' : 
                                    jobType === 'parttime' ? 'part-time job' : 'apprenticeship'
                                  } as a ${career.title}.`);
                                  
                                  // Move to next step if there's one
                                  // handleNext();
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
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      onClick={handleNext}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Next Step
                    </Button>
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
            <Step title="What do you plan to do during your gap year?">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={`border ${gapYearActivity === 'travel' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => {
                    setGapYearActivity('travel');
                    setUserJourney("After high school, I am interested in taking a gap year to travel and explore new places and cultures.");
                    handleNext(); // Auto-advance
                  }}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${gapYearActivity === 'travel' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'travel' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">flight_takeoff</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${gapYearActivity === 'travel' ? 'text-primary' : ''}`}>Travel</h5>
                      <p className="text-sm text-gray-600">Explore new places and cultures</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${gapYearActivity === 'volunteer' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => {
                    setGapYearActivity('volunteer');
                    setUserJourney("After high school, I am interested in taking a gap year to volunteer and give back to the community.");
                    handleNext(); // Auto-advance
                  }}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${gapYearActivity === 'volunteer' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'volunteer' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">volunteer_activism</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${gapYearActivity === 'volunteer' ? 'text-primary' : ''}`}>Volunteer</h5>
                      <p className="text-sm text-gray-600">Give back to the community</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${gapYearActivity === 'other' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => {
                    setGapYearActivity('other');
                    setUserJourney("After high school, I am interested in taking a gap year to learn new skills and pursue my personal interests and hobbies.");
                    handleNext(); // Auto-advance
                  }}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${gapYearActivity === 'other' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'other' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">more_horiz</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${gapYearActivity === 'other' ? 'text-primary' : ''}`}>Other Activities</h5>
                      <p className="text-sm text-gray-600">Learn new skills, pursue hobbies</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {gapYearActivity && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next Step</Button>
                </div>
              )}
            </Step>
          );
        }
        return null;
      
      case 4:
        // Military career path diagram
        if (selectedPath === 'military' && militaryBranch) {
          return (
            <Step 
              title={userJourney} 
              subtitle={`Military career pathway for the ${militaryBranch?.charAt(0).toUpperCase()}${militaryBranch?.slice(1)}`}
            >
              <MilitaryPathway 
                militaryBranch={militaryBranch || 'army'}
                handleBack={handleBack}
                handleNext={handleNext}
              />
            </Step>
          );
        }
        // Gap year pathway diagram
        else if (selectedPath === 'gap' && gapYearActivity) {
          return (
            <Step 
              title={userJourney} 
              subtitle={`Gap year pathway for ${gapYearActivity.charAt(0).toUpperCase()}${gapYearActivity.slice(1)} activities`}
            >
              <GapYearPathway 
                activity={gapYearActivity}
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
        // Field of Study selection step
        if (isEducationPath(selectedPath)) {
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
                          <h4 className="font-medium mb-4">Career Paths in {selectedFieldOfStudy}</h4>
                          
                          {isLoadingFieldPaths ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                              <p className="mt-2 text-sm text-gray-600">Loading career paths...</p>
                            </div>
                          ) : fieldCareerPaths && Array.isArray(fieldCareerPaths) && fieldCareerPaths.length > 0 ? (
                            <div className="space-y-3">
                              {fieldCareerPaths.map((path: CareerPath) => (
                                <Card key={path.id} className="border-gray-200 hover:border-primary transition-colors">
                                  <CardContent className="p-4">
                                    <div className="flex items-center">
                                      <div className="rounded-full bg-primary/10 text-primary h-8 w-8 flex items-center justify-center mr-3 flex-shrink-0">
                                        <span className="font-medium">{path.option_rank}</span>
                                      </div>
                                      <div>
                                        <h5 className="font-medium">{path.career_title}</h5>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm py-4">No career paths found for this field of study</p>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-6">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        {selectedFieldOfStudy && (
                          <Button 
                            onClick={handleNext}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Next: Choose Profession
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
                            Custom Career Search
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
                                  const searchTerm = e.target.value.trim().toLowerCase();
                                  setCareerSearchQuery(e.target.value);
                                  
                                  if (searchTerm) {
                                    if (allCareers && Array.isArray(allCareers)) {
                                      // Always search from all careers
                                      console.log('Searching all careers:', searchTerm);
                                      const filteredCareers = allCareers
                                        .filter((career: any) => 
                                          career.title?.toLowerCase().includes(searchTerm)
                                        )
                                        .map((career: any, index: number) => ({
                                          id: career.id || index,
                                          field_of_study: globalCareerSearch ? 
                                                          (career.category || career.field || "General") : 
                                                          selectedFieldOfStudy || "General",
                                          career_title: career.title,
                                          option_rank: career.rank || index + 1
                                        }));
                                      
                                      // If global search is disabled, only show careers that match the selected field
                                      // or show all if global search is enabled
                                      const finalFilteredCareers = globalCareerSearch ? 
                                        filteredCareers : 
                                        filteredCareers.filter(c => 
                                          !selectedFieldOfStudy || 
                                          c.field_of_study.toLowerCase() === selectedFieldOfStudy.toLowerCase()
                                        );
                                      
                                      setFilteredCareerPaths(finalFilteredCareers);
                                    } else {
                                      console.error('Could not search careers: allCareers is not available');
                                    }
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
                                    setSelectedProfession(careerSearchQuery.trim());
                                    
                                    // Complete the narrative with the searched career
                                    const narrative = `After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${careerSearchQuery.trim()}.`;
                                    setUserJourney(narrative);
                                    localStorage.setItem('userPathwayNarrative', narrative);
                                  }
                                }}
                                className="bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                Use Custom Career
                              </Button>
                              <Button 
                                type="button"
                                onClick={() => setGlobalCareerSearch(!globalCareerSearch)}
                                variant="outline"
                                className={globalCareerSearch ? "bg-blue-100" : ""}
                              >
                                {globalCareerSearch ? "Searching All Fields" : "Search All Fields"}
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
                              }}
                            >
                              Change
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-md font-medium mb-4">
                        {filteredCareerPaths ? 'Search Results:' : 'Available Career Options:'}
                      </h4>
                      
                      {/* Display either filtered careers or all careers */}
                      {(filteredCareerPaths?.length || fieldCareerPaths?.length) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {(filteredCareerPaths || fieldCareerPaths || []).map((path: CareerPath) => (
                            <Card 
                              key={path.id} 
                              className={`border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${selectedProfession === path.career_title ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                              onClick={() => {
                                setSelectedProfession(path.career_title);
                                
                                // Complete the narrative with the selected profession
                                const narrative = `After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${path.career_title}.`;
                                setUserJourney(narrative);
                                localStorage.setItem('userPathwayNarrative', narrative);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center">
                                  <div className={`rounded-full ${selectedProfession === path.career_title ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${selectedProfession === path.career_title ? 'text-white' : 'text-gray-600'} mr-3 flex-shrink-0`}>
                                    <span className="material-icons text-sm">work</span>
                                  </div>
                                  <div>
                                    <h5 className={`font-medium ${selectedProfession === path.career_title ? 'text-primary' : ''}`}>{path.career_title}</h5>
                                    <p className="text-sm text-gray-600">Rank: {path.option_rank}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 border rounded-lg mb-6">
                          <p className="text-gray-500">
                            {filteredCareerPaths ? 'No careers found matching your search.' : 'No career paths found for this field of study'}
                          </p>
                        </div>
                      )}
                      
                      {/* Show a "Clear Search" button when filtered */}
                      {filteredCareerPaths && (
                        <div className="flex justify-center mb-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Clear the search
                              setFilteredCareerPaths(null);
                              setCareerSearchQuery('');
                              setGlobalCareerSearch(false);
                            }}
                          >
                            <span className="material-icons text-sm mr-1">clear</span>
                            Clear Search
                          </Button>
                        </div>
                      )}
                      
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
                                      fieldOfStudy: selectedFieldOfStudy,
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
                            onClick={() => {
                              // Pass the complete narrative to the calculator via localStorage
                              localStorage.setItem('userPathwayNarrative', userJourney);
                              
                              // Redirect to calculator
                              navigate('/calculator');
                            }}
                          >
                            Create Financial Plan
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
      
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/90 to-primary-dark shadow-lg mb-8 p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-cyan-500 to-blue-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIgZD0iTTYwMCAwdjYwMEgwVjBaIi8+PHBhdGggc3Ryb2tlPSIjZmZmZmZmMTAiIGZpbGw9Im5vbmUiIGQ9Ik02MDAgMEgwdjYwMGg2MDBWMFoiLz48cGF0aCBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIgZD0iTTAgMzAwaDYwME0zMDAgMHY2MDAiLz48cGF0aCBkPSJNMCAwdjYwMGw2MDAtNjAwSDBaIiBzdHJva2U9IiNmZmZmZmYxMCIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik02MDAgMHY2MDBMODAwIDYwMFYwSDYwMFoiIHN0cm9rZT0iI2ZmZmZmZjEwIiBmaWxsPSJub25lIi8+PC9zdmc+')]"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Explore Your Pathways</h1>
            <p className="text-white/80 text-lg max-w-xl">
              Chart your course to an empowered future by making informed choices that align with your unique talents and aspirations.
            </p>
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={handleStartOver}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-glow flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <span className="material-icons">refresh</span>
              Start Over
            </Button>
          </div>
        </div>
      </div>
      
      {/* Step indicator - More dynamic and engaging */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute h-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 left-0 right-0 top-1/2 -translate-y-1/2 z-0"></div>
        <div className={`absolute h-1 bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 left-0 right-0 top-1/2 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out`} 
          style={{ width: `${(currentStep - 1) * 20}%` }}></div>
        
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className="z-10 flex flex-col items-center">
            <div 
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 
              ${currentStep >= step 
                ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white scale-110' 
                : 'bg-white text-gray-500 border border-gray-200'}`}
            >
              {step}
            </div>
            <div className={`mt-2 text-xs font-medium transition-all duration-300 ${currentStep >= step ? 'text-primary' : 'text-gray-400'}`}>
              Step {step}
            </div>
          </div>
        ))}
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};

export default Pathways;