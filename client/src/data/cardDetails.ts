import { CardDetail } from '@/types/recommendation';

// Map card IDs to their display names and categories
export const cardDetails: Record<string, CardDetail> = {
  'innovation': { title: 'Innovation & New Ideas', category: 'Creativity', emoji: '💡' },
  'problem_solving': { title: 'Problem Solving', category: 'Analysis', emoji: '🔍' },
  'working_with_people': { title: 'Working With People', category: 'Social', emoji: '🤝' },
  'numbers_data': { title: 'Numbers & Data', category: 'Analysis', emoji: '📊' },
  'building_creating': { title: 'Building & Creating', category: 'Practical', emoji: '🛠️' },
  'helping_others': { title: 'Helping Others', category: 'Social', emoji: '🙌' },
  'strategic_thinking': { title: 'Strategic Thinking', category: 'Analysis', emoji: '♟️' },
  'outdoor_work': { title: 'Working Outdoors', category: 'Practical', emoji: '🌲' },
  'team_collaboration': { title: 'Team Collaboration', category: 'Social', emoji: '🏆' },
  'technical_skills': { title: 'Technical Skills', category: 'Practical', emoji: '⚙️' },
  'artistic_expression': { title: 'Artistic Expression', category: 'Creativity', emoji: '🎨' },
  'entrepreneurship': { title: 'Entrepreneurship', category: 'Business', emoji: '🚀' },
  'research': { title: 'Research', category: 'Analysis', emoji: '🔬' },
  'mentoring': { title: 'Mentoring', category: 'Social', emoji: '👨‍🏫' },
  'nature_environment': { title: 'Nature & Environment', category: 'Outdoors', emoji: '🌿' },
  'digital_work': { title: 'Digital Work', category: 'Technology', emoji: '💻' },
};

// Map card IDs to categories for preference analysis
export const categoryMap: Record<string, string[]> = {
  'innovation': ['creativity', 'technology'],
  'problem_solving': ['analysis', 'practical'],
  'working_with_people': ['social', 'helping'],
  'numbers_data': ['analysis', 'technology'],
  'building_creating': ['creativity', 'practical'],
  'helping_others': ['social', 'helping'],
  'strategic_thinking': ['analysis', 'business'],
  'outdoor_work': ['outdoors', 'practical'],
  'team_collaboration': ['social', 'business'],
  'technical_skills': ['technology', 'practical'],
  'artistic_expression': ['creativity'],
  'entrepreneurship': ['business', 'creativity'],
  'research': ['analysis'],
  'mentoring': ['helping', 'social'],
  'nature_environment': ['outdoors'],
  'digital_work': ['technology'],
}; 