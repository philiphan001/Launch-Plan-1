import React from 'react';
import TwoYearCollegePath from '@/components/pathways/TwoYearCollegePath';
import { Card } from '@/components/ui/card';
import { College } from '@/types/college';
import { Career } from '@/types/career';

export default function TwoYearPathTestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          2-Year College Pathway
        </h1>
        <p className="text-gray-600">
          Plan your journey to a 2-year college degree
        </p>
      </div>

      <Card className="bg-white/50 backdrop-blur-sm border-gray-100 shadow-sm">
        <div className="p-6">
          <TwoYearCollegePath
            onComplete={(data: { college: College; fieldOfStudy: string; career: Career }) => 
              console.log('Pathway completed with data:', data)
            }
            onBack={() => console.log('Back button clicked')}
            isAuthenticated={true}
          />
        </div>
      </Card>
    </div>
  );
} 