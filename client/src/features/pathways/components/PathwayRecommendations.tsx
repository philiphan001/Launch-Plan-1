import React from 'react';
import "@/index.css";  // Import Tailwind CSS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PathwayRecommendationsProps {
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    type: 'education' | 'career' | 'lifestyle';
    confidence: number;
  }>;
  onSelectPath: (pathType: 'education' | 'career' | 'lifestyle', id: string) => void;
  onStartOver: () => void;
}

export const PathwayRecommendations: React.FC<PathwayRecommendationsProps> = ({
  recommendations,
  onSelectPath,
  onStartOver
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-primary mb-4">
          Your Personalized Pathway Recommendations
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your preferences and interests, we've identified these potential pathways for you.
          Each recommendation is tailored to your unique profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold">
                  {recommendation.title}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  {Math.round(recommendation.confidence * 100)}% Match
                </Badge>
              </div>
              <CardDescription className="mt-2">
                {recommendation.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => onSelectPath(recommendation.type, recommendation.id)}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Explore This Path
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button
          onClick={onStartOver}
          variant="outline"
          className="px-6 py-2 border border-gray-300 hover:bg-gray-50"
        >
          Start Over
        </Button>
      </div>
    </div>
  );
}; 