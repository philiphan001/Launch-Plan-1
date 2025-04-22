export interface AvatarAttributes {
  style: string;
  hairColor: string;
  hairStyle: string;
  outfit: string;
  accessory: string;
  location: string;
  occupation: string;
  personality: string;
  values: string;
  lifestyle: string;
}

export interface WorkLifeBalance {
  workLifeBalance: number;
  riskTolerance: number;
  teamPreference: number;
}

export interface Reflections {
  workAttire: string;
  livingLocation: string;
  weekendActivity: string;
  dailyRoutine: string;
  biggestAspiration: string;
}

export const defaultAttributes: AvatarAttributes = {
  style: 'anime',
  hairColor: 'black',
  hairStyle: 'spiky',
  outfit: 'schoolUniform',
  accessory: 'headphones',
  location: 'city',
  occupation: 'tech',
  personality: 'creative',
  values: 'family',
  lifestyle: 'balanced'
};

export const defaultWorkLifeBalance: WorkLifeBalance = {
  workLifeBalance: 50,
  riskTolerance: 50,
  teamPreference: 50
};

export const defaultReflections: Reflections = {
  workAttire: '',
  livingLocation: '',
  weekendActivity: '',
  dailyRoutine: '',
  biggestAspiration: ''
};

export const avatarStyles = [
  { id: 'anime', label: 'Anime' },
  { id: 'realistic', label: 'Realistic' },
  { id: 'cartoon', label: 'Cartoon' }
];

export const hairColors = [
  { id: 'black', label: 'Black' },
  { id: 'brown', label: 'Brown' },
  { id: 'blonde', label: 'Blonde' },
  { id: 'red', label: 'Red' },
  { id: 'blue', label: 'Blue' }
];

export const hairStyles = [
  { id: 'spiky', label: 'Spiky' },
  { id: 'straight', label: 'Straight' },
  { id: 'curly', label: 'Curly' },
  { id: 'wavy', label: 'Wavy' },
  { id: 'short', label: 'Short' }
];

export const outfits = [
  { id: 'schoolUniform', label: 'School Uniform' },
  { id: 'casual', label: 'Casual' },
  { id: 'business', label: 'Business' },
  { id: 'sporty', label: 'Sporty' },
  { id: 'creative', label: 'Creative' }
];

export const accessories = [
  { id: 'headphones', label: 'Headphones' },
  { id: 'glasses', label: 'Glasses' },
  { id: 'hat', label: 'Hat' },
  { id: 'watch', label: 'Watch' },
  { id: 'none', label: 'None' }
];

export const locations = [
  { id: 'city', label: 'City' },
  { id: 'suburb', label: 'Suburb' },
  { id: 'rural', label: 'Rural' },
  { id: 'beach', label: 'Beach' },
  { id: 'mountains', label: 'Mountains' }
];

export const occupations = [
  { id: 'tech', label: 'Technology' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'education', label: 'Education' },
  { id: 'business', label: 'Business' },
  { id: 'arts', label: 'Arts & Design' }
];

export const personalities = [
  { id: 'creative', label: 'Creative' },
  { id: 'analytical', label: 'Analytical' },
  { id: 'social', label: 'Social' },
  { id: 'organized', label: 'Organized' },
  { id: 'adventurous', label: 'Adventurous' }
];

export const values = [
  { id: 'family', label: 'Family' },
  { id: 'career', label: 'Career' },
  { id: 'health', label: 'Health' },
  { id: 'learning', label: 'Learning' },
  { id: 'community', label: 'Community' }
];

export const lifestyles = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'active', label: 'Active' },
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'busy', label: 'Busy' },
  { id: 'minimal', label: 'Minimal' }
]; 