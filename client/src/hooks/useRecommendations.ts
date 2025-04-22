import { useState, useEffect } from 'react';
import { RecommendationSet, PreferenceGroup } from '@/types/recommendation';
import { cardDetails, categoryMap } from '@/data/cardDetails';

interface UseRecommendationsProps {
  preferences: Record<string, boolean>;
}

interface UseRecommendationsReturn {
  recommendations: RecommendationSet | null;
  groupedPreferences: Record<string, PreferenceGroup>;
  isLoading: boolean;
  aiSummary: string;
}

export function useRecommendations({ preferences }: UseRecommendationsProps): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Analyze preferences and generate recommendations
  useEffect(() => {
    setIsLoading(true);
    const results = analyzePreferences(preferences);
    setRecommendations(results);
    setIsLoading(false);
  }, [preferences]);

  // Group preferences by category
  const groupedPreferences = Object.entries(preferences).reduce((acc, [key, liked]) => {
    if (cardDetails[key]) {
      const { category } = cardDetails[key];
      if (!acc[category]) {
        acc[category] = { liked: [], notInterested: [] };
      }
      const target = liked ? acc[category].liked : acc[category].notInterested;
      target.push({ ...cardDetails[key], liked });
    }
    return acc;
  }, {} as Record<string, PreferenceGroup>);

  // Generate AI summary
  const aiSummary = generateAISummary(preferences, recommendations);

  return {
    recommendations,
    groupedPreferences,
    isLoading,
    aiSummary,
  };
}

// Helper function to analyze preferences and generate recommendations
function analyzePreferences(preferences: Record<string, boolean>): RecommendationSet {
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
  
  return {
    education: generateEducationPaths(sortedCategories),
    career: generateCareerPaths(sortedCategories),
    lifestyle: generateLifestylePaths(sortedCategories)
  };
}

// Generate education recommendations
function generateEducationPaths(categories: string[]) {
  const recommendations = [];
  const [topCategory, secondCategory] = categories;
  
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
  
  recommendations.push({
    id: 'community_college',
    title: 'Community College',
    description: 'Flexible, affordable option to explore different subjects before committing.',
    match: 'Good option for anyone starting their higher education journey.'
  });

  return recommendations;
}

// Generate career recommendations
function generateCareerPaths(categories: string[]) {
  const recommendations = [];
  const [topCategory, secondCategory] = categories;
  
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
}

// Generate lifestyle recommendations
function generateLifestylePaths(categories: string[]) {
  const recommendations = [];
  const [topCategory] = categories;
  
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
}

// Generate AI summary
function generateAISummary(
  preferences: Record<string, boolean>,
  recommendations: RecommendationSet | null,
): string {
  // Get top categories from preferences
  const likedCategories = Object.entries(preferences)
    .filter(([_, liked]) => liked)
    .map(([key]) => cardDetails[key]?.category)
    .filter((category): category is string => !!category);

  // Get unique categories
  const uniqueCategories = Array.from(new Set(likedCategories));

  // Generate summary based on available data
  const summary = `Based on your profile and preferences, here's a personalized analysis of potential paths that might interest you:

${uniqueCategories.length > 0 ? `Your interests strongly align with ${uniqueCategories.join(', ')}, suggesting you might excel in roles that combine these elements.` : ''}

${recommendations?.education ? `Consider exploring these educational paths that match your preferences: ${recommendations.education.map(r => r.title).join(', ')}.` : ''}

${recommendations?.career ? `Your interests align well with career paths in ${recommendations.career.map(r => r.title).join(', ')}.` : ''}

${recommendations?.lifestyle ? `Given your preferences, you might also consider alternative paths like ${recommendations.lifestyle.map(r => r.title).join(', ')}.` : ''}

Keep exploring! The more you interact with our tools and games, the more personalized your recommendations will become.`;

  return summary;
} 