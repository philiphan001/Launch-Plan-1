export type PathType = 'education' | 'career' | 'lifestyle';

export interface CardDetail {
  title: string;
  category: string;
  emoji: string;
}

export interface GameResults {
  quickSpin?: {
    superpower: string[];
    idealDay: string[];
    values: string[];
    activities: string[];
    feelings: string[];
    location: string[];
    team_role: string[];
    wildcard: string[];
  };
  swipeCards?: Record<string, boolean>;
  identityWheel?: {
    interests: string[];
    skills: string[];
    values: string[];
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  match: string;
}

export interface RecommendationSet {
  education: Recommendation[];
  career: Recommendation[];
  lifestyle: Recommendation[];
}

export interface PreferenceGroup {
  liked: Array<{ title: string; emoji: string; liked: boolean }>;
  notInterested: Array<{ title: string; emoji: string; liked: boolean }>;
} 