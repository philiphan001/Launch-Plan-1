import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { Location } from '@/types/location';
import { Card } from '@/components/ui/card';
import TwoYearCollegePath from '@/components/pathways/TwoYearCollegePath';

interface TwoYearCollegePathTestProps {
  isAuthenticated?: boolean;
  user?: {
    id: number;
  };
}

export const TwoYearCollegePathTest: React.FC<TwoYearCollegePathTestProps> = ({
  isAuthenticated = false,
  user
}) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleComplete = async (data: {
    college: College;
    fieldOfStudy: string;
    career: Career;
    location?: Location;
  }) => {
    if (!data.location) {
      console.error('Location data is required for financial projections');
      return;
    }

    if (!isAuthenticated) {
      // Store the data in localStorage for later use
      const pathwayData = {
        educationType: '2year',
        selectedFieldOfStudy: data.fieldOfStudy,
        specificSchool: data.college.name,
        selectedProfession: data.career.title,
        location: {
          zipCode: data.location.zip_code,
          city: data.college.city,
          state: data.college.state
        },
        userJourney: `Pursuing a 2-year degree in ${data.fieldOfStudy} at ${data.college.name}`,
        zipCode: data.location.zip_code,
        selectedCareer: data.career.id
      };

      localStorage.setItem('pathwayData', JSON.stringify(pathwayData));
      
      toast({
        title: "Authentication Required",
        description: "Please sign in to create a financial plan. Your selections have been saved.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Get location cost of living data
      const locationData = await axios.get(`/api/location-cost-of-living/zip/${data.location.zip_code}`);
      
      // 2. Get fresh college data to ensure we have latest costs
      const collegeData = await axios.get(`/api/colleges/${data.college.id}`);
      const college = collegeData.data;

      // 3. Calculate financial values
      const tuition = college.tuition;
      const roomAndBoard = college.roomAndBoard;
      const totalCost = tuition + roomAndBoard;
      
      // Default household values
      const householdIncome = 80000;
      const householdSize = 1;

      // Calculate financial aid based on household income
      let financialAid = 0;
      if (householdIncome < 50000) financialAid = totalCost * 0.8;
      else if (householdIncome < 80000) financialAid = totalCost * 0.5;
      else if (householdIncome < 120000) financialAid = totalCost * 0.3;
      else financialAid = totalCost * 0.1;

      const netPrice = Math.max(totalCost - financialAid, 0);
      const studentLoanAmount = Math.round(netPrice * 0.7); // 70% of net price becomes loan
      const familyContribution = Math.floor(householdIncome * 0.1);

      // 4. Create college calculation
      const collegeCalc = await axios.post('/api/college-calculations', {
        userId: user?.id,
        collegeId: data.college.id,
        inState: true,
        householdIncome: householdIncome,
        householdSize: householdSize,
        zip: data.location.zip_code,
        onCampusHousing: true,
        includedInProjection: true,
        notes: `Auto-generated from Pathways for ${data.college.name}`,
        netPrice: netPrice,
        familyContribution: familyContribution,
        workStudy: 0,
        studentLoanAmount: studentLoanAmount,
        financialAid: financialAid,
        totalCost: totalCost,
        tuitionUsed: tuition,
        roomAndBoardUsed: roomAndBoard
      });

      // 5. Create career calculation
      const careerCalc = await axios.post('/api/career-calculations', {
        userId: user?.id,
        careerId: data.career.id,
        projectedSalary: data.career.salary || 40000, // Default salary if none provided
        education: data.fieldOfStudy,
        locationZip: data.location.zip_code,
        adjustedForLocation: true,
        includedInProjection: true,
        notes: `Auto-generated from Pathways for ${data.career.title}`
      });

      // 6. Auto-favorite the college
      await axios.post('/api/favorites/colleges', {
        userId: user?.id,
        collegeId: data.college.id
      });

      // 7. Auto-favorite the career
      await axios.post('/api/favorites/careers', {
        userId: user?.id,
        careerId: data.career.id
      });

      // 8. Create financial projection using the calculation IDs
      const financialData = {
        userId: user?.id,
        name: `${data.college.name} - ${data.fieldOfStudy} - ${data.career.title}`,
        projectionData: {
          ages: [20, 21, 22], // Default 2-year projection
          netWorth: [-studentLoanAmount, -studentLoanAmount, data.career.salary - studentLoanAmount],
          income: [0, 0, data.career.salary],
          expenses: [totalCost/2, totalCost/2, totalCost * 0.1] // Divide total cost over 2 years
        },
        collegeCalculationId: collegeCalc.data.id,
        careerCalculationId: careerCalc.data.id,
        timeframe: 3,
        startingAge: 20,
        startingSavings: 0,
        income: data.career.salary,
        expenses: totalCost/2,
        studentLoanDebt: studentLoanAmount,
        includesCollegeCalculation: true,
        includesCareerCalculation: true,
        locationAdjusted: true,
        locationZipCode: data.location.zip_code,
        costOfLivingIndex: locationData.data.income_adjustment_factor || 1.0,
        incomeAdjustmentFactor: locationData.data.income_adjustment_factor || 1.0,
        emergencyFundAmount: 10000, // Default emergency fund
        personalLoanTermYears: 5, // Default loan term
        personalLoanInterestRate: 8.0, // Default interest rate
        incomeGrowth: 0.03 // Default 3% annual income growth
      };

      const projection = await axios.post('/api/financial-projections', financialData);

      // 9. Store pathway data in localStorage for the projections page
      const pathwayData = {
        educationType: '2year',
        selectedFieldOfStudy: data.fieldOfStudy,
        specificSchool: data.college.name,
        selectedProfession: data.career.title,
        location: {
          zipCode: data.location.zip_code,
          city: data.college.city,
          state: data.college.state
        },
        userJourney: `Pursuing a 2-year degree in ${data.fieldOfStudy} at ${data.college.name}`,
        zipCode: data.location.zip_code,
        selectedCareer: data.career.id
      };

      localStorage.setItem('pathwayData', JSON.stringify(pathwayData));
      console.log('Financial plan created successfully:', projection.data);

      // 10. Navigate to the financial projections page
      setTimeout(() => {
        setLocation('/projections?autoGenerate=true');
      }, 3000);

    } catch (error) {
      console.error('Error creating financial plan:', error);
      toast({
        title: "Error",
        description: "Failed to create financial plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            onComplete={handleComplete}
            onBack={() => console.log('Back button clicked')}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </Card>
    </div>
  );
}; 