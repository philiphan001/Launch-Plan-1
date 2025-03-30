import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Check, X, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface College {
  id: number;
  name: string;
  location: string;
  state: string;
  type: string;
  tuition: number;
  roomAndBoard: number;
  acceptanceRate: number | null;
  rating: number | null;
  size: string | null;
  rank: number | null;
  feesByIncome: string | null | {
    [key: string]: number;
  };
  usNewsTop150: number | null;
  bestLiberalArtsColleges: number | null;
}

interface FavoriteCollege {
  id: number;
  userId: number;
  collegeId: number;
  createdAt: string;
  college: College;
}

interface ZipCodeIncome {
  id: number;
  state: string;
  zip_code: string;
  mean_income: number;
  estimated_investments: number;
  home_value: number | null;
}

const NetPriceCalculator = () => {
  const { toast } = useToast();
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [estimatedIncome, setEstimatedIncome] = useState<number | null>(null);
  const [usingEstimatedIncome, setUsingEstimatedIncome] = useState(false);
  const [householdSize, setHouseholdSize] = useState("4");
  const [householdStructure, setHouseholdStructure] = useState("two_parents");
  const [calculated, setCalculated] = useState(false);
  const [fetchingZipCode, setFetchingZipCode] = useState(false);
  
  // Temporary user ID for demo purposes - would normally come from auth context
  const userId = 1;
  
  // Query to fetch the user profile
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    }
  });
  
  // Set the user's zip code once the profile is loaded
  useEffect(() => {
    if (userData && userData.zipCode) {
      setZipCode(userData.zipCode);
      
      // Optionally auto-fetch income data if zip code is available
      if (userData.zipCode.length === 5) {
        fetchIncomeData(userData.zipCode);
      }
    }
  }, [userData]);
  
  // Query to fetch favorite colleges
  const { data: favoriteColleges = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['/api/favorites/colleges', userId],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/colleges/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite colleges');
      }
      return response.json();
    }
  });
  
  // Query for fetching income data by zip code
  const { data: zipCodeData, isLoading: isLoadingZipCode, error: zipCodeError, refetch: refetchZipCode } = useQuery({
    queryKey: ['/api/zip-code-income/zip', zipCode],
    queryFn: async () => {
      if (!zipCode || zipCode.length < 5) return null;
      const response = await fetch(`/api/zip-code-income/zip/${zipCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch income data for this zip code');
      }
      return response.json() as Promise<ZipCodeIncome>;
    },
    enabled: false // We'll trigger this manually
  });
  
  // Function to fetch income data based on zip code
  const fetchIncomeData = (zip: string) => {
    if (zip.length === 5) {
      setFetchingZipCode(true);
      fetch(`/api/zip-code-income/zip/${zip}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Zip code data not found');
          }
          return response.json();
        })
        .then(data => {
          setEstimatedIncome(data.mean_income);
          setUsingEstimatedIncome(true);
          setHouseholdIncome(data.mean_income.toString());
          toast({
            title: "Income Estimate Found",
            description: `The average household income in ${zip} is $${data.mean_income.toLocaleString()}.`,
          });
        })
        .catch(err => {
          console.error("Error fetching zip code income:", err);
          toast({
            variant: "destructive", 
            title: "No data available",
            description: "We couldn't find income data for this zip code. Please enter your income manually.",
          });
        })
        .finally(() => {
          setFetchingZipCode(false);
        });
    }
  };
  
  // Extract college data from favorite colleges
  const favoriteCollegesList = favoriteColleges.length 
    ? favoriteColleges.map((favorite: FavoriteCollege) => favorite.college)
    : [];
  
  // Function to parse fees by income if it's a string
  const parseFeesByIncome = (college: College) => {
    if (typeof college.feesByIncome === 'string' && college.feesByIncome) {
      try {
        college.feesByIncome = JSON.parse(college.feesByIncome);
      } catch (e) {
        console.error("Error parsing feesByIncome for college:", college.name);
        college.feesByIncome = {
          "0-30000": 0,
          "30001-48000": 0,
          "48001-75000": 0,
          "75001-110000": 0,
          "110001+": 0
        };
      }
    } else if (!college.feesByIncome) {
      college.feesByIncome = {
        "0-30000": 0,
        "30001-48000": 0,
        "48001-75000": 0,
        "75001-110000": 0,
        "110001+": 0
      };
    }
    return college;
  };
  
  // Process college data to ensure feesByIncome is an object not a string
  const processedColleges = favoriteCollegesList.map(parseFeesByIncome);
  
  // Find the selected college
  const selectedCollege = selectedCollegeId 
    ? processedColleges.find((college: College) => college.id === selectedCollegeId)
    : null;
  
  // Add an effect to update the UI when zip code income data is available
  useEffect(() => {
    if (zipCodeData && zipCodeData.mean_income) {
      setEstimatedIncome(zipCodeData.mean_income);
    }
  }, [zipCodeData]);
  
  const calculateNetPrice = () => {
    if (!selectedCollege || !householdIncome) return null;
    
    // Get the income bracket
    let incomeBracket = "110001+";
    const income = parseInt(householdIncome, 10);
    
    if (income <= 30000) incomeBracket = "0-30000";
    else if (income <= 48000) incomeBracket = "30001-48000";
    else if (income <= 75000) incomeBracket = "48001-75000";
    else if (income <= 110000) incomeBracket = "75001-110000";
    
    return selectedCollege.feesByIncome[incomeBracket];
  };
  
  const netPrice = calculated ? calculateNetPrice() : null;
  
  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-2">Net Price Calculator</h1>
      <p className="text-gray-600 mb-6">Find out how much a college will cost after financial aid by entering your information below.</p>
      
      {/* Add Alert explaining the zip code income feature - only shown when we have user data with a zip code */}
      {userData && userData.zipCode && estimatedIncome && (
        <Alert className="mb-6">
          <AlertDescription>
            <div className="flex items-start">
              <div className="mr-3 mt-0.5 flex-shrink-0">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Automatic Income Estimation</p>
                <p className="text-sm text-muted-foreground">
                  We've automatically used the zip code from your profile ({userData.zipCode}) to estimate your household income based on your area's average. 
                  You can always adjust this estimate if needed.
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Your Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zipCode" className="flex justify-between">
                    <span>Your Zip Code</span>
                    {userData && userData.zipCode && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Check className="h-3 w-3 mr-1" /> From your profile
                      </span>
                    )}
                  </Label>
                  <div className="flex mt-1">
                    <Input 
                      id="zipCode" 
                      placeholder="e.g. 98101"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      className="ml-2" 
                      onClick={() => fetchIncomeData(zipCode)}
                      disabled={zipCode.length !== 5 || fetchingZipCode}
                    >
                      {fetchingZipCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
                    </Button>
                  </div>
                  {zipCode.length > 0 && zipCode.length < 5 && (
                    <p className="text-xs text-destructive mt-1">Please enter a valid 5-digit zip code</p>
                  )}
                  {isLoadingUser && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Loading your profile data...
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="income" className="flex justify-between">
                    <span>Annual Household Income</span>
                    {estimatedIncome !== null && (
                      <span className="text-xs text-muted-foreground">
                        {usingEstimatedIncome ? (
                          <span className="flex items-center text-primary">
                            <Check className="h-3 w-3 mr-1" /> Using zip code estimate
                          </span>
                        ) : (
                          <Button
                            variant="link"
                            className="p-0 h-auto text-xs"
                            onClick={() => {
                              setHouseholdIncome(estimatedIncome.toString());
                              setUsingEstimatedIncome(true);
                            }}
                          >
                            Use zip code estimate (${estimatedIncome.toLocaleString()})
                          </Button>
                        )}
                      </span>
                    )}
                  </Label>
                  <div className="flex items-center mt-1">
                    <span className="mr-2">$</span>
                    <Input 
                      id="income" 
                      placeholder={estimatedIncome ? estimatedIncome.toString() : "e.g. 75000"}
                      value={householdIncome}
                      onChange={(e) => {
                        setHouseholdIncome(e.target.value);
                        if (usingEstimatedIncome) {
                          setUsingEstimatedIncome(false);
                        }
                      }}
                    />
                  </div>
                  {estimatedIncome !== null && usingEstimatedIncome && (
                    <p className="text-xs text-muted-foreground mt-1">
                      This is the average income for your zip code. You can adjust it if needed.
                    </p>
                  )}
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
                  <Label>Household Structure</Label>
                  <RadioGroup 
                    value={householdStructure} 
                    onValueChange={setHouseholdStructure}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="two_parents" id="two_parents" />
                      <Label htmlFor="two_parents">Two Parents</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single_parent" id="single_parent" />
                      <Label htmlFor="single_parent">Single Parent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="independent" id="independent" />
                      <Label htmlFor="independent">Independent Student</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Selected College</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="college">Choose a College</Label>
                  {isLoadingFavorites ? (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading favorite colleges...
                    </div>
                  ) : favoriteCollegesList.length === 0 ? (
                    <div className="mt-2 text-sm text-muted-foreground space-y-3">
                      <p>You haven't added any colleges to your favorites yet.</p>
                      <div className="flex items-center">
                        <Link to="/college-discovery" className="text-primary flex items-center">
                          <Search className="h-4 w-4 mr-1" /> Browse colleges and add favorites
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <Select 
                      value={selectedCollegeId?.toString()} 
                      onValueChange={(value) => setSelectedCollegeId(parseInt(value, 10))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a college" />
                      </SelectTrigger>
                      <SelectContent>
                        {processedColleges.map((college: College) => (
                          <SelectItem key={college.id} value={college.id.toString()}>
                            {college.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                
                {selectedCollege && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {selectedCollege.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {selectedCollege.type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Published Tuition:</span> ${selectedCollege.tuition.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Room & Board:</span> ${selectedCollege.roomAndBoard.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Total Cost:</span> ${(selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString()}
                    </p>
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  disabled={!selectedCollegeId || !zipCode || !householdIncome}
                  onClick={handleCalculate}
                >
                  Calculate Net Price
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Estimated Net Price</h3>
              
              {calculated && netPrice !== null && selectedCollege ? (
                <div>
                  <div className="flex flex-col items-center mb-8">
                    <h4 className="text-xl font-medium text-gray-700 mb-3">{selectedCollege.name}</h4>
                    <div className="bg-primary/10 p-8 rounded-full">
                      <p className="text-3xl font-mono font-bold text-primary">
                        ${netPrice.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Estimated annual cost after financial aid</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Cost Breakdown</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Published Tuition</span>
                          <span className="font-mono">${selectedCollege.tuition.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Room & Board</span>
                          <span className="font-mono">${selectedCollege.roomAndBoard.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-300">
                          <span>Total Cost</span>
                          <span className="font-mono">${(selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-success">
                          <span>Estimated Financial Aid</span>
                          <span className="font-mono">- ${((selectedCollege.tuition + selectedCollege.roomAndBoard) - netPrice).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-primary font-semibold pt-2 border-t border-gray-300">
                          <span>Your Net Cost</span>
                          <span className="font-mono">${netPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Financing Options</h5>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Federal Student Loans</p>
                          <p className="text-xs text-gray-600">Undergraduate students can borrow up to $12,500 annually in Federal loans.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Work-Study Opportunities</p>
                          <p className="text-xs text-gray-600">Campus employment can provide $2,000-$5,000 annually to help with expenses.</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Scholarships</p>
                          <p className="text-xs text-gray-600">Many schools offer merit scholarships not included in this estimate.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="mr-2">Download Estimate</Button>
                    <Button>Save to My Profile</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="flex justify-center mb-4">
                    <DollarSign className="h-12 w-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    {calculated ? "Unable to calculate" : "Enter your information"}
                  </h4>
                  <p className="text-gray-500">
                    {calculated 
                      ? "Please make sure you've selected a college and entered all required information."
                      : "Select a college and fill in your financial information to calculate your estimated net price."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Financial Aid Resources</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">FAFSA Application</h4>
                  <p className="text-sm text-gray-600">Complete the Free Application for Federal Student Aid to qualify for grants and loans.</p>
                </a>
                
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">Scholarship Search</h4>
                  <p className="text-sm text-gray-600">Find scholarships that match your background, interests, and academic achievements.</p>
                </a>
                
                <a href="#" className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <h4 className="font-medium text-primary mb-2">Financial Aid FAQ</h4>
                  <p className="text-sm text-gray-600">Get answers to common questions about paying for college and financial aid.</p>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetPriceCalculator;
