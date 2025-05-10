import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSwipeableCard } from '@/hooks/useSwipeableCard';
import confetti from 'canvas-confetti';

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  emoji: string;
}

interface SwipeableScenariosProps {
  onComplete: (results: Record<string, boolean>) => void;
  resetKey?: number;
}

export default function SwipeableScenarios({ onComplete, resetKey = 0 }: SwipeableScenariosProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/questions?game=Swipe Cards&limit=10')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch questions');
        return res.json();
      })
      .then(data => {
        // Convert all ids to strings for compatibility
        setScenarios(data.map((q: any) => ({ ...q, id: String(q.id) })));
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [resetKey]);

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

  if (loading) {
    return <div className="text-center py-12">Loading questions...</div>;
  }
  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }
  if (scenarios.length === 0) {
    return <div className="text-center py-12">No questions available.</div>;
  }

  if (currentIndex >= scenarios.length) {
    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    return (
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center space-y-6"
      >
        <div className="relative">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="inline-block mb-4"
          >
            <span className="text-6xl filter drop-shadow-lg">🎉</span>
          </motion.div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 text-transparent bg-clip-text animate-gradient">
          You're Amazing! 
        </h3>
        <p className="text-gray-600 text-lg font-medium">
          Get ready to discover your perfect path! 
        </p>
        <div className="flex justify-center mt-4 gap-4">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
          />
        </div>
      </motion.div>
    );
  }

  const currentScenario = scenarios[currentIndex];
  const progressPercent = (currentIndex / scenarios.length) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm font-medium mb-1">
          <span className="text-primary">Card {currentIndex + 1} of {scenarios.length}</span>
          <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-transparent bg-clip-text">
            {Math.round(progressPercent)}% complete
          </span>
        </div>
        <Progress 
          value={progressPercent} 
          className="h-2 bg-gray-100"
        />
      </div>
      
      <div className="relative w-full max-w-md h-[400px] mb-8">
        {/* Like/Dislike Indicators */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-10">
          <motion.div 
            animate={{ 
              opacity: dragOffset < -50 ? 1 : 0,
              scale: dragOffset < -50 ? 1.1 : 0.8,
            }}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full px-6 py-3 font-bold transform -rotate-12 shadow-lg backdrop-blur-sm"
          >
            Not for me
          </motion.div>
          
          <motion.div 
            animate={{ 
              opacity: dragOffset > 50 ? 1 : 0,
              scale: dragOffset > 50 ? 1.1 : 0.8,
            }}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full px-6 py-3 font-bold transform rotate-12 shadow-lg backdrop-blur-sm"
          >
            Love it!
          </motion.div>
        </div>
        
        {/* Swipeable Card */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={cardControls}
          whileDrag={{ scale: 1.02 }}
          className="absolute inset-0"
        >
          <Card className="h-full w-full overflow-hidden bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-8 h-full flex flex-col relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1"
              >
                <div className="text-6xl mb-6 transform hover:scale-110 transition-transform">
                  {currentScenario.emoji}
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 text-transparent bg-clip-text">
                  {currentScenario.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {currentScenario.description}
                </p>
              </motion.div>
              
              <div className="mt-6">
                <div className="text-sm font-medium text-gray-500 mb-2">Category</div>
                <div className={cn(
                  "text-sm font-bold py-2 px-4 rounded-full inline-block",
                  // You may want to update getCategoryGradient to handle dynamic categories
                  "bg-gradient-to-r from-violet-500 to-fuchsia-500",
                  "text-white shadow-md"
                )}>
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
          className="px-8 py-6 text-lg font-medium hover:scale-105 transition-transform"
        >
          Skip This One
        </Button>
      </div>
    </div>
  );
}