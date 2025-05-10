import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SavedCalculationsSection from "@/components/profile/SavedCalculationsSection";
import { AuthProps } from "@/interfaces/auth";
import CollegeList from "@/components/profile/CollegeList";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
  FavoritesService,
  FavoriteCollege,
  FavoriteCareer,
} from "@/services/favoritesService";
import { apiRequest } from "@/lib/queryClient";

interface ProfileProps {
  user?: AuthProps["user"];
}

const Profile = ({ user }: ProfileProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use the authenticated user's ID from props
  const userId = user?.id;

  // User info state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [birthYear, setBirthYear] = useState(0);

  // Financial profile state
  const [householdIncome, setHouseholdIncome] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [studentLoanAmount, setStudentLoanAmount] = useState("");
  const [otherDebtAmount, setOtherDebtAmount] = useState("");

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch financial profile
  const { data: financialProfile, isLoading: isLoadingFinancialProfile } = useQuery({
    queryKey: ["/api/financial-profiles/user", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest(`/api/financial-profiles/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch financial profile");
      return response.json();
    },
    enabled: !!userId,
    staleTime: 600000, // 10 minutes
  });

  // Update local state when user data is loaded
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setEmail(userData.email || "");
      setZipCode(userData.zipCode || "");
      setBirthYear(userData.birthYear || 0);
    }
  }, [userData]);

  // Update local state when financial profile is loaded
  useEffect(() => {
    if (financialProfile) {
      setHouseholdIncome(financialProfile.householdIncome?.toString() || "");
      setSavingsAmount(financialProfile.savingsAmount?.toString() || "");
      setStudentLoanAmount(financialProfile.studentLoanAmount?.toString() || "");
      setOtherDebtAmount(financialProfile.otherDebtAmount?.toString() || "");
    }
  }, [financialProfile]);

  // Fetch favorite colleges using FavoritesService
  const { data: favoriteColleges = [], isLoading: isLoadingColleges } =
    useQuery({
      queryKey: ["/api/favorites/colleges", userId],
      queryFn: async () => {
        if (!userId) return [];
        return await FavoritesService.getFavoriteColleges(userId);
      },
      enabled: !!userId,
    });

  // Fetch favorite careers using FavoritesService
  const { data: favoriteCareers = [], isLoading: isLoadingCareers } = useQuery({
    queryKey: ["/api/favorites/careers", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await FavoritesService.getFavoriteCareers(userId);
    },
    enabled: !!userId,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          zipCode,
          birthYear,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the user data cache to refresh the profile
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
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
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate();
  };

  // Update financial profile mutation
  const updateFinancialMutation = useMutation({
    mutationFn: async () => {
      // First check if financial profile exists for this user
      const checkResponse = await apiRequest(
        `/api/financial-profiles/user/${userId}`
      );
      let existingProfile = null;
      if (checkResponse.ok) {
        existingProfile = await checkResponse.json();
      } else if (checkResponse.status === 404) {
        // Auto-create a new profile with default values if not found
        const createResponse = await apiRequest("/api/financial-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            householdIncome: 60000,
            savingsAmount: 5000,
            studentLoanAmount: 0,
            otherDebtAmount: 0,
          }),
        });
        if (!createResponse.ok) {
          throw new Error("Failed to create financial profile");
        }
        existingProfile = await createResponse.json();
      }

      const financialData = {
        userId: userId,
        householdIncome: parseInt(householdIncome) || 0,
        savingsAmount: parseInt(savingsAmount) || 0,
        studentLoanAmount: parseInt(studentLoanAmount) || 0,
        otherDebtAmount: parseInt(otherDebtAmount) || 0,
      };

      let response;

      if (existingProfile) {
        // Update existing profile
        response = await apiRequest(
          `/api/financial-profiles/${existingProfile.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(financialData),
          }
        );
      } else {
        // Should not reach here, but fallback to create
        response = await apiRequest("/api/financial-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(financialData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to update financial profile");
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
    },
  });

  const handleSaveFinancial = () => {
    updateFinancialMutation.mutate();
  };

  // Remove favorite college mutation using FavoritesService
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return await FavoritesService.removeCollegeFromFavorites(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/favorites/colleges", userId],
      });
      toast({
        title: "College removed",
        description: "College has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite college:", error);
      toast({
        title: "Error removing college",
        description:
          "There was a problem removing this college from your favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteCollege = (id: number) => {
    removeFavoriteMutation.mutate(id);
  };

  // Remove favorite career mutation using FavoritesService
  const removeFavoriteCareerMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return await FavoritesService.removeCareerFromFavorites(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/favorites/careers", userId],
      });
      toast({
        title: "Career removed",
        description: "Career has been removed from your favorites.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite career:", error);
      toast({
        title: "Error removing career",
        description:
          "There was a problem removing this career from your favorites.",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteCareer = (id: number) => {
    removeFavoriteCareerMutation.mutate(id);
  };

  // Ensure financial profile exists on mount
  useEffect(() => {
    if (!userId) return;
    (async () => {
      const response = await apiRequest(`/api/financial-profiles/user/${userId}`);
      if (response.status === 404) {
        // Create default profile
        await apiRequest("/api/financial-profiles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            householdIncome: 60000,
            savingsAmount: 5000,
            studentLoanAmount: 0,
            otherDebtAmount: 0,
          }),
        });
      }
    })();
  }, [userId]);

  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">
        User Profile
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="financial">Financial Profile</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites</TabsTrigger>
          <TabsTrigger value="calculations">Saved Calculations</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
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
                    readOnly
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Try 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San
                      Francisco), or 30328 (Atlanta) for example data.
                    </p>
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

              <Button className="mt-6" onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Financial Information
              </h3>

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

              <Button className="mt-6" onClick={handleSaveFinancial}>
                Save Financial Information
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="colleges" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colleges">Colleges</TabsTrigger>
                    <TabsTrigger value="careers">Careers</TabsTrigger>
                    <TabsTrigger value="cities">Cities</TabsTrigger>
                  </TabsList>
                  <TabsContent value="colleges">
                    {userId && <CollegeList userId={userId} />}
                  </TabsContent>
                  <TabsContent value="careers">
                    {favoriteCareers && favoriteCareers.length > 0 ? (
                      <div className="space-y-3">
                        {favoriteCareers.map((favorite: FavoriteCareer) => (
                          <div
                            key={favorite.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center">
                              <span className="font-bold text-primary mr-2">
                                💼
                              </span>
                              <span>
                                {favorite.career?.title || "Unknown Career"}
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-destructive"
                                onClick={() =>
                                  removeFavoriteCareer(favorite.id)
                                }
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        No favorite careers yet
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="cities">
                    {userId ? (
                      <SavedCitiesList userId={userId} />
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        Please sign in to view your saved cities.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculations">
          <SavedCalculationsSection 
            user={user} 
            defaultTab={new URLSearchParams(window.location.search).get("subtab") || undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SavedCitiesList({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: favoriteLocations = [], isLoading } = useQuery({
    queryKey: ["/api/favorites/locations", userId],
    queryFn: async () => {
      return await FavoritesService.getFavoriteLocations(userId);
    },
    enabled: !!userId,
  });
  const removeFavoriteLocationMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      return await FavoritesService.removeLocationFromFavorites(favoriteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/locations", userId] });
      toast({
        title: "City removed",
        description: "City has been removed from your saved cities.",
      });
    },
    onError: (error) => {
      console.error("Error removing favorite city:", error);
      toast({
        title: "Error removing city",
        description: "There was a problem removing this city from your saved cities.",
        variant: "destructive",
      });
    },
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!favoriteLocations.length) {
    return <div className="text-center py-6 text-muted-foreground">No saved cities yet</div>;
  }
  return (
    <div className="space-y-3">
      {favoriteLocations.map((loc) => (
        <div key={loc.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
          <div>
            <span className="font-bold text-primary mr-2">🏙️</span>
            <span>{loc.city}, {loc.state} ({loc.zipCode})</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => removeFavoriteLocationMutation.mutate(loc.id)}
          >
            ✕
          </Button>
        </div>
      ))}
    </div>
  );
}

export default Profile;
