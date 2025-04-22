import { useState } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recommendation, PathType } from '@/types/recommendation';

interface PathwayTabsProps {
  recommendations: {
    education: Recommendation[];
    career: Recommendation[];
    lifestyle: Recommendation[];
  };
  onSelectPath: (pathType: PathType, id: string) => void;
}

export function PathwayTabs({ recommendations, onSelectPath }: PathwayTabsProps) {
  const [activeTab, setActiveTab] = useState<PathType>('education');

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PathType)} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="career">Career</TabsTrigger>
        <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
      </TabsList>
      
      <TabsContent value="education" className="space-y-4">
        {recommendations.education.map((rec) => (
          <PathwayCard
            key={rec.id}
            recommendation={rec}
            onSelect={() => onSelectPath('education', rec.id)}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="career" className="space-y-4">
        {recommendations.career.map((rec) => (
          <PathwayCard
            key={rec.id}
            recommendation={rec}
            onSelect={() => onSelectPath('career', rec.id)}
          />
        ))}
      </TabsContent>
      
      <TabsContent value="lifestyle" className="space-y-4">
        {recommendations.lifestyle.map((rec) => (
          <PathwayCard
            key={rec.id}
            recommendation={rec}
            onSelect={() => onSelectPath('lifestyle', rec.id)}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
}

interface PathwayCardProps {
  recommendation: Recommendation;
  onSelect: () => void;
}

function PathwayCard({ recommendation, onSelect }: PathwayCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-lg">{recommendation.title}</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {recommendation.match.startsWith('High') ? '90%+ Match' : '75% Match'}
            </Badge>
          </div>
          <CardDescription className="text-gray-600 mb-3">
            {recommendation.description}
          </CardDescription>
          <p className="text-sm text-gray-500 italic mb-3">{recommendation.match}</p>
          
          <Button 
            onClick={onSelect}
            className="w-full"
          >
            Explore This Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 