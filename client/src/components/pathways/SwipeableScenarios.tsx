import { useState, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
}

interface SwipeableScenariosProps {
  onComplete: (results: Record<string, boolean>) => void;
}

export default function SwipeableScenarios({ onComplete }: SwipeableScenariosProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const cardControls = useAnimation();
  const dragControls = useRef({ startX: 0 });
  
  const scenarios: Scenario[] = [
    {
      id: 'innovation',
      title: 'Innovation & New Ideas',
      description: 'Creating new solutions and thinking outside the box',
      category: 'Creativity',
    },
    {
      id: 'problem_solving',
      title: 'Problem Solving',
      description: 'Finding solutions to complex problems',
      category: 'Analysis',
    },
    {
      id: 'working_with_people',
      title: 'Working With People',
      description: 'Collaborating and helping others achieve their goals',
      category: 'Social',
    },
    {
      id: 'numbers_data',
      title: 'Numbers & Data',
      description: 'Working with statistics, calculations, and data analysis',
      category: 'Analysis',
    },
    {
      id: 'building_creating',
      title: 'Building & Creating',
      description: 'Working with your hands to construct or create things',
      category: 'Practical',
    },
    {
      id: 'helping_others',
      title: 'Helping Others',
      description: 'Supporting people through challenges and providing assistance',
      category: 'Social',
    },
    {
      id: 'strategic_thinking',
      title: 'Strategic Thinking',
      description: 'Planning ahead and making long-term decisions',
      category: 'Analysis',
    },
    {
      id: 'outdoor_work',
      title: 'Working Outdoors',
      description: 'Spending time in nature and natural environments',
      category: 'Practical',
    },
    {
      id: 'team_collaboration',
      title: 'Team Collaboration',
      description: 'Working together with others toward common goals',
      category: 'Social',
    },
    {
      id: 'technical_skills',
      title: 'Technical Skills',
      description: 'Using specialized knowledge and technical abilities',
      category: 'Practical',
    }
  ];
  
  const handleDragStart = () => {
    dragControls.current.startX = 0;
  };
  
  const handleDrag = (_: any, info: PanInfo) => {
    dragControls.current.startX = info.offset.x;
  };
  
  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    const xOffset = info.offset.x;
    
    if (xOffset > threshold) {
      // Swiped right (like)
      handleSwipe(true);
    } else if (xOffset < -threshold) {
      // Swiped left (dislike)
      handleSwipe(false);
    } else {
      // Return to center
      cardControls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 }});
    }
  };
  
  const handleSwipe = (liked: boolean) => {
    if (currentIndex < scenarios.length) {
      const scenario = scenarios[currentIndex];
      
      // Animate card off-screen
      cardControls.start({ 
        x: liked ? 500 : -500, 
        rotate: liked ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.5 } 
      }).then(() => {
        // Track result
        const updatedResults = {
          ...results,
          [scenario.id]: liked
        };
        setResults(updatedResults);
        
        // Update index to move to next card
        if (currentIndex < scenarios.length - 1) {
          setCurrentIndex(currentIndex + 1);
          // Reset animation for next card
          cardControls.set({ x: 0, rotate: 0, opacity: 1 });
        } else {
          // All scenarios done - use the updated results to ensure the last card is included
          onComplete(updatedResults);
        }
      });
    }
  };
  
  const handleSkip = () => {
    // Complete the activity early with current results
    // Add the currently visible card as neutral (false) to ensure we don't skip it entirely
    if (currentIndex < scenarios.length) {
      const updatedResults = {
        ...results,
        [scenarios[currentIndex].id]: false
      };
      onComplete(updatedResults);
    } else {
      onComplete(results);
    }
  };
  
  const getEmoji = (category: string) => {
    switch(category) {
      case 'Creativity': return '💡';
      case 'Analysis': return '🧩';
      case 'Social': return '👥';
      case 'Practical': return '🔧';
      default: return '✨';
    }
  };
  
  if (currentIndex >= scenarios.length) {
    // All cards have been swiped
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-medium">Thanks for your input!</h3>
        <p className="text-gray-600">We're analyzing your preferences...</p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }
  
  const currentScenario = scenarios[currentIndex];
  const progressPercent = (currentIndex / scenarios.length) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Card {currentIndex + 1} of {scenarios.length}</span>
          <span>{Math.round(progressPercent)}% complete</span>
        </div>
        <Progress value={progressPercent} />
      </div>
      
      <div className="relative w-full max-w-md h-56 mb-8">
        <motion.div
          className="absolute w-full"
          animate={cardControls}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x: 0, y: 0 }}
        >
          <Card className="bg-white shadow-lg h-56 overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="bg-primary/10 p-4">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{getEmoji(currentScenario.category)}</span>
                  <span className="text-lg font-medium">{currentScenario.title}</span>
                </div>
                <p className="text-gray-600 text-sm">{currentScenario.description}</p>
              </div>
              
              <div className="flex-grow flex items-center justify-center p-6 text-center">
                <p className="text-gray-700">
                  Does this interest or appeal to you? Swipe right if yes, left if no.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="flex justify-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-red-50 hover:bg-red-100 border-red-100 text-red-600"
          onClick={() => handleSwipe(false)}
        >
          <span className="material-icons mr-2">thumb_down</span>
          Not for me
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-green-50 hover:bg-green-100 border-green-100 text-green-600"
          onClick={() => handleSwipe(true)}
        >
          <span className="material-icons mr-2">thumb_up</span>
          I like this
        </Button>
      </div>
      
      <div className="w-full text-center">
        <Button variant="ghost" size="sm" onClick={handleSkip}>Skip the rest and see results</Button>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700 mt-6 w-full">
        <p className="flex items-start">
          <span className="material-icons text-blue-500 mr-2 text-lg">info</span>
          <span>Tip: You can also drag the card left or right to swipe!</span>
        </p>
      </div>
    </div>
  );
}