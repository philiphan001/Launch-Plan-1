import React, { useState } from 'react';
import { FourYearCollegePath } from '../pathways/FourYearCollegePath';
import { Card } from '@/components/ui/card';
import axios from 'axios';
import { College } from '@/types/college';
import { Career } from '@/types/career';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

interface Location {
  zip_code: string;
}

interface FourYearCollegePathTestProps {
  isAuthenticated?: boolean;
  user?: {
    id: number;
  };
}

export const FourYearCollegePathTest: React.FC<FourYearCollegePathTestProps> = ({
  isAuthenticated = false,
  user
}) => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

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
        educationType: '4year',
        selectedFieldOfStudy: data.fieldOfStudy,
        specificSchool: data.college.name,
        selectedProfession: data.career.title,
        location: {
          zipCode: data.location.zip_code,
          city: data.college.city,
          state: data.college.state
        },
        userJourney: `Pursuing a 4-year degree in ${data.fieldOfStudy} at ${data.college.name}`,
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
        roomAndBoardUsed: roomAndBoard,
        userId: user?.id // Add the user ID here
      });

      // 5. Create career calculation
      const careerCalc = await axios.post('/api/career-calculations', {
        careerId: data.career.id,
        projectedSalary: data.career.salary || 40000, // Default salary if none provided
        education: data.fieldOfStudy,
        locationZip: data.location.zip_code,
        adjustedForLocation: true,
        includedInProjection: true,
        notes: `Auto-generated from Pathways for ${data.career.title}`,
        userId: user?.id // Add the user ID here
      });

      // 6. Auto-favorite the college
      await axios.post('/api/favorites/colleges', {
        collegeId: data.college.id,
        userId: user?.id // Add the user ID here
      });

      // 7. Auto-favorite the career
      await axios.post('/api/favorites/careers', {
        careerId: data.career.id,
        userId: user?.id // Add the user ID here
      });

      // 8. Create financial projection using the calculation IDs
      const financialData = {
        userId: user?.id,
        name: `${data.college.name} - ${data.fieldOfStudy} - ${data.career.title}`,
        projectionData: {
          ages: [20, 21, 22, 23, 24], // 5 years total: 4 years of school + 1 year post-graduation
          netWorth: [
            -studentLoanAmount,
            -(studentLoanAmount * 1.25), // Accumulating debt
            -(studentLoanAmount * 1.5),
            -(studentLoanAmount * 1.75),
            (data.career.salary * 0.8) - (studentLoanAmount * 2) // First year salary minus accumulated debt
          ],
          income: [
            5000, // Part-time work during school
            5000,
            7500,
            7500,
            data.career.salary // Full salary after graduation
          ],
          expenses: [
            totalCost/4 + 12000, // College costs + living expenses
            totalCost/4 + 12000,
            totalCost/4 + 12000,
            totalCost/4 + 12000,
            (totalCost * 0.1) + 24000 // Loan payments + higher living expenses post-graduation
          ]
        },
        collegeCalculationId: collegeCalc.data.id,
        careerCalculationId: careerCalc.data.id,
        timeframe: 5, // 5 years total
        startingAge: 20,
        startingSavings: 0,
        income: data.career.salary,
        expenses: totalCost/4 + 12000, // Annual college costs + living expenses
        studentLoanDebt: studentLoanAmount * 2, // Total accumulated debt
        includesCollegeCalculation: true,
        includesCareerCalculation: true,
        locationAdjusted: true,
        locationZipCode: data.location.zip_code,
        costOfLivingIndex: locationData.data.income_adjustment_factor || 1.0,
        incomeAdjustmentFactor: locationData.data.income_adjustment_factor || 1.0,
        emergencyFundAmount: 15000, // Higher emergency fund for 4-year path
        personalLoanTermYears: 10, // Longer loan term for higher debt
        personalLoanInterestRate: 6.8, // Standard federal student loan rate
        incomeGrowth: 0.04 // Slightly higher income growth for 4-year degree
      };

      const projection = await axios.post('/api/financial-projections', financialData);

      // 9. Store pathway data in localStorage for the projections page
      const pathwayData = {
        educationType: '4year',
        selectedFieldOfStudy: data.fieldOfStudy,
        specificSchool: data.college.name,
        selectedProfession: data.career.title,
        location: {
          zipCode: data.location.zip_code,
          city: data.college.city,
          state: data.college.state
        },
        userJourney: `Pursuing a 4-year degree in ${data.fieldOfStudy} at ${data.college.name}`,
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