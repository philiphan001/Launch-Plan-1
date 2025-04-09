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
                  <p className="font-medium">Basic Training</p>
                  <p className="text-sm text-gray-600">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">8-13 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Third step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Advanced Training</p>
                  <p className="text-sm text-gray-600">(AIT/Technical School)</p>
                  <p className="text-sm text-gray-600">Specialized Skills</p>
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
                        <p className="font-medium">Tuition Assistance</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Online Classes</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">CLEP Exams</p>
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
                        <p className="font-medium">Civilian Transition</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-2">
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">GI Bill Education</p>
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
                          The process begins with connecting with a recruiter and going through the Military Entrance Processing Station (MEPS) which includes aptitude tests, medical exams, and career counseling.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Basic Training (Boot Camp) 8-13 weeks</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Army Basic Combat Training (BCT) is a 10-week course that challenges you mentally and physically. You'll learn military skills, Army values, and build physical fitness.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Advanced Training (AIT/Technical School)</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          After Basic Training, you'll attend Advanced Individual Training (AIT) to learn the specialized skills needed for your Military Occupational Specialty (MOS). Length varies from 4 weeks to over a year depending on specialization.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="education" className="p-4 space-y-4">
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Tuition Assistance</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Army offers Tuition Assistance (TA) that can pay up to 100% of tuition costs for courses taken during off-duty hours, up to $4,000 per fiscal year.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Online/Evening Classes</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Many service members pursue education through online programs or evening classes at colleges located near military installations that accommodate military schedules.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">CLEP/DANTES Exams</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          These programs allow service members to earn college credit by testing out of subjects they already know, accelerating degree completion and reducing costs.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="career" className="p-4 space-y-4">
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Military Career Advancement</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Service members can pursue a full military career with promotions, leadership opportunities, and specialized training. Career soldiers can retire after 20 years with pension and benefits.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">Civilian Transition</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          Military experience provides valuable skills for civilian careers. The Army offers transition assistance programs to help soldiers translate their military skills for civilian employers.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-100">
                      <CardContent className="pt-4">
                        <h4 className="font-medium">GI Bill Education</h4>
                        <p className="text-sm text-gray-600 mt-2">
                          The Post-9/11 GI Bill provides education benefits for service members who have served on active duty for 90 days or more. Benefits can include full tuition at public universities, housing allowance, and book stipends.
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
    } else if (militaryBranch === 'navy') {
      return (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side: Flow chart diagram */}
            <div className="md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">Military Career Path: Navy</h3>
              
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
                  <p className="font-medium">Basic Training</p>
                  <p className="text-sm text-gray-600">(Boot Camp)</p>
                  <p className="text-sm text-gray-600">8 weeks</p>
                </div>
                
                {/* Arrow down */}
                <div className="flex justify-center mb-4">
                  <span className="material-icons text-gray-400">arrow_downward</span>
                </div>
                
                {/* Third step box */}
                <div className="mx-auto w-64 p-3 border rounded-lg text-center mb-4 bg-blue-50">
                  <p className="font-medium">Advanced Training</p>
                  <p className="text-sm text-gray-600">("A" School)</p>
                  <p className="text-sm text-gray-600">Specialized Rating Skills</p>
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
                        <p className="font-medium">Navy College Program</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">NCPACE Courses</p>
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
                        <p className="font-medium">Navy Leadership</p>
                      </div>
                      <div className="w-32 p-2 border rounded-lg text-center text-xs bg-green-50">
                        <p className="font-medium">Maritime Industry</p>
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