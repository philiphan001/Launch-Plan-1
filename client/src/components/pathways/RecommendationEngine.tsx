import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  score: number;
  pathType: 'education' | 'career' | 'lifestyle';
}

interface RecommendationEngineProps {
  preferences: Record<string, boolean>;
  onSelectPath: (pathType: 'education' | 'career' | 'lifestyle', id: string) => void;
}

export default function RecommendationEngine({ preferences, onSelectPath }: RecommendationEngineProps) {
  // All potential recommendations
  const allRecommendations: Recommendation[] = useMemo(() => [
    // Education Paths
    {
      id: 'liberal_arts',
      title: 'Liberal Arts Degree',
      description: 'Explore diverse subjects with focus on critical thinking, communication, and creativity. Great for those who value learning across disciplines.',
      tags: ['4-year program', 'Well-rounded', 'Humanities'],
      icon: 'school',
      score: 0,
      pathType: 'education'
    },
    {
      id: 'stem_college',
      title: 'STEM Degree',
      description: 'Dive deep into science, technology, engineering or mathematics with hands-on learning and analytical problem-solving.',
      tags: ['4-year program', 'Technical', 'High-demand'],
      icon: 'science',
      score: 0,
      pathType: 'education'
    },
    {
      id: 'business_school',
      title: 'Business Degree',
      description: 'Learn entrepreneurship, finance, marketing and management skills for the corporate world or to start your own venture.',
      tags: ['4-year program', 'Practical', 'Versatile'],
      icon: 'business_center',
      score: 0,
      pathType: 'education'
    },
    {
      id: 'community_college',
      title: 'Community College',
      description: 'Get an associate degree or professional certificate with lower costs and flexible schedules.',
      tags: ['2-year program', 'Affordable', 'Flexible'],
      icon: 'menu_book',
      score: 0,
      pathType: 'education'
    },
    {
      id: 'trade_school',
      title: 'Trade School',
      description: 'Learn hands-on technical skills for in-demand trades with direct path to employment.',
      tags: ['Specialized', 'Hands-on', 'Career-focused'],
      icon: 'construction',
      score: 0,
      pathType: 'education'
    },
    
    // Career Paths
    {
      id: 'healthcare',
      title: 'Healthcare Career',
      description: 'Join the growing healthcare field with opportunities from direct patient care to health technology and administration.',
      tags: ['Stable', 'Meaningful', 'Growing field'],
      icon: 'medical_services',
      score: 0,
      pathType: 'career'
    },
    {
      id: 'technology',
      title: 'Technology Sector',
      description: 'Work in the dynamic tech industry with roles ranging from software development to IT support, data analysis, and more.',
      tags: ['Innovative', 'Fast-paced', 'High-paying'],
      icon: 'computer',
      score: 0,
      pathType: 'career'
    },
    {
      id: 'trades',
      title: 'Skilled Trades',
      description: 'Pursue electrician, plumbing, construction, or other skilled trades with apprenticeships and on-the-job training.',
      tags: ['Hands-on', 'Apprenticeship', 'Self-employed options'],
      icon: 'handyman',
      score: 0,
      pathType: 'career'
    },
    {
      id: 'creative_fields',
      title: 'Creative Professions',
      description: 'Use your artistic talents in fields like graphic design, content creation, marketing, or entertainment.',
      tags: ['Expressive', 'Portfolio-based', 'Varied work'],
      icon: 'palette',
      score: 0,
      pathType: 'career'
    },
    {
      id: 'public_service',
      title: 'Public Service',
      description: 'Make a difference working in government, non-profits, education or community service organizations.',
      tags: ['Impactful', 'Stable', 'Mission-driven'],
      icon: 'public',
      score: 0,
      pathType: 'career'
    },
    
    // Lifestyle Paths
    {
      id: 'entrepreneurship',
      title: 'Entrepreneurship',
      description: 'Be your own boss by starting a business, freelancing, or building a startup around your passions.',
      tags: ['Independent', 'Risk-taking', 'Flexible'],
      icon: 'storefront',
      score: 0,
      pathType: 'lifestyle'
    },
    {
      id: 'digital_nomad',
      title: 'Digital Nomad',
      description: 'Work remotely while traveling, combining career with exploration of different places and cultures.',
      tags: ['Location-independent', 'Travel', 'Tech-enabled'],
      icon: 'travel_explore',
      score: 0,
      pathType: 'lifestyle'
    },
    {
      id: 'work_life_balance',
      title: 'Work-Life Balance Focus',
      description: 'Prioritize balance with a stable job that offers good benefits, reasonable hours, and time for personal life.',
      tags: ['Stability', 'Benefits', 'Predictable'],
      icon: 'balance',
      score: 0,
      pathType: 'lifestyle'
    },
  ], []);
  
  // Calculate scores based on user preferences
  const recommendations = useMemo(() => {
    const scoredRecommendations = allRecommendations.map(rec => {
      let score = 0;
      
      // Scoring logic based on preferences
      if (rec.id === 'liberal_arts') {
        if (preferences['gain_knowledge'] === true) score += 2;
        if (preferences['be_creative'] === true) score += 1;
        if (preferences['analyze_data'] === true) score -= 1;
        if (preferences['work_hands'] === true) score -= 2;
      }
      
      else if (rec.id === 'stem_college') {
        if (preferences['analyze_data'] === true) score += 3;
        if (preferences['solve_problems'] === true) score += 2;
        if (preferences['be_creative'] === false) score += 1;
        if (preferences['work_hands'] === true) score += 1;
      }
      
      else if (rec.id === 'business_school') {
        if (preferences['get_rich'] === true) score += 2;
        if (preferences['lead_others'] === true) score += 2;
        if (preferences['own_business'] === true) score += 3;
        if (preferences['solve_problems'] === true) score += 1;
      }
      
      else if (rec.id === 'community_college') {
        if (preferences['work_life_balance'] === true) score += 2;
        if (preferences['get_rich'] === false) score += 1;
        if (preferences['flexible_hours'] === true) score += 1;
        if (preferences['high_prestige'] === true) score -= 2;
      }
      
      else if (rec.id === 'trade_school') {
        if (preferences['work_hands'] === true) score += 3;
        if (preferences['stable_career'] === true) score += 2;
        if (preferences['physical_active'] === true) score += 2;
        if (preferences['gain_knowledge'] === true) score -= 1;
      }
      
      else if (rec.id === 'healthcare') {
        if (preferences['help_others'] === true) score += 3;
        if (preferences['stable_career'] === true) score += 2;
        if (preferences['make_impact'] === true) score += 2;
        if (preferences['quiet_nature'] === true) score -= 1;
      }
      
      else if (rec.id === 'technology') {
        if (preferences['analyze_data'] === true) score += 3;
        if (preferences['get_rich'] === true) score += 2;
        if (preferences['solve_problems'] === true) score += 2;
        if (preferences['physical_active'] === true) score -= 2;
      }
      
      else if (rec.id === 'trades') {
        if (preferences['work_hands'] === true) score += 3;
        if (preferences['outdoor_work'] === true) score += 2;
        if (preferences['physical_active'] === true) score += 2;
        if (preferences['analyze_data'] === true) score -= 2;
      }
      
      else if (rec.id === 'creative_fields') {
        if (preferences['be_creative'] === true) score += 3;
        if (preferences['create_art'] === true) score += 3;
        if (preferences['make_impact'] === true) score += 1;
        if (preferences['stable_career'] === true) score -= 1;
      }
      
      else if (rec.id === 'public_service') {
        if (preferences['make_impact'] === true) score += 3;
        if (preferences['help_others'] === true) score += 3;
        if (preferences['solve_problems'] === true) score += 1;
        if (preferences['get_rich'] === true) score -= 2;
      }
      
      else if (rec.id === 'entrepreneurship') {
        if (preferences['own_business'] === true) score += 3;
        if (preferences['flexible_hours'] === true) score += 2;
        if (preferences['lead_others'] === true) score += 2;
        if (preferences['get_rich'] === true) score += 1;
        if (preferences['stable_career'] === true) score -= 3;
      }
      
      else if (rec.id === 'digital_nomad') {
        if (preferences['travel_world'] === true) score += 3;
        if (preferences['flexible_hours'] === true) score += 3;
        if (preferences['big_city'] === true) score += 1;
        if (preferences['stable_career'] === true) score -= 2;
      }
      
      else if (rec.id === 'work_life_balance') {
        if (preferences['work_life_balance'] === true) score += 3;
        if (preferences['stable_career'] === true) score += 2;
        if (preferences['quiet_nature'] === true) score += 1;
        if (preferences['get_rich'] === true) score -= 1;
        if (preferences['travel_world'] === true) score -= 1;
      }
      
      return { ...rec, score };
    });
    
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
      
  }, [allRecommendations, preferences]);

  // If no preferences yet, show loading or guidance
  if (Object.keys(preferences).length === 0) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Analyzing your preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-6">
        {recommendations.map((recommendation, index) => (
          <motion.div 
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="rounded-full bg-primary h-10 w-10 flex items-center justify-center text-white mr-4 flex-shrink-0">
                    <span className="material-icons">{recommendation.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-lg mb-1">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recommendation.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectPath(recommendation.pathType, recommendation.id)}
                    >
                      Explore This Path
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}