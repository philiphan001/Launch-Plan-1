import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwipeableScenarios from "@/components/pathways/SwipeableScenarios";
import RecommendationEngine from "@/components/pathways/RecommendationEngine";
import IdentityWheel from "@/components/pathways/IdentityWheel";
import AdvancedWheel from "@/components/pathways/AdvancedWheel";
import AvatarCreator from "@/components/pathways/AvatarCreator";

type PathChoice = "education" | "job" | "military" | "gap";
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
  <div className="mb-6">
    <h4 className="text-gray-800 font-medium mb-1">{title}</h4>
    {subtitle && <p className="text-sm text-gray-500 mb-3">{subtitle}</p>}
    {children}
  </div>
);

const Pathways = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<PathChoice | null>(null);
  const [educationType, setEducationType] = useState<EducationType>(null);
  const [jobType, setJobType] = useState<JobType>(null);
  const [militaryBranch, setMilitaryBranch] = useState<MilitaryBranch>(null);
  const [gapYearActivity, setGapYearActivity] = useState<GapYearActivity>(null);
  const [needsGuidance, setNeedsGuidance] = useState<boolean | null>(null);
  const [selectedFieldOfStudy, setSelectedFieldOfStudy] = useState<string | null>(null);
  const [swipeResults, setSwipeResults] = useState<Record<string, boolean>>({});
  const [wheelResults, setWheelResults] = useState<Record<string, string>>({});
  const [explorationMethod, setExplorationMethod] = useState<'swipe' | 'wheel' | 'advancedWheel' | 'avatar' | null>(null);
  const [avatarResults, setAvatarResults] = useState<Record<string, string>>({});
  
  // Fetch all career paths for the field selection dropdown
  const { data: allCareerPaths, isLoading: isLoadingAllPaths } = useQuery({
    queryKey: ['/api/career-paths'],
    enabled: currentStep === 4 && educationType === '4year'
  });
  
  // Get unique fields of study from the career paths
  const fieldsOfStudy = allCareerPaths && Array.isArray(allCareerPaths)
    ? Array.from(new Set(allCareerPaths.map((path: CareerPath) => path.field_of_study))).sort() 
    : [];
  
  // Fetch career paths for a specific field when selected
  const { data: fieldCareerPaths, isLoading: isLoadingFieldPaths } = useQuery({
    queryKey: ['/api/career-paths/field', selectedFieldOfStudy],
    enabled: !!selectedFieldOfStudy && currentStep === 4
  });

  const handlePathSelect = (path: PathChoice) => {
    setSelectedPath(path);
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
    setExplorationMethod(null);
    setSwipeResults({});
    setWheelResults({});
    setAvatarResults({});
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step title="How would you like to plan your future?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card 
                className={`cursor-pointer transition-colors hover:border-primary ${needsGuidance === false ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setNeedsGuidance(false)}
              >
                <CardContent className="p-6 text-center">
                  <div className="rounded-full bg-primary h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                    <span className="material-icons text-2xl">map</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">I know what I want to do</h3>
                  <p className="text-sm text-gray-600">I have a clear path in mind after high school</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-colors hover:border-primary ${needsGuidance === true ? 'border-primary bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setNeedsGuidance(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="rounded-full bg-secondary h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                    <span className="material-icons text-2xl">help_outline</span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Help me with ideas</h3>
                  <p className="text-sm text-gray-600">I'm not sure what I want to do after high school</p>
                </CardContent>
              </Card>
            </div>
            
            {needsGuidance !== null && (
              <div className="flex justify-end">
                <Button onClick={handleNext}>Next Step</Button>
              </div>
            )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card 
                    className="cursor-pointer transition-colors hover:border-primary hover:shadow-md"
                    onClick={() => setExplorationMethod('swipe')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-primary h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">swipe</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Swipe Cards</h3>
                      <p className="text-sm text-gray-600 mb-4">Swipe left or right on different interests, values and lifestyle options</p>
                      <Button variant="outline" size="sm">Select This Method</Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-colors hover:border-primary hover:shadow-md"
                    onClick={() => setExplorationMethod('wheel')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-secondary h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">casino</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Identity Wheel</h3>
                      <p className="text-sm text-gray-600 mb-4">Spin a wheel to discover prompts about your values, talents, fears and wishes</p>
                      <Button variant="outline" size="sm">Select This Method</Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-colors hover:border-primary hover:shadow-md"
                    onClick={() => setExplorationMethod('advancedWheel')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-purple-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">psychology</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Advanced Identity Wheel</h3>
                      <p className="text-sm text-gray-600 mb-4">Explore deeper aspects of your identity with fun prompts and mini-games</p>
                      <Button variant="outline" size="sm">Select This Method</Button>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-colors hover:border-primary hover:shadow-md"
                    onClick={() => setExplorationMethod('avatar')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="rounded-full bg-green-500 h-16 w-16 flex items-center justify-center text-white mx-auto mb-4">
                        <span className="material-icons text-2xl">face</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">Future Self Avatar</h3>
                      <p className="text-sm text-gray-600 mb-4">Create a personalized avatar that represents your future self</p>
                      <Button variant="outline" size="sm">Select This Method</Button>
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
                      onComplete={(results) => {
                        setSwipeResults(results);
                        handleNext();
                      }} 
                    />
                  </CardContent>
                </Card>
              </Step>
            );
          } else if (explorationMethod === 'wheel') {
            return (
              <Step 
                title="Spin the Wheel of Identity" 
                subtitle="Discover what matters most to you through fun prompts and questions"
              >
                <Card>
                  <CardContent className="p-6">
                    <IdentityWheel 
                      onComplete={(results) => {
                        setWheelResults(results);
                        handleNext();
                      }}
                    />
                  </CardContent>
                </Card>
              </Step>
            );
          } else if (explorationMethod === 'advancedWheel') {
            return (
              <Step 
                title="Spin the Advanced Identity Wheel" 
                subtitle="Explore deeper aspects of your identity with fun prompts and mini-games"
              >
                <Card>
                  <CardContent className="p-6">
                    <AdvancedWheel 
                      onComplete={(results) => {
                        setWheelResults(results);
                        handleNext();
                      }}
                    />
                  </CardContent>
                </Card>
              </Step>
            );
          } else if (explorationMethod === 'avatar') {
            return (
              <Step 
                title="Create Your Future Self" 
                subtitle="Design an avatar that represents who you want to become"
              >
                <Card>
                  <CardContent className="p-6">
                    <AvatarCreator 
                      onComplete={(results) => {
                        setAvatarResults(results);
                        handleNext();
                      }}
                    />
                  </CardContent>
                </Card>
              </Step>
            );
          }
        } else {
          return (
            <Step title="What would you like to do after high school?">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  className={`border ${selectedPath === 'education' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                  onClick={() => handlePathSelect('education')}
                >
                  <div className={`rounded-full ${selectedPath === 'education' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'education' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                    <span className="material-icons">school</span>
                  </div>
                  <h5 className={`font-medium ${selectedPath === 'education' ? 'text-primary' : ''}`}>Continue Education</h5>
                  <p className="text-sm text-gray-600 mt-1">Pursue college or other learning</p>
                </div>
                
                <div 
                  className={`border ${selectedPath === 'job' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                  onClick={() => handlePathSelect('job')}
                >
                  <div className={`rounded-full ${selectedPath === 'job' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'job' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                    <span className="material-icons">work</span>
                  </div>
                  <h5 className={`font-medium ${selectedPath === 'job' ? 'text-primary' : ''}`}>Get a Job</h5>
                  <p className="text-sm text-gray-600 mt-1">Enter the workforce</p>
                </div>
                
                <div 
                  className={`border ${selectedPath === 'military' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                  onClick={() => handlePathSelect('military')}
                >
                  <div className={`rounded-full ${selectedPath === 'military' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'military' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                    <span className="material-icons">military_tech</span>
                  </div>
                  <h5 className={`font-medium ${selectedPath === 'military' ? 'text-primary' : ''}`}>Join Military</h5>
                  <p className="text-sm text-gray-600 mt-1">Serve in armed forces</p>
                </div>
                
                <div 
                  className={`border ${selectedPath === 'gap' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors text-center`}
                  onClick={() => handlePathSelect('gap')}
                >
                  <div className={`rounded-full ${selectedPath === 'gap' ? 'bg-primary' : 'bg-gray-200'} h-12 w-12 flex items-center justify-center ${selectedPath === 'gap' ? 'text-white' : 'text-gray-600'} mx-auto mb-3`}>
                    <span className="material-icons">explore</span>
                  </div>
                  <h5 className={`font-medium ${selectedPath === 'gap' ? 'text-primary' : ''}`}>Take a Gap Year</h5>
                  <p className="text-sm text-gray-600 mt-1">Explore before deciding</p>
                </div>
              </div>
              
              {selectedPath && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next Step</Button>
                </div>
              )}
            </Step>
          );
        }
      
      case 3:
        if (needsGuidance) {
          const handleSelectPath = (pathType: 'education' | 'career' | 'lifestyle', id: string) => {
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
          
          // Determine which results to use based on the exploration method
          let preferences: Record<string, boolean>;
          
          if (explorationMethod === 'wheel' || explorationMethod === 'advancedWheel') {
            preferences = convertWheelResultsToPreferences();
          } else if (explorationMethod === 'avatar') {
            preferences = convertAvatarResultsToPreferences();
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
                    <Button variant="outline" onClick={handleBack}>Back</Button>
                    <Button variant="outline" onClick={handleStartOver}>Start Over</Button>
                  </div>
                </CardContent>
              </Card>
            </Step>
          );
        } else if (selectedPath === 'education') {
          return (
            <Step title="What type of education are you interested in?">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border ${educationType === '4year' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setEducationType('4year')}
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
                  onClick={() => setEducationType('2year')}
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
                  onClick={() => setEducationType('vocational')}
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
              
              {educationType && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next Step</Button>
                </div>
              )}
            </Step>
          );
        } else if (selectedPath === 'job') {
          return (
            <Step title="What type of job are you looking for?">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next Step</Button>
                </div>
              )}
            </Step>
          );
        } else if (selectedPath === 'military') {
          return (
            <Step title="Which military branch are you interested in?">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`border ${militaryBranch === 'army' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setMilitaryBranch('army')}
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
                  onClick={() => setMilitaryBranch('navy')}
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
                  onClick={() => setMilitaryBranch('airforce')}
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
                  onClick={() => setMilitaryBranch('marines')}
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
                  onClick={() => setMilitaryBranch('coastguard')}
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
                  onClick={() => setMilitaryBranch('spaceguard')}
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
                  <Button onClick={handleNext}>Next Step</Button>
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
                  onClick={() => setGapYearActivity('travel')}
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
                  onClick={() => setGapYearActivity('volunteer')}
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
                  className={`border ${gapYearActivity === 'work' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setGapYearActivity('work')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${gapYearActivity === 'work' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'work' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">payments</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${gapYearActivity === 'work' ? 'text-primary' : ''}`}>Work</h5>
                      <p className="text-sm text-gray-600">Save money for future plans</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${gapYearActivity === 'other' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setGapYearActivity('other')}
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
        if (educationType === '4year') {
          return (
            <Step title="Explore Career Paths by Field of Study" subtitle="Select a field of study to see potential career paths">
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
                          onValueChange={(value) => setSelectedFieldOfStudy(value)}
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
                          ) : fieldCareerPaths && fieldCareerPaths.length > 0 ? (
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
                        <Button onClick={handleStartOver}>Explore Another Path</Button>
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
                      {selectedPath === 'education' && educationType === '2year' && 'Pursuing a 2-year college degree can be a great way to enter the workforce quickly or transfer to a 4-year program later.'}
                      {selectedPath === 'education' && educationType === 'vocational' && 'Vocational training provides specialized skills that are in high demand in many industries.'}
                      {selectedPath === 'job' && 'Entering the workforce directly can provide valuable experience and help you save money.'}
                      {selectedPath === 'military' && 'Military service offers training, education benefits, and the opportunity to serve your country.'}
                      {selectedPath === 'gap' && 'A gap year can provide time for personal growth and clarity about your future goals.'}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <h4 className="font-medium">Resources to explore:</h4>
                    <ul className="space-y-2 text-sm">
                      {selectedPath === 'education' && educationType === '2year' && (
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
                      
                      {selectedPath === 'education' && educationType === 'vocational' && (
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
                    <Button onClick={handleStartOver}>Explore Another Path</Button>
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Explore Your Pathways</h1>
      
      {/* Step indicator */}
      <div className="flex items-center mb-8">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
          1
        </div>
        <div className={`h-1 flex-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
          2
        </div>
        <div className={`h-1 flex-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
          3
        </div>
        <div className={`h-1 flex-1 ${currentStep >= 4 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${currentStep >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
          4
        </div>
      </div>
      
      {renderCurrentStep()}
    </div>
  );
};

export default Pathways;