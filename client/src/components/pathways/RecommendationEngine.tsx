import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendationEngineProps {
  preferences: Record<string, boolean>;
  onSelectPath: (pathType: 'education' | 'career' | 'lifestyle', id: string) => void;
}

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

export default function RecommendationEngine({ preferences, onSelectPath }: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('education');
  
  useEffect(() => {
    // Simulate loading time to analyze preferences
    setLoading(true);
    setTimeout(() => {
      const results = analyzePreferences(preferences);
      setRecommendations(results);
      setLoading(false);
    }, 1500);
  }, [preferences]);
  
  if (loading) {
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
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-3">Your Personalized Recommendations</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          Based on your preferences, we've identified paths that might be a good fit for your interests and strengths.
        </p>
      </div>
      
      <Tabs defaultValue="education" onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="education" className="space-y-4">
          {recommendations?.education.map((rec: any) => (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {rec.match.startsWith('High') ? '90%+ Match' : '75% Match'}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 mb-3">
                    {rec.description}
                  </CardDescription>
                  <p className="text-sm text-gray-500 italic mb-3">{rec.match}</p>
                  
                  <Button 
                    onClick={() => onSelectPath('education', rec.id)}
                    className="w-full"
                  >
                    Explore This Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="career" className="space-y-4">
          {recommendations?.career.map((rec: any) => (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {rec.match.startsWith('High') ? '90%+ Match' : '75% Match'}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 mb-3">
                    {rec.description}
                  </CardDescription>
                  <p className="text-sm text-gray-500 italic mb-3">{rec.match}</p>
                  
                  <Button 
                    onClick={() => onSelectPath('career', rec.id)}
                    className="w-full"
                  >
                    Explore This Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="lifestyle" className="space-y-4">
          {recommendations?.lifestyle.map((rec: any) => (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {rec.match.startsWith('High') ? '90%+ Match' : '75% Match'}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-600 mb-3">
                    {rec.description}
                  </CardDescription>
                  <p className="text-sm text-gray-500 italic mb-3">{rec.match}</p>
                  
                  <Button 
                    onClick={() => onSelectPath('lifestyle', rec.id)}
                    className="w-full"
                  >
                    Explore This Path
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}