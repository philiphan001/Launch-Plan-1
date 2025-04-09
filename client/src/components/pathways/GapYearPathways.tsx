import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GapYearPathwayProps {
  activity: string;
  handleBack: () => void;
  handleNext: () => void;
  handleSelectPathway: (pathway: string) => void;
}

export const GapYearPathway: React.FC<GapYearPathwayProps> = ({
  activity,
  handleBack,
  handleNext,
  handleSelectPathway
}) => {
  // Render Travel pathway
  if (activity === 'travel') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Visualization */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Gap Year Pathway: Travel</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Gap Year: Travel</p>
                  <p className="text-sm text-gray-600 mt-1">Explore new places and cultures</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Travel Options Box */}
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                  {/* Option 1 */}
                  <div className="p-4 border border-teal-300 rounded-lg text-center bg-teal-50 shadow-sm cursor-pointer hover:bg-teal-100 transition-colors">
                    <div className="bg-teal-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 1</p>
                    </div>
                    <p className="font-semibold text-teal-900">International Backpacking</p>
                    <p className="text-sm text-gray-600 mt-1">Budget travel through multiple countries</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mr-1">Cultural Immersion</span>
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">Adaptability</span>
                    </div>
                  </div>
                  
                  {/* Option 2 */}
                  <div className="p-4 border border-indigo-300 rounded-lg text-center bg-indigo-50 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors">
                    <div className="bg-indigo-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 2</p>
                    </div>
                    <p className="font-semibold text-indigo-900">Work & Travel Programs</p>
                    <p className="text-sm text-gray-600 mt-1">Earn while exploring (au pair, seasonal work)</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-1">Work Experience</span>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Financial</span>
                    </div>
                  </div>
                  
                  {/* Option 3 */}
                  <div className="p-4 border border-amber-300 rounded-lg text-center bg-amber-50 shadow-sm cursor-pointer hover:bg-amber-100 transition-colors">
                    <div className="bg-amber-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 3</p>
                    </div>
                    <p className="font-semibold text-amber-900">Language Immersion</p>
                    <p className="text-sm text-gray-600 mt-1">Study a language abroad</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mr-1">Language Skills</span>
                      <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">Academic</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Next Steps - Path After Gap Year */}
                <div className="w-64 p-4 border border-purple-300 rounded-lg text-center bg-purple-50 shadow-sm mb-4">
                  <div className="bg-purple-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">AFTER GAP YEAR</p>
                  </div>
                  <p className="font-semibold text-purple-900">What's Your Plan?</p>
                  <p className="text-sm text-gray-600 mt-1">Choose your next step</p>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700"
                    onClick={() => handleSelectPathway('education')}
                  >
                    <span className="material-icons text-xs mr-1">school</span>
                    Education
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-700"
                    onClick={() => handleSelectPathway('job')}
                  >
                    <span className="material-icons text-xs mr-1">work</span>
                    Career
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-300 text-amber-700"
                    onClick={() => handleSelectPathway('military')}
                  >
                    <span className="material-icons text-xs mr-1">shield</span>
                    Military
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Your Travel Gap Year</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="planning">
                <TabsList className="w-full">
                  <TabsTrigger value="planning" className="flex-1">Planning</TabsTrigger>
                  <TabsTrigger value="benefits" className="flex-1">Benefits</TabsTrigger>
                  <TabsTrigger value="considerations" className="flex-1">Considerations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planning" className="p-4 space-y-4">
                  <Card className="border-teal-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Budget Planning</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Estimate costs for transportation, accommodation, food, activities, and emergencies. Research work opportunities if planning to earn while traveling.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-teal-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Destination Research</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Consider factors like safety, cost of living, visa requirements, language barriers, and cultural opportunities when choosing destinations.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-teal-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Timeline & Logistics</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Plan departure dates, length of stay, and transitions between locations. Arrange for essentials like travel insurance, vaccinations, and necessary documentation.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="benefits" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Personal Growth</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Develop independence, adaptability, problem-solving skills, and cultural awareness through navigating new environments and challenges.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Valuable Experiences</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Gain unique experiences that can enhance college applications, resumes, and interview discussions. Develop stories that demonstrate your initiative and global perspective.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Perspective & Direction</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Exposure to different cultures and ways of living can help clarify your values, interests, and future educational or career goals.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="considerations" className="p-4 space-y-4">
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Financial Investment</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Travel can be expensive. Consider savings, potential income opportunities, and how this investment compares to immediately starting college or work.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Transition Planning</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Plan for your return and next steps. If applying to college, consider timing for applications and how you'll complete them while traveling.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Safety & Support</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Research safety concerns for destinations and establish communication plans with family or support networks. Ensure you have access to necessary healthcare.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </Button>
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleNext}>
            Continue
            <span className="material-icons ml-2">arrow_forward</span>
          </Button>
        </div>
      </div>
    );
  }
  // Render Volunteer pathway
  else if (activity === 'volunteer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Visualization */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Gap Year Pathway: Volunteer</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Gap Year: Volunteer</p>
                  <p className="text-sm text-gray-600 mt-1">Give back to the community</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Volunteer Options Box */}
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                  {/* Option 1 */}
                  <div className="p-4 border border-emerald-300 rounded-lg text-center bg-emerald-50 shadow-sm cursor-pointer hover:bg-emerald-100 transition-colors">
                    <div className="bg-emerald-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 1</p>
                    </div>
                    <p className="font-semibold text-emerald-900">Local Community Service</p>
                    <p className="text-sm text-gray-600 mt-1">Volunteer with organizations in your area</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full mr-1">Community Impact</span>
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">Local Networks</span>
                    </div>
                  </div>
                  
                  {/* Option 2 */}
                  <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors">
                    <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 2</p>
                    </div>
                    <p className="font-semibold text-blue-900">National Service Programs</p>
                    <p className="text-sm text-gray-600 mt-1">AmeriCorps, City Year, or similar programs</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1">Structured</span>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Education Award</span>
                    </div>
                  </div>
                  
                  {/* Option 3 */}
                  <div className="p-4 border border-purple-300 rounded-lg text-center bg-purple-50 shadow-sm cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="bg-purple-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 3</p>
                    </div>
                    <p className="font-semibold text-purple-900">International Volunteering</p>
                    <p className="text-sm text-gray-600 mt-1">Service projects abroad</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">Global Perspective</span>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Cultural Exchange</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Next Steps - Path After Gap Year */}
                <div className="w-64 p-4 border border-purple-300 rounded-lg text-center bg-purple-50 shadow-sm mb-4">
                  <div className="bg-purple-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">AFTER GAP YEAR</p>
                  </div>
                  <p className="font-semibold text-purple-900">What's Your Plan?</p>
                  <p className="text-sm text-gray-600 mt-1">Choose your next step</p>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700"
                    onClick={() => handleSelectPathway('education')}
                  >
                    <span className="material-icons text-xs mr-1">school</span>
                    Education
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-700"
                    onClick={() => handleSelectPathway('job')}
                  >
                    <span className="material-icons text-xs mr-1">work</span>
                    Career
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-300 text-amber-700"
                    onClick={() => handleSelectPathway('military')}
                  >
                    <span className="material-icons text-xs mr-1">shield</span>
                    Military
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Your Volunteer Gap Year</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="planning">
                <TabsList className="w-full">
                  <TabsTrigger value="planning" className="flex-1">Planning</TabsTrigger>
                  <TabsTrigger value="benefits" className="flex-1">Benefits</TabsTrigger>
                  <TabsTrigger value="considerations" className="flex-1">Considerations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planning" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Finding Opportunities</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Research volunteer organizations that align with your interests, skills, and values. Consider program length, location, and any associated costs.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Application Timeline</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Programs like AmeriCorps have specific application deadlines, often 6-8 months before start dates. International programs may require even longer lead times.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Financial Planning</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Research stipends, housing allowances, or education awards offered. For unpaid opportunities, create a budget for living expenses during your service period.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="benefits" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Skill Development</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Gain practical experience in leadership, teamwork, communication, problem-solving, and specific skills related to your volunteer work.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Career Exploration</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Test potential career interests in a low-risk environment. Develop professional connections that can lead to recommendations or future opportunities.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Personal Growth & Purpose</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Develop empathy, cultural awareness, and a sense of purpose. Volunteering can provide meaning and direction that helps clarify your future goals.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="considerations" className="p-4 space-y-4">
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Program Reputation</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Research organizations thoroughly, especially international ones. Look for reviews, clear mission statements, and transparency about how your contribution helps.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Time Commitment</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Some programs require full-time commitments of 6-12 months. Consider how this fits with your other gap year goals and future education plans.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Support Systems</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Evaluate what type of training, mentorship, and support is provided by the volunteer program. This is especially important for international placements.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </Button>
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleNext}>
            Continue
            <span className="material-icons ml-2">arrow_forward</span>
          </Button>
        </div>
      </div>
    );
  }
  // Render Other Activities pathway  
  else if (activity === 'other') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Visualization */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Gap Year Pathway: Other Activities</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Gap Year: Other Activities</p>
                  <p className="text-sm text-gray-600 mt-1">Learn new skills, pursue hobbies</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Other Activities Options Box */}
                <div className="grid grid-cols-1 gap-4 w-full max-w-md">
                  {/* Option 1 */}
                  <div className="p-4 border border-purple-300 rounded-lg text-center bg-purple-50 shadow-sm cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="bg-purple-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 1</p>
                    </div>
                    <p className="font-semibold text-purple-900">Creative Projects</p>
                    <p className="text-sm text-gray-600 mt-1">Writing, art, music, film, or other arts</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">Self-Expression</span>
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">Portfolio Building</span>
                    </div>
                  </div>
                  
                  {/* Option 2 */}
                  <div className="p-4 border border-indigo-300 rounded-lg text-center bg-indigo-50 shadow-sm cursor-pointer hover:bg-indigo-100 transition-colors">
                    <div className="bg-indigo-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 2</p>
                    </div>
                    <p className="font-semibold text-indigo-900">Skills Training</p>
                    <p className="text-sm text-gray-600 mt-1">Coding, digital skills, trades, certifications</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mr-1">Marketable Skills</span>
                      <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">Credentials</span>
                    </div>
                  </div>
                  
                  {/* Option 3 */}
                  <div className="p-4 border border-teal-300 rounded-lg text-center bg-teal-50 shadow-sm cursor-pointer hover:bg-teal-100 transition-colors">
                    <div className="bg-teal-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                      <p className="text-xs font-semibold">OPTION 3</p>
                    </div>
                    <p className="font-semibold text-teal-900">Athletic Pursuits</p>
                    <p className="text-sm text-gray-600 mt-1">Sports training, competitions, outdoor adventures</p>
                    <div className="flex justify-center mt-3">
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full mr-1">Physical Growth</span>
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">Discipline</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Next Steps - Path After Gap Year */}
                <div className="w-64 p-4 border border-purple-300 rounded-lg text-center bg-purple-50 shadow-sm mb-4">
                  <div className="bg-purple-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">AFTER GAP YEAR</p>
                  </div>
                  <p className="font-semibold text-purple-900">What's Your Plan?</p>
                  <p className="text-sm text-gray-600 mt-1">Choose your next step</p>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-blue-300 text-blue-700"
                    onClick={() => handleSelectPathway('education')}
                  >
                    <span className="material-icons text-xs mr-1">school</span>
                    Education
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-green-300 text-green-700"
                    onClick={() => handleSelectPathway('job')}
                  >
                    <span className="material-icons text-xs mr-1">work</span>
                    Career
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-amber-300 text-amber-700"
                    onClick={() => handleSelectPathway('military')}
                  >
                    <span className="material-icons text-xs mr-1">shield</span>
                    Military
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Your Self-Directed Gap Year</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="planning">
                <TabsList className="w-full">
                  <TabsTrigger value="planning" className="flex-1">Planning</TabsTrigger>
                  <TabsTrigger value="benefits" className="flex-1">Benefits</TabsTrigger>
                  <TabsTrigger value="considerations" className="flex-1">Considerations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="planning" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Setting Clear Goals</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Define specific, measurable objectives for your gap year. What skills do you want to develop? What projects do you want to complete? Create a timeline with milestones.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Resource Identification</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Research the tools, spaces, materials, courses, and mentors you'll need. Consider both online and in-person resources for learning and practice.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Structure & Accountability</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Create a schedule or routine to maintain momentum. Consider finding a community, mentor, or accountability partner to help you stay on track.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="benefits" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Skill Development</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Develop technical, creative, or personal skills that may not be emphasized in traditional education. Build expertise in areas of deep personal interest.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Portfolio Building</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Create tangible work samples that can strengthen college applications or job opportunities. Document your process and growth throughout the year.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Self-Discovery</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Explore your interests deeply to gain clarity on future educational and career paths. Develop greater self-awareness about your strengths, working style, and passions.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="considerations" className="p-4 space-y-4">
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Self-Motivation</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Self-directed projects require significant discipline and internal motivation. Consider whether you thrive in structured or unstructured environments.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Financial Planning</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Budget for your living expenses as well as any materials, courses, or equipment needed. Consider part-time work to support your activities.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-amber-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Balance</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        While pursuing personal projects, maintain a balanced lifestyle with social connections and physical activity. Avoid isolation by finding communities related to your interests.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <span className="material-icons mr-2">arrow_back</span>
            Back
          </Button>
          <Button className="bg-green-500 hover:bg-green-600" onClick={handleNext}>
            Continue
            <span className="material-icons ml-2">arrow_forward</span>
          </Button>
        </div>
      </div>
    );
  }
  
  // Default view when no specific activity is selected
  return (
    <div className="p-8 text-center">
      <div className="text-lg font-medium mb-4">Please select a gap year activity to view its pathway.</div>
      <Button variant="outline" onClick={handleBack}>
        <span className="material-icons mr-2">arrow_back</span>
        Back to Selection
      </Button>
    </div>
  );
};