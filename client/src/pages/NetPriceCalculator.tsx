import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, DollarSign, Check, X, Search, Home, Building, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { AuthProps } from "@/interfaces/auth";
import PriceCharts from "@/components/calculator/PriceCharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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

interface CollegeCalculation {
  id?: number;
  userId: number;
  collegeId: number;
  netPrice: number;
  inState: boolean;
  familyContribution: number;
  workStudy: number;
  studentLoanAmount: number;
  financialAid: number;
  householdIncome: number;
  householdSize: number;
  zip: string;
  tuitionUsed: number;
  roomAndBoardUsed: number;
  onCampusHousing: boolean;
  totalCost: number;
  notes: string;
  calculationDate?: string;
  includedInProjection?: boolean;
}

interface NetPriceCalculatorProps extends AuthProps {}

const NetPriceCalculator = (props: NetPriceCalculatorProps) => {
  const { toast } = useToast();
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [zipCode, setZipCode] = useState("");
  const [householdIncome, setHouseholdIncome] = useState("");
  const [estimatedIncome, setEstimatedIncome] = useState<number | null>(null);
  const [usingEstimatedIncome, setUsingEstimatedIncome] = useState(false);
  const [investmentAssets, setInvestmentAssets] = useState("");
  const [estimatedInvestments, setEstimatedInvestments] = useState<number | null>(null);
  const [usingEstimatedInvestments, setUsingEstimatedInvestments] = useState(false);
  const [homeValue, setHomeValue] = useState("");
  const [estimatedHomeValue, setEstimatedHomeValue] = useState<number | null>(null);
  const [usingEstimatedHomeValue, setUsingEstimatedHomeValue] = useState(false);
  const [homeOwnership, setHomeOwnership] = useState<"own" | "rent">("rent");
  const [householdSize, setHouseholdSize] = useState("4");
  const [householdStructure, setHouseholdStructure] = useState("two_parents");
  const [calculated, setCalculated] = useState(false);
  const [fetchingZipCode, setFetchingZipCode] = useState(false);
  const [onCampusHousing, setOnCampusHousing] = useState(true);
  const [isInState, setIsInState] = useState(false);
  const [userState, setUserState] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [calculationName, setCalculationName] = useState("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [localZipCodeData, setLocalZipCodeData] = useState<ZipCodeIncome | null>(null);
  const [showZipCodeEditor, setShowZipCodeEditor] = useState(false);
  
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
    console.log('User Data Loaded:', userData);
    
    if (userData && userData.zipCode) {
      console.log('Using profile zip code:', userData.zipCode);
      setZipCode(userData.zipCode);
      
      // Optionally auto-fetch income data if zip code is available
      if (userData.zipCode.length === 5) {
        console.log('Auto-fetching income data for zip:', userData.zipCode);
        fetchIncomeData(userData.zipCode);
      }
    } else {
      console.log('No user data or zip code available');
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
      
      // Clear existing data first to avoid stale information
      setLocalZipCodeData(null);
      
      fetch(`/api/zip-code-income/zip/${zip}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Zip code data not found');
          }
          return response.json();
        })
        .then(data => {
          console.log('📍 Received zip code data:', data);
          
          // Store complete zip code data
          setLocalZipCodeData(data);
          
          // Set income data
          setEstimatedIncome(data.mean_income);
          setUsingEstimatedIncome(true);
          setHouseholdIncome(data.mean_income.toString());
          
          // Set investment assets data
          if (data.estimated_investments) {
            setEstimatedInvestments(data.estimated_investments);
            setUsingEstimatedInvestments(true);
            setInvestmentAssets(data.estimated_investments.toString());
          }
          
          // Set home value data if available
          if (data.home_value) {
            setEstimatedHomeValue(data.home_value);
            setUsingEstimatedHomeValue(true);
            setHomeValue(data.home_value.toString());
          }
          
          // CRITICAL FIX: Set the user's state code for in-state tuition determination
          if (data.state) {
            console.log(`📍 Setting user state to: "${data.state}" from zip code ${zip}`);
            setUserState(data.state);
          }
          
          toast({
            title: "Financial Estimates Found",
            description: `Based on ${zip}, we've estimated your financial information.`,
          });
        })
        .catch(err => {
          console.error("Error fetching zip code income:", err);
          toast({
            variant: "destructive", 
            title: "No data available",
            description: "We couldn't find data for this zip code. Please enter your information manually.",
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
  
  // Add an effect to update the UI when zip code income data is available from React Query
  useEffect(() => {
    if (zipCodeData) {
      // Synchronize React Query zipCodeData with our local state
      setLocalZipCodeData(zipCodeData);
      
      if (zipCodeData.mean_income) {
        setEstimatedIncome(zipCodeData.mean_income);
        setUsingEstimatedIncome(true);
        setHouseholdIncome(zipCodeData.mean_income.toString());
      }
      if (zipCodeData.estimated_investments) {
        setEstimatedInvestments(zipCodeData.estimated_investments);
        setUsingEstimatedInvestments(true);
        setInvestmentAssets(zipCodeData.estimated_investments.toString());
      }
      if (zipCodeData.home_value) {
        setEstimatedHomeValue(zipCodeData.home_value);
        setUsingEstimatedHomeValue(true);
        setHomeValue(zipCodeData.home_value.toString());
      }
      if (zipCodeData.state) {
        setUserState(zipCodeData.state);
      }
    }
  }, [zipCodeData]);
  
  // Add an effect to update the UI when our local zip code data changes
  useEffect(() => {
    if (localZipCodeData) {
      if (localZipCodeData.mean_income) {
        setEstimatedIncome(localZipCodeData.mean_income);
        setUsingEstimatedIncome(true);
        setHouseholdIncome(localZipCodeData.mean_income.toString());
      }
      if (localZipCodeData.estimated_investments) {
        setEstimatedInvestments(localZipCodeData.estimated_investments);
        setUsingEstimatedInvestments(true);
        setInvestmentAssets(localZipCodeData.estimated_investments.toString());
      }
      if (localZipCodeData.home_value) {
        setEstimatedHomeValue(localZipCodeData.home_value);
        setUsingEstimatedHomeValue(true);
        setHomeValue(localZipCodeData.home_value.toString());
      }
      if (localZipCodeData.state) {
        setUserState(localZipCodeData.state);
      }
    }
  }, [localZipCodeData]);
  
  // Initialize in-state status when college or user state changes
  useEffect(() => {
    // Display zip code data for debugging
    console.log('Zip Code Data (from React Query):', zipCodeData);
    console.log('Zip Code Data (local):', localZipCodeData);
    console.log('Current User State:', userState);

    if (!selectedCollege) {
      console.log('No college selected yet');
      return;
    }
    
    console.log('Selected College:', selectedCollege.name, selectedCollege.state);
    
    // Check if college is public - only public schools have in-state/out-of-state
    const isPublic = selectedCollege.type && selectedCollege.type.toLowerCase().includes('public');
    
    // For non-public schools, in-state/out-of-state doesn't matter
    if (!isPublic) {
      console.log('📚 College is private/non-public, in-state status does not apply');
      setIsInState(true); // Default to true for non-public schools
      return;
    }
    
    // Only proceed if we have both values needed for comparison
    if (selectedCollege && userState) {
      // Get state codes and normalize them (trim whitespace, uppercase)
      const collegeState = selectedCollege.state || '';
      const userStateNormalized = userState.toUpperCase().trim();
      const collegeStateNormalized = collegeState.toUpperCase().trim();
      
      // Debug information
      console.log('🔍 State Comparison for PUBLIC college:');
      console.log(`- User zip code: ${zipCode}`);
      console.log(`- User state code (normalized): "${userStateNormalized}"`);
      console.log(`- College state code (normalized): "${collegeStateNormalized}"`);
      
      // Check if the states match 
      const isMatch = userStateNormalized === collegeStateNormalized;
      console.log(`✅ In-state match result: ${isMatch ? 'MATCHED' : 'NOT MATCHED'}`);
      
      // Force update the in-state status and log it
      setIsInState(isMatch);
      console.log(`🏫 College will use ${isMatch ? 'IN-STATE' : 'OUT-OF-STATE'} tuition rates`);
    } else {
      // If we're missing state data but have a public college, default to out-of-state
      if (isPublic) {
        console.log('⚠️ Missing state data for comparison, defaulting to OUT-OF-STATE tuition');
        setIsInState(false);
      }
    }
  }, [selectedCollege, userState, zipCode, zipCodeData, localZipCodeData]);
  
  const calculateNetPrice = () => {
    if (!selectedCollege || !householdIncome) return null;
    
    // Get the income bracket
    let incomeBracket = "110001+";
    const income = parseInt(householdIncome, 10);
    
    if (income <= 30000) incomeBracket = "0-30000";
    else if (income <= 48000) incomeBracket = "30001-48000";
    else if (income <= 75000) incomeBracket = "48001-75000";
    else if (income <= 110000) incomeBracket = "75001-110000";
    
    // Get the base price from the fees by income bracket
    let adjustedPrice = selectedCollege.feesByIncome[incomeBracket];
    
    // For public colleges, apply out-of-state tuition adjustment if needed
    if (selectedCollege.type.includes("Public") && !isInState) {
      // Public universities typically charge 2-3x for out-of-state students
      // UCLA for example charges roughly 3x more for out-of-state tuition
      
      // Get the base in-state tuition from the college data
      const inStateTuition = selectedCollege.tuition;
      
      // Set the out-of-state multiplier (typically 2.5-3x for public schools)
      const outOfStateMultiplier = 3; 
      
      // Calculate the additional cost for out-of-state students
      const outOfStateSurcharge = (inStateTuition * outOfStateMultiplier) - inStateTuition;
      
      // Add this surcharge to the net price
      adjustedPrice += outOfStateSurcharge;
      
      console.log("Applied out-of-state tuition adjustment:", outOfStateSurcharge);
    }
    
    // Apply housing adjustment for off-campus housing
    if (!onCampusHousing) {
      // Off-campus housing might be 10% cheaper or more expensive depending on the area
      adjustedPrice = adjustedPrice - (selectedCollege.roomAndBoard * 0.1);
    }
    
    return Math.max(0, Math.round(adjustedPrice)); // Ensure we don't return negative values
  };
  
  const netPrice = calculated ? calculateNetPrice() : null;
  
  // Helper function to calculate average fees
  const calculateAverageFees = (feesByIncome: any): number => {
    if (!feesByIncome) return 0;
    
    try {
      const fees = Object.values(feesByIncome) as number[];
      if (fees.length === 0) return 0;
      
      const sum = fees.reduce((total, fee) => total + (fee || 0), 0);
      return sum / fees.length;
    } catch (err) {
      console.error("Error calculating average fees", err);
      return 0;
    }
  };
  
  // State to manage payment adjustment percentages
  const [efcPercentage, setEfcPercentage] = useState<number>(40); // User can pay 0-100% of net price
  const [workStudyPercentage, setWorkStudyPercentage] = useState<number>(30); // Work-study covers 0-100% of remainder
  
  // Enforce that EFC + work-study <= 100%
  useEffect(() => {
    // If the combined percentage exceeds 100%, adjust work-study down
    if (efcPercentage + workStudyPercentage > 100) {
      setWorkStudyPercentage(100 - efcPercentage);
    }
  }, [efcPercentage, workStudyPercentage]);
  
  // Calculate the base EFC amount (without user adjustment)
  const calculateBaseEFC = (): number => {
    if (!householdIncome || !netPrice) return 0;
    
    const income = parseInt(householdIncome, 10) || 0;
    const investments = parseInt(investmentAssets, 10) || 0;
    const homeEquity = homeOwnership === 'own' ? (parseInt(homeValue, 10) || 0) * 0.05 : 0;
    
    // Simplified EFC calculation - in reality this is much more complex
    let baseEfc = income * 0.12; // 12% of income
    baseEfc += investments * 0.07; // 7% of investment assets
    baseEfc += homeEquity; // Small percentage of home equity
    
    // Limit to no more than netPrice
    return Math.min(Math.round(baseEfc), netPrice);
  };
  
  // Calculate expected family contribution (EFC) with user's slider adjustment
  const calculateEFC = (): number => {
    if (!netPrice) return 0;
    
    // User can adjust how much of net price they want to pay (0-100%)
    const adjustedEfc = netPrice * (efcPercentage / 100);
    
    return Math.round(adjustedEfc);
  };
  
  // Calculate work-study amount with user's slider adjustment
  const calculateWorkStudy = (): number => {
    if (!netPrice) return 0;
    
    // Work-study is also based on total net price, not just the remainder
    const maxWorkStudyPercentage = 100 - efcPercentage; // Can't exceed what's left after EFC
    const actualWorkStudyPercentage = Math.min(workStudyPercentage, maxWorkStudyPercentage);
    
    // Apply work-study percentage to the total net price
    return Math.round(netPrice * (actualWorkStudyPercentage / 100));
  };
  
  // Calculate student loan amount (the rest is covered by loans)
  const calculateStudentLoan = (): number => {
    if (!netPrice) return 0;
    
    const efc = calculateEFC();
    const workStudy = calculateWorkStudy();
    
    // Loans cover what's left after EFC and work-study
    return Math.round(Math.max(0, netPrice - efc - workStudy));
  };
  
  const handleCalculate = () => {
    // If we have a zip code but no income data, try to fetch it automatically
    if (zipCode && zipCode.length === 5 && !estimatedIncome) {
      // Fetch income data first, then set calculated to true
      setFetchingZipCode(true);
      
      fetch(`/api/zip-code-income/zip/${zipCode}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Zip code data not found');
          }
          return response.json();
        })
        .then(data => {
          console.log('📍 Auto-fetched zip code data during calculation:', data);
          
          // Store complete zip code data
          setLocalZipCodeData(data);
          
          // Set income data
          setEstimatedIncome(data.mean_income);
          setUsingEstimatedIncome(true);
          setHouseholdIncome(data.mean_income.toString());
          
          // Set investment assets data
          if (data.estimated_investments) {
            setEstimatedInvestments(data.estimated_investments);
            setUsingEstimatedInvestments(true);
            setInvestmentAssets(data.estimated_investments.toString());
          }
          
          // Set home value data if available
          if (data.home_value) {
            setEstimatedHomeValue(data.home_value);
            setUsingEstimatedHomeValue(true);
            setHomeValue(data.home_value.toString());
          }
          
          // Set the user's state code for in-state tuition determination
          if (data.state) {
            console.log(`📍 Setting user state to: "${data.state}" from zip code ${zipCode}`);
            setUserState(data.state);
          }
          
          // Now continue with the calculation
          setCalculated(true);
        })
        .catch(err => {
          console.error("Error fetching zip code income during calculation:", err);
          // Even if the data fetch failed, we'll still calculate with current values
          setCalculated(true);
        })
        .finally(() => {
          setFetchingZipCode(false);
        });
    } else {
      // If we already have income data or no zip code, just calculate
      setCalculated(true);
    }
  };
  
  // Mutation for saving calculations
  const { mutate: saveCalculation, isPending: isSaving } = useMutation({
    mutationFn: async (calculationData: CollegeCalculation) => {
      const response = await fetch('/api/college-calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calculationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save calculation');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Calculation Saved",
        description: "Your college cost calculation has been saved to your profile.",
      });
      
      // Invalidate relevant queries to ensure the saved calculation appears immediately
      queryClient.invalidateQueries({ queryKey: ['/api/college-calculations/user', userId] });
      // Also invalidate the colleges query used in SavedCalculationsSection
      queryClient.invalidateQueries({ queryKey: ['/api/colleges'] });
    },
    onError: (error) => {
      console.error("Error saving calculation:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "We couldn't save your calculation. Please try again.",
      });
    }
  });
  
  // Function to save calculation to user profile
  const saveToProfile = () => {
    if (!selectedCollege || !netPrice) {
      toast({
        variant: "destructive",
        title: "Unable to Save",
        description: "Please complete your calculation first.",
      });
      return;
    }
    
    // Set default calculation name and open dialog
    setCalculationName(`${selectedCollege.name} (${new Date().toLocaleDateString()})`);
    setShowSaveDialog(true);
  };
  
  // Function that actually saves the calculation after name is provided
  const handleSaveCalculation = () => {
    if (!selectedCollege || !netPrice) return;
    
    // Calculate financial aid amount based on sticker price minus net price
    // This represents scholarships and grants that don't need to be repaid
    const stickerPrice = selectedCollege.type.includes("Public") && !isInState
      ? (selectedCollege.tuition * 3) + selectedCollege.roomAndBoard
      : selectedCollege.tuition + selectedCollege.roomAndBoard;
    
    const financialAid = Math.max(0, stickerPrice - netPrice);
    
    // Create the calculation data object
    const calculationData: CollegeCalculation = {
      userId,
      collegeId: selectedCollege.id,
      netPrice,
      inState: isInState,
      familyContribution: calculateEFC(),
      workStudy: calculateWorkStudy(),
      studentLoanAmount: calculateStudentLoan(),
      financialAid,
      householdIncome: parseInt(householdIncome, 10) || 0,
      householdSize: parseInt(householdSize, 10) || 0,
      zip: zipCode,
      tuitionUsed: selectedCollege.tuition,
      roomAndBoardUsed: selectedCollege.roomAndBoard,
      onCampusHousing,
      totalCost: stickerPrice,
      notes: calculationName || `${selectedCollege.name} cost calculation with ${efcPercentage}% family contribution and ${workStudyPercentage}% work-study.`,
      includedInProjection: false // By default, new calculations are not included in projections
    };
    
    // Close the dialog
    setShowSaveDialog(false);
    
    // Save the calculation
    saveCalculation(calculationData);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-2">Net Price Calculator</h1>
      <p className="text-gray-600 mb-6">Find out how much a college will cost after financial aid by entering your information below.</p>
      
      {/* We've replaced this alert with a more comprehensive version below */}
      
      {/* New Alert - Automatic Financial Information Estimation (matching design from image) */}
      {zipCodeData && zipCodeData.mean_income && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 shadow-sm">
          <div className="flex items-start">
            <div className="mr-3 flex-shrink-0 mt-0.5">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Automatic Income Estimation</h3>
              <p className="text-sm text-gray-600 mt-1">
                We've automatically used the zip code from your profile ({zipCode}) to estimate your household income based on your area's average. You can always adjust this estimate if needed.
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Estimated income:</span> ${zipCodeData.mean_income.toLocaleString()}
                </p>
                {zipCodeData.estimated_investments && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Estimated investments:</span> ${zipCodeData.estimated_investments.toLocaleString()}
                  </p>
                )}
                {zipCodeData.home_value && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Estimated home value:</span> ${zipCodeData.home_value.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Information</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="h-8 px-2 text-gray-500 hover:text-gray-700"
                >
                  {showAdvancedOptions ? (
                    <div className="flex items-center">
                      <span className="text-xs mr-1">Less Options</span>
                      <ChevronUp className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="text-xs mr-1">More Options</span>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="zipCode" className="flex justify-between">
                    <span>Your Zip Code</span>
                    {userData && userData.zipCode && !showZipCodeEditor && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Check className="h-3 w-3 mr-1" /> From your profile
                      </span>
                    )}
                  </Label>
                  
                  {!showZipCodeEditor && userData && userData.zipCode ? (
                    <div className="flex mt-1 items-center">
                      <div className="border rounded-md px-3 py-2 flex-1 bg-muted text-muted-foreground">
                        {zipCode}
                        {localZipCodeData && (
                          <span className="text-xs ml-2 text-muted-foreground">
                            ({localZipCodeData.state})
                          </span>
                        )}
                      </div>
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="ml-2" 
                        onClick={() => setShowZipCodeEditor(true)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="flex mt-1">
                      <Input 
                        id="zipCode" 
                        placeholder="Try 90210, 02142, 30328..."
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        className="ml-2" 
                        onClick={() => {
                          fetchIncomeData(zipCode);
                          if (userData && userData.zipCode && zipCode !== userData.zipCode) {
                            setShowZipCodeEditor(false);
                          }
                        }}
                        disabled={zipCode.length !== 5 || fetchingZipCode}
                      >
                        {fetchingZipCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
                      </Button>
                      {userData && userData.zipCode && showZipCodeEditor && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="ml-2" 
                          onClick={() => {
                            setZipCode(userData.zipCode);
                            setShowZipCodeEditor(false);
                            if (userData.zipCode.length === 5) {
                              fetchIncomeData(userData.zipCode);
                            }
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  )}
                  {zipCode.length > 0 && zipCode.length < 5 && (
                    <p className="text-xs text-destructive mt-1">Please enter a valid 5-digit zip code</p>
                  )}
                  {zipCode.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Try 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San Francisco), or 30328 (Atlanta) for example data.</p>
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
                
                {/* Essential field - Household Size */}
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
                
                {/* Show advanced fields toggle button */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full flex justify-between items-center"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <span>Advanced Details {showAdvancedOptions ? "↑" : "↓"}</span>
                    {showAdvancedOptions ? 
                      <ChevronUp className="h-4 w-4 ml-2" /> : 
                      <ChevronDown className="h-4 w-4 ml-2" />
                    }
                  </Button>
                </div>
                
                {/* Collapsible section for advanced fields */}
                <Collapsible open={showAdvancedOptions} className="pt-1">
                  <CollapsibleContent className="space-y-4">
                    {/* Advanced field - Investment Assets */}
                    <div>
                      <Label htmlFor="investmentAssets" className="flex justify-between">
                        <span>Investment Assets</span>
                        {estimatedInvestments !== null && (
                          <span className="text-xs text-muted-foreground">
                            {usingEstimatedInvestments ? (
                              <span className="flex items-center text-primary">
                                <Check className="h-3 w-3 mr-1" /> Using zip code estimate
                              </span>
                            ) : (
                              <Button
                                variant="link"
                                className="p-0 h-auto text-xs"
                                onClick={() => {
                                  setInvestmentAssets(estimatedInvestments.toString());
                                  setUsingEstimatedInvestments(true);
                                }}
                              >
                                Use zip code estimate (${estimatedInvestments.toLocaleString()})
                              </Button>
                            )}
                          </span>
                        )}
                      </Label>
                      <div className="flex items-center mt-1">
                        <span className="mr-2">$</span>
                        <Input 
                          id="investmentAssets" 
                          placeholder={estimatedInvestments ? estimatedInvestments.toString() : "e.g. 50000"}
                          value={investmentAssets}
                          onChange={(e) => {
                            setInvestmentAssets(e.target.value);
                            if (usingEstimatedInvestments) {
                              setUsingEstimatedInvestments(false);
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Stocks, bonds, retirement accounts, etc.
                      </p>
                    </div>
                    
                    {/* Advanced field - Home Ownership */}
                    <div>
                      <Label>Home Ownership</Label>
                      <RadioGroup 
                        value={homeOwnership} 
                        onValueChange={(value) => setHomeOwnership(value as "own" | "rent")}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="own" id="own_home" />
                          <Label htmlFor="own_home">Own Home</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="rent" id="rent_home" />
                          <Label htmlFor="rent_home">Rent</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {/* Advanced field - Home Value (conditional) */}
                    {homeOwnership === "own" && (
                      <div>
                        <Label htmlFor="homeValue" className="flex justify-between">
                          <span>Home Value</span>
                          {estimatedHomeValue !== null && (
                            <span className="text-xs text-muted-foreground">
                              {usingEstimatedHomeValue ? (
                                <span className="flex items-center text-primary">
                                  <Check className="h-3 w-3 mr-1" /> Using zip code estimate
                                </span>
                              ) : (
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-xs"
                                  onClick={() => {
                                    setHomeValue(estimatedHomeValue.toString());
                                    setUsingEstimatedHomeValue(true);
                                  }}
                                >
                                  Use zip code estimate (${estimatedHomeValue.toLocaleString()})
                                </Button>
                              )}
                            </span>
                          )}
                        </Label>
                        <div className="flex items-center mt-1">
                          <span className="mr-2">$</span>
                          <Input 
                            id="homeValue" 
                            placeholder={estimatedHomeValue ? estimatedHomeValue.toString() : "e.g. 350000"}
                            value={homeValue}
                            onChange={(e) => {
                              setHomeValue(e.target.value);
                              if (usingEstimatedHomeValue) {
                                setUsingEstimatedHomeValue(false);
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Estimated market value of your home
                        </p>
                      </div>
                    )}
                    
                    {/* Advanced field - Household Structure */}
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
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">My Favorite Schools</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="college">Choose from your favorite schools</Label>
                  {isLoadingFavorites ? (
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading favorite colleges...
                    </div>
                  ) : favoriteCollegesList.length === 0 ? (
                    <div className="mt-2 text-sm text-muted-foreground space-y-3">
                      <p>You haven't added any colleges to your favorites yet.</p>
                      <div className="flex items-center">
                        <Link to="/colleges" className="text-primary flex items-center">
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {selectedCollege.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {selectedCollege.type}
                      </p>
                      
                      {/* Show in-state badge for public colleges if the user is in-state */}
                      {selectedCollege.type.includes("Public") && userState && (
                        <div className="flex flex-col space-y-1 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 flex items-center">
                            {isInState ? (
                              <>
                                <Check className="h-3 w-3 text-success mr-1" />
                                <span className="text-success">In-state tuition eligible</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-destructive mr-1" />
                                <span className="text-destructive">Out-of-state tuition applies</span>
                              </>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Your state: {userState} | College state: {selectedCollege.state}
                          </span>
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Published Tuition:</span> ${selectedCollege.tuition.toLocaleString()}
                        {selectedCollege.type.includes("Public") && !isInState && (
                          <span className="text-xs text-destructive ml-2">(out-of-state rate)</span>
                        )}
                      </p>
                      
                      {/* Housing section with on/off campus toggle */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="housing-type" className="text-sm text-gray-600 font-medium">Housing:</Label>
                          <div className="flex items-center space-x-2">
                            <div className={`text-xs px-2 py-1 rounded-full flex items-center ${onCampusHousing ? 'bg-primary/20 text-primary' : 'bg-gray-100'}`}>
                              <Home className="h-3 w-3 mr-1" />
                              <span>On Campus</span>
                            </div>
                            <Switch
                              id="housing-type"
                              checked={!onCampusHousing}
                              onCheckedChange={(checked) => setOnCampusHousing(!checked)}
                            />
                            <div className={`text-xs px-2 py-1 rounded-full flex items-center ${!onCampusHousing ? 'bg-primary/20 text-primary' : 'bg-gray-100'}`}>
                              <Building className="h-3 w-3 mr-1" />
                              <span>Off Campus</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Room & Board:</span> ${selectedCollege.roomAndBoard.toLocaleString()}
                          {!onCampusHousing && (
                            <span className="text-xs text-muted-foreground ml-2">(estimated for off-campus)</span>
                          )}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-600 font-medium pt-2 border-t border-gray-200 mt-2">
                        <span>Total Cost:</span> ${(selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString()}
                      </p>
                    </div>
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
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="text-xl font-medium text-gray-700 mb-1">{selectedCollege.name}</h4>
                      {selectedCollege.type.includes("Public") && (
                        <div className="mb-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 flex items-center inline-flex mr-2">
                            {isInState ? (
                              <>
                                <Check className="h-3 w-3 text-success mr-1" />
                                <span className="text-success">In-state</span>
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 text-destructive mr-1" />
                                <span className="text-destructive">Out-of-state</span>
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-primary/10 px-6 py-4 rounded-lg">
                        <p className="text-3xl font-mono font-bold text-primary">
                          ${netPrice.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">Estimated annual cost after financial aid</p>
                    </div>
                  </div>
                  
                  {/* Cost breakdown and net price row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Cost breakdown section */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Cost Breakdown</h5>
                      <div className="space-y-2">
                        {/* For public colleges, show both in-state and out-of-state tuition */}
                        {selectedCollege.type.includes("Public") ? (
                          <>
                            {/* Calculate tuition values */}
                            {(() => {
                              const inStateTuition = selectedCollege.tuition;
                              const outOfStateMultiplier = 3;
                              const outOfStateTuition = inStateTuition * outOfStateMultiplier;
                              
                              return (
                                <>
                                  {/* In-state tuition row */}
                                  <div className="flex justify-between text-sm">
                                    <span>In-State Tuition</span>
                                    <span className="font-mono">
                                      ${inStateTuition.toLocaleString()}
                                      {!isInState && <span className="text-xs text-muted-foreground ml-2">(not applicable)</span>}
                                    </span>
                                  </div>
                                  
                                  {/* Out-of-state tuition row */}
                                  <div className="flex justify-between text-sm">
                                    <span>Out-of-State Tuition</span>
                                    <span className="font-mono">
                                      ${outOfStateTuition.toLocaleString()}
                                      {isInState && <span className="text-xs text-muted-foreground ml-2">(not applicable)</span>}
                                    </span>
                                  </div>
                                  
                                  {/* Applied tuition based on status */}
                                  <div className="flex justify-between text-sm font-medium">
                                    <span>Applied Tuition</span>
                                    <span className="font-mono">
                                      ${isInState ? inStateTuition.toLocaleString() : outOfStateTuition.toLocaleString()}
                                      <span className={`text-xs ml-2 ${isInState ? "text-success" : "text-destructive"}`}>
                                        ({isInState ? "in-state" : "out-of-state"})
                                      </span>
                                    </span>
                                  </div>
                                </>
                              );
                            })()}
                          </>
                        ) : (
                          // For private colleges, just show the tuition
                          <div className="flex justify-between text-sm">
                            <span>Tuition</span>
                            <span className="font-mono">${selectedCollege.tuition.toLocaleString()}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between text-sm">
                          <span>Room & Board</span>
                          <span className="font-mono">${selectedCollege.roomAndBoard.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm font-medium pt-2 border-t border-gray-300">
                          <span>Total Cost</span>
                          <span className="font-mono">
                            ${(() => {
                              if (selectedCollege.type.includes("Public") && !isInState) {
                                const inStateTuition = selectedCollege.tuition;
                                const outOfStateMultiplier = 3;
                                const outOfStateTuition = inStateTuition * outOfStateMultiplier;
                                return (outOfStateTuition + selectedCollege.roomAndBoard).toLocaleString();
                              } else {
                                return (selectedCollege.tuition + selectedCollege.roomAndBoard).toLocaleString();
                              }
                            })()}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm text-success">
                          <span>Estimated Financial Aid</span>
                          <span className="font-mono">
                            {(() => {
                              // Calculate the gross cost based on in-state vs out-of-state status
                              const grossCost = selectedCollege.type.includes("Public") && !isInState
                                ? (selectedCollege.tuition * 3) + selectedCollege.roomAndBoard
                                : selectedCollege.tuition + selectedCollege.roomAndBoard;
                                
                              // Calculate financial aid as gross cost minus net price
                              const financialAid = grossCost - netPrice;
                              
                              // Only show as aid if it's a positive number
                              if (financialAid >= 0) {
                                return `- $${financialAid.toLocaleString()}`;
                              } else {
                                // If negative, show it as an extra cost (no financial aid)
                                return "$0";
                              }
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-primary font-semibold pt-2 border-t border-gray-300">
                          <span>Your Net Cost</span>
                          <span className="font-mono">${netPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment visualization */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-700 mb-3">Payment Breakdown</h5>
                      
                      {/* Payment breakdown chart - VERTICAL VERSION */}
                      <div className="mb-4 flex justify-between items-end h-60 border-b border-gray-300 relative">
                        {/* Horizontal guide lines */}
                        <div className="absolute inset-0">
                          <div className="absolute w-full border-t border-dashed border-gray-300" style={{ bottom: '75%' }}></div>
                          <div className="absolute w-full border-t border-dashed border-gray-300" style={{ bottom: '50%' }}></div>
                          <div className="absolute w-full border-t border-dashed border-gray-300" style={{ bottom: '25%' }}></div>
                        </div>
                        
                        {/* Main bar chart */}
                        <div className="relative z-10 flex items-end justify-around w-full h-full px-4">
                          {/* EFC Column */}
                          <div className="flex flex-col items-center w-1/3">
                            {calculateEFC() > 0 && (
                              <>
                                <div 
                                  className="w-24 bg-primary rounded-t-md mb-2 flex flex-col items-center justify-end shadow-md" 
                                  style={{ 
                                    height: `${(calculateEFC() / netPrice) * 200}px`, 
                                    minHeight: '32px',
                                    maxHeight: '180px'
                                  }}
                                >
                                  <span className="text-sm text-white font-medium py-1">
                                    ${calculateEFC().toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">Family</p>
                                  <p className="text-xs text-muted-foreground">
                                    ({Math.round((calculateEFC() / netPrice) * 100)}% of cost)
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Work-Study Column */}
                          <div className="flex flex-col items-center w-1/3">
                            {calculateWorkStudy() > 0 && (
                              <>
                                <div 
                                  className="w-24 bg-amber-400 rounded-t-md mb-2 flex flex-col items-center justify-end shadow-md" 
                                  style={{ 
                                    height: `${(calculateWorkStudy() / netPrice) * 200}px`,
                                    minHeight: '32px',
                                    maxHeight: '180px'
                                  }}
                                >
                                  <span className="text-sm text-white font-medium py-1">
                                    ${calculateWorkStudy().toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">Work-Study</p>
                                  <p className="text-xs text-muted-foreground">
                                    ({Math.round((calculateWorkStudy() / netPrice) * 100)}% of cost)
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Student Loans Column */}
                          <div className="flex flex-col items-center w-1/3">
                            {calculateStudentLoan() > 0 && (
                              <>
                                <div 
                                  className="w-24 bg-blue-500 rounded-t-md mb-2 flex flex-col items-center justify-end shadow-md" 
                                  style={{ 
                                    height: `${(calculateStudentLoan() / netPrice) * 200}px`,
                                    minHeight: '32px',
                                    maxHeight: '180px'
                                  }}
                                >
                                  <span className="text-sm text-white font-medium py-1">
                                    ${calculateStudentLoan().toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm font-medium">Loans</p>
                                  <p className="text-xs text-muted-foreground">
                                    ({Math.round((calculateStudentLoan() / netPrice) * 100)}% of cost)
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600 pb-2">
                        <p>* This is an estimate based on average financial aid packages.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment adjustment section */}
                  <div className="bg-gray-100 p-4 rounded-lg mb-6">
                    <h5 className="font-medium text-gray-700 mb-3">How Do I Pay For College?</h5>
                    
                    {/* Payment adjustment sliders */}
                    <div className="space-y-6 mb-4">
                      {/* EFC percentage slider */}
                      <div>
                        <Label htmlFor="efc-percentage" className="text-sm">
                          <span className="flex justify-between">
                            <span>Your Family Contribution (EFC)</span>
                            <span className="text-primary font-medium">{efcPercentage}% of Net Price</span>
                          </span>
                        </Label>
                        <Slider
                          id="efc-percentage"
                          value={[efcPercentage]} 
                          min={0}
                          max={100}
                          step={5}
                          onValueChange={(values: number[]) => {
                            setEfcPercentage(values[0]);
                            // If EFC increased and now the sum exceeds 100%, adjust work-study down
                            if (values[0] + workStudyPercentage > 100) {
                              setWorkStudyPercentage(Math.max(0, 100 - values[0]));
                            }
                          }}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Pay Nothing (0%)</span>
                          <span>Pay Everything (100%)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Percentage of total college costs your family will contribute directly ({efcPercentage}% = ${calculateEFC().toLocaleString()})
                        </p>
                      </div>
                      
                      {/* Work-study percentage slider */}
                      <div>
                        <Label htmlFor="work-study-percentage" className="text-sm">
                          <span className="flex justify-between">
                            <span>Work-Study Participation</span>
                            <span className="text-amber-500 font-medium">{workStudyPercentage}%</span>
                          </span>
                        </Label>
                        <Slider
                          id="work-study-percentage"
                          value={[workStudyPercentage]} 
                          min={0}
                          max={Math.max(0, 100 - efcPercentage)}
                          step={5}
                          onValueChange={(values: number[]) => {
                            // Ensure we don't exceed the maximum allowed work-study percentage
                            const maxAllowed = Math.max(0, 100 - efcPercentage);
                            const newValue = Math.min(values[0], maxAllowed);
                            setWorkStudyPercentage(newValue);
                          }}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>No Work-Study (0%)</span>
                          <span>Max ({Math.max(0, 100 - efcPercentage)}%)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Working part-time on campus to cover {workStudyPercentage}% of your total college costs
                        </p>
                        <p className="text-xs text-muted-foreground">
                          (EFC + Work-Study cannot exceed 100%)
                        </p>
                      </div>
                      
                      <div className="text-sm border-t border-gray-200 pt-3 mt-3">
                        <p className="font-medium">Student Loans: ${calculateStudentLoan().toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          After EFC and work-study, the remaining costs are covered by student loans
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600">
                      <p>* Don't forget to explore additional scholarship opportunities!</p>
                    </div>
                  </div>
                  
                  {/* Add price charts for visualization */}
                  <div className="mt-8">
                    <h4 className="text-lg font-medium mb-4">Cost Visualizations</h4>
                    <PriceCharts 
                      collegeName={selectedCollege.name}
                      priceData={{
                        // Adjust sticker price for out-of-state tuition for public colleges
                        stickerPrice: selectedCollege.type.includes("Public") && !isInState
                          ? (selectedCollege.tuition * 3) + selectedCollege.roomAndBoard
                          : selectedCollege.tuition + selectedCollege.roomAndBoard,
                        // Calculate average price from fees by income brackets
                        averagePrice: selectedCollege.feesByIncome ? 
                          calculateAverageFees(selectedCollege.feesByIncome) : null,
                        myPrice: netPrice,
                        // Show actual tuition being used based on in-state/out-of-state status
                        tuition: selectedCollege.type.includes("Public") && !isInState
                          ? selectedCollege.tuition * 3  // Out-of-state tuition
                          : selectedCollege.tuition,     // In-state or private tuition
                        roomAndBoard: selectedCollege.roomAndBoard,
                        fees: 1200, // Example value for fees
                        books: 1000, // Example value for books and supplies
                      }}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="mr-2">Download Estimate</Button>
                    <Button 
                      onClick={saveToProfile}
                      disabled={isSaving}
                      className="flex items-center"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save to My Profile
                        </>
                      )}
                    </Button>
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
      
      {/* Save Calculation Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Calculation</DialogTitle>
            <DialogDescription>
              Enter a name for this calculation scenario to help you identify it later in your profile.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="calculationName" className="mb-2 block">Calculation Name</Label>
            <Input
              id="calculationName"
              value={calculationName}
              onChange={(e) => setCalculationName(e.target.value)}
              placeholder="e.g. Fall 2023 with Housing"
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCalculation} 
              disabled={!calculationName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Calculation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetPriceCalculator;
