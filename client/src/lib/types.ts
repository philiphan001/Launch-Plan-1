// Financial data types
export interface NetWorthData {
  age: number;
  netWorth: number;
}

export interface CashFlowData {
  age: number;
  income: number;
  expenses: number;
}

export interface ProjectionData {
  netWorth: number[];
  income?: number[];
  spouseIncome?: number[];
  expenses?: number[];
  assets?: number[];
  liabilities?: number[];
  // Detailed property breakdown
  homeValue?: number[];
  mortgage?: number[];
  carValue?: number[];
  carLoan?: number[];
  studentLoan?: number[];
  educationLoans?: number[]; // Undergraduate education loans
  graduateSchoolLoans?: number[]; // Graduate school loans
  personalLoans?: number[]; // Personal loans
  savingsValue?: number[];
  // Expense categories
  housing?: number[];
  transportation?: number[];
  food?: number[];
  healthcare?: number[];
  education?: number[];
  debt?: number[];
  childcare?: number[];
  discretionary?: number[];
  personalInsurance?: number[];
  apparel?: number[];
  services?: number[];
  entertainment?: number[];
  other?: number[];
  // Tax breakdowns
  payrollTax?: number[];
  federalTax?: number[];
  stateTax?: number[];
  taxes?: number[];  // Combined tax expenses for visualization
  retirementContribution?: number[];
  effectiveTaxRate?: number[];
  marginalTaxRate?: number[];
  ages: number[];
  
  // Allow indexing with string keys
  [key: string]: any;
}

// Milestone types
export type MilestoneType = "marriage" | "children" | "home" | "car" | "education" | "school" | "work" | "other";

export interface Milestone {
  id: string | number;
  type: MilestoneType | string;
  title: string;
  date?: string;
  yearsAway?: number;
  color?: string;
  financialImpact?: number;
  // Marriage-specific properties
  spouseOccupation?: string;
  spouseIncome?: number;
  spouseAssets?: number;
  spouseLiabilities?: number;
  // Home-specific properties
  homeValue?: number;
  homeDownPayment?: number;
  homeMonthlyPayment?: number;
  // Car-specific properties
  carValue?: number;
  carDownPayment?: number;
  carMonthlyPayment?: number;
  // Children-specific properties
  childrenCount?: number;
  childrenExpensePerYear?: number;
  // Education-specific properties
  educationCost?: number;
  educationType?: string; // Type of education (undergraduate, graduate, etc.)
  educationYears?: number; // Duration of education in years
  educationAnnualCost?: number; // Annual cost of education
  educationAnnualLoan?: number; // Annual loan amount for education
  targetOccupation?: string; // Target occupation after education
  // Status properties
  active?: boolean;
  completed?: boolean;
  details?: Record<string, any>;
  createdAt?: string | null;
}

// Career related types
export type GrowthRate = "fast" | "stable" | "slow";

export interface Career {
  id: string;
  title: string;
  salary: number;
  description: string;
  growthRate: GrowthRate;
  education: string;
  category?: string;
}

// College related types
export type CollegeSize = "small" | "medium" | "large";
export type CollegeType = "Public Research" | "Private Research" | "Public Liberal Arts" | "Private Liberal Arts" | "Community College" | "For-Profit";

export interface College {
  id: number;
  name: string;
  location: string | null;
  state: string | null;
  type: string | null;
  tuition: number | null;
  roomAndBoard: number | null;
  acceptanceRate: number | null;
  rating: number | null;
  size: string | null;
  rank: number | null;
  feesByIncome: string | null | {
    [key: string]: number;
  };
  usNewsTop150: number | null;
  bestLiberalArtsColleges: number | null;
  degreesAwardedPredominant: number | null;
  degreesAwardedHighest: number | null;
  admissionRateOverall: number | null;
  satScoresAverageOverall: number | null;
  pellGrantRate: number | null;
  completionRate4yr150nt: number | null;
  medianDebtCompletersOverall: number | null;
  medianDebtNoncompleters: number | null;
  demographicsMedianFamilyIncome: number | null;
  medianEarnings10yrsAfterEntry: number | null;
}

// Pathway related types
export type PathChoice = "education" | "job" | "military" | "gap";
export type EducationType = "4year" | "2year" | "vocational" | null;
export type JobType = "fulltime" | "parttime" | "apprenticeship" | null;
export type MilitaryBranch = "army" | "navy" | "airforce" | "marines" | "coastguard" | "spaceguard" | null;
export type GapYearActivity = "travel" | "volunteer" | "work" | "other" | null;

export interface PathwayPlan {
  id: string;
  name: string;
  path: PathChoice;
  subPath?: EducationType | JobType | MilitaryBranch | GapYearActivity;
  financialImpact: {
    initialInvestment: number;
    tenYearEarnings: number;
    netWorthAtThirty: number;
  };
}

// User profile types
export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  zipCode: string;
  financialProfile: FinancialProfile;
  favoriteColleges: College[];
  favoriteCareers: Career[];
  savedProjections: SavedProjection[];
  notificationPreferences: NotificationPreferences;
}

export interface FinancialProfile {
  householdIncome: number;
  householdSize: number;
  savingsAmount: number;
  studentLoanAmount: number;
  otherDebtAmount: number;
}

export interface SavedProjection {
  id: string;
  name: string;
  createdAt: string;
  projectionData: ProjectionData;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  financialAlerts: boolean;
  careerUpdates: boolean;
  scholarshipAlerts: boolean;
  dataCollection: boolean;
  shareAnonymousData: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
