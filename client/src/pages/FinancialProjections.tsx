import { useState, useEffect, useRef, useMemo } from "react";
import { AuthProps } from "@/interfaces/auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { createMainProjectionChart, fixLiabilityCalculation } from "@/lib/charts";
import ExpenseBreakdownChart from "@/components/financial/ExpenseBreakdownChart";
import AssetBreakdownChart from "@/components/financial/AssetBreakdownChart";
import EnhancedAssetBreakdownChart from "@/components/financial/EnhancedAssetBreakdownChart";
import RetirementGrowthWidget from "@/components/financial/RetirementGrowthWidget";
import ExpenseDebugHelper from "@/components/financial/ExpenseDebugHelper";
import { DebtBreakdownComponent } from "@/components/financial/DebtBreakdownComponent";
import TaxBreakdownChart from "@/components/financial/TaxBreakdownChart";
import TaxBreakdownTable from "@/components/financial/TaxBreakdownTable";
import CashFlowTable from "@/components/financial/CashFlowTable";
import LocationAdjustmentInfo from "@/components/financial/LocationAdjustmentInfo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Info, School, Briefcase, GraduationCap, ChevronUp, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import MilestonesSection from "@/components/milestones/MilestonesSection";
import { AdvicePanel } from "@/components/financial-advice/AdvicePanel";
import { generateFinancialAdvice, FinancialAdvice, FinancialState } from "@/lib/financialAdvice";
import { 
  calculateFinancialProjection, 
  generatePythonCalculatorInput,
  FinancialProjectionData
} from "@/lib/pythonCalculator";

type ProjectionType = "netWorth" | "income" | "expenses" | "assets" | "liabilities" | "cashFlow";

// Interfaces for API responses
interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  location: string | null;
  zipCode: string | null;
  birthYear: number | null;
}

interface CollegeCalculation {
  id: number;
  userId: number;
  collegeId: number;
  netPrice: number;
  studentLoanAmount: number;
  includedInProjection: boolean;
  college?: {
    name: string;
  };
}

interface CareerCalculation {
  id: number;
  userId: number;
  careerId: number;
  projectedSalary: number;
  entryLevelSalary: number | null;
  startYear: number | null;
  includedInProjection: boolean;
  education: string | null;
  career?: {
    title: string;
  };
}

interface Milestone {
  id: number;
  userId: number;
  type: string;
  title: string;
  date: string;
  yearsAway: number;
  // Marriage specific fields
  spouseOccupation?: string;
  spouseIncome?: number;
  spouseAssets?: number;
  spouseLiabilities?: number;
  // Home specific fields
  homeValue?: number;
  homeDownPayment?: number;
  homeMonthlyPayment?: number;
  // Car specific fields
  carValue?: number;
  carDownPayment?: number;
  carMonthlyPayment?: number;
  // Children specific fields
  childrenCount?: number;
  childrenExpensePerYear?: number;
  // Education specific fields
  educationCost?: number;
  educationType?: string;
  educationYears?: number;
  educationAnnualCost?: number;
  educationAnnualLoan?: number;
  targetOccupation?: string;
  educationField?: string;
  targetCareer?: string;
  workStatus?: string; // "no", "part-time", or "full-time"
  partTimeIncome?: number;
  returnToSameProfession?: boolean;
  // Additional properties used in the app but not in the database
  financialImpact?: number;
  active?: boolean;
  completed?: boolean;
  details?: Record<string, any>;
  createdAt?: Date | null;
}

interface FinancialProfile {
  id: number;
  userId: number;
  householdIncome: number | null;
  householdSize: number | null;
  savingsAmount: number | null;
  studentLoanAmount: number | null;
  otherDebtAmount: number | null;
}

interface FinancialProjectionsProps extends AuthProps {
  initialProjectionId?: number;
}

const FinancialProjections = ({
  user,
  isAuthenticated,
  isFirstTimeUser,
  login,
  signup,
  logout,
  completeOnboarding,
  initialProjectionId
}: FinancialProjectionsProps) => {
  // Temporary user ID for demo purposes
  const userId = 1;
  
  // Setup React Query client first
  const queryClient = useQueryClient();
  
  // Get the current location for parsing query parameters
  const [location] = useLocation();
  // This combination of projectionId and timestamp will force a full reset when the URL changes
  const { projectionId, timestamp } = useMemo(() => {
    // Parse URL query parameters
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const t = params.get('t') || Date.now().toString();
    
    // Give priority to initialProjectionId if provided (from App.tsx)
    const effectiveId = initialProjectionId || (id ? parseInt(id, 10) : null);
    
    // Log when projection ID changes
    console.log("Projection ID changed to:", effectiveId, 
        initialProjectionId ? "(from initialProjectionId)" : "(from URL)", 
        "with timestamp:", t);
    
    return { projectionId: effectiveId, timestamp: t };
  }, [location, initialProjectionId]);

  const [activeTab, setActiveTab] = useState<ProjectionType>("netWorth");
  const [timeframe, setTimeframe] = useState<string>("10 Years");
  const [age, setAge] = useState<number>(25);
  const [startingSavings, setStartingSavings] = useState<number>(5000);
  const [income, setIncome] = useState<number>(40000);
  const [expenses, setExpenses] = useState<number>(35000);
  // Get income growth rate from localStorage (set by IncomeGrowthWidget)
  const [incomeGrowth, setIncomeGrowth] = useState<number>(() => {
    const savedGrowthRate = window.localStorage.getItem('income-growth-rate');
    return savedGrowthRate ? parseFloat(savedGrowthRate) : 3.0;
  });
  const [studentLoanDebt, setStudentLoanDebt] = useState<number>(0);
  const [financialAdvice, setFinancialAdvice] = useState<FinancialAdvice[]>([]);
  
  // State for collapsible sections
  const [locationSectionOpen, setLocationSectionOpen] = useState<boolean>(true);
  const [expenseSectionOpen, setExpenseSectionOpen] = useState<boolean>(true);
  const [assetSectionOpen, setAssetSectionOpen] = useState<boolean>(true);
  const [debtSectionOpen, setDebtSectionOpen] = useState<boolean>(true);
  const [taxSectionOpen, setTaxSectionOpen] = useState<boolean>(true);
  const [calculationsSectionOpen, setCalculationsSectionOpen] = useState<boolean>(true);
  const [adviceSectionOpen, setAdviceSectionOpen] = useState<boolean>(true);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Fetch user data to get birth year
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json() as Promise<User>;
    }
  });

  // Fetch assumptions for financial calculations
  const { data: assumptions, isLoading: isLoadingAssumptions } = useQuery({
    queryKey: ['/api/assumptions/user', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assumptions/user/${userId}`);
        if (!response.ok) {
          console.error("Failed to fetch assumptions:", response.statusText);
          return []; // Return empty array if fetch fails
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching assumptions:", err);
        return []; // Return empty array on error
      }
    }
  });
  
  // Fetch financial profile
  const { data: financialProfile, isLoading: isLoadingFinancialProfile, error: financialProfileError } = useQuery({
    queryKey: ['/api/financial-profiles/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/financial-profiles/user/${userId}`);
      if (response.status === 404) {
        // Return a default financial profile if none exists
        return {
          id: 0,
          userId: userId,
          householdIncome: null,
          householdSize: null,
          savingsAmount: 5000, // Default starting savings
          studentLoanAmount: null,
          otherDebtAmount: null
        } as FinancialProfile;
      }
      if (!response.ok) throw new Error('Failed to fetch financial profile');
      return response.json() as Promise<FinancialProfile>;
    },
    enabled: !!userData
  });
  
  // Fetch location cost of living data based on user's zip code
  const { data: locationCostData, isLoading: isLoadingLocationData } = useQuery({
    queryKey: ['/api/location-cost-of-living/zip', userData?.zipCode],
    queryFn: async () => {
      if (!userData?.zipCode) return null;
      const response = await fetch(`/api/location-cost-of-living/zip/${userData.zipCode}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to fetch location cost of living data');
      const data = await response.json();
      
      // Debug location data to check healthcare value
      console.log("Location cost of living data:", {
        zipCode: userData?.zipCode,
        city: data?.city,
        state: data?.state,
        healthcare: data?.healthcare,
        healthcare_exists: data?.healthcare !== undefined && data?.healthcare !== null,
        healthcare_type: typeof data?.healthcare,
        allKeys: data ? Object.keys(data) : [],
        allValues: data ? Object.keys(data).map(key => ({ key, value: data[key] })) : []
      });
      
      return data;
    },
    enabled: !!userData?.zipCode
  });

  // Fetch college calculations to get student loan debt
  const { data: collegeCalculations, isLoading: isLoadingCollegeCalcs } = useQuery({
    queryKey: ['/api/college-calculations/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/college-calculations/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch college calculations');
      return response.json() as Promise<CollegeCalculation[]>;
    }
  });

  // Fetch career calculations to get income projection
  const { data: careerCalculations, isLoading: isLoadingCareerCalcs } = useQuery({
    queryKey: ['/api/career-calculations/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/career-calculations/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch career calculations');
      return response.json() as Promise<CareerCalculation[]>;
    }
  });
  
  // Fetch milestones for financial projections
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery({
    queryKey: ['/api/milestones/user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/milestones/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch milestones');
      return response.json() as Promise<Milestone[]>;
    },
    // Force a refetch when we return to this component or when there's a focus change
    // This ensures the data is always up-to-date after edits
    refetchOnWindowFocus: true
  });
  
  // Get all available careers for reference in milestone processing
  // This data is needed for salary information when changing careers after graduation
  const { data: careers, isLoading: isLoadingCareers } = useQuery({
    queryKey: ['/api/careers'],
    queryFn: async () => {
      const response = await fetch('/api/careers');
      if (!response.ok) throw new Error('Failed to fetch careers');
      return response.json();
    }
  });

  // Make careers data available globally for Python calculator access
  // This is needed for the targetOccupation functionality in education milestones
  useEffect(() => {
    if (careers && careers.length > 0) {
      // @ts-ignore - Adding global property for Python calculator
      window.careersData = careers;
      console.log("Made careers data globally available for Python calculator:", careers.length);
    }
  }, [careers]);
  
  // Create mutation to update financial profile
  const updateFinancialProfileMutation = useMutation({
    mutationFn: async (data: Partial<FinancialProfile>) => {
      if (!financialProfile?.id) return null;
      
      const response = await fetch(`/api/financial-profiles/${financialProfile.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update financial profile');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/financial-profiles/user', userId] });
    },
  });

  // Update form values based on user profile and saved calculations
  useEffect(() => {
    // Calculate current age from birth year if available
    if (userData?.birthYear) {
      const currentAge = new Date().getFullYear() - userData.birthYear;
      setAge(currentAge);
    }
    
    // Set initial savings from financial profile
    if (financialProfile?.savingsAmount) {
      setStartingSavings(financialProfile.savingsAmount);
    }
    
    // Set student loan debt from college calculations
    if (collegeCalculations && collegeCalculations.length > 0) {
      // Find the college calculation that's included in projections
      const includedCollegeCalc = collegeCalculations.find(calc => calc.includedInProjection);
      if (includedCollegeCalc) {
        setStudentLoanDebt(includedCollegeCalc.studentLoanAmount || 0);
      }
    }
    
    // Set income from career calculations
    if (careerCalculations && careerCalculations.length > 0) {
      // Find the career calculation that's included in projections
      const includedCareerCalc = careerCalculations.find(calc => calc.includedInProjection);
      if (includedCareerCalc && includedCareerCalc.entryLevelSalary) {
        setIncome(includedCareerCalc.entryLevelSalary);
      } else if (includedCareerCalc) {
        setIncome(includedCareerCalc.projectedSalary);
      }
    }

    // Set appropriate defaults for expenses based on income and location
    if (income > 0) {
      // Base expenses on income (typically 70-80% of income)
      const baseExpenses = income * 0.75;
      
      // Apply location adjustment if available
      if (locationCostData) {
        // Calculate annual expenses directly from monthly cost of living data
        // These values are actual dollar amounts from the CSV file
        const monthlyExpenses = (
          (locationCostData.housing || 0) +
          (locationCostData.food || 0) +
          (locationCostData.transportation || 0) +
          (locationCostData.healthcare || 0) +
          (locationCostData.personal_insurance || 0) + 
          (locationCostData.entertainment || 0) +
          (locationCostData.services || 0) +
          (locationCostData.apparel || 0) +
          (locationCostData.other || 0)
        );
        
        // Convert monthly to annual
        const annualExpenses = monthlyExpenses * 12;
        
        // Make sure we're getting a reasonable result

        
        // Use the calculated annual expenses, but ensure it's at least 50% of income
        // as a sanity check (people generally don't spend less than half their income)
        setExpenses(Math.max(Math.round(annualExpenses), Math.round(income * 0.5)));
      } else {
        setExpenses(Math.round(baseExpenses));
      }
    }
  }, [userData, financialProfile, collegeCalculations, careerCalculations, locationCostData, income]);
  
  // Find the included college and career calculations
  const includedCollegeCalc = collegeCalculations?.find(calc => calc.includedInProjection);
  const includedCareerCalc = careerCalculations?.find(calc => calc.includedInProjection);
  
  // Define variables to hold spouse-related assumption values with defaults
  const [spouseLoanTerm, setSpouseLoanTerm] = useState<number>(10); // Default: 10 years
  const [spouseLoanRate, setSpouseLoanRate] = useState<number>(5.0); // Default: 5.0% annual interest
  const [spouseAssetGrowth, setSpouseAssetGrowth] = useState<number>(3.0); // Default: 3.0% annual growth
  
  // Define variables for new configurable parameters
  const [emergencyFundAmount, setEmergencyFundAmount] = useState<number>(10000); // Default: $10,000
  const [personalLoanTermYears, setPersonalLoanTermYears] = useState<number>(5); // Default: 5 years
  const [personalLoanInterestRate, setPersonalLoanInterestRate] = useState<number>(8.0); // Default: 8.0% annual interest
  
  // Listen for income growth rate changes from the Assumptions page
  useEffect(() => {
    const handleStorageChange = () => {
      const savedRate = window.localStorage.getItem('income-growth-rate');
      if (savedRate) {
        const parsedRate = parseFloat(savedRate);
        if (!isNaN(parsedRate)) {
          setIncomeGrowth(parsedRate);
        }
      }
    };
    
    // Set up event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Get assumptions with a dedicated query for retirement calculations
  const { data: assumptionsData } = useQuery({
    queryKey: ['/api/assumptions/user', userId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/assumptions/user/${userId}`);
        if (!response.ok) {
          console.error("Failed to fetch assumptions:", response.statusText);
          return []; // Return empty array if fetch fails
        }
        return response.json();
      } catch (err) {
        console.error("Error fetching assumptions:", err);
        return []; // Return empty array on error
      }
    }
  });
  
  // Function to get assumption value by category and key
  const getAssumptionValue = (category: string, key: string, defaultVal: number): number => {
    if (!assumptionsData || !Array.isArray(assumptionsData)) return defaultVal;
    
    const assumption = assumptionsData.find((a: any) => 
      a.category === category && a.key === key && a.isEnabled
    );
    
    return assumption ? assumption.value : defaultVal;
  };
  
  // Process assumptions for financial calculations
  useEffect(() => {
    if (assumptionsData && assumptionsData.length > 0) {
      console.log("Processing assumptions for financial calculations:", assumptionsData);
      
      // Additional assumptions processing could be added here for retirement
      
      // Find spouse loan term assumption
      const spouseLoanTermAssumption = assumptionsData.find(
        (a: { category: string; key: string; isEnabled: boolean }) => 
          a.category === "marriage" && a.key === "spouse-loan-term" && a.isEnabled
      );
      
      // Find spouse loan interest rate assumption
      const spouseLoanRateAssumption = assumptionsData.find(
        (a: { category: string; key: string; isEnabled: boolean }) => 
          a.category === "marriage" && a.key === "spouse-loan-rate" && a.isEnabled
      );
      
      // Find spouse asset growth rate assumption
      const spouseAssetGrowthAssumption = assumptionsData.find(
        (a: { category: string; key: string; isEnabled: boolean }) => 
          a.category === "marriage" && a.key === "spouse-asset-growth" && a.isEnabled
      );
      
      console.log("Spouse loan term assumption:", spouseLoanTermAssumption);
      console.log("Spouse loan rate assumption:", spouseLoanRateAssumption);
      console.log("Spouse asset growth assumption:", spouseAssetGrowthAssumption);
      
      // Set state variables with assumption values or use defaults
      if (spouseLoanTermAssumption) {
        console.log("Setting spouse loan term to:", spouseLoanTermAssumption.value);
        setSpouseLoanTerm(spouseLoanTermAssumption.value);
      }
      
      if (spouseLoanRateAssumption) {
        console.log("Setting spouse loan rate to:", spouseLoanRateAssumption.value);
        setSpouseLoanRate(spouseLoanRateAssumption.value);
      }
      
      if (spouseAssetGrowthAssumption) {
        console.log("Setting spouse asset growth to:", spouseAssetGrowthAssumption.value);
        setSpouseAssetGrowth(spouseAssetGrowthAssumption.value);
      }
    }
  }, [assumptionsData]);
  
  // Check if data is being loaded
  const isLoading = isLoadingUser || isLoadingFinancialProfile || isLoadingCollegeCalcs || isLoadingCareerCalcs || isLoadingLocationData || isLoadingMilestones || isLoadingAssumptions || isLoadingCareers;
  
  // Determine years based on timeframe
  const years = timeframe === "5 Years" ? 5 : timeframe === "20 Years" ? 20 : 10;
  
  // Get cost of living adjustment factor from location data
  // This factor is critical for properly adjusting income based on location:
  // - Values > 1.0 indicate high-cost areas (e.g., 1.2 = 20% higher than average)
  // - Values < 1.0 indicate low-cost areas (e.g., 0.8 = 20% lower than average)
  // When the user changes their location/zip code, this factor updates and triggers recalculation
  const costOfLivingFactor = locationCostData?.income_adjustment_factor || 1.0;
  
  // Generate projection data based on inputs
  // This is now a function to be called both during rendering and via onMilestoneChange
  // We directly use the state values and the milestones parameter 
  const generateProjectionData = (milestonesList = milestones) => {
    // Format milestones to match expected format if needed
    const formattedMilestones = milestonesList?.map(m => ({
      id: m.id,
      userId: m.userId,
      type: m.type,
      title: m.title,
      date: m.date,
      yearsAway: m.yearsAway,
      spouseOccupation: m.spouseOccupation,
      spouseIncome: m.spouseIncome,
      spouseAssets: m.spouseAssets,
      spouseLiabilities: m.spouseLiabilities,
      homeValue: m.homeValue,
      homeDownPayment: m.homeDownPayment,
      homeMonthlyPayment: m.homeMonthlyPayment,
      carValue: m.carValue,
      carDownPayment: m.carDownPayment,
      carMonthlyPayment: m.carMonthlyPayment,
      childrenCount: m.childrenCount,
      childrenExpensePerYear: m.childrenExpensePerYear,
      educationCost: m.educationCost
    })) || [];
    // Set up initial values for assets and liabilities
    let initialSavings = startingSavings;
    let initialStudentLoanDebt = studentLoanDebt;
    
    // Track overall asset and liability totals
    let totalAssets = initialSavings;
    let totalLiabilities = initialStudentLoanDebt;
    
    // Calculate initial net worth properly (total assets minus total liabilities)
    let netWorth = totalAssets - totalLiabilities;
    
    // Properly adjust income based on cost of living factor
    // For high-cost areas (factor > 1), this increases income to reflect higher wages
    // For low-cost areas (factor < 1), this decreases income to reflect lower wages
    // This adjustment is critical for all projection calculations to be location-aware
    let currentIncome = income * costOfLivingFactor;
    
    // Use the expenses input as-is because we already adjusted it in the useEffect
    // We don't need to apply location adjustment again since it's already built into the input value
    let currentExpenses = expenses;
    
    // Ensure expenses are at least 50% of income and at most 90% as a sanity check
    currentExpenses = Math.max(currentIncome * 0.5, Math.min(currentExpenses, currentIncome * 0.9));
    
    const netWorthData = [netWorth];
    const incomeData = [currentIncome];
    const spouseIncomeData = [0]; // Initialize spouse income data array
    const expensesData = [currentExpenses];
    
    // Initialize separate arrays for assets and liabilities
    const assetsData = [startingSavings]; // Initial assets (savings only)
    const liabilitiesData = [studentLoanDebt]; // Initial liabilities (student loan only)
    
    // Track expense categories for detailed breakdown with initial values as percentages of base expenses
    // Initialize with empty arrays, the backend will provide the proper data
    const housingExpensesData = [0]; // Will be populated with backend data
    const transportationExpensesData = [0]; // Will be populated with backend data
    const foodExpensesData = [0]; // Will be populated with backend data
    const healthcareExpensesData = [0]; // Will be populated with backend data
    const educationExpensesData = [0]; // Student loan and education loan expenses
    const debtExpensesData = [0]; // Other debt payments
    const discretionaryExpensesData = [0]; // Will be populated with backend data
    const childcareExpensesData = [0]; // Child-related expenses
    const taxesData = [currentIncome * 0.25]; // Estimate initial taxes at 25% of income
    
    // Specific asset and liability tracking
    const homeValueData = [0]; // Track home value as an asset
    const mortgageData = [0];  // Track mortgage as a liability
    
    // Track car value and loan
    const carValueData = [0]; // Track car value as an asset
    const carLoanData = [0];  // Track car loan as a liability
    
    // Track student loan balance over time
    let remainingStudentLoanDebt = studentLoanDebt;
    const studentLoanData = [remainingStudentLoanDebt]; // Track student loans as a liability
    
    const ages = [age];
    
    // Sort milestones by yearsAway to process them in chronological order
    const sortedMilestones = milestones ? [...milestones].sort((a, b) => a.yearsAway - b.yearsAway) : [];
    
    console.log("Processing milestones for projection:", sortedMilestones);
    
    // Create a map of milestones by year
    const milestonesByYear = new Map();
    if (sortedMilestones.length > 0) {
      sortedMilestones.forEach(milestone => {
        if (milestone.yearsAway <= years) {
          milestonesByYear.set(milestone.yearsAway, [...(milestonesByYear.get(milestone.yearsAway) || []), milestone]);
        }
      });
    }
    
    // Track spouse income and assets/liabilities (for marriage milestone)
    let hasSpouse = false;
    let spouseIncome = 0;
    let spouseIncomeGrowth = incomeGrowth; // Use same growth rate as primary income
    let spouseAssets = 0; // Track spouse assets separately
    let spouseLiabilities = 0; // Track spouse liabilities separately
    
    // Track homeowner status, value, and mortgage (for home milestone)
    let hasHome = false;
    let homeValue = 0;
    let mortgagePrincipal = 0;
    let mortgagePayment = 0;
    
    // Track car payments (for car milestone)
    let hasCar = false;
    let carValue = 0;
    let carLoanPrincipal = 0;
    let carPayment = 0;
    
    // Track children expenses (for children milestone)
    let hasChildren = false;
    let childrenExpenses = 0;
    
    // Track education debt (for education milestone)
    let hasEducationDebt = false;
    let educationDebt = 0;
    
    for (let i = 1; i <= years; i++) {
      // Apply income growth
      currentIncome = Math.round(currentIncome * (1 + incomeGrowth / 100));
      
      // If spouse income, apply growth to that as well
      if (hasSpouse) {
        spouseIncome = Math.round(spouseIncome * (1 + spouseIncomeGrowth / 100));
      }
      
      // Base expense growth rate (inflation)
      currentExpenses = Math.round(currentExpenses * 1.02);
      
      // Process milestones for this year
      if (milestonesByYear.has(i)) {
        const yearMilestones = milestonesByYear.get(i);
        
        yearMilestones.forEach((milestone: any) => {
          console.log(`Processing milestone for year ${i}:`, milestone);
          
          switch (milestone.type) {
            case 'marriage':
              hasSpouse = true;
              spouseIncome = milestone.spouseIncome || 50000;
              
              // Set spouse assets and liabilities
              spouseAssets = milestone.spouseAssets || 0;
              spouseLiabilities = milestone.spouseLiabilities || 0;
              
              // Add spouse assets and subtract liabilities from net worth
              netWorth += spouseAssets - spouseLiabilities;
              console.log(`Marriage milestone: Adding spouse with income $${spouseIncome}, assets $${spouseAssets}, and liabilities $${spouseLiabilities}`);
              break;
              
            case 'home':
              hasHome = true;
              // Set home value
              homeValue = milestone.homeValue || 0;
              // Calculate mortgage principal (home value minus down payment)
              const downPayment = milestone.homeDownPayment || 0;
              mortgagePrincipal = homeValue - downPayment;
              
              // Down payment reduces liquid assets but shouldn't change net worth
              // since it transfers from cash to home equity
              // We need to reduce the netWorth value because it's used to track liquid assets
              // The total netWorth will be properly calculated from all assets and liabilities later
              netWorth -= downPayment;
              
              // Set monthly mortgage payment (annual)
              mortgagePayment = (milestone.homeMonthlyPayment || 0) * 12;
              console.log(`Home milestone: Value $${homeValue}, Down payment $${downPayment}, Mortgage $${mortgagePrincipal}, annual payment $${mortgagePayment}`);
              break;
              
            case 'car':
              hasCar = true;
              // Set car value
              carValue = milestone.carValue || 0;
              // Calculate car loan principal (car value minus down payment)
              const carDownPayment = milestone.carDownPayment || 0;
              carLoanPrincipal = carValue - carDownPayment;
              
              // Reduce liquid assets by the down payment amount
              // The car asset value and loan will be tracked in specific arrays
              // We need to reduce the netWorth value because it's used to track liquid assets
              // The total netWorth will be properly calculated from all assets and liabilities later
              netWorth -= carDownPayment;
              
              // Set monthly car payment (annual)
              carPayment = (milestone.carMonthlyPayment || 0) * 12;
              
              // Get the transportation reduction factor from assumptions (default 80%)
              const carTransportationReduction = 0.8; // This should be retrieved from assumptions
              
              console.log(`Car milestone: Value $${carValue}, Down payment $${carDownPayment}, Loan $${carLoanPrincipal}, annual payment $${carPayment}`);
              console.log(`Transportation expenses reduced by ${carTransportationReduction * 100}% due to car purchase`);
              break;
              
            case 'children':
              hasChildren = true;
              // Set annual child expenses
              childrenExpenses = (milestone.childrenExpensePerYear || 0) * (milestone.childrenCount || 1);

              break;
              
            case 'education':
              hasEducationDebt = true;
              // Add education cost as debt
              educationDebt = milestone.educationCost || 0;
              // For the first year of education, we assume a 20% down payment
              // We reduce netWorth to account for the immediate cash outflow
              netWorth -= educationDebt * 0.2; // 20% of total cost paid upfront
              console.log(`Education milestone: Total cost $${educationDebt}`);
              break;
          }
        });
      }
      
      // Calculate education loan payments for this year
      let studentLoanPaymentForYear = 0;
      if (remainingStudentLoanDebt > 0 && i <= 10) {
        const studentLoanInterestRate = 0.05; // 5% annual interest rate
        const studentLoanTerm = 10; // 10 year term
        const r = studentLoanInterestRate;
        const n = studentLoanTerm;
        const amortizedAnnualPayment = (studentLoanDebt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        studentLoanPaymentForYear = amortizedAnnualPayment;
      }
      
      // Calculate education debt payment for this year
      let educationLoanPaymentForYear = 0;
      if (hasEducationDebt && i > 1 && i <= 6) {
        const educationLoanInterestRate = 0.06; // 6% annual interest rate
        const educationLoanTerm = 5; // 5 year term
        const educationMilestone = sortedMilestones.find((m: { type: string }) => m.type === 'education');
        const initialEducationCost = educationMilestone?.educationCost || 0;
        const r = educationLoanInterestRate;
        const n = educationLoanTerm;
        const amortizedAnnualPayment = (initialEducationCost * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        educationLoanPaymentForYear = amortizedAnnualPayment;
      }
      
      // Track personal and spouse income separately
      let totalIncome = currentIncome + (hasSpouse ? spouseIncome : 0);
      
      // Add all expenses together, including loan payments
      const totalExpenses = currentExpenses + 
        (hasHome ? mortgagePayment : 0) +
        (hasCar ? carPayment : 0) +
        (hasChildren ? childrenExpenses : 0) +
        studentLoanPaymentForYear +
        educationLoanPaymentForYear;
      
      // Calculate annual surplus or deficit
      const annualSurplus = totalIncome - totalExpenses;
      
      // Update net worth
      netWorth += annualSurplus;
      
      // Apply student loan payments (simplified - 10 year repayment)
      let studentLoanPayment = 0;
      if (remainingStudentLoanDebt > 0 && i <= 10) {
        // Simple amortization for student loans - 10 year term with 5% interest rate
        const studentLoanInterestRate = 0.05; // 5% annual interest rate
        const studentLoanTerm = 10; // 10 year term
        
        // Calculate interest for this year
        const annualInterestPaid = remainingStudentLoanDebt * studentLoanInterestRate;
        
        // Calculate total annual payment (level payment amortization)
        const r = studentLoanInterestRate;
        const n = studentLoanTerm;
        const amortizedAnnualPayment = (studentLoanDebt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        studentLoanPayment = amortizedAnnualPayment;
        
        // Principal reduction is annual payment minus interest
        const principalReduction = Math.min(
          amortizedAnnualPayment - annualInterestPaid,
          remainingStudentLoanDebt // Can't reduce more than remaining principal
        );
        
        // Track student loan payment in the education expenses category
        educationExpensesData[i-1] = (educationExpensesData[i-1] || 0) + amortizedAnnualPayment;
        
        console.log(`Student loan payment for year ${i}: $${amortizedAnnualPayment.toFixed(2)} (interest: $${annualInterestPaid.toFixed(2)}, principal: $${principalReduction.toFixed(2)})`);
        console.log(`Student loan balance: $${remainingStudentLoanDebt.toFixed(2)} → $${(remainingStudentLoanDebt - principalReduction).toFixed(2)}`);
        
        // Update the student loan balance for this year
        remainingStudentLoanDebt = Math.max(0, remainingStudentLoanDebt - principalReduction);
      }
      
      // The education loans (both undergraduate and graduate) are now handled by the Python backend
      // The loan data is passed back to us as arrays: educationLoans and graduateSchoolLoans
      // We no longer need to re-calculate the loans here, which ensures consistency
      
      let educationLoanPayment = 0;
      
      // If we have data from the Python backend (projectionData), use it
      if (projectionData?.educationLoans && projectionData.educationLoans[i-1] !== undefined) {
        // We're using the data directly from the Python calculator
        // The payment handling is done in the backend
        const undergraduateLoans = projectionData.educationLoans[i-1] || 0;
        const graduateLoans = projectionData.graduateSchoolLoans?.[i-1] || 0;
        
        // For debugging purposes
        if (undergraduateLoans > 0 || graduateLoans > 0) {
          console.log(`Education loans for year ${i}: Undergraduate $${undergraduateLoans}, Graduate $${graduateLoans}`);
        }
      }
      // Note: We don't need to calculate the payment or update the debt anymore as that's handled by the backend
      
      // Update mortgage principal for this year (amortization calculation)
      if (hasHome) {
        // Assume 30-year mortgage with 6% annual interest rate
        const mortgageInterestRate = 0.06; // 6% annual interest rate
        const mortgageTerm = 30; // 30-year mortgage
        
        // Calculate interest for this year
        const annualInterestPaid = mortgagePrincipal * mortgageInterestRate;
        
        // Find the home milestone to get the initial home value and down payment
        const homeMilestone = sortedMilestones.find((m: { type: string }) => m.type === 'home');
        const homeValue = homeMilestone?.homeValue || 0;
        const downPayment = homeMilestone?.homeDownPayment || 0;
        const initialMortgagePrincipal = homeValue - downPayment;
        
        // If the annual mortgage payment isn't specified in the milestone or is unreasonable,
        // calculate a payment based on a proper 30-year loan amortization
        let annualMortgagePayment = mortgagePayment;
        if (mortgagePayment <= 0 || mortgagePayment < annualInterestPaid) {
          // Calculate proper amortization payment
          const r = mortgageInterestRate;
          const n = mortgageTerm;
          annualMortgagePayment = (initialMortgagePrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        
        // Principal reduction is mortgage payment minus interest
        const principalReduction = Math.min(
          annualMortgagePayment - annualInterestPaid,
          mortgagePrincipal // Can't reduce more than remaining principal
        );
        
        // Note: Mortgage payment is already included in totalExpenses
        
        console.log(`Mortgage payment for year ${i}: $${annualMortgagePayment.toFixed(2)} (interest: $${annualInterestPaid.toFixed(2)}, principal: $${principalReduction.toFixed(2)})`);
        console.log(`Mortgage balance: $${mortgagePrincipal.toFixed(2)} → $${(mortgagePrincipal - principalReduction).toFixed(2)}`);
        
        // Update mortgage principal
        mortgagePrincipal = Math.max(0, mortgagePrincipal - principalReduction);
      }
      
      // Update housing value with appreciation (3% per year)
      if (hasHome) {
        homeValue = Math.round(homeValue * 1.03);
      }
      
      // Update car loan principal for this year (amortization calculation)
      if (hasCar) {
        // Assume 5-year car loan with 5% annual interest rate
        const carInterestRate = 0.05; // 5% annual interest rate
        const carLoanTerm = 5; // 5-year car loan
        
        // Calculate interest for this year
        const annualInterestPaid = carLoanPrincipal * carInterestRate;
        
        // Find the car milestone to get the initial car value and down payment
        const carMilestone = sortedMilestones.find((m: { type: string }) => m.type === 'car');
        const carMilestoneValue = carMilestone?.carValue || 0;
        const downPayment = carMilestone?.carDownPayment || 0;
        const initialCarLoanPrincipal = carMilestoneValue - downPayment;
        
        // If the annual car payment isn't specified in the milestone or is unreasonable,
        // calculate a payment based on a proper 5-year loan amortization
        let annualCarPayment = carPayment;
        if (carPayment <= 0 || carPayment < annualInterestPaid) {
          // Calculate proper amortization payment
          const r = carInterestRate;
          const n = carLoanTerm;
          annualCarPayment = (initialCarLoanPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        
        // Principal reduction is car payment minus interest
        const principalReduction = Math.min(
          annualCarPayment - annualInterestPaid,
          carLoanPrincipal // Can't reduce more than remaining principal
        );
        
        // Note: Car payment is already included in totalExpenses
        
        console.log(`Car loan payment for year ${i}: $${annualCarPayment.toFixed(2)} (interest: $${annualInterestPaid.toFixed(2)}, principal: $${principalReduction.toFixed(2)})`);
        console.log(`Car loan balance: $${carLoanPrincipal.toFixed(2)} → $${(carLoanPrincipal - principalReduction).toFixed(2)}`);
        
        // Update car loan principal
        carLoanPrincipal = Math.max(0, carLoanPrincipal - principalReduction);
        
        // Update car value with depreciation (15% per year)
        carValue = Math.round(carValue * 0.85);
      }
      
      // Process spouse liabilities according to assumptions (amortized reduction)
      if (hasSpouse && spouseLiabilities > 0) {
        // Use the spouse loan term and interest rate from assumptions
        const spouseLoanInterestRate = spouseLoanRate / 100; // Convert from percentage to decimal
        
        // Calculate years into marriage
        const marriageMilestone = sortedMilestones.find((m: { type: string }) => m.type === 'marriage');
        const marriageYear = marriageMilestone?.yearsAway || 0;
        const yearsIntoMarriage = i - marriageYear;
        
        if (yearsIntoMarriage >= 0 && yearsIntoMarriage < spouseLoanTerm) {
          // Get the initial spouse liability amount when marriage started
          const initialSpouseLiabilities = marriageMilestone?.spouseLiabilities || 0;
          
          // Proper amortization calculation for level payment loan
          // Formula: Payment = (P * r * (1+r)^n) / ((1+r)^n - 1)
          // Where: P = principal, r = interest rate per period, n = number of periods
          const r = spouseLoanInterestRate;
          const n = spouseLoanTerm;
          const amortizedAnnualPayment = (initialSpouseLiabilities * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
          
          // Calculate interest for this year
          const annualInterestPaid = spouseLiabilities * spouseLoanInterestRate;
          
          // Principal reduction is annual payment minus interest
          const principalReduction = Math.min(
            amortizedAnnualPayment - annualInterestPaid,
            spouseLiabilities // Can't reduce more than remaining principal
          );
          
          // Subtract payment from net worth (via expenses - total expenses track this now)
          // We don't need to directly impact netWorth here anymore because it's handled by the overall cash flow
          // netWorth -= amortizedAnnualPayment;
          
          // Note: Spouse loan payments are already accounted for in the main cash flow calculation
          
          console.log(`Spouse loan payment for year ${i}: $${amortizedAnnualPayment.toFixed(2)} (interest: $${annualInterestPaid.toFixed(2)}, principal: $${principalReduction.toFixed(2)})`);
          console.log(`Spouse loan balance: $${spouseLiabilities.toFixed(2)} → $${(spouseLiabilities - principalReduction).toFixed(2)}`);
          
          // Update spouse liabilities
          spouseLiabilities = Math.max(0, spouseLiabilities - principalReduction);
        }
      }
      
      // Apply spouse asset growth according to assumptions
      if (hasSpouse && spouseAssets > 0) {
        // Use the spouse asset growth rate from assumptions
        const spouseAssetGrowthRate = spouseAssetGrowth / 100; // Convert from percentage to decimal
        
        // Only apply growth after the marriage occurs
        const marriageMilestone = sortedMilestones.find((m: { type: string }) => m.type === 'marriage');
        const marriageYear = marriageMilestone?.yearsAway || 0;
        const yearsIntoMarriage = i - marriageYear;
        
        if (yearsIntoMarriage > 0) { // Only apply growth after the first year of marriage
          // Calculate asset growth for this year
          const assetGrowthAmount = spouseAssets * spouseAssetGrowthRate;
          
          // Add growth to spouse assets
          spouseAssets += assetGrowthAmount;
          
          // Add growth to net worth
          netWorth += assetGrowthAmount;
          
          console.log(`Spouse asset growth for year ${i}: $${assetGrowthAmount.toFixed(2)} (${spouseAssetGrowth}% of $${spouseAssets.toFixed(2)})`);
        }
      }
      
      // Calculate total assets and liabilities
      // For assets, we count the positive components of netWorth (savings from income)
      // plus home value, car value, and spouse assets if applicable
      const totalAssets = Math.max(0, netWorth) + 
                          (hasHome ? homeValue : 0) + 
                          (hasCar ? carValue : 0) + 
                          (hasSpouse ? spouseAssets : 0);
                          
      // For liabilities, we track all debts separately 
      // Student loan debt is tracked separately as a dedicated liability
      // Now using graduate and undergraduate education loans from the Python calculator
      // instead of the local educationDebt variable which is redundant
      const graduateSchoolDebt = projectionData?.graduateSchoolLoans?.[i-1] || 0;
      const undergraduateSchoolDebt = projectionData?.educationLoans?.[i-1] || 0;
      
      const totalLiabilities = mortgagePrincipal + 
                              carLoanPrincipal + 
                              remainingStudentLoanDebt + 
                              graduateSchoolDebt + 
                              undergraduateSchoolDebt + 
                              (hasSpouse ? spouseLiabilities : 0);
      
      // Calculate proper net worth as total assets minus total liabilities
      const properNetWorth = totalAssets - totalLiabilities;
      
      // Update data arrays for this year
      netWorthData.push(properNetWorth); // Use proper net worth calculation that includes all assets and liabilities
      assetsData.push(totalAssets);  
      liabilitiesData.push(totalLiabilities);
      homeValueData.push(hasHome ? homeValue : 0);
      mortgageData.push(mortgagePrincipal);
      carValueData.push(hasCar ? carValue : 0);
      carLoanData.push(carLoanPrincipal);
      studentLoanData.push(remainingStudentLoanDebt);
      
      // Store income values for stacked chart
      incomeData.push(currentIncome);
      spouseIncomeData.push(hasSpouse ? spouseIncome : 0);
      expensesData.push(totalExpenses);
      
      // Track expense categories for detailed breakdown
      // Housing: 30% of base expenses + mortgage payment if any
      let housingExpense = currentExpenses * 0.3 + (hasHome ? mortgagePayment : 0);
      housingExpensesData.push(housingExpense);
      
      // Transportation: 15% of base expenses + car payment if any
      let transportationExpense = currentExpenses * 0.15 + (hasCar ? carPayment : 0);
      transportationExpensesData.push(transportationExpense);
      
      // Food: 15% of base expenses
      let foodExpense = currentExpenses * 0.15;
      foodExpensesData.push(foodExpense);
      
      // Healthcare: 10% of base expenses
      let healthcareExpense = currentExpenses * 0.1;
      healthcareExpensesData.push(healthcareExpense);
      
      // Education: student loan + education loan payments
      // Note: Education expenses are updated during loan payment calculations
      if (!educationExpensesData[i]) {
        educationExpensesData.push(educationExpensesData[i-1] || 0);
      }
      
      // Debt: other debt payments
      // Note: Most debt is tracked in other categories, this is for miscellaneous debt
      debtExpensesData.push(0);
      
      // Childcare: child-related expenses
      let childcareExpense = hasChildren ? childrenExpenses : 0;
      childcareExpensesData.push(childcareExpense);
      
      // Discretionary: 30% of base expenses (or remainder)
      let discretionaryExpense = currentExpenses * 0.3;
      discretionaryExpensesData.push(discretionaryExpense);
      
      // Taxes: Calculated as percentage of income
      // For simplicity, we'll use a progressive-like structure
      // Income under 50k: 15%, 50k-100k: 20%, 100k+: 25%
      let taxRate;
      // Use the already declared totalIncome from above
      if (totalIncome < 50000) {
        taxRate = 0.15; // 15% for lower income
      } else if (totalIncome < 100000) {
        taxRate = 0.20; // 20% for middle income
      } else {
        taxRate = 0.25; // 25% for higher income
      }
      
      // Apply filing status adjustment (married filing jointly pays less than single)
      if (hasSpouse) {
        taxRate = taxRate * 0.85; // Simplified married discount
      }
      
      let taxAmount = totalIncome * taxRate;
      taxesData.push(taxAmount);
      
      ages.push(age + i);
    }
    
    // Calculate current expense data for expense breakdown chart
    const currentExpenseCategories = {
      housing: housingExpensesData.length > 0 ? housingExpensesData[0] : 0,
      transportation: transportationExpensesData.length > 0 ? transportationExpensesData[0] : 0,
      food: foodExpensesData.length > 0 ? foodExpensesData[0] : 0,
      healthcare: healthcareExpensesData.length > 0 ? healthcareExpensesData[0] : 0,
      education: educationExpensesData.length > 0 ? educationExpensesData[0] : 0,
      debt: debtExpensesData.length > 0 ? debtExpensesData[0] : 0,
      childcare: childcareExpensesData.length > 0 ? childcareExpensesData[0] : 0,
      discretionary: discretionaryExpensesData.length > 0 ? discretionaryExpensesData[0] : 0,
      // Make sure taxes are properly included with a significant non-zero value
      taxes: taxesData.length > 0 ? taxesData[0] : (incomeData[0] || income) * 0.2, // Use 20% default if needed
      // Add additional expense categories to match the ExpenseBreakdownChart interface
      personalInsurance: 0, // Will be populated from Python data when available
      entertainment: 0,     // Will be populated from Python data when available
      apparel: 0,           // Will be populated from Python data when available
      services: 0,          // Will be populated from Python data when available
      other: 0              // Will be populated from Python data when available
    };

    return {
      netWorth: netWorthData,
      income: incomeData,
      spouseIncome: spouseIncomeData,
      expenses: expensesData,
      assets: assetsData, // Use properly tracked asset data that includes home value
      liabilities: liabilitiesData, // Use properly tracked liability data that includes mortgage
      homeValue: homeValueData, // Track home value separately
      mortgage: mortgageData, // Track mortgage separately
      carValue: carValueData, // Track car value separately
      carLoan: carLoanData, // Track car loan separately
      studentLoan: studentLoanData, // Track student loan separately
      ages: ages,
      // Add expense categories with proper naming for the charts
      housingExpenses: housingExpensesData,
      transportationExpenses: transportationExpensesData,
      foodExpenses: foodExpensesData,
      healthcareExpenses: healthcareExpensesData,
      educationExpenses: educationExpensesData,
      debtExpenses: debtExpensesData,
      childcareExpenses: childcareExpensesData,
      discretionaryExpenses: discretionaryExpensesData,
      taxes: taxesData, // Include tax expenses for visualization
      
      // Add aliases with the exact property names expected by the charts in charts.ts
      housing: housingExpensesData,
      transportation: transportationExpensesData,
      food: foodExpensesData,
      healthcare: healthcareExpensesData,
      education: educationExpensesData,
      debt: debtExpensesData,
      childcare: childcareExpensesData,
      discretionary: discretionaryExpensesData,
      personalInsurance: [], // Add empty arrays to avoid undefined errors
      entertainment: [],
      apparel: [],
      services: [],
      other: [],
      
      // Current expense breakdown for the pie chart
      currentExpenses: currentExpenseCategories
    };
  };
  
  // Create a state for projection data
  // Add a state for the name of the current projection
const [projectionName, setProjectionName] = useState<string>(`Projection - ${new Date().toLocaleDateString()}`);

// Fetch saved projection data if an ID is provided
const { data: savedProjection, isLoading: isLoadingSavedProjection, error: savedProjectionError } = useQuery({
  queryKey: ['/api/financial-projections/detail', projectionId, timestamp], // Include timestamp to force refresh
  queryFn: async () => {
    if (!projectionId) {
      console.log("No projection ID provided, skipping fetch");
      return null;
    }
    
    // Add cache-busting timestamp to ensure fresh data
    const cacheBuster = new Date().getTime();
    console.log(`Fetching projection data for ID: ${projectionId} (cache bust: ${cacheBuster})`);
    
    try {
      const url = `/api/financial-projections/detail/${projectionId}?_=${cacheBuster}`;
      console.log(`Making fetch request to: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch projection data: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch saved projection: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Successfully loaded projection data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching projection:", error);
      throw error;
    }
  },
  enabled: !!projectionId, // Only enable this query when we have a projection ID
  retry: false // Don't retry failed requests
});

// Create a ref to track previous projection ID
const previousProjectionIdRef = useRef<number | null>(null);

// Load saved projection data when available - force a hard reset of state when projection ID changes
useEffect(() => {
  // First, detect if we've switched to a different projection
  const didProjectionChange = previousProjectionIdRef.current !== projectionId;
  
  // Update the ref
  previousProjectionIdRef.current = projectionId;
  
  // Only proceed if we have projection data and either it just loaded or the projection ID changed
  if (savedProjection && (!isLoadingSavedProjection || didProjectionChange)) {
    console.log("Loading saved projection:", savedProjection, "ID changed:", didProjectionChange);
    console.log("Projection has complete data:", 
      savedProjection.startingAge !== null &&
      savedProjection.startingSavings !== null &&
      savedProjection.income !== null && 
      savedProjection.expenses !== null);
    
    // Create a batch of state updates to be executed together for better performance
    const stateUpdates = () => {
      // Reset all state values at once
      
      // Load the projection name
      setProjectionName(savedProjection.name || `Projection - ${new Date().toLocaleDateString()}`);
      
      // Check if the projection has proper data or if it's an older projection with incomplete data
      const hasCompleteData = savedProjection.startingAge !== null &&
                            savedProjection.startingSavings !== null &&
                            savedProjection.income !== null;
      
      if (!hasCompleteData) {
        console.warn("Projection has incomplete data - extracting from projectionData JSON");
        
        // For older projections, try to extract data from the projectionData JSON
        try {
          const projData = typeof savedProjection.projectionData === 'string' 
            ? JSON.parse(savedProjection.projectionData) 
            : savedProjection.projectionData;
          
          // Extract data from the JSON
          const extractedAge = projData.ages && projData.ages.length > 0 ? projData.ages[0] : 25;
          const extractedSavings = projData.netWorth && projData.netWorth.length > 0 ? projData.netWorth[0] : 5000;
          const extractedIncome = projData.income && projData.income.length > 1 ? projData.income[1] : 40000;
          const extractedExpenses = projData.expenses && projData.expenses.length > 1 ? projData.expenses[1] : 35000;
          
          // Set extracted values
          setTimeframe(projData.ages ? `${projData.ages.length - 1} Years` : "10 Years");
          setAge(extractedAge);
          setStartingSavings(extractedSavings);
          setIncome(extractedIncome);
          setExpenses(extractedExpenses);
          setIncomeGrowth(3.0); // Default
          setStudentLoanDebt(0); // Default
          
          // Use default configurable parameters
          setEmergencyFundAmount(10000);
          setPersonalLoanTermYears(5);
          setPersonalLoanInterestRate(8.0);
          
          console.log("Extracted values from JSON:", {
            age: extractedAge,
            savings: extractedSavings,
            income: extractedIncome,
            expenses: extractedExpenses
          });
        } catch (error) {
          console.error("Failed to extract data from projectionData JSON:", error);
          // Fall back to defaults
          setTimeframe("10 Years");
          setAge(25);
          setStartingSavings(5000);
          setIncome(40000);
          setExpenses(35000);
          setIncomeGrowth(3.0);
          setStudentLoanDebt(0);
          setEmergencyFundAmount(10000);
          setPersonalLoanTermYears(5);
          setPersonalLoanInterestRate(8.0);
        }
      } else {
        // Normal case - use the properly saved values
        setTimeframe(savedProjection.timeframe ? `${savedProjection.timeframe} Years` : "10 Years");
        setAge(savedProjection.startingAge || 25);
        setStartingSavings(savedProjection.startingSavings || 5000);
        setIncome(savedProjection.income || 40000);
        setExpenses(savedProjection.expenses || 35000);
        setIncomeGrowth(savedProjection.incomeGrowth || 3.0);
        setStudentLoanDebt(savedProjection.studentLoanDebt || 0);
        
        // Load configurable parameters - use defaults if not present
        setEmergencyFundAmount(savedProjection.emergencyFundAmount || 10000);
        setPersonalLoanTermYears(savedProjection.personalLoanTermYears || 5);
        setPersonalLoanInterestRate(savedProjection.personalLoanInterestRate || 8.0);
      }
      
      // Parse the saved projection data
      if (savedProjection.projectionData) {
        try {
          const parsedData = JSON.parse(savedProjection.projectionData);
          
          // Add a key with the current projection ID to force React to treat this as new data
          // and re-render all dependent components
          const dataWithKey = {
            ...parsedData,
            _key: `projection-${projectionId}-${new Date().getTime()}`
          };
          
          console.log("Setting projection data with key:", dataWithKey._key);
          setProjectionData(dataWithKey);
        } catch (error) {
          console.error("Failed to parse saved projection data:", error);
        }
      }
    };
    
    // Execute all state updates as a batch
    stateUpdates();
    
    // Log that state has been completely reset based on the new projection
    console.log("State reset complete for projection ID:", projectionId);
  }
  
  // Log any errors that occurred during projection loading
  if (savedProjectionError) {
    console.error("Error loading saved projection:", savedProjectionError);
  }
}, [savedProjection, isLoadingSavedProjection, projectionId, savedProjectionError, initialProjectionId]);

// Initialize projection data with a key that depends on projectionId to force re-renders
const [projectionData, setProjectionData] = useState<any>(() => {
  return {
    netWorth: [startingSavings],
    ages: [age],
    income: [income],
    expenses: [expenses],
    _key: projectionId || 'new' // Add a key to force state change detection
  };
});
  
  // Update projection data when inputs change
  useEffect(() => {
    const updateProjectionData = async () => {
      console.log("Inputs changed, calculating projection data using Python calculator");
      try {
        // Add debugging for any existing milestones of type 'education'
        const educationMilestones = milestones?.filter(m => m.type === 'education') || [];
        console.log('Education milestones for calculator:', educationMilestones);
        
        // Generate input data for the Python calculator
        // Format milestones to match expected format and required fields
        const formattedMilestones = milestones?.map(m => ({
          id: m.id,
          userId: m.userId,
          type: m.type,
          title: m.title,
          date: m.date || null,
          yearsAway: m.yearsAway || null,
          financialImpact: m.financialImpact || null,
          // Required fields for all milestone types to ensure consistency
          workStatus: m.workStatus || "yes", // Default to working
          partTimeIncome: m.partTimeIncome || 0,
          returnToSameProfession: m.returnToSameProfession || false,
          // Marriage-specific fields
          spouseOccupation: m.spouseOccupation || null,
          spouseIncome: m.spouseIncome || null,
          spouseAssets: m.spouseAssets || null,
          spouseLiabilities: m.spouseLiabilities || null,
          // Home-specific fields
          homeValue: m.homeValue || null,
          homeDownPayment: m.homeDownPayment || null,
          homeMonthlyPayment: m.homeMonthlyPayment || null,
          // Car-specific fields
          carValue: m.carValue || null,
          carDownPayment: m.carDownPayment || null,
          carMonthlyPayment: m.carMonthlyPayment || null,
          // Children-specific fields
          childrenCount: m.childrenCount || null,
          childrenExpensePerYear: m.childrenExpensePerYear || null,
          // Education-specific fields
          educationCost: m.educationCost || null,
          educationType: m.educationType || null,
          educationYears: m.educationYears || null,
          educationAnnualCost: m.educationAnnualCost || null,
          educationAnnualLoan: m.educationAnnualLoan || null,
          targetOccupation: m.targetOccupation || null,
          educationField: m.educationField || null,
          targetCareer: m.targetCareer || null,
          // General fields
          active: m.active !== undefined ? m.active : true,
          completed: m.completed !== undefined ? m.completed : false,
          details: m.details || {},
          createdAt: m.createdAt ? new Date(m.createdAt) : null
        })) || [];
        
        // Pass location data and configurable parameters to the Python calculator
        // Get retirement contribution rate and growth rate from assumptions
        const retirementContributionRate = getAssumptionValue('general', 'retirement-contribution-rate', 0.05);
        const retirementGrowthRate = getAssumptionValue('general', 'retirement-growth-rate', 0.07);
        
        console.log("Using retirement assumptions:", { 
          contributionRate: retirementContributionRate,
          growthRate: retirementGrowthRate
        });
        
        const pythonInput = generatePythonCalculatorInput(
          age,
          years,
          startingSavings,
          income,
          incomeGrowth,
          studentLoanDebt,
          formattedMilestones,
          costOfLivingFactor,
          locationCostData, // Pass the location data directly
          emergencyFundAmount, // New parameter: fixed amount for emergency fund
          personalLoanTermYears, // New parameter: term length for personal loans
          personalLoanInterestRate, // New parameter: interest rate for personal loans
          retirementContributionRate, // New parameter: percentage of income to contribute to retirement
          retirementGrowthRate // New parameter: annual growth rate for retirement accounts
        );
        
        // Add the careers data to the calculator input for post-graduation occupation selection
        if (careers && careers.length > 0) {
          // Optimize by only sending essential career fields to reduce payload size
          pythonInput.careersData = careers.map((career: any) => ({
            id: career.id,
            title: career.title,
            median_salary: career.median_salary || 0,
            entry_salary: career.entry_salary || 0,
            experienced_salary: career.experienced_salary || 0
          }));
          console.log(`Added ${careers.length} careers to Python calculator input for milestone target occupations (optimized fields)`);
        }
        
        console.log("Sending data to Python calculator:", pythonInput);
        
        // Call the Python calculator and get the results
        const result = await calculateFinancialProjection(pythonInput);
        console.log("Received projection data from Python calculator:", result);
        
        // Add milestones to the projection data (with properly transformed years)
        const resultWithMilestones = {
          ...result,
          milestones: formattedMilestones.map(m => {
            // Create a standardized milestone object with all required fields
            const standardizedMilestone = {
              ...m,
              // Ensure yearsAway is a number relative to the start age
              yearsAway: m.yearsAway !== null ? m.yearsAway : 
                (new Date(m.date as string).getFullYear() - (new Date().getFullYear() - (age - 25))),
              // Add fields that TypeScript expects for all Milestone types
              workStatus: m.workStatus || "yes",
              partTimeIncome: m.partTimeIncome || 0,
              returnToSameProfession: m.returnToSameProfession || false,
              details: m.details || {},
              // Marriage-specific fields
              spouseOccupation: m.spouseOccupation || "",
              spouseIncome: m.spouseIncome || 0,
              spouseAssets: m.spouseAssets || 0,
              spouseLiabilities: m.spouseLiabilities || 0,
              // Education-specific fields
              educationCost: m.educationCost || 0,
              educationField: m.educationField || "",
              targetCareer: m.targetCareer || "",
              // Home-specific fields
              homeValue: m.homeValue || 0,
              homeDownPayment: m.homeDownPayment || 0,
              homeMonthlyPayment: m.homeMonthlyPayment || 0,
              // Car-specific fields
              carValue: m.carValue || 0,
              carDownPayment: m.carDownPayment || 0,
              carMonthlyPayment: m.carMonthlyPayment || 0,
              // Children-specific fields
              childrenCount: m.childrenCount || 0,
              childrenExpensePerYear: m.childrenExpensePerYear || 0
            };
            return standardizedMilestone;
          })
        };
        
        console.log("Adding milestones to projection data:", {
          milestonesCount: formattedMilestones.length,
          resultWithMilestones: resultWithMilestones
        });
        
        // Update the projection data state
        setProjectionData(resultWithMilestones);
      } catch (error) {
        console.error("Error calculating projections:", error);
        // Fall back to the JavaScript calculator on error
        console.log("Falling back to JavaScript calculator");
        setProjectionData(generateProjectionData(milestones));
      }
    };
    
    // Execute the async function
    updateProjectionData();
  }, [income, expenses, startingSavings, studentLoanDebt, milestones, timeframe, incomeGrowth, age, 
      spouseLoanTerm, spouseLoanRate, spouseAssetGrowth, costOfLivingFactor, years, locationCostData,
      emergencyFundAmount, personalLoanTermYears, personalLoanInterestRate, careers]); // Include all configurable parameters to ensure recalculation when any of them change
  
  // Generate financial advice based on current financial state
  useEffect(() => {
    // Create a financial state object based on current values
    const financialState: FinancialState = {
      income: income,
      expenses: expenses,
      savings: startingSavings,
      studentLoanDebt: studentLoanDebt,
      otherDebt: financialProfile?.otherDebtAmount || 0,
    };
    
    // Add home-related values if milestones include a home purchase
    const homeMilestone = milestones?.find(m => m.type === 'home');
    if (homeMilestone) {
      financialState.homeValue = homeMilestone.homeValue;
      financialState.homeDownPayment = homeMilestone.homeDownPayment;
      financialState.homeMonthlyPayment = homeMilestone.homeMonthlyPayment;
    }
    
    // Add car-related values if milestones include a car purchase
    const carMilestone = milestones?.find(m => m.type === 'car');
    if (carMilestone) {
      financialState.carValue = carMilestone.carValue;
      financialState.carDownPayment = carMilestone.carDownPayment;
      financialState.carMonthlyPayment = carMilestone.carMonthlyPayment;
    }
    
    // Generate financial advice
    const advice = generateFinancialAdvice(financialState);
    setFinancialAdvice(advice);
  }, [income, expenses, startingSavings, studentLoanDebt, financialProfile, milestones]);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createMainProjectionChart(ctx, projectionData, activeTab);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab, timeframe]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Financial Projections</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Projection Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Current Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <select 
                  id="timeframe"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option>5 Years</option>
                  <option>10 Years</option>
                  <option>20 Years</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="savings">Starting Savings ($)</Label>
                <Input 
                  id="savings" 
                  type="number" 
                  value={startingSavings} 
                  onChange={(e) => {
                    const newValue = Number(e.target.value);
                    setStartingSavings(newValue);
                    
                    // Update financial profile in database when savings amount changes
                    if (financialProfile?.id) {
                      updateFinancialProfileMutation.mutate({
                        savingsAmount: newValue
                      });
                    }
                  }} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="studentLoanDebt">Student Loan Debt ($)</Label>
                <Input 
                  id="studentLoanDebt" 
                  type="number" 
                  value={studentLoanDebt} 
                  onChange={(e) => setStudentLoanDebt(Number(e.target.value))} 
                  className="mt-1"
                />
                {includedCollegeCalc && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using student loan amount from {includedCollegeCalc.college?.name}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input 
                  id="income" 
                  type="number" 
                  value={income} 
                  onChange={(e) => setIncome(Number(e.target.value))} 
                  className="mt-1"
                />
                {includedCareerCalc && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using salary from {includedCareerCalc.career?.title} career
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="expenses">Annual Expenses ($)</Label>
                <Input 
                  id="expenses" 
                  type="number" 
                  value={expenses} 
                  onChange={(e) => setExpenses(Number(e.target.value))} 
                  className="mt-1"
                />
                {locationCostData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Adjusted for cost of living in {locationCostData.city || locationCostData.zip_code}
                  </p>
                )}
              </div>
              
              {/* Income Growth Rate moved to General Assumptions */}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-md font-semibold mb-2">Advanced Settings</h4>
                
                <div className="mb-3">
                  <Label>Emergency Fund Amount: {formatCurrency(emergencyFundAmount)}</Label>
                  <div className="flex space-x-2 items-center mt-2">
                    <Input
                      type="number"
                      value={emergencyFundAmount}
                      onChange={(e) => setEmergencyFundAmount(Number(e.target.value))}
                      min={1000}
                      step={1000}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Recommended: $10,000 minimum</p>
                </div>
                
                <div className="mb-3">
                  <Label>Personal Loan Term (Years): {personalLoanTermYears}</Label>
                  <Slider
                    value={[personalLoanTermYears]}
                    onValueChange={(value) => setPersonalLoanTermYears(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>Personal Loan Interest Rate: {personalLoanInterestRate}%</Label>
                  <Slider
                    value={[personalLoanInterestRate]}
                    onValueChange={(value) => setPersonalLoanInterestRate(value[0])}
                    min={3}
                    max={20}
                    step={0.5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Applied to negative cash flow scenarios</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Label htmlFor="projectionName">Projection Name</Label>
                  <Input
                    id="projectionName"
                    value={projectionName}
                    onChange={(e) => setProjectionName(e.target.value)}
                    placeholder="Enter a name for this projection"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6"
              onClick={async () => {
                try {
                  // Adjust income based on location, but we don't need to adjust expenses again
                  // since they're already adjusted in the UI as part of the expenses state
                  const adjustedIncome = income * (locationCostData?.income_adjustment_factor || 1.0);
                  const adjustedExpenses = expenses; // expenses is already adjusted via useEffect
                     
                  const response = await fetch('/api/financial-projections', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      userId,
                      name: projectionName, // Changed from projectionName to name to match schema
                      timeframe: years,
                      startingAge: age,
                      startingSavings,
                      income: Math.round(adjustedIncome),
                      expenses: Math.round(adjustedExpenses),
                      incomeGrowth,
                      studentLoanDebt,
                      projectionData: JSON.stringify(projectionData),
                      includesCollegeCalculation: !!includedCollegeCalc,
                      includesCareerCalculation: !!includedCareerCalc,
                      collegeCalculationId: includedCollegeCalc?.id || null,
                      careerCalculationId: includedCareerCalc?.id || null,
                      locationAdjusted: !!locationCostData,
                      locationZipCode: userData?.zipCode || null,
                      costOfLivingIndex: locationCostData ? 
                        locationCostData.income_adjustment_factor || 1.0 : null,
                      incomeAdjustmentFactor: locationCostData?.income_adjustment_factor || null,
                      // Save the configurable parameters
                      emergencyFundAmount: emergencyFundAmount,
                      personalLoanTermYears: personalLoanTermYears,
                      personalLoanInterestRate: personalLoanInterestRate,
                    }),
                  });
                  
                  if (response.ok) {
                    alert('Projection saved successfully!');
                    // Invalidate the financial projections query to refresh the list
                    queryClient.invalidateQueries({ queryKey: ['/api/financial-projections', userId] });
                  } else {
                    throw new Error('Failed to save projection');
                  }
                } catch (error) {
                  console.error('Error saving projection:', error);
                  alert('Failed to save projection. Please try again.');
                }
              }}
            >
              Save Projection
            </Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-wrap mb-4">
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('netWorth')}
              >
                Net Worth
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('income')}
              >
                Income
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'expenses' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'assets' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Assets
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'liabilities' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'cashFlow' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('cashFlow')}
              >
                Cash Flow
              </button>
            </div>
            
            <div className="h-96">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Net Worth at {projectionData?.ages?.length > 0 ? projectionData.ages[projectionData.ages.length - 1] : age}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-2xl font-mono font-medium text-gray-800 cursor-help">
                        ${projectionData?.netWorth?.length > 0 ? projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString() : startingSavings.toLocaleString()}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Includes all assets (like home and car value) minus all liabilities (like mortgages and loans).</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Total Savings & Investments</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-2xl font-mono font-medium text-gray-800 cursor-help">
                        ${projectionData?.savingsValue?.length > 0 
                          ? projectionData.savingsValue[projectionData.savingsValue.length - 1].toLocaleString() 
                          : startingSavings.toLocaleString()}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Represents only liquid savings and investments. Does not include the value of physical assets like homes and cars.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Annual Savings Rate</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-2xl font-mono font-medium text-gray-800 cursor-help">
                        {projectionData?.income?.length > 0 && projectionData?.expenses?.length > 0 ? 
                          Math.round((projectionData.income[0] - projectionData.expenses[0]) / projectionData.income[0] * 100) : 
                          Math.round((income - expenses) / income * 100)}%
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Percentage of income saved each year. Higher rates lead to faster wealth accumulation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Card to display location-based cost of living or 'Add Location' card if no data */}
      {locationCostData ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Location Cost of Living</h3>
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {locationCostData.city || 'Your Location'}, {locationCostData.state} ({userData?.zipCode})
                </div>
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your financial projections are adjusted based on the cost of living in your location. 
              {locationCostData.income_adjustment_factor > 1 
                ? ` This area has a ${((locationCostData.income_adjustment_factor - 1) * 100).toFixed(0)}% higher cost of living than the national average.`
                : ` This area has a ${((1 - locationCostData.income_adjustment_factor) * 100).toFixed(0)}% lower cost of living than the national average.`
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Income Adjustment</p>
                <p className="text-2xl font-medium text-primary">
                  {(locationCostData.income_adjustment_factor * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {locationCostData.income_adjustment_factor > 1 ? 'Higher' : 'Lower'} than average
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Housing Cost</p>
                <p className="text-2xl font-medium text-primary">
                  ${(locationCostData.housing || 0).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Monthly cost
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-500 uppercase">Total Monthly Cost</p>
                <p className="text-2xl font-medium text-primary">
                  ${((locationCostData.housing || 0) + 
                    (locationCostData.food || 0) + 
                    (locationCostData.transportation || 0) + 
                    (locationCostData.healthcare || 0) + 
                    (locationCostData.personal_insurance || 0) + 
                    (locationCostData.entertainment || 0) +
                    (locationCostData.services || 0)).toFixed(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sum of all expense categories
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Detailed Cost Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Housing</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.housing || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.housing || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Food</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.food || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.food || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Transportation</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.transportation || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.transportation || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Healthcare</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.healthcare || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.healthcare || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Insurance</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.personal_insurance || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.personal_insurance || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Entertainment</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.entertainment || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.entertainment || 0).toFixed(0)}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Services</p>
                  <div className="flex items-center mt-1">
                    <div className="h-2 bg-blue-100 rounded-full w-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${Math.min((locationCostData.services || 0) / 25, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs ml-2">${(locationCostData.services || 0).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Impact on your finances:</span> In {locationCostData.city || 'your location'}, 
                {(locationCostData.income_adjustment_factor || 0) >= 1 
                  ? ` salaries tend to be higher to compensate for the increased cost of living.`
                  : ` your expenses will be lower, but salaries may also be lower than in more expensive areas.`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Location Cost of Living</h3>
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mr-2">
                  {userData?.zipCode || "No location set"}
                </div>
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
            
            <div className="py-8 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No location data available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {userData?.zipCode 
                  ? `We don't have cost of living data for your current zip code (${userData.zipCode}).
                    Try changing to 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San Francisco), or 30328 (Atlanta) to see data.`
                  : "Set your location to adjust financial projections based on cost of living."}
              </p>
              <div className="mt-6">
                <UpdateLocationDialog userData={userData} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Location Adjustment Info */}
      {projectionData?.location && (
        <Card className="mb-6">
          <Collapsible open={locationSectionOpen} onOpenChange={setLocationSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Location Impact Details</h3>
              {locationSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <LocationAdjustmentInfo projectionData={projectionData} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
      
      {/* Expense Breakdown Chart */}
      {projectionData?.currentExpenses && (
        <Card className="mb-6">
          <Collapsible open={expenseSectionOpen} onOpenChange={setExpenseSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Expense Breakdown</h3>
              {expenseSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <ExpenseBreakdownChart currentExpenses={projectionData.currentExpenses} />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Understanding your expenses:</span> This breakdown shows where your 
                    money is going. Housing (30%), transportation (15%), food (15%), healthcare (10%), taxes (typically 15-25%), 
                    and discretionary spending (30%) form your basic expenses, with additional categories for education, debt, and 
                    childcare when applicable.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Retirement Growth Rate Widget */}
      <RetirementGrowthWidget />
      
      {/* Asset Breakdown Chart */}
      {projectionData?.assets && projectionData?.savingsValue && (
        <Card className="mb-6">
          <Collapsible open={assetSectionOpen} onOpenChange={setAssetSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Asset Breakdown</h3>
              {assetSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <EnhancedAssetBreakdownChart 
                  assetData={{
                    savings: projectionData.savingsValue[0] || 0,
                    retirement: projectionData.retirementContribution ? projectionData.retirementContribution[0] || 0 : 0,
                    homeValue: projectionData.homeValue[0] || 0,
                    carValue: projectionData.carValue[0] || 0,
                    otherAssets: 0, // Set to 0 for now, may customize in the future
                  }}
                  projectionData={{
                    ages: projectionData.ages,
                    retirementContribution: projectionData.retirementContribution
                  }}
                />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Understanding your assets:</span> This breakdown shows where your 
                    wealth is currently allocated. Having a diverse mix of assets (savings, retirement accounts, property, etc.) 
                    helps create a strong financial foundation and reduces risk through diversification.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Debt Breakdown by Loan Type */}
      {projectionData?.debt && (
        <Card className="mb-6">
          <Collapsible open={debtSectionOpen} onOpenChange={setDebtSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Debt Breakdown</h3>
              {debtSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <DebtBreakdownComponent projectionData={projectionData} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Tax Breakdown Chart */}
      {projectionData?.payrollTax && projectionData?.federalTax && projectionData?.stateTax && (
        <Card className="mb-6">
          <Collapsible open={taxSectionOpen} onOpenChange={setTaxSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Tax Breakdown</h3>
              {taxSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <TaxBreakdownChart projectionData={projectionData} isLoading={isLoading} />
                
                {/* Add tabular view for detailed tax data */}
                <div className="mt-6">
                  <TaxBreakdownTable projectionData={projectionData} isLoading={isLoading} />
                </div>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Understanding your taxes:</span> This breakdown shows the different types of taxes 
                    you'll pay based on your income projections. This includes federal income tax, state income tax, and payroll taxes 
                    (Social Security and Medicare). Your effective tax rate represents the percentage of your total income paid in taxes.
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
      
      {/* Detailed Cash Flow Table with collapsible container */}
      {/* Apply the fixLiabilityCalculation function to ensure graduate school loans are properly counted */}
      <CashFlowTable 
        {...fixLiabilityCalculation(projectionData)}
        ages={projectionData.ages}
        income={projectionData.income}
        spouseIncome={projectionData.spouseIncome}
        expenses={projectionData.expenses}
        housingExpenses={projectionData.housing}
        transportationExpenses={projectionData.transportation}
        foodExpenses={projectionData.food}
        healthcareExpenses={projectionData.healthcare}
        personalInsuranceExpenses={projectionData.personalInsurance}
        apparelExpenses={projectionData.apparel}
        servicesExpenses={projectionData.services}
        entertainmentExpenses={projectionData.entertainment}
        otherExpenses={projectionData.other}
        educationExpenses={projectionData.education}
        childcareExpenses={projectionData.childcare} 
        debtExpenses={projectionData.debt}
        discretionaryExpenses={projectionData.discretionary}
      />
      
      {/* Card to display included college and career calculations */}
      <Card className="mb-6">
        <Collapsible open={calculationsSectionOpen} onOpenChange={setCalculationsSectionOpen}>
          <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
            <h3 className="text-lg font-medium">Included Calculations</h3>
            {calculationsSectionOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-6 pt-0">
              <p className="text-gray-600 mb-4">
                These saved calculations are factored into your financial projections.
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 ml-1">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Your age is derived from birth year, student debt comes from college calculations, 
                        and starting income uses your career's entry-level salary.
                        {locationCostData && " Income and expenses are adjusted based on your location's cost of living."}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
              
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* College calculation section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <School className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">College</h4>
                    </div>
                    
                    {includedCollegeCalc ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">College:</span>
                          <span className="font-medium">{includedCollegeCalc.college?.name || "Unknown College"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Student Loan Amount:</span>
                          <span className="font-medium">{formatCurrency(includedCollegeCalc.studentLoanAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Cost:</span>
                          <span className="font-medium">{formatCurrency(includedCollegeCalc.netPrice)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-gray-400">No college calculation included</span>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => window.location.href = "/net-price-calculator"}>
                            Add College Cost
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Career calculation section */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">Career</h4>
                    </div>
                    
                    {includedCareerCalc ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Career:</span>
                          <span className="font-medium">{includedCareerCalc.career?.title || "Unknown Career"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Starting Salary:</span>
                          <span className="font-medium">
                            {formatCurrency(includedCareerCalc.entryLevelSalary || includedCareerCalc.projectedSalary)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Education:</span>
                          <span className="font-medium">{includedCareerCalc.education || "Not specified"}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-gray-400">No career calculation included</span>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={() => window.location.href = "/career-builder"}>
                            Add Career
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Financial Advice Section */}
      {financialAdvice.length > 0 && (
        <Card className="mb-6">
          <Collapsible open={adviceSectionOpen} onOpenChange={setAdviceSectionOpen}>
            <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
              <h3 className="text-lg font-medium">Financial Recommendations</h3>
              {adviceSectionOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6 pt-0">
                <AdvicePanel 
                  advice={financialAdvice} 
                  title="" 
                  showCount={true} 
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
      
      {/* Life Milestones Section */}
      <MilestonesSection 
        userId={userId} 
        onMilestoneChange={() => {
          console.log("Milestone changed, recalculating projections...");
          
          // Force a re-fetch of milestone data with a higher priority
          queryClient.invalidateQueries({ 
            queryKey: ['/api/milestones/user', userId],
            // This will cause the query to refetch immediately and update the UI
            refetchType: 'active',
          });
          
          // No need for the workaround with the income change - the refetchOnWindowFocus
          // setting we added previously, combined with the invalidation above, ensures
          // the data will refresh properly
        }} 
      />
    </div>
  );
};

// UpdateLocationDialog component for changing the zip code
interface UpdateLocationDialogProps {
  userData: User | undefined;
}

const UpdateLocationDialog = ({ userData }: UpdateLocationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newZipCode, setNewZipCode] = useState(userData?.zipCode || '');
  const queryClient = useQueryClient(); // For cache invalidation

  const updateZipCodeMutation = useMutation({
    mutationFn: async (zipCode: string) => {
      const response = await fetch(`/api/users/${userData?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipCode
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries that depend on the user data or location data
      queryClient.invalidateQueries({ queryKey: ['/api/users', userData?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/location-cost-of-living/zip', newZipCode] });
      setOpen(false);
    }
  });

  const handleUpdateLocation = () => {
    if (newZipCode && newZipCode.length === 5 && /^\d+$/.test(newZipCode)) {
      updateZipCodeMutation.mutate(newZipCode);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7">
          Change
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Location</DialogTitle>
          <DialogDescription>
            Change your location to recalculate financial projections based on the new cost of living.
            This change will be applied across all parts of the application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              placeholder="Enter zip code"
              value={newZipCode}
              onChange={(e) => setNewZipCode(e.target.value)}
              maxLength={5}
              pattern="[0-9]{5}"
            />
            <p className="text-xs text-gray-500">
              Enter a valid US 5-digit zip code. Try 90210 (Beverly Hills), 02142 (Cambridge), 94103 (San Francisco), or 30328 (Atlanta) for example data.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleUpdateLocation}
            disabled={updateZipCodeMutation.isPending || !newZipCode || newZipCode.length !== 5 || !/^\d+$/.test(newZipCode)}
          >
            {updateZipCodeMutation.isPending ? "Updating..." : "Update Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialProjections;
