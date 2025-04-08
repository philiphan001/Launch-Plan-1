import { useState, useEffect } from "react";
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

// Helper component for step rendering
const Step = ({ children, title, subtitle }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
    <div>{children}</div>
  </div>
);

const Pathways = () => {
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
  
  // State for "Do you need guidance?" step
  const [needsGuidance, setNeedsGuidance] = useState<boolean | null>(null);
  const [explorationMethod, setExplorationMethod] = useState<string>('');
  
  // State for search functionality for schools
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSpecificSchool, setHasSpecificSchool] = useState(false);
  const [specificSchool, setSpecificSchool] = useState('');
  
  // State for field of study and profession selection
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  
  // Track user's narrative journey
  const [userJourney, setUserJourney] = useState<string>('');
  
  // State to track when the guided path games have been completed
  const [guidedPathComplete, setGuidedPathComplete] = useState(false);
  
  // Results from different exploration methods
  const [swipeResults, setSwipeResults] = useState<Record<string, boolean>>({});
  const [wheelResults, setWheelResults] = useState<Record<string, string>>({});
  const [avatarResults, setAvatarResults] = useState<Record<string, string>>({});
  const [quickSpinResults, setQuickSpinResults] = useState<{
    superpower: string;
    ideal_day: string;
    values: string;
    activities: string;
  }>({
    superpower: '',
    ideal_day: '',
    values: '',
    activities: ''
  });
  
  // Reset key to force component remounting
  const [resetKey, setResetKey] = useState(0);
  
  // Query to get search results for colleges
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['/api/colleges/search', searchQuery, educationType],
    enabled: searchQuery.length > 2,
  });
  
  // Query to get all fields of study
  const { data: fieldsOfStudy = [], isLoading: isLoadingAllPaths } = useQuery({
    queryKey: ['/api/career-paths/fields'],
    select: (data: unknown) => 
      Array.from(new Set((data as CareerPath[]).map(path => path.field_of_study))).sort(),
  });
  
  // Query to get career paths for a specific field
  const { data: fieldCareerPaths = [], isLoading: isLoadingFieldPaths } = useQuery({
    queryKey: ['/api/career-paths/by-field', selectedFieldOfStudy],
    enabled: !!selectedFieldOfStudy,
  });
  
  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const selectEducationType = (type: EducationType) => {
    setEducationType(type);
    setSelectedPath('education');
    handleNext();
  };
  
  const handlePathSelect = (path: PathChoice) => {
    setSelectedPath(path);
    
    if (path === 'education') {
      setUserJourney("After high school, I am interested in...");
    } else if (path === 'job') {
      setUserJourney("After high school, I am interested in entering the workforce.");
      setSelectedPath('job');
      handleNext();
    } else if (path === 'military') {
      setUserJourney("After high school, I am interested in joining the military.");
      setSelectedPath('military');
      handleNext();
    } else if (path === 'gap') {
      setUserJourney("After high school, I am interested in taking a gap year.");
      setSelectedPath('gap');
      handleNext();
    }
  };
  
  const handleExplorationMethodSelect = (method: string) => {
    setExplorationMethod(method);
    setResetKey(prevKey => prevKey + 1);
    handleNext();
  };
  
  const handleRestartExploration = () => {
    // Reset all exploration-related state
    setGuidedPathComplete(false);
    setSwipeResults({});
    setWheelResults({});
    setAvatarResults({});
    setQuickSpinResults({
      superpower: '',
      ideal_day: '',
      values: '',
      activities: ''
    });
    
    // Go back to the exploration method selection
    setCurrentStep(3);
  };
  
  // Render different steps based on currentStep
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step 
            title="What would you like to do after high school?" 
            subtitle="Choose a path to explore your options"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${selectedPath === 'education' ? 'border-primary' : 'border-gray-200'}`}
                onClick={() => handlePathSelect('education')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedPath === 'education' ? 'bg-primary' : 'bg-gray-100'} h-10 w-10 flex items-center justify-center mr-3`}>
                      <span className="material-icons text-lg">school</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Continue Education</h3>
                      <p className="text-gray-600 text-sm">College, university, or vocational training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${selectedPath === 'job' ? 'border-primary' : 'border-gray-200'}`}
                onClick={() => handlePathSelect('job')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedPath === 'job' ? 'bg-primary' : 'bg-gray-100'} h-10 w-10 flex items-center justify-center mr-3`}>
                      <span className="material-icons text-lg">work</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Enter Workforce</h3>
                      <p className="text-gray-600 text-sm">Start a job or career</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${selectedPath === 'military' ? 'border-primary' : 'border-gray-200'}`}
                onClick={() => handlePathSelect('military')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedPath === 'military' ? 'bg-primary' : 'bg-gray-100'} h-10 w-10 flex items-center justify-center mr-3`}>
                      <span className="material-icons text-lg">military_tech</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Join Military</h3>
                      <p className="text-gray-600 text-sm">Serve in a branch of the armed forces</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border-2 cursor-pointer transition-all hover:shadow-md ${selectedPath === 'gap' ? 'border-primary' : 'border-gray-200'}`}
                onClick={() => handlePathSelect('gap')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`rounded-full ${selectedPath === 'gap' ? 'bg-primary' : 'bg-gray-100'} h-10 w-10 flex items-center justify-center mr-3`}>
                      <span className="material-icons text-lg">explore</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Gap Year</h3>
                      <p className="text-gray-600 text-sm">Travel, volunteer, or personal development</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {selectedPath && (
              <div className="mt-6">
                <Button 
                  onClick={handleNext} 
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Continue
                </Button>
              </div>
            )}
          </Step>
        );
      
      case 2:
        if (needsGuidance) {
          return (
            <Step 
              title="How would you like to explore?" 
              subtitle="Choose an exploration method that interests you"
            >
              <div className="mt-4 space-y-4">
                <Card 
                  className="border cursor-pointer hover:shadow-md transition"
                  onClick={() => handleExplorationMethodSelect('quickSpin')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-3 mr-4">
                        <span className="material-icons">psychology</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Quick Self-Discovery</h3>
                        <p className="text-sm text-gray-600">Answer a few questions about yourself</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border cursor-pointer hover:shadow-md transition"
                  onClick={() => handleExplorationMethodSelect('swipe')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="bg-green-100 text-green-600 rounded-full p-3 mr-4">
                        <span className="material-icons">swipe</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Interest Cards</h3>
                        <p className="text-sm text-gray-600">Swipe through activities and interests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border cursor-pointer hover:shadow-md transition"
                  onClick={() => handleExplorationMethodSelect('wheel')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="bg-purple-100 text-purple-600 rounded-full p-3 mr-4">
                        <span className="material-icons">sports_esports</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Spin the Wheel</h3>
                        <p className="text-sm text-gray-600">Answer random questions about your preferences</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border cursor-pointer hover:shadow-md transition"
                  onClick={() => handleExplorationMethodSelect('advancedWheel')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-600 rounded-full p-3 mr-4">
                        <span className="material-icons">insights</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Deep Dive Wheel</h3>
                        <p className="text-sm text-gray-600">In-depth exploration of your values and aspirations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border cursor-pointer hover:shadow-md transition"
                  onClick={() => handleExplorationMethodSelect('avatar')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="bg-amber-100 text-amber-600 rounded-full p-3 mr-4">
                        <span className="material-icons">person</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Future Self Avatar</h3>
                        <p className="text-sm text-gray-600">Create an avatar of your future self</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>Back</Button>
              </div>
            </Step>
          );
        } else {
          // Direct path - choose education type when selected path is education
          if (isEducationPath(selectedPath)) {
            return (
              <Step 
                title="What type of education are you interested in?" 
                subtitle="Choose the type of education you want to pursue"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <Card 
                    className="border-2 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => selectEducationType('4year')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                          <span className="material-icons">school</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">4-Year College/University</h3>
                          <p className="text-gray-600 text-sm">Bachelor's degree programs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="border-2 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => selectEducationType('2year')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                          <span className="material-icons">menu_book</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">2-Year College</h3>
                          <p className="text-gray-600 text-sm">Associate's degree programs</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="border-2 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => selectEducationType('vocational')}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-amber-100 text-amber-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                          <span className="material-icons">construction</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">Vocational/Trade School</h3>
                          <p className="text-gray-600 text-sm">Specialized skills training</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => {
                      setNeedsGuidance(true);
                      handleNext();
                    }}
                  >
                    Help me with ideas
                  </Button>
                </div>
              </Step>
            );
          }
          
          // Direct paths for other options - will implement their specific steps later
          return (
            <Step 
              title={`Let's explore your ${selectedPath} path`} 
              subtitle="We'll help you plan your next steps"
            >
              <Card className="mt-4">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="rounded-full bg-blue-100 text-blue-600 h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      {selectedPath === 'job' && <span className="material-icons text-2xl">work</span>}
                      {selectedPath === 'military' && <span className="material-icons text-2xl">military_tech</span>}
                      {selectedPath === 'gap' && <span className="material-icons text-2xl">explore</span>}
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      {selectedPath === 'job' && 'Entering the Workforce'}
                      {selectedPath === 'military' && 'Military Service'}
                      {selectedPath === 'gap' && 'Taking a Gap Year'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedPath === 'job' && 
                        'Starting your career right away can provide valuable experience and help you save money.'}
                      {selectedPath === 'military' && 
                        'Military service offers training, education benefits, and the opportunity to serve your country.'}
                      {selectedPath === 'gap' && 
                        'Taking a gap year can provide time for personal growth, exploration, and clarity about your future goals.'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedPath === 'job' && (
                      <div>
                        <h4 className="font-medium mb-2">What type of job are you interested in?</h4>
                        <div className="space-y-2">
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${jobType === 'fulltime' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setJobType('fulltime')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${jobType === 'fulltime' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Full-time employment</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${jobType === 'parttime' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setJobType('parttime')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${jobType === 'parttime' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Part-time work</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${jobType === 'apprenticeship' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setJobType('apprenticeship')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${jobType === 'apprenticeship' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Apprenticeship or on-the-job training</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPath === 'military' && (
                      <div>
                        <h4 className="font-medium mb-2">Which branch of the military interests you?</h4>
                        <div className="space-y-2">
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'army' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('army')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'army' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Army</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'navy' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('navy')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'navy' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Navy</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'airforce' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('airforce')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'airforce' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Air Force</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'marines' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('marines')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'marines' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Marines</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'coastguard' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('coastguard')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'coastguard' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Coast Guard</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${militaryBranch === 'spaceguard' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setMilitaryBranch('spaceguard')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${militaryBranch === 'spaceguard' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Space Force</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedPath === 'gap' && (
                      <div>
                        <h4 className="font-medium mb-2">What would you like to do during your gap year?</h4>
                        <div className="space-y-2">
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${gapYearActivity === 'travel' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setGapYearActivity('travel')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${gapYearActivity === 'travel' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Travel and explore</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${gapYearActivity === 'volunteer' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setGapYearActivity('volunteer')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${gapYearActivity === 'volunteer' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Volunteer or service</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${gapYearActivity === 'work' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setGapYearActivity('work')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${gapYearActivity === 'work' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Work and save money</div>
                            </div>
                          </div>
                          <div 
                            className={`border p-3 rounded-md cursor-pointer hover:bg-gray-50 ${gapYearActivity === 'other' ? 'border-primary bg-blue-50' : ''}`}
                            onClick={() => setGapYearActivity('other')}
                          >
                            <div className="flex items-center">
                              <div className={`h-5 w-5 rounded-full border ${gapYearActivity === 'other' ? 'bg-primary border-primary' : 'border-gray-300'} mr-2`}></div>
                              <div>Other personal development</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {
                        setNeedsGuidance(true);
                        handleNext();
                      }}
                    >
                      Help me with ideas
                    </Button>
                    {(jobType || militaryBranch || gapYearActivity) && (
                      <Button 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => navigate('/calculator')}
                      >
                        Continue to Financial Planner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        }
      
      case 3: {
        // When starting over, make sure to reset the guidedPathComplete flag
        if (currentStep === 3 && guidedPathComplete && !needsGuidance) {
          // Reset the guidedPathComplete flag when explicitly returning to step 3 in direct path
          setGuidedPathComplete(false);
        }
        
        if (needsGuidance) {
          // Check if we have results for the selected exploration method and set flag accordingly
          useEffect(() => {
            const hasCompletedGame = 
              (explorationMethod === 'swipe' && Object.keys(swipeResults).length > 0) ||
              (explorationMethod === 'wheel' && Object.keys(wheelResults).length > 0) ||
              (explorationMethod === 'advancedWheel' && Object.keys(wheelResults).length > 0) ||
              (explorationMethod === 'avatar' && Object.keys(avatarResults).length > 0) ||
              (explorationMethod === 'quickSpin' && quickSpinResults.superpower !== '');
            
            if (hasCompletedGame) {
              setGuidedPathComplete(true);
            }
          }, [explorationMethod, swipeResults, wheelResults, avatarResults, quickSpinResults]);
          
          // Helper function to handle selections from recommendations
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
                avatarPreferences['strategic_thinking'] = true;
              } else if (avatarResults.avatar_personality === 'social') {
                avatarPreferences['working_with_people'] = true;
                avatarPreferences['team_collaboration'] = true;
              } else if (avatarResults.avatar_personality === 'practical') {
                avatarPreferences['outdoor_work'] = true;
                avatarPreferences['building_creating'] = true;
              }
              
              // Map income preferences
              if (avatarResults.avatar_income === 'high') {
                avatarPreferences['strategic_thinking'] = true;
                avatarPreferences['entrepreneurship'] = true;
              } else if (avatarResults.avatar_income === 'stable') {
                avatarPreferences['team_collaboration'] = true;
                avatarPreferences['problem_solving'] = true;
              }
              
              // Map lifestyle preferences
              if (avatarResults.avatar_lifestyle === 'active') {
                avatarPreferences['outdoor_work'] = true;
              } else if (avatarResults.avatar_lifestyle === 'balanced') {
                avatarPreferences['team_collaboration'] = true;
              } else if (avatarResults.avatar_lifestyle === 'creative') {
                avatarPreferences['artistic_expression'] = true;
              } else if (avatarResults.avatar_lifestyle === 'social') {
                avatarPreferences['working_with_people'] = true;
              }
            }
            
            return avatarPreferences;
          };
          
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
          
          // Determine which exploration tool to render
          switch (explorationMethod) {
            case 'swipe':
              return (
                <Step 
                  title={
                    guidedPathComplete 
                      ? "Here are your personalized recommendations"
                      : "Swipe through these cards to help us understand your interests"
                  } 
                  subtitle={
                    guidedPathComplete 
                      ? "Based on your preferences, these paths might be a good fit"
                      : "Swipe right if something interests you, left if it doesn't"
                  }
                >
                  {guidedPathComplete ? (
                    <RecommendationEngine 
                      preferences={swipeResults} 
                      onSelectPath={handleSelectPath}
                    />
                  ) : (
                    <SwipeableScenarios
                      key={resetKey}
                      onComplete={(results) => {
                        setSwipeResults(results);
                        setGuidedPathComplete(true);
                      }}
                    />
                  )}
                </Step>
              );
              
            case 'wheel':
              return (
                <Step 
                  title={
                    guidedPathComplete 
                      ? "Here are your personalized recommendations"
                      : "Spin the wheel to explore your interests"
                  } 
                  subtitle={
                    guidedPathComplete 
                      ? "Based on your choices, these paths might be a good fit"
                      : "Answer questions to help discover what paths might interest you"
                  }
                >
                  {guidedPathComplete ? (
                    <RecommendationEngine 
                      preferences={convertWheelResultsToPreferences()} 
                      onSelectPath={handleSelectPath}
                    />
                  ) : (
                    <IdentityWheel
                      key={resetKey}
                      onComplete={(results) => {
                        setWheelResults(results);
                        setGuidedPathComplete(true);
                      }}
                    />
                  )}
                </Step>
              );
              
            case 'advancedWheel':
              return (
                <Step 
                  title={
                    guidedPathComplete 
                      ? "Here are your personalized recommendations"
                      : "Deep dive into your values and aspirations"
                  } 
                  subtitle={
                    guidedPathComplete 
                      ? "Based on your values, these paths might be a good fit"
                      : "Answer questions to explore what truly matters to you"
                  }
                >
                  {guidedPathComplete ? (
                    <RecommendationEngine 
                      preferences={convertWheelResultsToPreferences()} 
                      onSelectPath={handleSelectPath}
                    />
                  ) : (
                    <AdvancedWheel
                      key={resetKey}
                      onComplete={(results) => {
                        setWheelResults(results);
                        setGuidedPathComplete(true);
                      }}
                    />
                  )}
                </Step>
              );
              
            case 'avatar':
              return (
                <Step 
                  title={
                    guidedPathComplete 
                      ? "Here are your personalized recommendations"
                      : "Create your future self avatar"
                  } 
                  subtitle={
                    guidedPathComplete 
                      ? "Based on your future self vision, these paths might be a good fit"
                      : "Visualize where you want to be in the future"
                  }
                >
                  {guidedPathComplete ? (
                    <RecommendationEngine 
                      preferences={convertAvatarResultsToPreferences()} 
                      onSelectPath={handleSelectPath}
                    />
                  ) : (
                    <AvatarCreator
                      key={resetKey}
                      onComplete={(results) => {
                        setAvatarResults(results);
                        setGuidedPathComplete(true);
                      }}
                    />
                  )}
                </Step>
              );
              
            case 'quickSpin':
              return (
                <Step 
                  title={
                    guidedPathComplete 
                      ? "Here are your personalized recommendations"
                      : "Quick self-discovery questions"
                  } 
                  subtitle={
                    guidedPathComplete 
                      ? "Based on your answers, these paths might be a good fit"
                      : "Answer a few questions to help us understand your interests"
                  }
                >
                  {guidedPathComplete ? (
                    <RecommendationEngine 
                      preferences={convertQuickSpinResultsToPreferences()} 
                      onSelectPath={handleSelectPath}
                    />
                  ) : (
                    <QuickSpinWheel
                      key={resetKey}
                      onComplete={(results) => {
                        // Make sure results conform to our expected structure
                        const formattedResults = {
                          superpower: results.superpower || '',
                          ideal_day: results.ideal_day || '',
                          values: results.values || '',
                          activities: results.activities || ''
                        };
                        setQuickSpinResults(formattedResults);
                        setGuidedPathComplete(true);
                      }}
                    />
                  )}
                </Step>
              );
              
            default: {
              return (
                <Step 
                  title="Let's explore your options" 
                  subtitle="Choose an exploration method to continue"
                >
                  <div className="text-center py-8">
                    <Button 
                      onClick={handleBack}
                      className="bg-primary"
                    >
                      Go back to select an exploration method
                    </Button>
                  </div>
                </Step>
              );
            }
          }
        } else {
          return (
            <Step 
              title="Do you need guidance choosing a path?" 
              subtitle="We can help you explore options based on your interests"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card 
                  className="border-2 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    setNeedsGuidance(true);
                    handleNext();
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-orange-100 text-orange-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                        <span className="material-icons">psychology</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">Yes, I'd like help</h3>
                        <p className="text-gray-600 text-sm">Explore your interests and get personalized suggestions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="border-2 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => {
                    setNeedsGuidance(false);
                    handleBack();
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-600 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                        <span className="material-icons">map</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">No, I know where I'm headed</h3>
                        <p className="text-gray-600 text-sm">Continue with your selected path</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>Back</Button>
              </div>
            </Step>
          );
        }
      }
      
      case 4: {
        // Do you have a specific school in mind?
        if (isEducationPath(selectedPath) && educationType) {
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
                    <p className="text-gray-600 mb-2">Search for your school:</p>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="text" 
                        placeholder="Type school name..." 
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setSearchQuery(e.target.value);
                          setHasSpecificSchool(true);
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  {searchQuery.length > 2 && (
                    <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                      {isLoadingSearch ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Searching schools...</p>
                        </div>
                      ) : searchResults && Array.isArray(searchResults) && searchResults.length > 0 ? (
                        searchResults.map((school: any) => (
                          <div 
                            key={school.id} 
                            className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSpecificSchool(school.name);
                              setSearchQuery('');
                              
                              // Update the narrative to include the selected school
                              const schoolType = educationType === '4year' ? 'attending' : 
                                                educationType === '2year' ? 'attending' : 
                                                'attending';
                              setUserJourney(`After high school, I am interested in ${schoolType} ${school.name} where I am interested in studying...`);
                              
                              // Automatically proceed to field of study step
                              handleNext();
                            }}
                          >
                            <p className="font-medium">{school.name}</p>
                            <p className="text-sm text-gray-600">{school.city}, {school.state}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-gray-500">
                          {searchQuery.length > 0 ? 'No schools found. Try a different search term.' : 'Type to search for schools'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {specificSchool && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">Selected School:</p>
                        <p>{specificSchool}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSpecificSchool('');
                          setSearchQuery('');
                        }}
                      >
                        Change
                      </Button>
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
        return null;
      }
      
      case 5: {
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
                        <Select 
                          value={selectedFieldOfStudy || ""}
                          onValueChange={(value) => {
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
                            {fieldsOfStudy.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
      }
      
      case 6: {
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
                      
                      {fieldCareerPaths && Array.isArray(fieldCareerPaths) && fieldCareerPaths.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {fieldCareerPaths.map((path: CareerPath) => (
                            <Card 
                              key={path.id} 
                              className={`border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${selectedProfession === path.career_title ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                              onClick={() => {
                                setSelectedProfession(path.career_title);
                                
                                // Complete the narrative with the selected profession
                                setUserJourney(`After high school, I am interested in attending ${specificSchool || (educationType === '4year' ? 'a 4-year college' : educationType === '2year' ? 'a 2-year college' : 'a vocational school')} where I am interested in studying ${selectedFieldOfStudy} to become a ${path.career_title}.`);
                                
                                // Store the narrative in localStorage for use in the calculator
                                localStorage.setItem('userPathwayNarrative', userJourney);
                                
                                // Delay navigation to give visual feedback that the option was selected
                                setTimeout(() => {
                                  navigate('/calculator');
                                }, 500);
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
                        <div className="text-center py-8">
                          <p className="text-gray-600">No career paths found for this field of study. Try selecting a different field.</p>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>Back</Button>
                        {selectedProfession && (
                          <Button 
                            className="bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => navigate('/calculator')}
                          >
                            Continue to Financial Planner
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
        return null;
      }
      
      default: {
        return (
          <Step 
            title="Let's get started" 
            subtitle="We'll help you explore options and make plans"
          >
            <div className="text-center py-8">
              <Button 
                onClick={() => setCurrentStep(1)}
                className="bg-primary"
              >
                Start Exploration
              </Button>
            </div>
          </Step>
        );
      }
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pathway Explorer</h1>
        <p className="text-gray-600">Discover your post-high school options</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Pathways;