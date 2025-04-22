export type WheelPromptCategory = 'superpower' | 'idealDay' | 'values' | 'likedActivities' | 'futureFeeling' | 'dreamLocation' | 'teamRole' | 'careerVibes' | 'timeCapsule' | 'wildcard';

export interface PromptOption {
  id: string;
  text: string;
}

export interface WheelPrompt {
  id: string;
  question: string;
  category: WheelPromptCategory;
  options: PromptOption[];
  isCustomInput?: boolean;
}

export const wheelCategories = [
  'Superpower', 'Ideal Day', 'Values', 'Liked Activities', 'Future Feeling', 
  'Dream Location', 'Team Role', 'Career Vibes', 'Time Capsule', 'Wildcard'
];

export const prompts: WheelPrompt[] = [
  {
    id: 'superpower',
    question: "What's something people come to you for help with?",
    category: 'superpower',
    options: [
      { id: 'listening', text: 'Listening and giving advice' },
      { id: 'solving', text: 'Solving problems' },
      { id: 'fixing', text: 'Fixing or building things' },
      { id: 'leading', text: 'Leading and organizing' },
      { id: 'humor', text: 'Making people laugh' },
    ]
  },
  {
    id: 'idealDay_setting',
    question: "In your perfect day, what's the setting?",
    category: 'idealDay',
    options: [
      { id: 'beach', text: 'Beach or tropical location' },
      { id: 'mountains', text: 'Mountains or forest' },
      { id: 'city', text: 'Busy city' },
      { id: 'home', text: 'Cozy home' },
      { id: 'travel', text: 'Traveling somewhere new' },
    ]
  },
  {
    id: 'idealDay_people',
    question: "Who would be with you in your perfect day?",
    category: 'idealDay',
    options: [
      { id: 'family', text: 'Family' },
      { id: 'friends', text: 'Close friends' },
      { id: 'partner', text: 'Romantic partner' },
      { id: 'alone', text: 'Enjoying time alone' },
      { id: 'new_people', text: 'Meeting new people' },
    ]
  },
  {
    id: 'idealDay_activities',
    question: "What would you be doing on your perfect day?",
    category: 'idealDay',
    options: [
      { id: 'relaxing', text: 'Relaxing and recharging' },
      { id: 'adventure', text: 'Having an adventure' },
      { id: 'creating', text: 'Creating or building something' },
      { id: 'learning', text: 'Learning something new' },
      { id: 'celebrating', text: 'Celebrating something special' },
    ]
  },
  {
    id: 'values',
    question: "Pick the 2 most important things to you right now.",
    category: 'values',
    options: [
      { id: 'security', text: 'Security and stability' },
      { id: 'adventure', text: 'Adventure and experiences' },
      { id: 'relationships', text: 'Relationships with others' },
      { id: 'independence', text: 'Independence and freedom' },
      { id: 'money', text: 'Financial success' },
      { id: 'impact', text: 'Making a positive impact' },
    ]
  },
  {
    id: 'likedActivities',
    question: "Which do you enjoy more?",
    category: 'likedActivities',
    options: [
      { id: 'building', text: 'Building or creating things' },
      { id: 'performing', text: 'Performing or entertaining' },
      { id: 'helping', text: 'Helping or teaching others' },
      { id: 'researching', text: 'Researching and learning' },
      { id: 'organizing', text: 'Organizing and planning' },
    ]
  },
  {
    id: 'futureFeeling',
    question: "When I think about life after high school, I feel...",
    category: 'futureFeeling',
    options: [
      { id: 'excited', text: 'Excited for new opportunities' },
      { id: 'nervous', text: 'Nervous about the unknown' },
      { id: 'lost', text: 'A bit lost or uncertain' },
      { id: 'determined', text: 'Determined to succeed' },
      { id: 'curious', text: 'Curious about what\'s possible' },
    ]
  },
  {
    id: 'dreamLocation',
    question: "Where would you love to live someday?",
    category: 'dreamLocation',
    options: [
      { id: 'rural', text: 'Rural countryside' },
      { id: 'urban', text: 'Urban city center' },
      { id: 'near_family', text: 'Near family and friends' },
      { id: 'new_country', text: 'A different country' },
      { id: 'coast', text: 'By the ocean' },
      { id: 'nature', text: 'Surrounded by nature' },
    ]
  },
  {
    id: 'teamRole',
    question: "In a group, I'm usually the...",
    category: 'teamRole',
    options: [
      { id: 'leader', text: 'Leader who takes charge' },
      { id: 'organizer', text: 'Organizer who manages details' },
      { id: 'ideas', text: 'Ideas person with creative solutions' },
      { id: 'helper', text: 'Helper who supports others' },
      { id: 'observer', text: 'Quiet observer who thinks deeply' },
    ]
  },
  {
    id: 'careerVibes',
    question: "Which of these sounds most fun?",
    category: 'careerVibes',
    options: [
      { id: 'fixing', text: 'Fixing a car or building something' },
      { id: 'teaching', text: 'Teaching a class or mentoring' },
      { id: 'business', text: 'Starting a business' },
      { id: 'coding', text: 'Coding an app or website' },
      { id: 'caring', text: 'Caring for someone who needs help' },
      { id: 'designing', text: 'Designing or creating art' },
    ]
  },
  {
    id: 'timeCapsule',
    question: "Write a 3-word message to your future self.",
    category: 'timeCapsule',
    isCustomInput: true,
    options: []
  },
  {
    id: 'wildcard',
    question: "If your life were a movie, what would be the title?",
    category: 'wildcard',
    isCustomInput: true,
    options: []
  },
]; 