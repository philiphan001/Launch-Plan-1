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
  // Render pathway based on military branch
  const renderPathway = () => {
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
                        <div className="flex justify-between items-center mt-2 bg-gray-50 p-2 rounded-md">
                          <div className="text-center">
                            <p className="text-xs font-semibold">E-1</p>
                            <p className="text-xs text-gray-500">Private</p>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="text-center">
                            <p className="text-xs font-semibold">E-5</p>
                            <p className="text-xs text-gray-500">Sergeant</p>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="text-center">
                            <p className="text-xs font-semibold">E-8/E-9</p>
                            <p className="text-xs text-gray-500">Master Sergeant/SGM</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Education While Serving</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Army offers multiple paths for continuing education:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 pl-4 list-disc">
                          <li><strong>Tuition Assistance:</strong> Up to $4,000 annually for college courses</li>
                          <li><strong>Credentialing Programs:</strong> Earn civilian certifications related to your MOS</li>
                          <li><strong>Green to Gold:</strong> Program for enlisted soldiers to earn degrees and commissions as officers</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Retirement Benefits</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          After 20+ years of service, qualify for:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 pl-4 list-disc">
                          <li>Monthly retirement pay for life</li>
                          <li>TRICARE health coverage for you and your family</li>
                          <li>Commissary and exchange privileges</li>
                          <li>VA benefits and services</li>
                        </ul>
                        <p className="text-xs mt-2 text-gray-500 italic">
                          Note: Newer service members use the Blended Retirement System (BRS) which includes a Thrift Savings Plan with military contributions.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="civilian-path" className="p-4 space-y-4">
                    <div className="mb-4 flex items-center">
                      <div className="bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        <p className="text-white text-xs font-bold">B</p>
                      </div>
                      <h3 className="font-semibold text-blue-900">Transition to Civilian Life</h3>
                    </div>
                    
                    <Card className="border-orange-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">GI Bill Education Benefits</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          After completing your service, the Post-9/11 GI Bill provides:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 pl-4 list-disc">
                          <li>Full tuition at public state universities</li>
                          <li>Monthly housing allowance based on school location</li>
                          <li>Annual book/supplies stipend up to $1,000</li>
                          <li>Up to 36 months of benefits (4 academic years)</li>
                        </ul>
                        <div className="mt-2 bg-yellow-50 p-2 rounded-md text-xs">
                          <p className="font-medium text-yellow-800">Connect to Education Pathway:</p>
                          <p className="text-gray-700">After military service, you can use your GI Bill to pursue higher education options including 4-year universities, community colleges, or vocational training programs.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-indigo-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Civilian Career Opportunities</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Military experience translates well to many civilian career fields:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 pl-4 list-disc">
                          <li><strong>Law Enforcement/Security:</strong> Police, federal agencies, private security</li>
                          <li><strong>Technical Fields:</strong> IT, cybersecurity, equipment maintenance</li>
                          <li><strong>Healthcare:</strong> Medical technicians, healthcare administration</li>
                          <li><strong>Logistics:</strong> Supply chain management, transportation</li>
                          <li><strong>Leadership Roles:</strong> Project management, team supervision</li>
                        </ul>
                        <div className="mt-2 bg-purple-50 p-2 rounded-md text-xs">
                          <p className="font-medium text-purple-800">Connect to Career Pathway:</p>
                          <p className="text-gray-700">Your military training and experience provide valuable skills for civilian careers. Transition services will help you translate military experience to civilian job qualifications.</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-red-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Transition Support Programs</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Army provides extensive transition support:
                        </p>
                        <ul className="text-sm text-gray-600 mt-1 pl-4 list-disc">
                          <li><strong>Transition Assistance Program (TAP):</strong> Career workshops, resume building, interview skills</li>
                          <li><strong>VA Benefits Briefings:</strong> Education on available healthcare and benefit programs</li>
                          <li><strong>Career Skills Programs:</strong> Training and internships with civilian employers before separation</li>
                          <li><strong>Hiring Preferences:</strong> Federal job preferences for veterans</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (militaryBranch === 'navy') {
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
                    <p className="font-semibold text-blue-900">Recruit Training</p>
                    <p className="text-sm text-gray-600 mt-1">(Boot Camp)</p>
                    <p className="text-sm text-gray-600">8 weeks at Great Lakes</p>
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
                    <p className="text-sm text-gray-600 mt-1">("A" School)</p>
                    <p className="text-sm text-gray-600">Rating-Specific Training</p>
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
                        <p className="text-xs text-gray-600 mt-1">Sea/shore rotations</p>
                      </div>
                      
                      {/* Navy career sub-options */}
                      <div className="flex justify-center mb-2">
                        <div className="h-6 w-0.5 bg-gray-400"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div className="p-3 border border-green-200 rounded-lg text-center bg-green-50 text-sm shadow-sm">
                          <p className="font-semibold text-green-800">Sea Duty Assignments</p>
                          <p className="text-xs text-gray-600 mt-1">Ships, Submarines, Aircraft</p>
                        </div>
                        
                        <div className="p-3 border border-blue-200 rounded-lg text-center bg-blue-50 text-sm shadow-sm">
                          <p className="font-semibold text-blue-800">Navy College Program</p>
                          <p className="text-xs text-gray-600 mt-1">Education while serving</p>
                        </div>
                        
                        <div className="p-3 border border-purple-200 rounded-lg text-center bg-purple-50 text-sm shadow-sm">
                          <p className="font-semibold text-purple-800">Advancement</p>
                          <p className="text-xs text-gray-600 mt-1">E-1 to E-9 progression</p>
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
                          <p className="text-xs text-gray-600 mt-1">College degree funding</p>
                        </div>
                        
                        <div className="p-3 border border-indigo-200 rounded-lg text-center bg-indigo-50 text-sm shadow-sm">
                          <p className="font-semibold text-indigo-800">Maritime Industry</p>
                          <p className="text-xs text-gray-600 mt-1">Shipping, ports, offshore</p>
                        </div>
                        
                        <div className="p-3 border border-red-200 rounded-lg text-center bg-red-50 text-sm shadow-sm">
                          <p className="font-semibold text-red-800">Technical Careers</p>
                          <p className="text-xs text-gray-600 mt-1">Engineering, electronics, IT</p>
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
                          Start your Navy journey by meeting with a recruiter, going through the Military Entrance Processing Station (MEPS), and choosing your career path (rating).
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Basic Training (Boot Camp) 8 weeks</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Navy basic training takes place at Naval Station Great Lakes, Illinois. You'll learn military procedures, naval history, first aid, firefighting, and water survival skills.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Advanced Training ("A" School)</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          After Boot Camp, you'll attend "A" School for specific job training in your rating. The length varies from a few weeks to over a year depending on your specialization.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="education" className="p-4 space-y-4">
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Navy College Program</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Navy College Program helps sailors pursue certificates and degrees through partnerships with colleges and universities that offer Navy-relevant education.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">NCPACE Courses</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Navy College Program for Afloat College Education (NCPACE) offers courses to sailors while deployed at sea, allowing education to continue during deployments.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Tuition Assistance and CLEP</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Navy Tuition Assistance can pay up to 100% of tuition costs, and the College Level Examination Program (CLEP) allows sailors to earn college credit by exam.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="career" className="p-4 space-y-4">
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Navy Leadership</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Career sailors can advance through enlisted ranks or pursue commissioning as an officer through programs like Officer Candidate School (OCS) or the Limited Duty Officer (LDO) program.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Maritime Industry</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Naval experience is highly valued in civilian maritime industries including shipping, port operations, and offshore energy. Many sailors transition to these sectors after service.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">GI Bill Benefits</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Post-9/11 GI Bill provides comprehensive education benefits after service, covering tuition, housing, and books for college, vocational training, or other approved educational programs.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (militaryBranch === 'airforce') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side: Flow chart diagram */}
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">Military Career Path: Air Force</h3>
              
              <div className="relative bg-white p-6 rounded-lg border shadow-sm">
                {/* First step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Enlistment</p>
                  <p className="text-sm text-gray-600">After High School</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Second step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Basic Military Training</p>
                  <p className="text-sm text-gray-600">(BMT)</p>
                  <p className="text-sm text-gray-600">8.5 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Third step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Technical Training</p>
                  <p className="text-sm text-gray-600">(AFSC Training)</p>
                  <p className="text-sm text-gray-600">Air Force Specialty Code</p>
                </div>
                
                {/* Branching paths */}
                <div className="flex justify-center mb-2">
                  <div className="flex items-center">
                    <div className="w-32 border-b border-gray-400"></div>
                    <span className="material-icons text-gray-400 mx-2">call_split</span>
                    <div className="w-32 border-b border-gray-400"></div>
                  </div>
                </div>
                
                {/* Two paths side by side */}
                <div className="flex justify-center gap-20 mb-4">
                  <div>
                    <div className="w-48 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                      <p className="font-medium">Education Options</p>
                      <p className="text-sm text-gray-600">While Serving</p>
                    </div>
                    
                    {/* Branching education options */}
                    <div className="flex justify-center mb-2">
                      <div className="flex items-center">
                        <div className="w-5 border-b border-gray-400"></div>
                        <span className="material-icons text-gray-400 mx-2">call_split</span>
                        <div className="w-5 border-b border-gray-400"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">CCAF</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">AU-ABC Program</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="w-48 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                      <p className="font-medium">Career Outcomes</p>
                    </div>
                    
                    {/* Branching career outcomes */}
                    <div className="flex justify-center mb-2">
                      <div className="flex items-center">
                        <div className="w-5 border-b border-gray-400"></div>
                        <span className="material-icons text-gray-400 mx-2">call_split</span>
                        <div className="w-5 border-b border-gray-400"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Military Career</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Aerospace</p>
                      </div>
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
        </div>
      );
    } else if (militaryBranch === 'marines') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side: Flow chart diagram */}
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">Military Career Path: Marines</h3>
              
              <div className="relative bg-white p-6 rounded-lg border shadow-sm">
                {/* First step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Enlistment</p>
                  <p className="text-sm text-gray-600">After High School</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Second step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Recruit Training</p>
                  <p className="text-sm text-gray-600">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">13 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Third step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Combat Training & MOS School</p>
                  <p className="text-sm text-gray-600">(Military Occupational Specialty)</p>
                </div>
                
                {/* Branching paths */}
                <div className="flex justify-center mb-2">
                  <div className="flex items-center">
                    <div className="w-32 border-b border-gray-400"></div>
                    <span className="material-icons text-gray-400 mx-2">call_split</span>
                    <div className="w-32 border-b border-gray-400"></div>
                  </div>
                </div>
                
                {/* Two paths side by side */}
                <div className="flex justify-center gap-20 mb-4">
                  <div>
                    <div className="w-48 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                      <p className="font-medium">Education Options</p>
                      <p className="text-sm text-gray-600">While Serving</p>
                    </div>
                    
                    {/* Branching education options */}
                    <div className="flex justify-center mb-2">
                      <div className="flex items-center">
                        <div className="w-5 border-b border-gray-400"></div>
                        <span className="material-icons text-gray-400 mx-2">call_split</span>
                        <div className="w-5 border-b border-gray-400"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">MCCS Programs</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Tuition Assistance</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="w-48 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                      <p className="font-medium">Career Outcomes</p>
                    </div>
                    
                    {/* Branching career outcomes */}
                    <div className="flex justify-center mb-2">
                      <div className="flex items-center">
                        <div className="w-5 border-b border-gray-400"></div>
                        <span className="material-icons text-gray-400 mx-2">call_split</span>
                        <div className="w-5 border-b border-gray-400"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Marine Corps Career</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Law Enforcement</p>
                      </div>
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
                        <h4 className="font-medium">Recruit Training (Boot Camp) 13 weeks</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Marine Corps Boot Camp is the longest and most physically demanding of all branches, taking place at Parris Island, SC or San Diego, CA. You'll develop discipline, physical fitness, and Marine Corps values.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Combat Training & MOS School</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          After Boot Camp, you'll attend Marine Combat Training followed by Military Occupational Specialty (MOS) school to learn your specific job skills, from infantry to technical specialties.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="education" className="p-4 space-y-4">
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Marine Corps Community Services (MCCS)</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          MCCS offers education programs including voluntary education, testing services, and academic counseling to help Marines pursue higher education while serving.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Tuition Assistance</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Marine Corps offers Tuition Assistance that can fund up to 100% of tuition costs for approved courses, up to annual limits, allowing Marines to pursue degrees while on active duty.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Leadership Development</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Marine Corps emphasizes leadership training throughout a Marine's career, providing valuable skills that translate to both military advancement and civilian leadership roles.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="career" className="p-4 space-y-4">
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Marine Corps Career</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          A career in the Marines offers advancement through the enlisted or officer ranks with retirement benefits after 20 years. Marines can pursue specialized training and leadership opportunities.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Law Enforcement & Security</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The discipline, physical fitness, and tactical training Marines receive make them highly sought after in law enforcement, federal agencies, and private security sectors.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Leadership & Management</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Marine Corps leadership experience is highly valued in civilian organizations. Former Marines often excel in management positions across various industries due to their discipline and leadership skills.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Default template for other branches
      return (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold mb-4">Military Career Path: {militaryBranch.charAt(0).toUpperCase() + militaryBranch.slice(1)}</h3>
          <p className="mb-4">We're still building detailed information for this branch. Here's what a typical military career path looks like:</p>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 p-3 border rounded-lg text-center mb-2 bg-blue-50">
              <p className="font-medium">Enlistment After High School</p>
            </div>
            <span className="material-icons text-gray-400 my-2">arrow_downward</span>
            
            <div className="w-64 p-3 border rounded-lg text-center mb-2 bg-blue-50">
              <p className="font-medium">Basic Training</p>
            </div>
            <span className="material-icons text-gray-400 my-2">arrow_downward</span>
            
            <div className="w-64 p-3 border rounded-lg text-center mb-2 bg-blue-50">
              <p className="font-medium">Technical/Specialized Training</p>
            </div>
            <span className="material-icons text-gray-400 my-2">arrow_downward</span>
            
            <div className="flex justify-center gap-4">
              <div className="w-48 p-3 border rounded-lg text-center bg-green-50">
                <p className="font-medium">Military Career</p>
              </div>
              <div className="w-48 p-3 border rounded-lg text-center bg-green-50">
                <p className="font-medium">Education Opportunities</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      {renderPathway()}
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button 
          onClick={handleNext}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};