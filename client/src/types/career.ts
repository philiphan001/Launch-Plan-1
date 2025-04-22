export interface Career {
  id: number;
  title: string;
  description: string;
  category: string;
  education: string;
  salary: number;
  salary_median: number;
  salary_pct_10: number;
  salary_pct_25: number;
  salary_pct_75: number;
  salary_pct_90: number;
  growth_rate: number;
  alias1?: string;
  alias2?: string;
  alias3?: string;
  alias4?: string;
  alias5?: string;
  skills?: string[];
  certifications?: string[];
  experience?: string;
  workEnvironmentDetails?: string;
  workScheduleDetails?: string;
  physicalDemandsDetails?: string;
  travelDetails?: string;
  stressLevelDetails?: string;
  jobOutlookDetails?: string;
  relatedCareersList?: string[];
  industriesList?: string[];
  locationsList?: string[];
  hasRemoteWork?: boolean;
  benefitsList?: string[];
  challengesList?: string[];
  advancementDetails?: string;
  workLifeBalanceDetails?: string;
  satisfactionScore?: number;
  demandDetails?: string;
  competitionDetails?: string;
  entryLevel?: {
    education: string;
    experience: string;
    salary: number;
  };
  midLevel?: {
    education: string;
    experience: string;
    salary: number;
  };
  seniorLevel?: {
    education: string;
    experience: string;
    salary: number;
  };
  requiredSkills?: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  recommendedSkills?: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  workEnvironmentOptions?: {
    indoor: boolean;
    outdoor: boolean;
    office: boolean;
    remote: boolean;
    travel: boolean;
    hazardous: boolean;
  };
  workScheduleOptions?: {
    fullTime: boolean;
    partTime: boolean;
    flexible: boolean;
    shift: boolean;
    onCall: boolean;
  };
  physicalDemandsOptions?: {
    standing: boolean;
    sitting: boolean;
    lifting: boolean;
    walking: boolean;
    climbing: boolean;
  };
  travelOptions?: {
    local: boolean;
    national: boolean;
    international: boolean;
    frequency: string;
  };
  stressLevelOptions?: {
    low: boolean;
    medium: boolean;
    high: boolean;
    factors: string[];
  };
  jobOutlookOptions?: {
    growth: string;
    stability: string;
    demand: string;
    competition: string;
  };
  relatedCareersOptions?: {
    title: string;
    similarity: number;
  }[];
  industriesOptions?: {
    name: string;
    percentage: number;
  }[];
  locationsOptions?: {
    city: string;
    state: string;
    demand: string;
    salary: number;
  }[];
  remoteWorkOptions?: {
    available: boolean;
    percentage: number;
    requirements: string[];
  };
  benefitsOptions?: {
    health: boolean;
    dental: boolean;
    vision: boolean;
    retirement: boolean;
    vacation: boolean;
    sick: boolean;
    education: boolean;
  };
  challengesOptions?: {
    technical: string[];
    personal: string[];
    professional: string[];
  };
  advancementOptions?: {
    paths: string[];
    requirements: string[];
    timeline: string;
  };
  workLifeBalanceOptions?: {
    rating: number;
    factors: string[];
  };
  satisfactionOptions?: {
    overall: number;
    factors: string[];
  };
  demandOptions?: {
    current: string;
    future: string;
    factors: string[];
  };
  competitionOptions?: {
    level: string;
    factors: string[];
  };
}

export interface FavoriteCareer {
  id: number;
  userId: number;
  careerId: number;
  career: Career;
  createdAt: string;
}

export interface CareerSearchFilters {
  query?: string;
  education?: string;
  category?: string;
  minSalary?: number;
  maxSalary?: number;
  growthRate?: number;
  jobType?: 'fulltime' | 'parttime';
  fieldOfStudy?: string;
  globalSearch?: boolean;
} 