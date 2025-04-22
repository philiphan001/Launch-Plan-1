import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSwipeableCard } from '@/hooks/useSwipeableCard';
import { scenarios, getCategoryGradient } from '@/data/swipeableScenarios';

interface SwipeableScenariosProps {
  onComplete: (results: Record<string, boolean>) => void;
  resetKey?: number;
}

export default function SwipeableScenarios({ onComplete, resetKey = 0 }: SwipeableScenariosProps) {
  const {
    currentIndex,
    dragOffset,
    cardControls,
    handleDragStart,
    handleDrag,
    handleDragEnd,
    handleSkip,
    swipeStatus
  } = useSwipeableCard({
    scenarios,
    resetKey,
    onComplete
  });
  
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
            Nope
          </div>
          
          {/* Like indicator */}
          <div 
            className={cn(
              "bg-green-500 text-white rounded-full px-4 py-2 font-bold transform rotate-[20deg] transition-opacity shadow-lg",
              dragOffset > 50 ? "opacity-100" : "opacity-0" 
            )}
          >
            Like
          </div>
        </div>
        
        {/* Swipeable Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={cardControls}
          className="absolute inset-0"
        >
          <Card className="h-full w-full">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex-1">
                <div className="text-4xl mb-4">{currentScenario.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{currentScenario.title}</h3>
                <p className="text-gray-600">{currentScenario.description}</p>
              </div>
              
              <div className="mt-4">
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className={`text-sm font-medium bg-gradient-to-r ${getCategoryGradient(currentScenario.category)} text-transparent bg-clip-text`}>
                  {currentScenario.category}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="px-8"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}