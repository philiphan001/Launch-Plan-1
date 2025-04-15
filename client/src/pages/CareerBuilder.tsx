import React, { useState } from 'react';
import { AuthProps } from '@/interfaces/auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Briefcase, GraduationCap, BadgeInfo, Clock, Brain, 
  TrendingUp, Lightbulb, AlertTriangle, DollarSign, BarChart3,
  CalendarClock, PiggyBank, School, Award, Calculator, CheckCircle2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface Career {
  id: number;
  title: string;
  description: string | null;
  salary: number | null;
  growthRate: string | null;
  education: string | null;
  category: string | null;
  salaryPct10: number | null;
  salaryPct25: number | null;
  salaryMedian: number | null;
  salaryPct75: number | null;
  salaryPct90: number | null;
}

interface FavoriteCareer {
  id: number;
  userId: number;
  careerId: number;
  createdAt: string;
  career: Career;
}

interface CareerTimelineStep {
  year: number;
  stage: string;
  description: string;
  earnings?: number;
}

interface CareerInsights {
  education: string;
  pathways: string;
  dailyTasks: string;
  skillsNeeded: string;
  futureOutlook: string;
  relatedCareers: string;
}

interface CareerTimeline {
  timeline: CareerTimelineStep[];
}

interface CareerBuilderProps extends AuthProps {}

const CareerBuilder: React.FC<CareerBuilderProps> = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding
}) => {
  const userId = user?.id || 1; // Use authenticated user ID or fallback to default
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [insights, setInsights] = useState<CareerInsights | null>(null);
  const [timeline, setTimeline] = useState<CareerTimeline | null>(null);
  const [projectedSalary, setProjectedSalary] = useState<number | ''>('');
  const [startYear, setStartYear] = useState<number | ''>(new Date().getFullYear() + 4);
  const [education, setEducation] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [locationCity, setLocationCity] = useState<string>('');
  const [locationState, setLocationState] = useState<string>('');
  const [formProcessing, setFormProcessing] = useState(false);
  const [calculationSuccess, setCalculationSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch favorite careers
  const { data: favoriteCareers, isLoading, error } = useQuery({
    queryKey: ['/api/favorites/careers', userId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/careers/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite careers');
      }
      return response.json() as Promise<FavoriteCareer[]>;
    }
  });

  // Function to fetch career insights using OpenAI
  const fetchCareerInsights = async (careerId: number) => {
    try {
      setLoadingInsights(true);
      const response = await fetch(`/api/career-insights/${careerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch career insights');
      }
      
      const data = await response.json();
      console.log('Career insights data for career ID:', careerId, data);
      
      setInsights(data);
    } catch (error) {
      console.error('Error fetching career insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };
  
  // Function to fetch career timeline data
  const fetchCareerTimeline = async (careerId: number) => {
    try {
      setLoadingTimeline(true);
      const response = await fetch(`/api/career-timeline/${careerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch career timeline');
      }
      
      const data = await response.json();
      console.log('Career timeline data for career ID:', careerId, data);
      
      setTimeline(data);
    } catch (error) {
      console.error('Error fetching career timeline:', error);
      // Set default timeline as a fallback
      setTimeline({
        timeline: [
          { year: 0, stage: 'education', description: 'Graduate high school and begin your education journey', earnings: 0 },
          { year: 4, stage: 'education', description: 'Complete relevant degree or training', earnings: 0 },
          { year: 5, stage: 'entry', description: 'First professional position', earnings: 45000 },
          { year: 8, stage: 'mid', description: 'Mid-level position with more responsibilities', earnings: 65000 },
          { year: 15, stage: 'senior', description: 'Senior position with leadership opportunities', earnings: 90000 }
        ]
      });
    } finally {
      setLoadingTimeline(false);
    }
  };

  // Handle career selection
  const handleCareerSelect = (career: Career) => {
    setSelectedCareer(career);
    setInsights(null); // Reset insights when selecting a new career
    setTimeline(null); // Reset timeline when selecting a new career
    fetchCareerInsights(career.id);
    fetchCareerTimeline(career.id);
    
    // Reset calculation form
    setProjectedSalary(career.salary || 0);
    setEducation(career.education || '');
    setAdditionalNotes('');
    setLocationCity('');
    setLocationState('');
    setCalculationSuccess(false);
  };
  
  // Use timeline data to populate form values
  const useTimelineData = () => {
    if (!timeline || !timeline.timeline || timeline.timeline.length === 0) {
      toast({
        title: "No Timeline Data",
        description: "There is no timeline data available for this career yet. Try analyzing the career first.",
        variant: "destructive",
      });
      return;
    }
    
    // Find the entry level position from timeline
    const entryPosition = timeline.timeline.find(step => step.stage === 'entry' && step.earnings);
    // Find the last career position (typically senior level)
    const latestPosition = [...timeline.timeline]
      .filter(step => step.earnings)
      .sort((a, b) => b.year - a.year)[0];
    
    // Get education info
    const educationSteps = timeline.timeline.filter(step => step.stage === 'education');
    const educationStep = educationSteps.length > 0 ? educationSteps[educationSteps.length - 1] : null;
    
    // Calculate start year based on education completion
    const completionYear = educationStep ? educationStep.year : 4;
    const startYear = new Date().getFullYear() + completionYear;
    
    // Set the form values
    if (latestPosition && latestPosition.earnings) {
      setProjectedSalary(latestPosition.earnings);
    }
    setStartYear(startYear);
    
    // Create notes with timeline data
    const notes = [
      educationStep ? `Education: ${educationStep.description}` : '',
      entryPosition ? `Entry Level (Year ${entryPosition.year}): ${entryPosition.description}` : '',
      latestPosition ? `Career Peak (Year ${latestPosition.year}): ${latestPosition.description}` : ''
    ].filter(Boolean).join('\n\n');
    
    setAdditionalNotes(notes);
    
    toast({
      title: "Timeline Data Applied",
      description: "Career timeline information has been applied to your financial projections.",
      variant: "default",
    });
  };
  
  // Create career calculation mutation
  const createCareerCalculation = useMutation({
    mutationFn: async () => {
      if (!selectedCareer) {
        throw new Error('No career selected');
      }
      
      if (!projectedSalary) {
        throw new Error('Projected salary is required');
      }
      
      // Get salary percentiles from career or estimate them
      const entryLevelSalary = selectedCareer.salaryPct10 || Math.round((selectedCareer.salary || 0) * 0.6);
      const midCareerSalary = selectedCareer.salaryMedian || selectedCareer.salary || 0;
      const experiencedSalary = selectedCareer.salaryPct90 || Math.round((selectedCareer.salary || 0) * 1.4);
      
      const calculationData = {
        userId,
        careerId: selectedCareer.id,
        projectedSalary: typeof projectedSalary === 'string' ? parseInt(projectedSalary) : projectedSalary,
        startYear: typeof startYear === 'string' ? parseInt(startYear) : startYear,
        education,
        entryLevelSalary,
        midCareerSalary,
        experiencedSalary,
        additionalNotes,
        locationCity,
        locationState,
        includedInProjection: true
      };
      
      const response = await fetch('/api/career-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save career calculation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setCalculationSuccess(true);
      // Invalidate career calculations for this user to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/career-calculations/user', userId] });
      // Also invalidate college and career calculations queries
      queryClient.invalidateQueries({ queryKey: ['/api/careers'] });
      toast({
        title: "Success!",
        description: `${selectedCareer?.title} has been saved and included in your financial projections.`,
        variant: "default",
      });
    },
    onError: (error) => {
      console.error('Error creating career calculation:', error);
      toast({
        title: "Error",
        description: `Failed to save career calculation: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your career information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
        <AlertDescription>
          We encountered an error loading your favorite careers. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Career Builder</h1>
      <p className="text-gray-600 mb-6">
        Explore detailed insights and career pathways for your favorite occupations with AI-powered analysis.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with favorite careers */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Your Favorite Careers
              </CardTitle>
              <CardDescription>Select a career to view AI-enhanced insights</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteCareers && favoriteCareers.length > 0 ? (
                <div className="space-y-2">
                  {favoriteCareers.map((favCareer) => (
                    <Button
                      key={favCareer.id}
                      variant={selectedCareer?.id === favCareer.career.id ? "default" : "outline"}
                      className="w-full justify-start text-left"
                      onClick={() => handleCareerSelect(favCareer.career)}
                    >
                      <div className="truncate">
                        {favCareer.career.title}
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No favorites yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Add careers to your favorites to explore them in detail
                  </p>
                  <Button asChild>
                    <a href="/career-exploration">Explore Careers</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right content area with career details */}
        <div className="md:col-span-2">
          {selectedCareer ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{selectedCareer.title}</CardTitle>
                  {selectedCareer.description && (
                    <CardDescription className="text-base">
                      {selectedCareer.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {selectedCareer.salary && (
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <BadgeInfo className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Average Salary</p>
                          <p className="text-xl font-bold">${selectedCareer.salary.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {selectedCareer.growthRate && (
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Growth Rate</p>
                          <p className="text-xl font-bold">{selectedCareer.growthRate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Salary Percentiles Visualization */}
                  {selectedCareer.salary && (
                    <div className="mt-6 mb-6">
                      <div className="flex items-start mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Salary Range by Percentile</h3>
                          <p className="text-xs text-muted-foreground">
                            How much you might earn at different experience/performance levels
                            {(!selectedCareer.salaryPct10 || !selectedCareer.salaryPct25 || 
                              !selectedCareer.salaryMedian || !selectedCareer.salaryPct75 || 
                              !selectedCareer.salaryPct90) && (
                              <span className="ml-1 text-amber-600">
                                (some values estimated)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* 10th Percentile */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">10th Percentile (Entry Level)</span>
                            <span className="font-medium">
                              ${(selectedCareer.salaryPct10 || Math.round(selectedCareer.salary * 0.6)).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={20} className="h-2" />
                        </div>
                        
                        {/* 25th Percentile */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">25th Percentile</span>
                            <span className="font-medium">
                              ${(selectedCareer.salaryPct25 || Math.round(selectedCareer.salary * 0.8)).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={40} className="h-2" />
                        </div>
                        
                        {/* Median (50th Percentile) */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">Median (50th Percentile)</span>
                            <span className="font-medium">
                              ${(selectedCareer.salaryMedian || selectedCareer.salary).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={60} className="h-2" />
                        </div>
                        
                        {/* 75th Percentile */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">75th Percentile</span>
                            <span className="font-medium">
                              ${(selectedCareer.salaryPct75 || Math.round(selectedCareer.salary * 1.2)).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={80} className="h-2" />
                        </div>
                        
                        {/* 90th Percentile */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">90th Percentile (Top Earners)</span>
                            <span className="font-medium">
                              ${(selectedCareer.salaryPct90 || Math.round(selectedCareer.salary * 1.4)).toLocaleString()}
                            </span>
                          </div>
                          <Progress value={100} className="h-3" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />
                  
                  {selectedCareer.education && (
                    <div className="flex items-start mt-4">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Typical Education</p>
                        <p className="text-muted-foreground">{selectedCareer.education}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Generated Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI-Enhanced Career Insights
                  </CardTitle>
                  <CardDescription>
                    Detailed information generated with AI about this career path
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingInsights ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Analyzing career insights...</p>
                    </div>
                  ) : insights ? (
                    <Tabs defaultValue="education">
                      <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
                        <TabsTrigger value="education">Education</TabsTrigger>
                        <TabsTrigger value="pathways">Pathways</TabsTrigger>
                        <TabsTrigger value="dailyTasks">Daily Tasks</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="outlook">Outlook</TabsTrigger>
                        <TabsTrigger value="related">Related</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="education" className="space-y-4">
                        <div className="flex items-start">
                          <GraduationCap className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Education Requirements</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.education}</p>
                      </TabsContent>
                      
                      <TabsContent value="pathways" className="space-y-4">
                        <div className="flex items-start">
                          <TrendingUp className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Career Pathways</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.pathways}</p>
                      </TabsContent>
                      
                      <TabsContent value="dailyTasks" className="space-y-4">
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Daily Responsibilities</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.dailyTasks}</p>
                      </TabsContent>
                      
                      <TabsContent value="skills" className="space-y-4">
                        <div className="flex items-start">
                          <Brain className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Key Skills Needed</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.skillsNeeded}</p>
                      </TabsContent>
                      
                      <TabsContent value="outlook" className="space-y-4">
                        <div className="flex items-start">
                          <Lightbulb className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Future Outlook</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.futureOutlook}</p>
                      </TabsContent>
                      
                      <TabsContent value="related" className="space-y-4">
                        <div className="flex items-start">
                          <Briefcase className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Related Careers</h3>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-line">{insights.relatedCareers}</p>
                      </TabsContent>
                      
                      <TabsContent value="timeline" className="space-y-4">
                        <div className="flex items-start mb-4">
                          <CalendarClock className="h-5 w-5 mr-2 flex-shrink-0 text-primary" />
                          <h3 className="font-medium">Career Timeline</h3>
                        </div>
                        
                        {loadingTimeline ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Building career timeline...</p>
                          </div>
                        ) : timeline && timeline.timeline && timeline.timeline.length > 0 ? (
                          <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-200">
                            {timeline.timeline.map((step, index: number) => (
                              <div key={`timeline-${selectedCareer?.id}-${index}`} className="relative">
                                <div className="absolute -left-8 bg-primary rounded-full p-2 flex items-center justify-center">
                                  {step.stage === 'education' ? (
                                    <School className="h-4 w-4 text-white" />
                                  ) : step.stage === 'entry' ? (
                                    <Briefcase className="h-4 w-4 text-white" />
                                  ) : step.stage === 'mid' ? (
                                    <Award className="h-4 w-4 text-white" />
                                  ) : (
                                    <PiggyBank className="h-4 w-4 text-white" />
                                  )}
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200">
                                  <div className="mb-1 flex items-center">
                                    <span className="text-lg font-semibold text-gray-800">Year {step.year}</span>
                                    {step.earnings && (
                                      <div className="ml-auto text-base font-medium text-emerald-600">
                                        ${step.earnings.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-base font-medium mb-2 text-gray-700">
                                    {step.stage === 'education' ? 'Education & Training' : 
                                     step.stage === 'entry' ? 'Entry Level' :
                                     step.stage === 'mid' ? 'Mid-Career' : 'Senior Level'}
                                  </h4>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground">
                            No timeline information available
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                      <p className="text-center">
                        No insights available. Click the Analyze button to generate insights with AI.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => {
                          if (selectedCareer) {
                            fetchCareerInsights(selectedCareer.id);
                            fetchCareerTimeline(selectedCareer.id);
                          }
                        }}
                      >
                        Analyze Career
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Career Financial Projections Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Include in Financial Projections
                  </CardTitle>
                  <CardDescription>
                    Save this career to include in your financial projections and life planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculationSuccess ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Career Saved!</h3>
                      <p className="text-muted-foreground">
                        {selectedCareer.title} has been added to your financial projections.
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setCalculationSuccess(false)}
                      >
                        Make Changes
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-end mb-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm flex items-center text-primary"
                          onClick={useTimelineData}
                          disabled={!timeline || loadingTimeline}
                        >
                          <CalendarClock className="h-4 w-4 mr-1" />
                          Use Timeline Data
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="projected-salary">Projected Annual Salary</Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                            <Input
                              id="projected-salary"
                              type="number"
                              className="pl-8"
                              value={projectedSalary}
                              onChange={(e) => setProjectedSalary(e.target.value ? parseInt(e.target.value) : '')}
                              placeholder="Annual salary"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="start-year">Career Start Year</Label>
                          <Input
                            id="start-year"
                            type="number"
                            value={startYear}
                            onChange={(e) => setStartYear(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder={`${new Date().getFullYear() + 4}`}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="education">Education Level</Label>
                        <Input
                          id="education"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="e.g., Bachelor's Degree, Master's Degree"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <input
                            id="city"
                            value={locationCity}
                            onChange={(e) => setLocationCity(e.target.value)}
                            placeholder="City for location adjustment"
                            className="w-full rounded-md border border-input h-9 px-3 py-1 text-sm bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <input
                            id="state"
                            value={locationState}
                            onChange={(e) => setLocationState(e.target.value)}
                            placeholder="State for location adjustment"
                            className="w-full rounded-md border border-input h-9 px-3 py-1 text-sm bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <textarea
                          id="notes"
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Any additional information or notes about this career choice"
                          rows={5}
                          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={() => createCareerCalculation.mutate()}
                        disabled={!selectedCareer || !projectedSalary || createCareerCalculation.isPending}
                      >
                        {createCareerCalculation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save to Financial Projections
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        This will replace any previously included career in your financial projections
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Briefcase className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Career</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Choose a career from your favorites list to view detailed AI-enhanced insights about the career pathway, education requirements, and more.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerBuilder;