import { useState } from "react";
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

  const handleRestart = () => {
    setSwipeResults({});
    setHasShownSummary(false);
    setResetCounter(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Swipe Cards Game Test</h1>
      
      {!swipeResults || Object.keys(swipeResults).length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <SwipeableScenarios 
              key={`swipe-${resetCounter}`}
              resetKey={resetCounter}
              onComplete={(results) => {
                setSwipeResults(results);
              }} 
            />
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={handleRestart}>
                <span className="material-icons text-sm mr-1">sports_esports</span>
                Play Game Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !hasShownSummary ? (
        <Card>
          <CardContent className="p-6">
            <SwipeSummary 
              results={swipeResults} 
              onContinue={() => setHasShownSummary(true)}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleRestart}>
                <span className="material-icons text-sm mr-1">sports_esports</span>
                Play Game Again
              </Button>
              <Button onClick={() => setHasShownSummary(true)}>
                Continue to Recommendations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <AISummary summary={useRecommendations({ preferences: swipeResults }).aiSummary} />
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Your Results</h2>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(swipeResults, null, 2)}
              </pre>
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={handleRestart}>
                  <span className="material-icons text-sm mr-1">sports_esports</span>
                  Play Game Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 