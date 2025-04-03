// Test script to verify the financial calculator functionality
import { spawn } from 'child_process';

// Sample data (minimal test case)
const inputData = {
  startAge: 25,
  yearsToProject: 10,
  pathType: "baseline",
  assets: [
    {
      type: "investment",
      name: "Savings Account",
      initialValue: 10000,
      growthRate: 0.02
    }
  ],
  liabilities: [
    {
      type: "loan",
      name: "Student Loan",
      initialBalance: 20000,
      interestRate: 0.05,
      termYears: 10
    }
  ],
  incomes: [
    {
      type: "salary",
      name: "Primary Job",
      annualAmount: 60000,
      growthRate: 0.03
    }
  ],
  expenditures: [
    {
      type: "living",
      name: "Living Expenses",
      annualAmount: 40000,
      inflationRate: 0.02
    }
  ],
  milestones: []
};

// Spawn the Python process
const pythonProcess = spawn('python3', ['server/python/calculator.py']);

// Send input data to Python process
pythonProcess.stdin.write(JSON.stringify(inputData));
pythonProcess.stdin.end();

// Collect output data
let resultData = '';
let errorData = '';

pythonProcess.stdout.on('data', (data) => {
  resultData += data.toString();
});

pythonProcess.stderr.on('data', (data) => {
  errorData += data.toString();
  console.error('Python stderr:', data.toString());
});

// Process results when Python process exits
pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Python script exited with code ${code}`);
    console.error('Error:', errorData);
    process.exit(1);
  }
  
  try {
    // Try to parse the output as JSON
    const result = JSON.parse(resultData);
    console.log('Test successful! Received valid JSON result:');
    console.log('Net worth projection (first few years):', result.netWorth.slice(0, 5));
    console.log('Income projection (first few years):', result.income.slice(0, 5));
    console.log('Expenses projection (first few years):', result.expenses.slice(0, 5));
    
    // Count the number of projection years
    console.log(`Projection covers ${result.netWorth.length} years as expected`);
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to parse Python output:', error);
    console.error('Raw output:', resultData);
    process.exit(1);
  }
});