import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  emoji: string;
}

interface SwipeableScenariosProps {
  onComplete: (results: Record<string, boolean>) => void;
  resetKey?: number; // Add a reset key prop for forcing re-mount
}

export default function SwipeableScenarios({ onComplete, resetKey = 0 }: SwipeableScenariosProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const cardControls = useAnimation();
  const dragControls = useRef({ startX: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  
  // Reset state when resetKey changes
  useEffect(() => {
    console.log('SwipeableScenarios: resetKey changed to', resetKey);
    // Completely reset the component state
    setCurrentIndex(0);
    setResults({});
    setDragOffset(0);
    cardControls.set({ x: 0, rotate: 0, opacity: 1 });
    
    // Force a repaint of the component
    const timer = setTimeout(() => {
      console.log('SwipeableScenarios: Delayed reset complete');
      cardControls.set({ x: 0, rotate: 0, opacity: 1 });
    }, 50);
    
    return () => clearTimeout(timer);
  }, [resetKey, cardControls]);
  
  const scenarios: Scenario[] = [
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
  
  const handleDragStart = () => {
    dragControls.current.startX = 0;
  };
  
  const handleDrag = (_: any, info: PanInfo) => {
    dragControls.current.startX = info.offset.x;
    setDragOffset(info.offset.x);
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
      setDragOffset(0);
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
          setDragOffset(0);
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
  
  // Get gradient colors for cards based on category
  const getCategoryGradient = (category: string) => {
    switch(category) {
      case 'Creativity': return 'from-purple-500 to-pink-500';
      case 'Analysis': return 'from-blue-500 to-cyan-500';
      case 'Social': return 'from-green-500 to-teal-500';
      case 'Practical': return 'from-amber-500 to-orange-500';
      default: return 'from-violet-500 to-fuchsia-500';
    }
  };
  
  // Calculate whether we're showing a "like" or "dislike" indicator
  const swipeStatus = () => {
    if (dragOffset > 50) return 'like';
    if (dragOffset < -50) return 'dislike';
    return null;
  };
  
  if (currentIndex >= scenarios.length) {
    // All cards have been swiped - show a more exciting completion screen
    return (
      <div className="text-center space-y-6">
        <div className="animate-bounce inline-block mb-4">
          <span className="text-5xl">🎉</span>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Awesome Job!
        </h3>
        <p className="text-gray-600 text-lg">
          We're finding your perfect matches...
        </p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full shadow-md"></div>
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
      
      <div className="relative w-full max-w-md h-72 mb-8">
        {/* Like/Dislike Indicators */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-10">
          {/* Dislike indicator */}
          <div 
            className={cn(
              "bg-red-500 text-white rounded-full px-4 py-2 font-bold transform rotate-[-20deg] transition-opacity shadow-lg",
              dragOffset < -50 ? "opacity-100" : "opacity-0" 
            )}
          >
            NOPE
          </div>
          
          {/* Like indicator */}
          <div 
            className={cn(
              "bg-green-500 text-white rounded-full px-4 py-2 font-bold transform rotate-[20deg] transition-opacity shadow-lg",
              dragOffset > 50 ? "opacity-100" : "opacity-0"
            )}
          >
            LIKE!
          </div>
        </div>
          
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
          <Card className="bg-white shadow-xl h-72 overflow-hidden rounded-xl border-0">
            <CardContent className="p-0 h-full flex flex-col">
              <div className={cn(
                "bg-gradient-to-r p-5 text-white",
                getCategoryGradient(currentScenario.category)
              )}>
                <div className="flex items-center mb-3">
                  <span className="text-4xl mr-3">{currentScenario.emoji}</span>
                  <span className="text-xl font-bold">{currentScenario.title}</span>
                </div>
                <p className="text-white/90 text-base">{currentScenario.description}</p>
              </div>
              
              <div className="flex-grow flex items-center justify-center p-6 text-center bg-white relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center border-4 border-white shadow-md">
                  <span className="text-xl">{dragOffset > 50 ? "👍" : (dragOffset < -50 ? "👎" : "🤔")}</span>
                </div>
                <div>
                  <p className="text-gray-700 font-medium text-lg mb-2">
                    Does this interest you?
                  </p>
                  <p className="text-gray-500 text-sm">
                    Swipe right if yes, left if no
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="flex justify-center gap-6 mb-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 text-white py-6 px-6 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
          onClick={() => handleSwipe(false)}
        >
          <span className="text-2xl mr-2">👎</span>
          Not My Thing
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-0 text-white py-6 px-6 shadow-lg hover:shadow-xl transition-all rounded-xl font-bold"
          onClick={() => handleSwipe(true)}
        >
          <span className="text-2xl mr-2">👍</span>
          Love This!
        </Button>
      </div>
      
      <div className="w-full text-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:bg-gray-100 text-gray-500 transition-all"
          onClick={handleSkip}
        >
          Skip and see my results
        </Button>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 mt-6 w-full shadow-sm">
        <p className="flex items-start">
          <span className="text-2xl mr-2">💫</span>
          <span className="font-medium">Pro Tip: <span className="font-normal">Drag the card left or right to swipe - just like on dating apps!</span></span>
        </p>
      </div>
    </div>
  );
}