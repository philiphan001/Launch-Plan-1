import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MilitaryPathwayProps {
  militaryBranch: string;
  handleBack: () => void;
  handleNext: () => void;
}

export const MilitaryPathway: React.FC<MilitaryPathwayProps> = ({
  militaryBranch,
  handleBack,
  handleNext
}) => {
  // Render Army pathway
  if (militaryBranch === 'army') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Army</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-6 year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Basic Training</p>
                  <p className="text-sm text-gray-600 mt-1">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">8-13 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">Advanced Training</p>
                  <p className="text-sm text-gray-600 mt-1">(AIT/Technical School)</p>
                  <p className="text-sm text-gray-600">Specialized Skills</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Military Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Military */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Continue Military Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Military career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">Advancement Opportunities</p>
                        <p className="text-xs text-gray-600 mt-1">Promotions & Leadership Roles</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">Education While Serving</p>
                        <p className="text-xs text-gray-600 mt-1">Tuition Assistance & Online Classes</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Retirement Benefits</p>
                        <p className="text-xs text-gray-600 mt-1">Pension after 20+ years service</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Transition to Civilian Life</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education Benefits</p>
                        <p className="text-xs text-gray-600 mt-1">Funding for college/university</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Civilian Career Paths</p>
                        <p className="text-xs text-gray-600 mt-1">Using military skills & training</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Veterans Benefits</p>
                        <p className="text-xs text-gray-600 mt-1">Healthcare, home loans & more</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="military-career" className="flex-1">Military Career</TabsTrigger>
                  <TabsTrigger value="civilian-path" className="flex-1">Civilian Path</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <div className="mb-4 flex items-center">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <p className="text-white text-xs font-bold">1</p>
                    </div>
                    <h3 className="font-semibold text-blue-900">Initial Training Path</h3>
                  </div>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Requirements:</strong> High school diploma/GED, pass ASVAB test, meet physical standards, age 17-35.
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        The process begins with connecting with a recruiter and going through the Military Entrance Processing Station (MEPS) which includes aptitude tests, medical exams, and career counseling.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Basic Combat Training (BCT) - 10 weeks</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Army Basic Combat Training is a 10-week course at locations like Fort Jackson, SC or Fort Leonard Wood, MO. You'll learn military procedures, weapons training, field tactics, physical fitness, and Army values.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Advanced Individual Training (AIT)</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        AIT teaches the specialized skills needed for your Military Occupational Specialty (MOS). Training length varies from 4 weeks to over a year depending on your MOS.
                      </p>
                      <div className="mt-2 bg-blue-50 p-2 rounded-md">
                        <p className="text-xs font-medium text-blue-800">Popular Army Career Fields:</p>
                        <ul className="text-xs text-gray-700 mt-1 pl-4 list-disc">
                          <li>Combat Arms (Infantry, Artillery, Armor)</li>
                          <li>Intelligence & Communications</li>
                          <li>Engineering & Mechanical Maintenance</li>
                          <li>Medical & Healthcare</li>
                          <li>Logistics & Transportation</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="military-career" className="p-4 space-y-4">
                  <div className="mb-4 flex items-center">
                    <div className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <p className="text-white text-xs font-bold">A</p>
                    </div>
                    <h3 className="font-semibold text-green-900">Military Career Path</h3>
                  </div>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Rank Advancement</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Progress from enlisted ranks (E-1 to E-9) over your career through promotion boards, time in service, and leadership positions. Each promotion brings higher pay and responsibilities.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Continuing Education</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Army supports continuing education through tuition assistance and specialized military schools. Many soldiers earn associate, bachelor's, or even master's degrees while serving.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Career Specialization</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        As you advance, you'll have opportunities to specialize further in your field or cross-train in new areas. Military career progression typically includes leadership roles and increased responsibilities.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="civilian-path" className="p-4 space-y-4">
                  <div className="mb-4 flex items-center">
                    <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <p className="text-white text-xs font-bold">B</p>
                    </div>
                    <h3 className="font-semibold text-blue-900">Civilian Transition Path</h3>
                  </div>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">GI Bill Education Benefits</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        After serving, you qualify for GI Bill benefits which can cover tuition, housing, and books at approved colleges, universities, and technical schools. This can fully fund your higher education.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Civilian Career Options</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Military experience translates well to many civilian careers. Leadership, discipline, and technical skills are highly valued by employers. Many organizations specifically recruit veterans.
                      </p>
                      <div className="mt-2 bg-blue-50 p-2 rounded-md">
                        <p className="text-xs font-medium text-blue-800">Common Veteran Career Paths:</p>
                        <ul className="text-xs text-gray-700 mt-1 pl-4 list-disc">
                          <li>Law Enforcement & Security</li>
                          <li>Federal Government & Defense Contractors</li>
                          <li>Logistics & Supply Chain Management</li>
                          <li>Technical Trades & Engineering</li>
                          <li>Healthcare & Emergency Services</li>
                        </ul>
                      </div>
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
  // Render Navy pathway
  else if (militaryBranch === 'navy') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Navy</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-6 year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Boot Camp</p>
                  <p className="text-sm text-gray-600 mt-1">(Recruit Training)</p>
                  <p className="text-sm text-gray-600">8 weeks at Great Lakes, IL</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">A School</p>
                  <p className="text-sm text-gray-600 mt-1">(Rating Training)</p>
                  <p className="text-sm text-gray-600">Technical specialty</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Navy Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Navy */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Navy Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Navy career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">Leadership Advancement</p>
                        <p className="text-xs text-gray-600 mt-1">Chief Petty Officer track</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">Specialized Schools</p>
                        <p className="text-xs text-gray-600 mt-1">Advanced technical training</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Sea & Shore Rotations</p>
                        <p className="text-xs text-gray-600 mt-1">Global deployment opportunities</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Civilian Transition</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education</p>
                        <p className="text-xs text-gray-600 mt-1">College funding benefits</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Maritime Industry</p>
                        <p className="text-xs text-gray-600 mt-1">Shipping, ports, naval systems</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Technical Careers</p>
                        <p className="text-xs text-gray-600 mt-1">Engineering, electronics</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">Education Options</TabsTrigger>
                  <TabsTrigger value="career" className="flex-1">Career Paths</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Start by meeting with a Navy recruiter who will guide you through qualification testing (ASVAB), medical screening, and job selection based on your aptitude and Navy needs.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Recruit Training Command (RTC)</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Navy boot camp is held at Naval Station Great Lakes in Illinois. This 8-week program transforms civilians into sailors through physical training, classroom instruction, and practical seamanship.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Rating Assignment & A School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        After boot camp, you'll attend A School to learn your Navy rating (job specialty). From nuclear technicians to intelligence specialists, the Navy offers over 80 career fields.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="education" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Navy College Program</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Navy offers tuition assistance for active duty personnel to pursue higher education during off-duty hours. Many sailors earn degrees while serving.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Navy COOL Program</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Credentialing Opportunities On-Line (COOL) helps sailors earn civilian certifications and licenses that correspond to their Navy skills, enhancing both military and post-service careers.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">United Services Military Apprenticeship</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        USMAP allows sailors to earn Department of Labor apprenticeship certifications in their fields while on active duty, documenting their skills for civilian employers.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="career" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Navy Career Path</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        A 20+ year Navy career includes advancement through enlisted ranks or potentially commissioning as an officer. Sea duty and shore duty rotations offer diverse experiences.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Maritime & Defense</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Navy veterans are highly sought after in maritime industries, shipping companies, port authorities, and defense contractors where their specialized skills transfer directly.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technical & Engineering</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Navy technical training in electronics, nuclear power, machinery repair, and computer systems translates well to civilian careers in engineering and technical fields.
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
  // Render Air Force pathway
  else if (militaryBranch === 'airforce') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Air Force</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-6 year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Basic Military Training</p>
                  <p className="text-sm text-gray-600 mt-1">(BMT)</p>
                  <p className="text-sm text-gray-600">8.5 weeks at Lackland AFB</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">Technical Training</p>
                  <p className="text-sm text-gray-600 mt-1">(AFSC Training)</p>
                  <p className="text-sm text-gray-600">Air Force Specialty Code</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Air Force Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Air Force */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Air Force Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Air Force career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">Leadership Positions</p>
                        <p className="text-xs text-gray-600 mt-1">NCO and Officer pathways</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">CCAF Degree</p>
                        <p className="text-xs text-gray-600 mt-1">Community College of the Air Force</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Special Assignments</p>
                        <p className="text-xs text-gray-600 mt-1">Instructor, Special Ops, Recruiting</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Civilian Transition</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education</p>
                        <p className="text-xs text-gray-600 mt-1">College funding benefits</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Aviation Industry</p>
                        <p className="text-xs text-gray-600 mt-1">Defense, commercial, space</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Tech & Cybersecurity</p>
                        <p className="text-xs text-gray-600 mt-1">High-demand tech skills</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">Education Options</TabsTrigger>
                  <TabsTrigger value="career" className="flex-1">Career Paths</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Begin with meeting an Air Force recruiter who will guide you through the ASVAB test, medical examination, and job selection based on your qualifications and Air Force needs.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Basic Military Training (BMT) 8.5 weeks</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Air Force Basic Military Training takes place at Lackland AFB in San Antonio, Texas. You'll develop military discipline, physical fitness, and foundational Air Force knowledge.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technical Training (AFSC Training)</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        After BMT, you'll attend technical school to learn your specific Air Force Specialty Code (AFSC) skills. Duration ranges from 6 weeks to over a year depending on your career field.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="education" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Community College of the Air Force</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The CCAF is a federally chartered academic institution that grants associate degrees to enlisted members. Your technical training and experience count toward your degree.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">USAF Distance Learning</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Air Force offers numerous distance learning opportunities through Air University and partnerships with civilian institutions, making education accessible while serving.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">AU-ABC Program</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Air University Associate-to-Baccalaureate Cooperative (AU-ABC) program helps airmen transfer their CCAF credits to partner schools to complete bachelor's degrees.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="career" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Air Force Career</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        A 20+ year Air Force career offers promotion opportunities, leadership positions, and retirement benefits. Some airmen commission as officers through programs like Officer Training School.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Aviation & Aerospace</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Air Force experience is highly valued in commercial aviation, defense contractors, and aerospace companies. Many skills directly transfer to civilian aviation careers.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technical Industry</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Air Force provides world-class training in cybersecurity, electronics, telecommunications, and other technical fields that are in high demand in civilian sectors.
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
  // Render Marines pathway 
  else if (militaryBranch === 'marines') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Marines</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-5 year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Recruit Training</p>
                  <p className="text-sm text-gray-600 mt-1">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">13 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">Combat Training & MOS School</p>
                  <p className="text-sm text-gray-600 mt-1">(Military Occupational Specialty)</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Marines Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Marines */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Marine Corps Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Marines career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">NCO Leadership Path</p>
                        <p className="text-xs text-gray-600 mt-1">Senior enlisted ranks</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">Specialized Training</p>
                        <p className="text-xs text-gray-600 mt-1">Advanced combat & technical schools</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Special Assignments</p>
                        <p className="text-xs text-gray-600 mt-1">Embassy Security, Recruiting, Drill Instructor</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Civilian Transition</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education</p>
                        <p className="text-xs text-gray-600 mt-1">College funding benefits</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Law Enforcement</p>
                        <p className="text-xs text-gray-600 mt-1">Police, federal agencies, security</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Leadership Roles</p>
                        <p className="text-xs text-gray-600 mt-1">Management, crisis response, logistics</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">Education Options</TabsTrigger>
                  <TabsTrigger value="career" className="flex-1">Career Paths</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The process starts with a Marine Corps recruiter who will guide you through qualification testing, medical screening, and job selection based on your aptitude and Corps needs.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Recruit Training (Boot Camp) - 13 weeks</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Marine Corps recruit training is the longest and most challenging of all military branches. It takes place at Parris Island, SC, or San Diego, CA, and transforms recruits into Marines.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Combat Training & MOS School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        After boot camp, all Marines attend Combat Training followed by their Military Occupational Specialty (MOS) school to learn their specific job skills.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="education" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Marine Corps University</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Throughout a Marine's career, they can access professional military education through Marine Corps University, which offers leadership and tactical courses.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Tuition Assistance Program</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Active duty Marines can receive tuition assistance for college courses taken during off-duty hours, allowing them to work toward degrees while serving.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Voluntary Education Programs</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Marine Corps Community Services (MCCS) offers various education programs, including testing services, academic advising, and college partnerships.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="career" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Marine Corps Career</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        A career in the Marines offers advancement through the enlisted ranks or through officer commissioning programs. Marines value leadership, discipline, and technical expertise.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Law Enforcement & Security</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Marine Corps training and ethos make veterans excellent candidates for careers in law enforcement, federal agencies, and private security firms.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Leadership & Management</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The leadership skills, discipline, and problem-solving abilities developed in the Marines transfer well to management positions in various industries.
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
  // Render Coast Guard pathway
  else if (militaryBranch === 'coastguard') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Coast Guard</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Basic Training</p>
                  <p className="text-sm text-gray-600 mt-1">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">8 weeks at Cape May, NJ</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">Rate Training</p>
                  <p className="text-sm text-gray-600 mt-1">(A School)</p>
                  <p className="text-sm text-gray-600">Specialized job training</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Coast Guard Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Coast Guard */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Coast Guard Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Coast Guard career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">Leadership Path</p>
                        <p className="text-xs text-gray-600 mt-1">Petty Officer to Chief</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">Advanced Training</p>
                        <p className="text-xs text-gray-600 mt-1">Search & Rescue, Maritime Law</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Career Specialization</p>
                        <p className="text-xs text-gray-600 mt-1">Homeland Security roles</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Civilian Transition</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education</p>
                        <p className="text-xs text-gray-600 mt-1">College funding benefits</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Maritime Industry</p>
                        <p className="text-xs text-gray-600 mt-1">Shipping, ports, safety</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Law Enforcement</p>
                        <p className="text-xs text-gray-600 mt-1">Federal, state, local agencies</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">Education Options</TabsTrigger>
                  <TabsTrigger value="career" className="flex-1">Career Paths</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Begin by meeting with a Coast Guard recruiter who will guide you through the ASVAB test, medical screening, and preparation for basic training. The process is selective as the Coast Guard is the smallest military branch.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Basic Training - 8 weeks</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Coast Guard basic training takes place at Cape May, New Jersey. You'll learn seamanship, maritime law, firefighting, water rescue, and other specialized skills unique to the Coast Guard's mission.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">A School (Rate Training)</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Following basic training, you'll attend specialized training for your assigned rate (job specialty). The Coast Guard offers career paths in maritime enforcement, engineering, operations, and more.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="education" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Tuition Assistance Program</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Coast Guard offers tuition assistance for active duty members, helping pay for college courses at accredited institutions during off-duty hours.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Coast Guard Institute</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Coast Guard Institute helps members with their educational needs, including degree programs, testing services, and credit for military training and experience.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Leadership Development</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Throughout your Coast Guard career, you'll have opportunities for leadership training and advancement, including potential selection for officer training programs.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="career" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Coast Guard Career</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        A long-term Coast Guard career offers advancement through the enlisted ranks and specialized roles in maritime safety, security, and emergency response operations.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Maritime Industry</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Coast Guard experience is highly valued in maritime safety, port operations, shipping, and commercial vessel industries, with many veterans moving to these sectors.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Law Enforcement & Emergency Services</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Coast Guard's focus on maritime law enforcement and search and rescue operations makes veterans excellent candidates for positions in law enforcement, emergency management, and homeland security.
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
  // Render Space Force pathway 
  else if (militaryBranch === 'spaceguard') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side: Flow chart diagram */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Military Career Path: Space Force</h3>
            
            <div className="relative bg-white p-6 rounded-lg border shadow-sm">
              {/* Path Visualization - Enhanced Flow Chart */}
              <div className="flex flex-col items-center">
                {/* First Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 1</p>
                  </div>
                  <p className="font-semibold text-blue-900">Enlistment</p>
                  <p className="text-sm text-gray-600 mt-1">After High School</p>
                </div>
                
                {/* Arrow down with service agreement note */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                  <div className="absolute -right-40 top-0 bg-yellow-50 border border-yellow-200 p-2 rounded text-xs max-w-[200px]">
                    <p className="font-semibold text-yellow-800">Service Agreement</p>
                    <p className="text-gray-700">Typically 4-6 year commitment</p>
                  </div>
                </div>
                
                {/* Second Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 2</p>
                  </div>
                  <p className="font-semibold text-blue-900">Basic Military Training</p>
                  <p className="text-sm text-gray-600 mt-1">(BMT)</p>
                  <p className="text-sm text-gray-600">8.5 weeks at Lackland AFB</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-200 h-6 w-6 flex items-center justify-center text-gray-600">
                    <span className="material-icons text-sm">arrow_downward</span>
                  </div>
                </div>
                
                {/* Third Step Box */}
                <div className="w-64 p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm">
                  <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                    <p className="text-xs font-semibold">STEP 3</p>
                  </div>
                  <p className="font-semibold text-blue-900">Technical Training</p>
                  <p className="text-sm text-gray-600 mt-1">(SFSC Training)</p>
                  <p className="text-sm text-gray-600">Space Force Specialty Code</p>
                </div>
                
                {/* Decision Point - Career Path Decision */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="h-8 w-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-yellow-400 h-8 w-8 flex items-center justify-center text-white">
                    <span className="material-icons text-sm">fork_right</span>
                  </div>
                  <div className="py-1 px-3 bg-yellow-100 border border-yellow-200 rounded-lg text-xs text-yellow-800 font-medium mt-1">
                    Career Path Decision Point
                  </div>
                </div>
                
                {/* Branching paths with improved visualization */}
                <div className="flex items-center justify-center mb-6 w-full">
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                  <div className="rounded-full bg-gray-400 h-5 w-5 flex items-center justify-center text-white mx-4">
                    <span className="material-icons text-xs">call_split</span>
                  </div>
                  <div className="w-1/3 h-0.5 bg-gray-400"></div>
                </div>
                
                {/* Two main paths - Space Force Career vs. Civilian Transition */}
                <div className="flex justify-center gap-8 w-full">
                  {/* Left path - Stay in Space Force */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-green-300 rounded-lg text-center bg-green-50 shadow-sm mb-4">
                      <div className="bg-green-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION A</p>
                      </div>
                      <p className="font-semibold text-green-900">Space Force Career</p>
                      <p className="text-xs text-gray-600 mt-1">20+ year career path</p>
                    </div>
                    
                    {/* Space Force career sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                        <p className="font-semibold text-green-800">Specialized Positions</p>
                        <p className="text-xs text-gray-600 mt-1">Space operations, cyber defense</p>
                      </div>
                      
                      <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                        <p className="font-semibold text-blue-800">Advanced Education</p>
                        <p className="text-xs text-gray-600 mt-1">STEM degrees and certifications</p>
                      </div>
                      
                      <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                        <p className="font-semibold text-purple-800">Leadership Track</p>
                        <p className="text-xs text-gray-600 mt-1">Supervisory & command roles</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right path - Transition to Civilian */}
                  <div className="w-1/2 max-w-xs">
                    <div className="p-4 border border-blue-300 rounded-lg text-center bg-blue-50 shadow-sm mb-4">
                      <div className="bg-blue-600 text-white py-1 px-2 rounded-t-md -mt-4 mb-2 mx-auto inline-block">
                        <p className="text-xs font-semibold">OPTION B</p>
                      </div>
                      <p className="font-semibold text-blue-900">Civilian Transition</p>
                      <p className="text-xs text-gray-600 mt-1">After your service commitment</p>
                    </div>
                    
                    {/* Civilian path sub-options */}
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-0.5 bg-gray-400"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="p-3 border border-orange-200 rounded-lg text-center bg-orange-50 text-sm shadow-sm">
                        <p className="font-semibold text-orange-800">GI Bill Education</p>
                        <p className="text-xs text-gray-600 mt-1">College funding benefits</p>
                      </div>
                      
                      <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                        <p className="font-semibold text-indigo-800">Aerospace Industry</p>
                        <p className="text-xs text-gray-600 mt-1">Space companies, satellite operations</p>
                      </div>
                      
                      <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                        <p className="font-semibold text-red-800">Tech & Cybersecurity</p>
                        <p className="text-xs text-gray-600 mt-1">High-demand tech careers</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pathway Connections - Button to explore education/career options */}
                <div className="mt-8 flex flex-col items-center">
                  <div className="text-xs text-gray-500 mb-2">Want to explore post-service options in detail?</div>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 text-xs">
                      <span className="material-icons text-xs mr-1">school</span>
                      Explore Education Pathways
                    </Button>
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 text-xs">
                      <span className="material-icons text-xs mr-1">work</span>
                      Explore Career Options
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side: Information tabs */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-semibold mb-4">Steps in Your Journey</h3>
            
            <div className="border rounded-lg">
              <Tabs defaultValue="getting-started">
                <TabsList className="w-full">
                  <TabsTrigger value="getting-started" className="flex-1">Getting Started</TabsTrigger>
                  <TabsTrigger value="education" className="flex-1">Education Options</TabsTrigger>
                  <TabsTrigger value="career" className="flex-1">Career Paths</TabsTrigger>
                </TabsList>
                
                <TabsContent value="getting-started" className="p-4 space-y-4">
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Enlistment After High School</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Begin with meeting a Space Force recruiter who will guide you through the application process. As the newest and most technical branch, Space Force is highly selective with a focus on STEM aptitude.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Basic Military Training (BMT)</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Space Force guardians attend Air Force Basic Military Training at Lackland AFB in Texas. This 8.5-week program builds military discipline while preparing you for specialized technical training.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technical Training & Specialization</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        After BMT, you'll receive specialized training in your Space Force Specialty Code (SFSC). Key career fields include space operations, intelligence, cyber operations, and engineering.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="education" className="p-4 space-y-4">
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technology Education Programs</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The Space Force emphasizes continuous education in STEM fields with special programs for computer science, engineering, and space-related disciplines.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Tuition Assistance & Scholarships</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Space Force members can access tuition assistance for college courses and specialized technical certifications while serving, with additional scholarships for in-demand fields.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Space Professional Development</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Throughout your career, you'll have access to specialized training in emerging space technology, satellite operations, and cybersecurity through Space Force professional development programs.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="career" className="p-4 space-y-4">
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Space Force Career</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        A Space Force career offers progression through technical specializations in space operations, cyber defense, and intelligence with leadership opportunities in this cutting-edge branch.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Space Industry</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        Space Force skills are in high demand at aerospace companies, satellite operations firms, and commercial space ventures, with many guardians transitioning to roles at SpaceX, Blue Origin, and other industry leaders.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-purple-100">
                    <CardContent className="pt-4">
                      <h4 className="font-medium">Technology & Cybersecurity</h4>
                      <p className="text-sm text-gray-600 mt-2">
                        The technical training received in the Space Force makes veterans highly sought after in technology fields, particularly cybersecurity, network operations, and systems engineering.
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
  // Default return (shouldn't reach this if valid branch is provided)
  return (
    <div className="p-8 text-center">
      <div className="text-lg font-medium mb-4">Please select a military branch to view its career pathway.</div>
      <Button variant="outline" onClick={handleBack}>
        <span className="material-icons mr-2">arrow_back</span>
        Back to Selection
      </Button>
    </div>
  );
};