/**
 * This script tests the handling of workStatus="no" for education milestones
 * in the financial calculator.
 */

import axios from 'axios';

async function createTestMilestone() {
  const userId = 1; // Use an existing user ID from your database
  
  // Education milestone with explicit workStatus="no"
  const testMilestone = {
    userId,
    type: "education",
    title: "Test Graduate School",
    date: "2025-01-01",
    yearsAway: 2,
    educationCost: 80000,
    educationType: "mba",
    educationYears: 2,
    educationAnnualCost: 40000,
    educationAnnualLoan: 20000,
    targetOccupation: "Business Manager",
    workStatus: "no", // This is the value we're testing
    partTimeIncome: 0,
    returnToSameProfession: false,
  };

  try {
    console.log("Creating test milestone with workStatus='no'");
    const createResponse = await axios.post('http://localhost:5000/api/milestones', testMilestone);
    console.log("Milestone created:", createResponse.data);
    
    // Now fetch the milestone to verify workStatus
    const milestoneId = createResponse.data.id;
    const getResponse = await axios.get(`http://localhost:5000/api/milestones/${milestoneId}`);
    
    console.log("Retrieved milestone:", JSON.stringify(getResponse.data, null, 2));
    console.log("workStatus value:", getResponse.data.workStatus);
    console.log("workStatus type:", typeof getResponse.data.workStatus);
    
    // Now run a test projection to see if the workStatus is preserved
    const projectionData = {
      startAge: 28,
      yearsToProject: 10,
      costOfLivingFactor: 1.0,
      emergencyFundAmount: 10000,
      personalLoanTermYears: 5,
      personalLoanInterestRate: 8,
      assets: [{
        type: "investment",
        name: "Savings",
        initialValue: 20000,
        growthRate: 0.03
      }],
      liabilities: [],
      incomes: [{
        type: "salary",
        name: "Primary Income",
        annualAmount: 70000,
        growthRate: 0.03,
        startYear: 0
      }],
      expenditures: [
        {
          type: "housing",
          name: "Housing",
          annualAmount: 18000,
          inflationRate: 0.03
        },
        {
          type: "transportation",
          name: "Transportation",
          annualAmount: 5000,
          inflationRate: 0.03
        }
      ],
      milestones: [getResponse.data]
    };
    
    console.log("Running financial projection with the milestone...");
    const projectionResponse = await axios.post('http://localhost:5000/api/calculate/financial-projection', 
      projectionData, 
      { 
        headers: { 'Content-Type': 'application/json' },
        maxBodyLength: Infinity
      }
    );
    
    console.log("Projection data received. Checking income during education years...");
    const income = projectionResponse.data.income;
    console.log("Income array:", income);
    
    // The education milestone starts at year 2
    const beforeEducation = income[1];
    const duringEducation1 = income[2];
    const duringEducation2 = income[3];
    const afterEducation = income[4];
    
    console.log("\nTEST RESULTS:");
    console.log("Year 1 (Before education): $" + beforeEducation);
    console.log("Year 2 (During education, year 1): $" + duringEducation1);
    console.log("Year 3 (During education, year 2): $" + duringEducation2);
    console.log("Year 4 (After education): $" + afterEducation);
    
    if (duringEducation1 === 0 && duringEducation2 === 0) {
      console.log("\n✅ TEST PASSED: Income is correctly zeroed during education years with 'no' workStatus!");
    } else {
      console.log("\n❌ TEST FAILED: Income should be zero during education years but got non-zero values.");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  }
}

createTestMilestone();