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
  ages: number[];
}

// Milestone types
export type MilestoneType = "school" | "work" | "home" | "other";

export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  date: string;
  yearsAway: number;
  color?: string;
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
  id: string;
  name: string;
  rating: number;
  location: string;
  state: string;
  type: string;
  tuition: number;
  acceptanceRate: number;
  isInState?: boolean;
  rank?: number;
  size: CollegeSize;
  roomAndBoard?: number;
  feesByIncome?: {
    [key: string]: number;
  };
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
