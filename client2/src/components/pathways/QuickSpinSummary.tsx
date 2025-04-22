import { Card, CardContent } from '../ui/card';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '../ui/button';

interface QuickSpinSummaryProps {
  results: Record<string, string>;
  onContinue: () => void;
}

interface College {
  id: number;
  name: string;
}

interface Career {
  id: number;
  title: string;
}

interface PathwayResponse {
  category: string;
  question: string;
  response: string;
}

const categoryLabels: Record<string, string> = {
  superpower: 'My Superpower',
  ideal_day: 'My Ideal Day',
  values: 'What I Value',
  activities: 'What I Like to Do',
  feelings: 'Future Feelings',
  location: 'Dream Location',
  team_role: 'My Role in a Team',
  wildcard: 'Wildcard Dream'
};

const categoryIcons: Record<string, string> = {
  superpower: '⚡',
  ideal_day: '☀️',
  values: '💎',
  activities: '🎯',
  feelings: '💫',
  location: '🌎',
  team_role: '👥',
  wildcard: '🎲'
};

const categoryColors: Record<string, string> = {
  superpower: '#FF5757',
  ideal_day: '#FF9E3D',
  values: '#FFD449',
  activities: '#5CFF5C',
  feelings: '#4CACFF',
  location: '#9D4EDD',
  team_role: '#FF7EB6',
  wildcard: '#7B61FF'
};

const QuickSpinSummary = ({ results, onContinue }: QuickSpinSummaryProps) => {
  // Fetch user's favorited colleges and careers
  const { data: favoritedColleges = [] } = useQuery<College[]>({
    queryKey: ['favoritedColleges'],
    queryFn: async () => {
      const response = await apiRequest('/api/favorites/colleges/user');
      return response.json();
    }
  });

  const { data: favoritedCareers = [] } = useQuery<Career[]>({
    queryKey: ['favoritedCareers'],
    queryFn: async () => {
      const response = await apiRequest('/api/favorites/careers/user');
      return response.json();
    }
  });

  // Save responses to pathway_responses table
  useEffect(() => {
    const saveResponses = async () => {
      try {
        const responses = Object.entries(results).map(([category, response]) => 
          apiRequest('/api/pathway-responses', {
            method: 'POST',
            body: JSON.stringify({
              category,
              question: categoryLabels[category],
              response
            })
          })
        );
        
        // Wait for all responses to complete
        await Promise.all(responses);
        
        // Log success
        console.log('Successfully saved all pathway responses');
      } catch (error) {
        console.error('Error saving pathway responses:', error);
      }
    };

    saveResponses();
  }, [results]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Identity Profile</h2>
        <p className="text-gray-600">Based on your Quick Spin game responses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).map(([key, value]) => (
          <Card key={key} className="overflow-hidden">
            <div 
              className="h-2" 
              style={{ backgroundColor: categoryColors[key] }}
            />
            <CardContent className="p-6">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-2">{categoryIcons[key]}</span>
                <h3 className="text-lg font-semibold">{categoryLabels[key]}</h3>
              </div>
              <p className="text-gray-700">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(favoritedColleges.length > 0 || favoritedCareers.length > 0) && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Additional Insights
          </h3>
          {favoritedColleges.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                <strong>Your Favorited Colleges:</strong> We'll consider your interest in {favoritedColleges.map(c => c.name).join(', ')}
              </p>
            </div>
          )}
          {favoritedCareers.length > 0 && (
            <div>
              <p className="text-sm text-gray-700">
                <strong>Your Favorited Careers:</strong> We'll factor in your interest in {favoritedCareers.map(c => c.title).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-4">
          These insights, combined with your favorited colleges and careers, will help shape your personalized recommendations
        </p>
        <Button onClick={onContinue} className="mt-4">
          Continue to Recommendations
        </Button>
      </div>
    </div>
  );
};

export default QuickSpinSummary; 