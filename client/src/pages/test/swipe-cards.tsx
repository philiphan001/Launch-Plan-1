import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SwipeableScenarios from "@/features/pathways/components/SwipeableScenarios";
import SwipeSummary from "@/features/pathways/components/SwipeSummary";
import { AISummary } from "@/features/pathways/components/recommendation/AISummary";
import { useRecommendations } from "@/hooks/useRecommendations";

export default function SwipeCardsTest() {
  const [swipeResults, setSwipeResults] = useState<Record<string, boolean>>({});
  const [hasShownSummary, setHasShownSummary] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  
  const { aiSummary } = useRecommendations({ preferences: swipeResults });

  const handleRestart = () => {
    setSwipeResults({});
    setHasShownSummary(false);
    setResetCounter(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-sky-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-600 via-pink-500 to-orange-500 text-transparent bg-clip-text">
            Discover Your Path
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Swipe through scenarios to find what excites you! 
          </p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!swipeResults || Object.keys(swipeResults).length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <SwipeableScenarios 
                  key={`swipe-${resetCounter}`}
                  resetKey={resetCounter}
                  onComplete={(results) => {
                    setSwipeResults(results);
                  }} 
                />
                <div className="flex justify-center mt-8">
                  <Button 
                    variant="outline"
                    onClick={handleRestart}
                    className="group hover:scale-105 transition-transform"
                  >
                    <span className="material-icons text-lg mr-2 group-hover:rotate-180 transition-transform">
                      sports_esports
                    </span>
                    Start Over
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : !hasShownSummary ? (
            <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <SwipeSummary 
                  results={swipeResults} 
                  onContinue={() => setHasShownSummary(true)}
                />
                <div className="flex justify-between mt-8">
                  <Button 
                    variant="outline"
                    onClick={handleRestart}
                    className="group hover:scale-105 transition-transform"
                  >
                    <span className="material-icons text-lg mr-2 group-hover:rotate-180 transition-transform">
                      sports_esports
                    </span>
                    Start Over
                  </Button>
                  <Button 
                    onClick={() => setHasShownSummary(true)}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:opacity-90 hover:scale-105 transition-all"
                  >
                    See Your Results
                    <span className="material-icons ml-2">arrow_forward</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AISummary summary={aiSummary} />
              </motion.div>
              
              <Card className="backdrop-blur-sm bg-white/90 border-0 shadow-xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 text-transparent bg-clip-text">
                    Your Results
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-xl overflow-auto max-h-96 mb-8 border border-gray-100">
                    <pre className="text-gray-700">
                      {JSON.stringify(swipeResults, null, 2)}
                    </pre>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={handleRestart}
                      className="group hover:scale-105 transition-transform"
                    >
                      <span className="material-icons text-lg mr-2 group-hover:rotate-180 transition-transform">
                        sports_esports
                      </span>
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 