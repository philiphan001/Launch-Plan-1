// Test script to create a financial projection with negative cash flow
// This will trigger personal loan creation in the Python calculator

import axios from 'axios';

// Financial projection data with high expenses relative to income
const projectionData = {
  startAge: 27,
  yearsToProject: 5,
  pathType: 'baseline',
  costOfLivingFactor: 1,
  emergencyFundAmount: 5000,
  personalLoanTermYears: 5,
  personalLoanInterestRate: 0.08,
  retirementContributionRate: 0.05,
  retirementGrowthRate: 0.06,
  incomes: [
    {
      type: 'salary',
      name: 'Primary Income',
      annualAmount: 50000,
      growthRate: 0.03,
      startYear: 0,
      endYear: 10
    }
  ],
  expenditures: [
    {
      type: 'housing',
      name: 'Housing',
      annualAmount: 25000,
      inflationRate: 0.02
    },
    {
      type: 'transportation',
      name: 'Transportation',
      annualAmount: 6000,
      inflationRate: 0.02
    },
    {
      type: 'living',
      name: 'Food',
      annualAmount: 10000,
      inflationRate: 0.02
    },
    {
      type: 'living',
      name: 'Healthcare',
      annualAmount: 8000,
      inflationRate: 0.03
    },
    {
      type: 'living',
      name: 'Other Expenses',
      annualAmount: 10000,
      inflationRate: 0.02
    }
  ],
  assets: [
    {
      type: 'investment',
      name: 'Savings Account',
      initialValue: 10000,
      growthRate: 0.02
    }
  ],
  liabilities: [
    {
      type: 'mortgage',
      name: 'Mortgage',
      initialBalance: 250000,
      interestRate: 0.045,
      termYears: 30,
    }
  ],
  milestones: [
    {
      type: 'job',
      year: 1,
      title: 'Job Change',
      description: 'Change to a new job with higher income',
      income_change: 5000
    },
    {
      type: 'car',
      year: 2,
      title: 'Buy Car',
      description: 'Purchase a new car',
      carValue: 30000,
      downPayment: 5000
    }
  ]
};

async function runTest() {
  try {
    console.log('Sending financial projection request with potential negative cash flow...');
    const response = await axios.post('http://localhost:5000/api/calculate/financial-projection', projectionData);
    
    console.log('Response received!');
    
    // Output key fields
    const result = response.data;
    console.log('Ages:', result.ages);
    console.log('Income:', result.income);
    console.log('Expenses:', result.expenses);
    console.log('Cash Flow:', result.cashFlow);
    
    // Output liability breakdown
    console.log('\nLiability Breakdown:');
    console.log('Total Liabilities:', result.liabilities);
    console.log('Mortgage:', result.mortgage);
    console.log('Car Loan:', result.carLoan);
    console.log('Student Loan:', result.studentLoan);
    console.log('Personal Loans:', result.personalLoans);
    
    // Check for negative cash flow
    const negativeYears = result.cashFlow.map((flow, i) => {
      if (flow < 0) return { year: result.ages[i], amount: flow };
      return null;
    }).filter(item => item !== null);
    
    console.log('\nYears with negative cash flow:');
    console.log(negativeYears);
    
    // Check if personal loans were created
    const hasPersonalLoans = result.personalLoans.some(loan => loan > 0);
    console.log('\nDoes projection have personal loans?', hasPersonalLoans);
    
    if (hasPersonalLoans) {
      console.log('Personal loans by year:');
      result.personalLoans.forEach((loan, i) => {
        if (loan > 0) {
          console.log(`Age ${result.ages[i]}: $${loan}`);
        }
      });
    } else {
      console.log('No personal loans created despite negative cash flow.');
    }
  } catch (error) {
    console.error('Error running test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

runTest();