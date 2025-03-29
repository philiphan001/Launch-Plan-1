import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const Settings = () => {
  const { toast } = useToast();
  
  // User info state
  const [firstName, setFirstName] = useState("Alex");
  const [lastName, setLastName] = useState("Johnson");
  const [email, setEmail] = useState("alex.johnson@example.com");
  const [currentLocation, setCurrentLocation] = useState("Seattle, WA");
  const [zipCode, setZipCode] = useState("98101");
  
  // Financial profile state
  const [householdIncome, setHouseholdIncome] = useState("75000");
  const [householdSize, setHouseholdSize] = useState("4");
  const [savingsAmount, setSavingsAmount] = useState("10000");
  const [studentLoanAmount, setStudentLoanAmount] = useState("0");
  const [otherDebtAmount, setOtherDebtAmount] = useState("0");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [financialAlerts, setFinancialAlerts] = useState(true);
  const [careerUpdates, setCareerUpdates] = useState(true);
  const [scholarshipAlerts, setScholarshipAlerts] = useState(true);
  
  // Favorites
  const { data: favoriteColleges } = useQuery({
    queryKey: ['/api/user/favorites/colleges'],
    queryFn: async () => {
      return [
        { id: "1", name: "University of Washington" },
        { id: "2", name: "Stanford University" }
      ];
    },
    // Disable actual fetching for now
    enabled: false
  });
  
  const { data: favoriteCareers } = useQuery({
    queryKey: ['/api/user/favorites/careers'],
    queryFn: async () => {
      return [
        { id: "1", title: "Software Developer" },
        { id: "2", title: "Financial Analyst" }
      ];
    },
    // Disable actual fetching for now
    enabled: false
  });
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };
  
  const handleSaveFinancial = () => {
    toast({
      title: "Financial data updated",
      description: "Your financial information has been saved.",
    });
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences updated",
      description: "Your notification settings have been saved.",
    });
  };
  
  const removeFavoriteCollege = (id: string) => {
    toast({
      title: "College removed",
      description: "College has been removed from your favorites.",
    });
  };
  
  const removeFavoriteCareer = (id: string) => {
    toast({
      title: "Career removed",
      description: "Career has been removed from your favorites.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="financial">Financial Profile</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Personal Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Current Location</Label>
                    <Input 
                      id="location" 
                      value={currentLocation} 
                      onChange={(e) => setCurrentLocation(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input 
                      id="zipCode" 
                      value={zipCode} 
                      onChange={(e) => setZipCode(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <Button className="mt-6" onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Account Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    placeholder="Enter current password" 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    placeholder="Enter new password" 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="Confirm new password" 
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button className="mt-6">Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Financial Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="income">Annual Household Income</Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="income" 
                      type="number" 
                      value={householdIncome} 
                      onChange={(e) => setHouseholdIncome(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Select 
                    value={householdSize} 
                    onValueChange={setHouseholdSize}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select household size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 person</SelectItem>
                      <SelectItem value="2">2 people</SelectItem>
                      <SelectItem value="3">3 people</SelectItem>
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="5">5 people</SelectItem>
                      <SelectItem value="6+">6+ people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="savings">Current Savings</Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="savings" 
                      type="number" 
                      value={savingsAmount} 
                      onChange={(e) => setSavingsAmount(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="studentLoans">Student Loan Debt</Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="studentLoans" 
                      type="number" 
                      value={studentLoanAmount} 
                      onChange={(e) => setStudentLoanAmount(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="otherDebt">Other Debt</Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="otherDebt" 
                      type="number" 
                      value={otherDebtAmount} 
                      onChange={(e) => setOtherDebtAmount(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <Button className="mt-6" onClick={handleSaveFinancial}>Save Financial Information</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Favorite Colleges</h3>
                
                {favoriteColleges && favoriteColleges.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteColleges.map((college) => (
                      <div 
                        key={college.id} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="material-icons text-primary mr-2">school</span>
                          <span>{college.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeFavoriteCollege(college.id)}
                          >
                            <span className="material-icons text-gray-500">close</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-icons text-gray-400 text-3xl">bookmark_border</span>
                    <p className="text-gray-500 mt-2">No favorite colleges added yet</p>
                    <Button className="mt-4">Explore Colleges</Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Favorite Careers</h3>
                
                {favoriteCareers && favoriteCareers.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteCareers.map((career) => (
                      <div 
                        key={career.id} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="material-icons text-primary mr-2">work</span>
                          <span>{career.title}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => removeFavoriteCareer(career.id)}
                          >
                            <span className="material-icons text-gray-500">close</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-icons text-gray-400 text-3xl">bookmark_border</span>
                    <p className="text-gray-500 mt-2">No favorite careers added yet</p>
                    <Button className="mt-4">Explore Careers</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Saved Financial Projections</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="material-icons text-primary mr-2">trending_up</span>
                    <div>
                      <p className="font-medium">My Career Plan</p>
                      <p className="text-xs text-gray-500">Created: May 15, 2023</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">View</Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <span className="material-icons text-gray-500">close</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="material-icons text-primary mr-2">trending_up</span>
                    <div>
                      <p className="font-medium">College Comparison</p>
                      <p className="text-xs text-gray-500">Created: June 2, 2023</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">View</Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <span className="material-icons text-gray-500">close</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Financial Alerts</h4>
                    <p className="text-sm text-gray-500">Get alerts about your financial projections</p>
                  </div>
                  <Switch
                    checked={financialAlerts}
                    onCheckedChange={setFinancialAlerts}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Career Updates</h4>
                    <p className="text-sm text-gray-500">Updates about careers you've saved</p>
                  </div>
                  <Switch
                    checked={careerUpdates}
                    onCheckedChange={setCareerUpdates}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Scholarship Alerts</h4>
                    <p className="text-sm text-gray-500">Notifications about available scholarships</p>
                  </div>
                  <Switch
                    checked={scholarshipAlerts}
                    onCheckedChange={setScholarshipAlerts}
                  />
                </div>
              </div>
              
              <Button className="mt-6" onClick={handleSaveNotifications}>Save Notification Settings</Button>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-gray-500">Allow us to collect usage data to improve the application</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Share Anonymous Data</h4>
                    <p className="text-sm text-gray-500">Share anonymous data for educational research</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Button className="mt-6">Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
