// Helper function to create a test projection with milestones
// This is just for testing purposes

export const createTestProjectionData = (age: number = 25, years: number = 10) => {
  const testMilestones = [
    {
      id: 999,
      userId: 1,
      type: "home",
      title: "Buy a Home",
      yearsAway: 3,
      date: null,
      homeValue: 350000,
      homeDownPayment: 70000,
      homeMonthlyPayment: 1800,
      financialImpact: 70000,
      active: true,
      completed: false
    },
    {
      id: 998,
      userId: 1,
      type: "car",
      title: "Buy a Car",
      yearsAway: 1,
      date: null,
      carValue: 35000,
      carDownPayment: 7000,
      carMonthlyPayment: 500,
      financialImpact: 7000,
      active: true,
      completed: false
    }
  ];

  // Generate annual data arrays
  const ages = Array.from({ length: years + 1 }, (_, i) => age + i);
  
  // Base financial data - this is what would normally come from the Python calculator
  // Create dummy data for years + 1 entries (including starting year)
  const netWorth = Array.from({ length: years + 1 }, (_, i) => 10000 + i * 30000);
  const income = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 50000 + i * 2000);
  const expenses = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 30000 + i * 1000);
  const assets = Array.from({ length: years + 1 }, (_, i) => 10000 + i * 30000);
  const liabilities = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 7 ? 10000 - i * 1500 : 0);
  const cashFlow = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : income[i] - expenses[i]);
  
  // Expense breakdown - these arrays should sum to expenses
  const housing = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 3 ? 12000 : 21600);
  const transportation = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 1 ? 3600 : 6000);
  const food = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 6000 + i * 100);
  const healthcare = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 3600 + i * 150);
  const personalInsurance = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 1200 + i * 20);
  const entertainment = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 2400 + i * 50);
  const apparel = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 1200 + i * 20);
  const services = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 1800 + i * 30);
  const other = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : 1200 + i * 30);
  
  // Tax breakdown (also part of expenses)
  const payrollTax = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : income[i] * 0.0765);
  const federalTax = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : income[i] * 0.15);
  const stateTax = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : income[i] * 0.05);
  
  // Asset breakdown
  const homeValue = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 3 ? 0 : 350000 + i * 5000);
  const mortgage = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 3 ? 0 : 280000 - (i - 3) * 8000);
  const carValue = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 1 ? 0 : 35000 - i * 4000);
  const carLoan = Array.from({ length: years + 1 }, (_, i) => i === 0 ? 0 : i < 1 ? 0 : 28000 - i * 5000);
  
  // Create and return the complete projection data
  return {
    ages,
    netWorth,
    income,
    expenses,
    assets,
    liabilities,
    cashFlow,
    
    // Expense breakdown
    housing,
    transportation,
    food,
    healthcare,
    personalInsurance,
    entertainment,
    apparel,
    services,
    other,
    
    // Tax breakdown
    payrollTax,
    federalTax,
    stateTax,
    
    // Asset breakdown
    homeValue,
    mortgage,
    carValue,
    carLoan,
    
    // Milestones
    milestones: testMilestones
  };
};