import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scenarios } from "@/data/swipeableScenarios";
import { getCategoryGradient } from "@/data/swipeableScenarios";

interface SwipeSummaryProps {
  results: Record<string, boolean>;
  onContinue: () => void;
}

export default function SwipeSummary({ results, onContinue }: SwipeSummaryProps) {
  // Group results by category
  const categoryResults = scenarios.reduce((acc, scenario) => {
    const category = scenario.category;
    if (!acc[category]) {
      acc[category] = {
        liked: [],
        disliked: []
      };
    }
    if (results[scenario.id]) {
      acc[category].liked.push(scenario);
    } else {
      acc[category].disliked.push(scenario);
    }
    return acc;
  }, {} as Record<string, { liked: typeof scenarios, disliked: typeof scenarios }>);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text mb-2">
          Your Preferences Summary
        </h3>
        <p className="text-gray-600">
          Here's what we learned about your interests and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(categoryResults).map(([category, { liked, disliked }]) => (
          <Card key={category}>
            <CardContent className="p-6">
              <h4 className={`text-lg font-semibold mb-4 bg-gradient-to-r ${getCategoryGradient(category)} text-transparent bg-clip-text`}>
                {category}
              </h4>
              
              {liked.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">You Liked:</h5>
                  <div className="space-y-2">
                    {liked.map(scenario => (
                      <div key={scenario.id} className="flex items-center space-x-2">
                        <span className="text-2xl">{scenario.emoji}</span>
                        <div>
                          <p className="font-medium">{scenario.title}</p>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {disliked.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-500 mb-2">You Disliked:</h5>
                  <div className="space-y-2">
                    {disliked.map(scenario => (
                      <div key={scenario.id} className="flex items-center space-x-2 opacity-60">
                        <span className="text-2xl">{scenario.emoji}</span>
                        <div>
                          <p className="font-medium">{scenario.title}</p>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={onContinue} size="lg">
          Continue to Recommendations
        </Button>
      </div>
    </div>
  );
} 