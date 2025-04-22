import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@apollo/client';
import { GET_USER_PROFILE, GET_FAVORITE_COLLEGES, GET_FAVORITE_CAREERS } from '../../graphql/queries';
import { useRecommendations } from '@/hooks/useRecommendations';
import { AISummary } from './recommendation/AISummary';
import { PreferencesSummary } from './recommendation/PreferencesSummary';
import { PathwayTabs } from './recommendation/PathwayTabs';
import { PathType } from '@/types/recommendation';

interface GameResults {
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

export interface RecommendationEngineProps {
  preferences: Record<string, boolean>;
  onSelectPath: (pathType: PathType, id: string) => void;
}

// Map card IDs to their display names and categories
const cardDetails: Record<string, { title: string; category: string; emoji: string }> = {
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

// This determines recommendation based on liked cards
const analyzePreferences = (preferences: Record<string, boolean>) => {
  // Count the frequency of different categories
  const counts: Record<string, number> = {
    'creativity': 0,
    'analysis': 0,
    'social': 0,
    'practical': 0,
    'technology': 0,
    'business': 0,
    'helping': 0,
    'outdoors': 0,
  };
  
  // Map card IDs to categories
  const categoryMap: Record<string, string[]> = {
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
  
  // Count preferences 
  Object.entries(preferences).forEach(([key, liked]) => {
    if (liked && categoryMap[key]) {
      categoryMap[key].forEach(category => {
        counts[category] = (counts[category] || 0) + 1;
      });
    }
  });
  
  // Sort categories by count
  const sortedCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Generate recommendations based on top categories
  return {
    education: generateEducationPaths(sortedCategories),
    career: generateCareerPaths(sortedCategories),
    lifestyle: generateLifestylePaths(sortedCategories)
  };
};

// Generate education recommendations based on preference categories
const generateEducationPaths = (categories: string[]) => {
  const recommendations = [];
  
  const topCategory = categories[0];
  const secondCategory = categories[1];
  
  // Education path recommendations
  if (['creativity', 'social', 'helping'].includes(topCategory)) {
    recommendations.push({
      id: 'liberal_arts',
      title: 'Liberal Arts College',
      description: 'Smaller schools with focus on critical thinking and well-rounded education.',
      match: 'High match: Your preference for creativity and people-oriented activities align well with liberal arts.'
    });
  }
  
  if (['analysis', 'technology', 'practical'].includes(topCategory)) {
    recommendations.push({
      id: 'stem_college',
      title: 'STEM-focused University',
      description: 'Schools with strong science, technology, engineering, and math programs.',
      match: 'High match: Your analytical and technical interests are perfect for STEM fields.'
    });
  }
  
  if (['business', 'social', 'analysis'].includes(topCategory)) {
    recommendations.push({
      id: 'business_school',
      title: 'Business School',
      description: 'Programs that focus on management, marketing, finance, and entrepreneurship.',
      match: 'High match: Your interests in business and strategic thinking indicate this would be a good fit.'
    });
  }
  
  if (['practical', 'outdoors'].includes(topCategory)) {
    recommendations.push({
      id: 'trade_school',
      title: 'Trade or Technical School',
      description: 'Specialized training for specific careers in skilled trades or technical fields.',
      match: 'High match: Your practical and hands-on preferences align with vocational training.'
    });
  }
  
  // Always include as a flexible option
  recommendations.push({
    id: 'community_college',
    title: 'Community College',
    description: 'Flexible, affordable option to explore different subjects before committing.',
    match: 'Good option for anyone starting their higher education journey.'
  });

  return recommendations;
};

// Generate career paths based on top categories
const generateCareerPaths = (categories: string[]) => {
  const recommendations = [];
  const topCategory = categories[0];
  const secondCategory = categories[1];
  
  if (['creativity', 'social'].includes(topCategory)) {
    recommendations.push({
      id: 'creative_fields',
      title: 'Creative Industries',
      description: 'Careers in design, media, entertainment, or advertising.',
      match: 'High match: Your creative interests and people skills would thrive in these fields.'
    });
  }

  if (['technology', 'analysis'].includes(topCategory)) {
    recommendations.push({
      id: 'tech_sector',
      title: 'Technology Sector',
      description: 'Careers in software development, data analysis, or IT.',
      match: 'High match: Your analytical mind and tech interests are perfect for this growing field.'
    });
  }

  if (['helping', 'social'].includes(topCategory)) {
    recommendations.push({
      id: 'healthcare',
      title: 'Healthcare & Wellness',
      description: 'Careers in healthcare, counseling, or social services.',
      match: 'High match: Your desire to help others and work with people aligns with these caring professions.'
    });
  }

  if (['outdoors', 'practical'].includes(topCategory)) {
    recommendations.push({
      id: 'trades',
      title: 'Skilled Trades',
      description: 'Careers in construction, manufacturing, or other hands-on fields.',
      match: 'High match: Your practical skills and outdoor preferences are well-suited for these hands-on jobs.'
    });
  }

  if (['business', 'social'].includes(topCategory)) {
    recommendations.push({
      id: 'business',
      title: 'Business & Management',
      description: 'Careers in management, marketing, sales, or entrepreneurship.',
      match: 'High match: Your business acumen and people skills would excel in these roles.'
    });
  }

  return recommendations;
};

// Generate lifestyle recommendations
const generateLifestylePaths = (categories: string[]) => {
  const recommendations = [];
  const topCategory = categories[0];
  
  if (['creativity', 'technology'].includes(topCategory)) {
    recommendations.push({
      id: 'digital_nomad',
      title: 'Digital Nomad',
      description: 'Work remotely while traveling to different locations.',
      match: 'High match: Your creative or tech skills could enable location independence.'
    });
  }

  if (['business', 'social'].includes(topCategory)) {
    recommendations.push({
      id: 'entrepreneurship',
      title: 'Entrepreneurship',
      description: 'Start your own business or freelance in your field of interest.',
      match: 'High match: Your business sense and initiative could lead to successful ventures.'
    });
  }

  if (['helping', 'outdoors'].includes(topCategory)) {
    recommendations.push({
      id: 'service_year',
      title: 'Service Year',
      description: 'Spend a year in programs like AmeriCorps, Peace Corps, or conservation work.',
      match: 'High match: Your passion for helping others and hands-on work fits with service programs.'
    });
  }

  return recommendations;
};

function generateAISummary(
  preferences: Record<string, boolean>,
  userProfile: any,
  favoriteColleges: any[],
  favoriteCareers: any[],
  recommendations: any
) {
  // Get top categories from preferences
  const likedCategories = Object.entries(preferences)
    .filter(([_, liked]) => liked)
    .map(([key]) => cardDetails[key]?.category)
    .filter((category): category is string => !!category);

  // Get unique categories
  const uniqueCategories = Array.from(new Set(likedCategories));

  // Generate summary based on all available data
  const summary = `Based on your profile and preferences, here's a personalized analysis of potential paths that might interest you:

${uniqueCategories.length > 0 ? `Your interests strongly align with ${uniqueCategories.join(', ')}, suggesting you might excel in roles that combine these elements.` : ''}

${favoriteColleges.length > 0 ? `Your interest in ${favoriteColleges.map(c => c.name).join(', ')} suggests you value ${favoriteColleges[0].type === 'Liberal Arts' ? 'a well-rounded education' : 'specialized training'}. Consider also exploring these adjacent institutions that match your preferences: ${recommendations.education.map((r: any) => r.title).join(', ')}.` : ''}

${favoriteCareers.length > 0 ? `Your career interests in ${favoriteCareers.map(c => c.title).join(', ')} open up possibilities in related fields like ${recommendations.career.map((r: any) => r.title).join(', ')}.` : ''}

${recommendations.lifestyle.length > 0 ? `Given your preferences, you might also consider alternative paths like ${recommendations.lifestyle.map((r: any) => r.title).join(', ')}.` : ''}

Keep exploring! The more you interact with our tools and games, the more personalized your recommendations will become. Try our career exploration games or college matching tools to further refine these suggestions.`;

  return summary;
}

// Map game responses to preference categories
const mapGameResponsesToPreferences = (gameResults: GameResults): Record<string, boolean> => {
  const preferences: Record<string, boolean> = {};

  // Process Quick Spin results
  if (gameResults.quickSpin) {
    // Map superpower to relevant categories
    const superpower = gameResults.quickSpin.superpower.join(' ').toLowerCase();
    if (superpower.includes('creative') || superpower.includes('artistic')) {
      preferences['artistic_expression'] = true;
      preferences['innovation'] = true;
    }
    if (superpower.includes('problem') || superpower.includes('analytical')) {
      preferences['problem_solving'] = true;
      preferences['strategic_thinking'] = true;
    }
    if (superpower.includes('people') || superpower.includes('communication')) {
      preferences['working_with_people'] = true;
      preferences['team_collaboration'] = true;
    }

    // Map activities to relevant categories
    const activities = gameResults.quickSpin.activities.join(' ').toLowerCase();
    if (activities.includes('outdoor') || activities.includes('nature')) {
      preferences['outdoor_work'] = true;
      preferences['nature_environment'] = true;
    }
    if (activities.includes('build') || activities.includes('create')) {
      preferences['building_creating'] = true;
      preferences['technical_skills'] = true;
    }
    if (activities.includes('help') || activities.includes('teach')) {
      preferences['helping_others'] = true;
      preferences['mentoring'] = true;
    }
  }

  // Process Swipe Cards results
  if (gameResults.swipeCards) {
    Object.entries(gameResults.swipeCards).forEach(([key, liked]) => {
      preferences[key] = liked;
    });
  }

  // Process Identity Wheel results
  if (gameResults.identityWheel) {
    gameResults.identityWheel.interests.forEach(interest => {
      const key = interest.toLowerCase().replace(/\s+/g, '_');
      preferences[key] = true;
    });
    gameResults.identityWheel.skills.forEach(skill => {
      const key = skill.toLowerCase().replace(/\s+/g, '_');
      preferences[key] = true;
    });
  }

  return preferences;
};

export default function RecommendationEngine({ preferences, onSelectPath }: RecommendationEngineProps) {
  const { recommendations, groupedPreferences, isLoading, aiSummary } = useRecommendations({ preferences });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-4">
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
        
        {[1, 2, 3].map(i => (
          <Card key={i} className="mb-4">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      <AISummary summary={aiSummary} />
      <PreferencesSummary groupedPreferences={groupedPreferences} />
      <PathwayTabs recommendations={recommendations} onSelectPath={onSelectPath} />
    </div>
  );
}