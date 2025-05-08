import { useState, useEffect } from "react";
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
import LaunchPlanAssumptionsCard from "@/components/assumptions/LaunchPlanAssumptionsCard";
import { Rocket } from "lucide-react";
import { AuthProps } from "@/interfaces/auth";
import {
  FavoritesService,
  FavoriteCollege,
  FavoriteCareer,
} from "@/services/favoritesService";

interface SettingsProps extends AuthProps {}

const Settings = (props: SettingsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("financial");

  // Use the authenticated user's ID from props
  const userId = props.user?.id;

  // Check hash in URL for direct tab access
  useEffect(() => {
    // Get the hash from the URL (without the # symbol)
    const hash = window.location.hash.substring(1);

    // If there's a hash and it matches one of our tabs, set it as active
    if (
      hash &&
      [
        "profile",
        "financial",
        "favorites",
        "assumptions",
        "notifications",
      ].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // User info state
  const [firstName, setFirstName] = useState("Philip");
  const [lastName, setLastName] = useState("Han");
  const [email, setEmail] = useState("philip.han@example.com");
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

  // Fetch favorite colleges using FavoritesService
  const { data: favoriteColleges = [], isLoading: isLoadingColleges } =
    useQuery({
      queryKey: ["/api/favorites/colleges", userId],
      queryFn: async () => {
        if (!userId) return [];
        return await FavoritesService.getFavoriteColleges(userId);
      },
      enabled: !!userId, // Only run query when userId exists
    });

  // Fetch favorite careers using FavoritesService
  const { data: favoriteCareers = [], isLoading: isLoadingCareers } = useQuery({
    queryKey: ["/api/favorites/careers", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await FavoritesService.getFavoriteCareers(userId);
    },
    enabled: !!userId, // Only run query when userId exists
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

  // Query client for cache invalidation
  const queryClient = useQueryClient();

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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">
        Account Settings
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">My Account Settings</TabsTrigger>
          {/* <TabsTrigger value="financial">Financial Profile</TabsTrigger> */}
          <TabsTrigger value="assumptions">Launch Plan</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          {/* Remove the Personal Information section entirely */}
          {/* <Card> ...Personal Information... </Card> */}

          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Account Settings</h3>

              <div className="space-y-4">
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

        {/* Remove the Financial Profile tab content */}
        {/* <TabsContent value="financial"> ... </TabsContent> */}

        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">
                Notification Preferences
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Financial Alerts</h4>
                    <p className="text-sm text-gray-500">
                      Get alerts about your financial projections
                    </p>
                  </div>
                  <Switch
                    checked={financialAlerts}
                    onCheckedChange={setFinancialAlerts}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Career Updates</h4>
                    <p className="text-sm text-gray-500">
                      Updates about careers you've saved
                    </p>
                  </div>
                  <Switch
                    checked={careerUpdates}
                    onCheckedChange={setCareerUpdates}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Scholarship Alerts</h4>
                    <p className="text-sm text-gray-500">
                      Notifications about available scholarships
                    </p>
                  </div>
                  <Switch
                    checked={scholarshipAlerts}
                    onCheckedChange={setScholarshipAlerts}
                  />
                </div>
              </div>

              <Button className="mt-6" onClick={handleSaveNotifications}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Data Collection</h4>
                    <p className="text-sm text-gray-500">
                      Allow us to collect usage data to improve the application
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Share Anonymous Data</h4>
                    <p className="text-sm text-gray-500">
                      Share anonymous data for educational research
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="mt-6">Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assumptions">
          <div className="space-y-6">
            <div className="flex items-center mb-4">
              <Rocket className="h-6 w-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold">Launch Plan</h2>
            </div>
            <LaunchPlanAssumptionsCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
