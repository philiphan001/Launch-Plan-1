import React from 'react';
import { FourYearCollegePath } from '../pathways/FourYearCollegePath';
import { Card } from '@/components/ui/card';

export const FourYearCollegePathTest: React.FC = () => {
  const handleComplete = (data: {
    college: { name: string; city: string; state: string };
    fieldOfStudy: string;
    career: { title: string; salary?: number };
  }) => {
    console.log('Pathway completed with data:', data);
    // In a real implementation, this would likely update the user's pathway data
    // and trigger navigation to the next step (e.g., financial projections)
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          4-Year College Pathway
        </h1>
        <p className="text-gray-600">
          Plan your journey to a 4-year college degree
        </p>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
        <div className="p-6">
          <FourYearCollegePath
            onComplete={handleComplete}
            onBack={() => console.log('Back button clicked')}
          />
        </div>
      </Card>
    </div>
  );
}; 