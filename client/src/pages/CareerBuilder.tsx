import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Briefcase, GraduationCap, BadgeInfo, Clock, Brain, TrendingUp, Lightbulb, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

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

interface CareerInsights {
  education: string;
  pathways: string;
  dailyTasks: string;
  skillsNeeded: string;
  futureOutlook: string;
  relatedCareers: string;
}

const CareerBuilder: React.FC = () => {
  const userId = 1; // Default user ID
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insights, setInsights] = useState<CareerInsights | null>(null);

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
      setInsights(data);
    } catch (error) {
      console.error('Error fetching career insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Handle career selection
  const handleCareerSelect = (career: Career) => {
    setSelectedCareer(career);
    setInsights(null); // Reset insights when selecting a new career
    fetchCareerInsights(career.id);
  };

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
                  {(selectedCareer.salaryPct10 || selectedCareer.salaryPct25 || 
                    selectedCareer.salaryMedian || selectedCareer.salaryPct75 || 
                    selectedCareer.salaryPct90) && (
                    <div className="mt-6 mb-6">
                      <div className="flex items-start mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium">Salary Range by Percentile</h3>
                          <p className="text-xs text-muted-foreground">How much you might earn at different experience/performance levels</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {selectedCareer.salaryPct10 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">10th Percentile (Entry Level)</span>
                              <span className="font-medium">${selectedCareer.salaryPct10.toLocaleString()}</span>
                            </div>
                            <Progress value={20} className="h-2" />
                          </div>
                        )}
                        
                        {selectedCareer.salaryPct25 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">25th Percentile</span>
                              <span className="font-medium">${selectedCareer.salaryPct25.toLocaleString()}</span>
                            </div>
                            <Progress value={40} className="h-2" />
                          </div>
                        )}
                        
                        {selectedCareer.salaryMedian && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">Median (50th Percentile)</span>
                              <span className="font-medium">${selectedCareer.salaryMedian.toLocaleString()}</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                        )}
                        
                        {selectedCareer.salaryPct75 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">75th Percentile</span>
                              <span className="font-medium">${selectedCareer.salaryPct75.toLocaleString()}</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                        )}
                        
                        {selectedCareer.salaryPct90 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium">90th Percentile (Top Earners)</span>
                              <span className="font-medium">${selectedCareer.salaryPct90.toLocaleString()}</span>
                            </div>
                            <Progress value={100} className="h-3" />
                          </div>
                        )}
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
                      <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                        <TabsTrigger value="education">Education</TabsTrigger>
                        <TabsTrigger value="pathways">Pathways</TabsTrigger>
                        <TabsTrigger value="dailyTasks">Daily Tasks</TabsTrigger>
                        <TabsTrigger value="skills">Skills</TabsTrigger>
                        <TabsTrigger value="outlook">Outlook</TabsTrigger>
                        <TabsTrigger value="related">Related</TabsTrigger>
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
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mb-4" />
                      <p className="text-center">
                        No insights available. Click the Analyze button to generate insights with AI.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => selectedCareer && fetchCareerInsights(selectedCareer.id)}
                      >
                        Analyze Career
                      </Button>
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