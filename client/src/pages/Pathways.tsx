import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

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
  
  const { data: recommendedPaths } = useQuery({
    queryKey: ['/api/pathways/recommendations'],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [];
    },
    // Disable actual fetching for now
    enabled: false
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
          </Step>
        );
      
      case 2:
        if (needsGuidance) {
          return (
            <Step 
              title="Let's find the right path for you" 
              subtitle="Based on your interests and goals, we'll recommend some potential paths"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-medium mb-2">What are your main interests?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {["Technology", "Healthcare", "Business", "Arts", "Science", "Trades", "Service"].map((interest) => (
                          <div 
                            key={interest}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:border-primary"
                          >
                            {interest}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">What are your top priorities?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {["Income potential", "Job security", "Work-life balance", "Making a difference", "Quick entry to workforce", "Advancement opportunities"].map((priority) => (
                          <div 
                            key={priority}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:border-primary"
                          >
                            {priority}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">What level of education are you willing to pursue?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {["High school diploma", "Certificate program", "Associate's degree", "Bachelor's degree", "Graduate degree"].map((education) => (
                          <div 
                            key={education}
                            className="border border-gray-200 rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:border-primary"
                          >
                            {education}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleNext}>See Recommendations</Button>
                </CardContent>
              </Card>
            </Step>
          );
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
            </Step>
          );
        }
      
      case 3:
        if (needsGuidance) {
          return (
            <Step title="Recommended Paths" subtitle="Based on your answers, here are some paths that might be a good fit for you">
              <div className="space-y-4">
                <Card className="hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span className="material-icons">school</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Associate's Degree in Information Technology</h4>
                        <p className="text-sm text-gray-600 mb-3">A 2-year program that prepares you for entry-level technology positions with strong job growth and good pay.</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Technology</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">2-year program</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">In-demand field</span>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="rounded-full bg-secondary h-10 w-10 flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span className="material-icons">build</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Electrician Apprenticeship Program</h4>
                        <p className="text-sm text-gray-600 mb-3">Learn while you earn in this skilled trade with high demand and solid income potential.</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Trades</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">On-the-job training</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Quick entry to workforce</span>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="rounded-full bg-accent-light h-10 w-10 flex items-center justify-center text-white mr-4 flex-shrink-0">
                        <span className="material-icons">medical_services</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-lg mb-1">Healthcare Certificate Programs</h4>
                        <p className="text-sm text-gray-600 mb-3">Short-term training for in-demand healthcare support roles like medical assistant or phlebotomist.</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Healthcare</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Certificate program</span>
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Making a difference</span>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      <span className="material-icons text-sm">apartment</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${educationType === '4year' ? 'text-primary' : ''}`}>4-Year College</h5>
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
                      <span className="material-icons text-sm">account_balance</span>
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
                      <p className="text-sm text-gray-600">Serve communities in need</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`border ${gapYearActivity === 'work' ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-primary hover:bg-blue-50'} rounded-lg p-4 cursor-pointer transition-colors`}
                  onClick={() => setGapYearActivity('work')}
                >
                  <div className="flex items-center">
                    <div className={`rounded-full ${gapYearActivity === 'work' ? 'bg-primary' : 'bg-gray-200'} h-10 w-10 flex items-center justify-center ${gapYearActivity === 'work' ? 'text-white' : 'text-gray-600'} mr-3`}>
                      <span className="material-icons text-sm">savings</span>
                    </div>
                    <div>
                      <h5 className={`font-medium ${gapYearActivity === 'work' ? 'text-primary' : ''}`}>Work & Save</h5>
                      <p className="text-sm text-gray-600">Build savings for future</p>
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
                      <h5 className={`font-medium ${gapYearActivity === 'other' ? 'text-primary' : ''}`}>Other Plans</h5>
                      <p className="text-sm text-gray-600">Pursue personal interests</p>
                    </div>
                  </div>
                </div>
              </div>
            </Step>
          );
        }
        return null;
      
      case 4:
        return (
          <Step
            title="Financial Impact"
            subtitle="Here's how your chosen path might affect your finances over time"
          >
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <h4 className="font-medium mb-4">Financial Summary for Your Path</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 uppercase">Initial Investment</p>
                      <p className="text-2xl font-mono font-medium text-gray-800">
                        {selectedPath === 'education' && educationType === '4year' ? '$120,000' : 
                         selectedPath === 'education' && educationType === '2year' ? '$30,000' : 
                         selectedPath === 'education' && educationType === 'vocational' ? '$15,000' : 
                         selectedPath === 'military' ? '$0' : 
                         selectedPath === 'gap' ? '$5,000' : '$0'}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 uppercase">10-Year Earnings</p>
                      <p className="text-2xl font-mono font-medium text-gray-800">
                        {selectedPath === 'education' && educationType === '4year' ? '$650,000' : 
                         selectedPath === 'education' && educationType === '2year' ? '$480,000' : 
                         selectedPath === 'education' && educationType === 'vocational' ? '$420,000' : 
                         selectedPath === 'job' ? '$380,000' : 
                         selectedPath === 'military' ? '$450,000' : 
                         '$400,000'}
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 uppercase">Est. Net Worth at 30</p>
                      <p className="text-2xl font-mono font-medium text-gray-800">
                        {selectedPath === 'education' && educationType === '4year' ? '$150,000' : 
                         selectedPath === 'education' && educationType === '2year' ? '$120,000' : 
                         selectedPath === 'education' && educationType === 'vocational' ? '$130,000' : 
                         selectedPath === 'job' ? '$90,000' : 
                         selectedPath === 'military' ? '$110,000' : 
                         '$100,000'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <h5 className="font-medium mb-2">Key Financial Considerations</h5>
                    <ul className="space-y-2 text-sm">
                      {selectedPath === 'education' && educationType === '4year' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            4-year degrees typically lead to higher lifetime earnings, but come with significant upfront costs.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Student loans may be necessary - average debt at graduation is $30,000.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Consider in-state public universities to reduce costs.
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'education' && educationType === '2year' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Associate degrees provide a good return on investment with lower costs.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Many students transfer to 4-year schools after completing their associate degree.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Community colleges often offer affordable tuition and flexible scheduling.
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'education' && educationType === 'vocational' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Vocational programs typically offer faster entry into the workforce.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Many skilled trades offer apprenticeships with paid training.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Some trades see earnings increase significantly with experience.
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'job' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Starting work immediately provides earlier income and work experience.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Consider employers that offer tuition assistance for future education.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Advancement opportunities may be limited without further education.
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'military' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Military service includes benefits like healthcare, housing allowances, and retirement plans.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            The GI Bill can cover college expenses after service.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Veterans preference can help with federal job applications after service.
                          </li>
                        </>
                      )}
                      
                      {selectedPath === 'gap' && (
                        <>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            A gap year may delay earnings but can provide valuable experiences.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Consider working part-time to offset costs during your gap year.
                          </li>
                          <li className="flex items-start">
                            <span className="material-icons text-primary mr-2 text-sm">info</span>
                            Have a plan for what comes after your gap year.
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex items-center" onClick={handleStartOver}>
                      <span className="material-icons mr-1 text-sm">refresh</span>
                      Start Over
                    </Button>
                    <Button className="flex items-center">
                      <span className="material-icons mr-1 text-sm">save</span>
                      Save to My Profile
                    </Button>
                    <Button className="flex items-center">
                      <span className="material-icons mr-1 text-sm">bar_chart</span>
                      Create Financial Projection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Step>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Planning Your Path</h1>
      
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="font-medium text-gray-700">Decision Tree</h3>
          <p className="text-sm text-gray-500 mt-1">Map out your post-high school journey</p>
        </div>
        <CardContent className="p-6">
          {renderCurrentStep()}
          
          {currentStep > 1 && currentStep < 4 && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleNext}
                disabled={(currentStep === 2 && !selectedPath && !needsGuidance) || 
                         (currentStep === 3 && selectedPath === 'education' && !educationType) ||
                         (currentStep === 3 && selectedPath === 'job' && !jobType) ||
                         (currentStep === 3 && selectedPath === 'military' && !militaryBranch) ||
                         (currentStep === 3 && selectedPath === 'gap' && !gapYearActivity)}
              >
                Continue
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Pathways;
