export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'innovation',
    title: 'Innovation & New Ideas',
    description: 'Being the one who comes up with the next big thing that changes everything',
    category: 'Creativity',
    emoji: '💡',
  },
  {
    id: 'problem_solving',
    title: 'Problem Solving',
    description: 'Cracking the code when everyone else is stuck — like being a detective!',
    category: 'Analysis',
    emoji: '🔍',
  },
  {
    id: 'working_with_people',
    title: 'Working With People',
    description: 'Being the glue that brings people together and makes magic happen',
    category: 'Social',
    emoji: '🤝',
  },
  {
    id: 'numbers_data',
    title: 'Numbers & Data',
    description: 'Finding the patterns in the chaos and making sense of it all',
    category: 'Analysis',
    emoji: '📊',
  },
  {
    id: 'building_creating',
    title: 'Building & Creating',
    description: 'Making something real that people can actually touch, use, and love',
    category: 'Practical',
    emoji: '🛠️',
  },
  {
    id: 'helping_others',
    title: 'Helping Others',
    description: 'Being the person others turn to when they need support or guidance',
    category: 'Social',
    emoji: '🙌',
  },
  {
    id: 'strategic_thinking',
    title: 'Strategic Thinking',
    description: 'Seeing three steps ahead like a chess master planning the perfect move',
    category: 'Analysis',
    emoji: '♟️',
  },
  {
    id: 'outdoor_work',
    title: 'Working Outdoors',
    description: 'Trading office walls for open skies and connecting with nature daily',
    category: 'Practical',
    emoji: '🌲',
  },
  {
    id: 'team_collaboration',
    title: 'Team Collaboration',
    description: 'Creating something incredible together that no one could do alone',
    category: 'Social',
    emoji: '🏆',
  },
  {
    id: 'technical_skills',
    title: 'Technical Skills',
    description: 'Mastering complex tools and tech that most people don\'t understand',
    category: 'Practical',
    emoji: '⚙️',
  }
];

export const getCategoryGradient = (category: string) => {
  switch(category) {
    case 'Creativity': return 'from-purple-500 to-pink-500';
    case 'Analysis': return 'from-blue-500 to-cyan-500';
    case 'Social': return 'from-green-500 to-teal-500';
    case 'Practical': return 'from-amber-500 to-orange-500';
    default: return 'from-violet-500 to-fuchsia-500';
  }
}; 