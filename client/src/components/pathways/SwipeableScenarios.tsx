import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ScenarioOption {
  id: string;
  text: string;
  emoji: string;
  category: 'interests' | 'values' | 'environment' | 'lifestyle';
  description: string;
}

interface SwipeableScenariosProps {
  onComplete: (results: Record<string, boolean>) => void;
}

export default function SwipeableScenarios({ onComplete }: SwipeableScenariosProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [currentSwipe, setCurrentSwipe] = useState<'left' | 'right' | null>(null);
  
  // Define all scenario cards
  const scenarios: ScenarioOption[] = useMemo(() => [
    // Interests
    { id: 'work_hands', text: 'Work with your hands', emoji: '💪', category: 'interests', description: 'Building, creating, or fixing physical objects' },
    { id: 'solve_problems', text: 'Solve big social problems', emoji: '🌍', category: 'interests', description: 'Addressing challenges facing society or communities' },
    { id: 'help_others', text: 'Help others directly', emoji: '🤝', category: 'interests', description: 'Working one-on-one with people who need assistance' },
    { id: 'analyze_data', text: 'Analyze data and patterns', emoji: '📊', category: 'interests', description: 'Finding insights in numbers and statistics' },
    { id: 'create_art', text: 'Create art or media', emoji: '🎨', category: 'interests', description: 'Expressing ideas through visual, musical, or digital creation' },
    
    // Environments
    { id: 'big_city', text: 'Live in a big city', emoji: '🏙️', category: 'environment', description: 'Urban living with diverse cultures and amenities' },
    { id: 'quiet_nature', text: 'Own a quiet cabin in the woods', emoji: '🛖', category: 'environment', description: 'Peaceful nature setting away from urban areas' },
    { id: 'travel_world', text: 'Travel the world for work', emoji: '✈️', category: 'environment', description: 'Job involving frequent international travel' },
    { id: 'outdoor_work', text: 'Work outdoors most days', emoji: '🌲', category: 'environment', description: 'Career primarily outside rather than in an office' },
    { id: 'own_business', text: 'Run your own business', emoji: '🏪', category: 'environment', description: 'Being an entrepreneur rather than an employee' },
    
    // Values
    { id: 'get_rich', text: 'Get rich', emoji: '💰', category: 'values', description: 'High income potential is a top priority' },
    { id: 'make_impact', text: 'Make a positive impact', emoji: '✨', category: 'values', description: 'Contributing to meaningful change in the world' },
    { id: 'be_creative', text: 'Express your creativity', emoji: '🎭', category: 'values', description: 'Work that allows artistic or innovative expression' },
    { id: 'gain_knowledge', text: 'Always keep learning new things', emoji: '📚', category: 'values', description: 'Continuous intellectual growth and challenge' },
    { id: 'work_life_balance', text: 'Have work-life balance', emoji: '⚖️', category: 'values', description: 'Time for both career and personal life' },
    
    // Lifestyle 
    { id: 'flexible_hours', text: 'Set your own schedule', emoji: '🕐', category: 'lifestyle', description: 'Flexibility to choose when you work' },
    { id: 'stable_career', text: 'Have job security', emoji: '🛡️', category: 'lifestyle', description: 'Stable employment with low risk of job loss' },
    { id: 'lead_others', text: 'Lead a team of people', emoji: '👑', category: 'lifestyle', description: 'Management or leadership position' },
    { id: 'physical_active', text: 'Be physically active at work', emoji: '🏃', category: 'lifestyle', description: 'Job involves movement rather than sitting all day' },
    { id: 'high_prestige', text: 'Have a prestigious title', emoji: '🏆', category: 'lifestyle', description: 'Position that carries social recognition and respect' },
  ], []);

  const handleSwipe = (direction: 'left' | 'right') => {
    const scenario = scenarios[currentIndex];
    const isLiked = direction === 'right';
    
    // Set current swipe for animation
    setCurrentSwipe(direction);
    
    // Update responses
    setResponses(prev => ({ ...prev, [scenario.id]: isLiked }));
    
    // Move to next card after animation
    setTimeout(() => {
      setCurrentSwipe(null);
      
      if (currentIndex < scenarios.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsComplete(true);
      }
    }, 300);
  };

  useEffect(() => {
    if (isComplete) {
      // Small delay before showing results
      const timer = setTimeout(() => {
        setShowResults(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  const handleFinish = () => {
    onComplete(responses);
  };

  // Group responses by category
  const resultsByCategory = useMemo(() => {
    if (!showResults) return {};
    
    const result: Record<string, {liked: ScenarioOption[], disliked: ScenarioOption[]}> = {
      interests: {liked: [], disliked: []},
      values: {liked: [], disliked: []},
      environment: {liked: [], disliked: []},
      lifestyle: {liked: [], disliked: []},
    };
    
    scenarios.forEach(scenario => {
      const isLiked = responses[scenario.id];
      if (isLiked === true) {
        result[scenario.category].liked.push(scenario);
      } else if (isLiked === false) {
        result[scenario.category].disliked.push(scenario);
      }
    });
    
    return result;
  }, [showResults, scenarios, responses]);

  // Progress percentage
  const progress = useMemo(() => {
    return Math.round(Object.keys(responses).length / scenarios.length * 100);
  }, [responses, scenarios.length]);

  if (showResults) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Your Preferences</h2>
          <p className="text-gray-600">Based on your choices, here's what you're interested in</p>
        </div>
        
        <div className="space-y-6">
          {Object.entries(resultsByCategory).map(([category, { liked }]) => {
            if (liked.length === 0) return null;
            
            return (
              <Card key={category} className="overflow-hidden">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium capitalize mb-4">
                    {category === 'interests' ? 'What You Like to Do' : 
                     category === 'values' ? 'What You Value' :
                     category === 'environment' ? 'Where You Want to Be' :
                     'How You Want to Work'}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3">
                    {liked.map(scenario => (
                      <div 
                        key={scenario.id}
                        className="flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2"
                      >
                        <span>{scenario.emoji}</span>
                        <span>{scenario.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-end mt-8">
          <Button onClick={handleFinish}>
            Continue to Recommendations
          </Button>
        </div>
      </div>
    );
  }

  const currentScenario = scenarios[currentIndex];

  return (
    <div className="relative h-[500px] max-w-md mx-auto">
      {/* Help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            className="absolute inset-0 z-20 bg-black/70 text-white rounded-lg flex flex-col items-center justify-center p-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-medium mb-4">Find Your Path</h3>
            <p className="text-center mb-6">Choose what appeals to you and what doesn't.</p>
            
            <div className="flex w-full justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center mb-2">
                  <span className="text-2xl">👎</span>
                </div>
                <span className="text-sm">Not for me</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center mb-2">
                  <span className="text-2xl">👍</span>
                </div>
                <span className="text-sm">I like this</span>
              </div>
            </div>
            
            <Button onClick={() => setShowHelp(false)}>Got it</Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Choose your preferences</span>
          <span>{currentIndex + 1} of {scenarios.length}</span>
        </div>
        <Progress value={progress} />
      </div>
      
      {/* Card */}
      <motion.div 
        className="h-[350px]"
        animate={
          currentSwipe === 'left' 
            ? { x: -500, opacity: 0, rotate: -10 }
            : currentSwipe === 'right'
              ? { x: 500, opacity: 0, rotate: 10 }
              : { x: 0, opacity: 1, rotate: 0 }
        }
        transition={{ duration: 0.3 }}
      >
        <Card className="h-[350px] w-full overflow-hidden shadow-lg relative">
          <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-5xl mb-4">{currentScenario.emoji}</div>
            <h3 className="text-xl font-medium mb-2">{currentScenario.text}</h3>
            <p className="text-gray-600">{currentScenario.description}</p>
            
            <div className="mt-auto pt-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs text-gray-600 bg-gray-100">
                {currentScenario.category === 'interests' ? 'Interest' : 
                 currentScenario.category === 'values' ? 'Value' :
                 currentScenario.category === 'environment' ? 'Environment' :
                 'Lifestyle'}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Button controls */}
      <div className="flex justify-center gap-10 mt-6">
        <Button 
          variant="outline" 
          className="rounded-full h-14 w-14 p-0"
          onClick={() => handleSwipe('left')}
        >
          <span className="text-red-500 text-xl">✕</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="rounded-full h-14 w-14 p-0" 
          onClick={() => handleSwipe('right')}
        >
          <span className="text-green-500 text-xl">❤</span>
        </Button>
      </div>
    </div>
  );
}