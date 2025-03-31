import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SavedCalculationsSection from "@/components/profile/SavedCalculationsSection";

// Types for the favorites
type FavoriteCollege = {
  id: number;
  userId: number;
  collegeId: number;
  college: {
    id: number;
    name: string;
    location: string | null;
    state: string | null;
    type: string | null;
    // Other college properties...
  };
};

type FavoriteCareer = {
  id: number;
  userId: number;
  careerId: number;
  createdAt?: string;
  career?: {
    id: number;
    title: string;
    description?: string;
    salary?: number;
  };
};

const Profile = () => {
  const { toast } = useToast();
  
  // User info state
  const [firstName, setFirstName] = useState("Philip");
  const [lastName, setLastName] = useState("Han");
  const [email, setEmail] = useState("philip.han@example.com");
  const [currentLocation, setCurrentLocation] = useState("Seattle, WA");
  const [zipCode, setZipCode] = useState("98101");
  const [birthYear, setBirthYear] = useState(1998);
  
  // Financial profile state
  const [householdIncome, setHouseholdIncome] = useState("75000");
  const [householdSize, setHouseholdSize] = useState("4");
  const [savingsAmount, setSavingsAmount] = useState("10000");
  const [studentLoanAmount, setStudentLoanAmount] = useState("0");
  const [otherDebtAmount, setOtherDebtAmount] = useState("0");
  
  // Temporary user ID for demo purposes
  const temporaryUserId = 1;

  // Fetch favorite colleges
  const { data: favoriteColleges = [], isLoading: isLoadingColleges } = useQuery({
    queryKey: ['/api/favorites/colleges', temporaryUserId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/colleges/${temporaryUserId}`);
      if (!response.ok) throw new Error('Failed to fetch favorite colleges');
      const data = await response.json();
      return data;
    }
  });
  
  // Fetch favorite careers
  const { data: favoriteCareers = [], isLoading: isLoadingCareers } = useQuery({
    queryKey: ['/api/favorites/careers', temporaryUserId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/careers/${temporaryUserId}`);
      if (!response.ok) throw new Error('Failed to fetch favorite careers');
      const data = await response.json();
      return data;
    }
  });
  
  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${temporaryUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          location: currentLocation,
          zipCode,
          birthYear,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile information.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate();
  };
  
  // Update financial profile mutation
  const updateFinancialMutation = useMutation({
    mutationFn: async () => {
      // First check if financial profile exists for this user
      const checkResponse = await fetch(`/api/financial-profiles/user/${temporaryUserId}`);
      const existingProfile = checkResponse.ok ? await checkResponse.json() : null;
      
      const financialData = {
        userId: temporaryUserId,
        householdIncome: parseInt(householdIncome) || 0,
        householdSize: parseInt(householdSize) || 1,
        savingsAmount: parseInt(savingsAmount) || 0,
        studentLoanAmount: parseInt(studentLoanAmount) || 0,
        otherDebtAmount: parseInt(otherDebtAmount) || 0,
      };
      
      let response;
      
      if (existingProfile) {
        // Update existing profile
        response = await fetch(`/api/financial-profiles/${existingProfile.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(financialData),
        });
      } else {
        // Create new profile
        response = await fetch('/api/financial-profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(financialData),
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to update financial profile');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Financial data updated",
        description: "Your financial information has been saved.",
      });
    },
    onError: (error) => {
      console.error("Error updating financial profile:", error);
      toast({
        title: "Error updating financial data",
        description: "There was a problem updating your financial information.",
        variant: "destructive",
      });
    }
  });

  const handleSaveFinancial = () => {
    updateFinancialMutation.mutate();
  };
  
  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Remove favorite college mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await fetch(`/api/favorites/colleges/${favoriteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove favorite college');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/colleges', temporaryUserId] });
      toast({
        title: "College removed",
        description: "College has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite college:", error);
      toast({
        title: "Error removing college",
        description: "There was a problem removing this college from your favorites.",
        variant: "destructive",
      });
    }
  });

  const removeFavoriteCollege = (id: number) => {
    removeFavoriteMutation.mutate(id);
  };
  
  // Remove favorite career mutation
  const removeFavoriteCareerMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await fetch(`/api/favorites/careers/${favoriteId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove favorite career');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites/careers', temporaryUserId] });
      toast({
        title: "Career removed",
        description: "Career has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite career:", error);
      toast({
        title: "Error removing career",
        description: "There was a problem removing this career from your favorites.",
        variant: "destructive",
      });
    }
  });

  const removeFavoriteCareer = (id: number) => {
    removeFavoriteCareerMutation.mutate(id);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">User Profile</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="financial">Financial Profile</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="calculations">Saved Calculations</TabsTrigger>
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
                
                <div>
                  <Label htmlFor="birthYear">Birth Year</Label>
                  <Input 
                    id="birthYear" 
                    type="number" 
                    value={birthYear} 
                    onChange={(e) => setBirthYear(parseInt(e.target.value))} 
                    className="mt-1"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
              
              <Button className="mt-6" onClick={handleSaveProfile}>Save Changes</Button>
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
                    {favoriteColleges.map((favoriteCollege: FavoriteCollege) => (
                      <div 
                        key={favoriteCollege.id} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="font-bold text-primary mr-2">🎓</span>
                          <span>{favoriteCollege.college.name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => removeFavoriteCollege(favoriteCollege.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-gray-400 text-3xl">📚</span>
                    <p className="text-gray-500 mt-2">No favorite colleges added yet</p>
                    <Button className="mt-4" onClick={() => window.location.href = "/colleges"}>
                      Explore Colleges
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Favorite Careers</h3>
                
                {favoriteCareers && favoriteCareers.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteCareers.map((career: FavoriteCareer) => (
                      <div 
                        key={career.id} 
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="font-bold text-primary mr-2">💼</span>
                          <span>{career.career?.title || "Unknown Career"}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => removeFavoriteCareer(career.id)}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="text-gray-400 text-3xl">💼</span>
                    <p className="text-gray-500 mt-2">No favorite careers added yet</p>
                    <Button className="mt-4" onClick={() => window.location.href = "/careers"}>
                      Explore Careers
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="calculations">
          <SavedCalculationsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;