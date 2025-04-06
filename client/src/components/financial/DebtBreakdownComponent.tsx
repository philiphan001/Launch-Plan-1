import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DebtBreakdownProps {
  projectionData: any;
}

// Colors for different debt types
const DEBT_COLORS = {
  mortgage: '#8884d8',
  studentLoan: '#82ca9d',
  carLoan: '#ffc658',
  personalLoans: '#ff8042',
  other: '#d0ed57'
};

const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-semibold">{`Age: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: $${(entry.value as number).toLocaleString()}`}
          </p>
        ))}
        {payload.length > 1 && (
          <p className="font-semibold text-gray-800">
            {`Total: $${payload.reduce((sum, entry) => sum + (entry.value as number), 0).toLocaleString()}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ 
  active, 
  payload 
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p style={{ color: payload[0].color }}>
          {`$${(payload[0].value as number).toLocaleString()}`}
        </p>
        <p>
          {`${payload[0].payload.percent}% of total debt`}
        </p>
      </div>
    );
  }
  return null;
};

export const DebtBreakdownComponent: React.FC<DebtBreakdownProps> = ({ projectionData }) => {
  const [activeTab, setActiveTab] = useState('by-type');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Debug: Log the entire projection data to check its structure
  console.log('Projection Data Keys:', Object.keys(projectionData));
  
  // Extract necessary data
  const ages = projectionData.ages || [];
  const debtTotal = projectionData.debt || [];
  
  // Loan type data
  const mortgageData = projectionData.mortgage || [];
  const studentLoanData = projectionData.studentLoan || [];
  const carLoanData = projectionData.carLoan || [];
  const personalLoansData = projectionData.personalLoans || [];
  
  // Debug: Log the personal loans data to see if it's coming through
  console.log('Personal Loans Data:', personalLoansData);

  // Interest/principal data (if needed for comparison)
  const debtInterest = projectionData.debtInterest || [];
  const debtPrincipal = projectionData.debtPrincipal || [];

  // Create data for the stacked bar chart by loan type
  const chartDataByType = ages.map((age: number, index: number) => {
    const mortgage = mortgageData[index] || 0;
    const studentLoan = studentLoanData[index] || 0;
    const carLoan = carLoanData[index] || 0;
    const personalLoans = personalLoansData[index] || 0;
    
    // If there's a discrepancy between the sum of individual loans and total debt,
    // assign the difference to "Other"
    const sumOfKnownLoans = mortgage + studentLoan + carLoan + personalLoans;
    const total = debtTotal[index] || 0;
    const other = Math.max(0, total - sumOfKnownLoans);
    
    return {
      age,
      'Mortgage': mortgage,
      'Student Loan': studentLoan,
      'Car Loan': carLoan,
      'Personal Loans': personalLoans,
      'Other': other,
      'Total': total
    };
  });

  // Create data for the stacked bar chart by principal/interest
  const chartDataByComponent = ages.map((age: number, index: number) => ({
    age,
    'Principal': debtPrincipal[index] || 0,
    'Interest': debtInterest[index] || 0,
    'Total': debtTotal[index] || 0
  }));

  // Filter out zero values to present cleaner data
  const filteredChartDataByType = chartDataByType.filter((data: { Total: number }) => data.Total > 0);
  const filteredChartDataByComponent = chartDataByComponent.filter((data: { Total: number }) => data.Total > 0);
  
  // If no debt data available, show a message
  if (filteredChartDataByType.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Breakdown</CardTitle>
          <CardDescription>Showing debt payments by loan type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No debt payments in your projection
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to handle year selection for pie chart
  const handleYearSelect = (data: any) => {
    if (data && data.activeLabel) {
      setSelectedYear(data.activeLabel);
    }
  };

  // Get the selected year index or default to the first year with debt
  const selectedYearIndex = selectedYear ? 
    ages.findIndex((age: number) => age === selectedYear) : 
    ages.findIndex((age: number, index: number) => debtTotal[index] > 0);

  // Create pie chart data for the selected year
  const pieData = selectedYearIndex >= 0 ? [
    { name: 'Mortgage', value: mortgageData[selectedYearIndex] || 0, color: DEBT_COLORS.mortgage, 
      percent: ((mortgageData[selectedYearIndex] || 0) / debtTotal[selectedYearIndex] * 100).toFixed(1) },
    { name: 'Student Loan', value: studentLoanData[selectedYearIndex] || 0, color: DEBT_COLORS.studentLoan,
      percent: ((studentLoanData[selectedYearIndex] || 0) / debtTotal[selectedYearIndex] * 100).toFixed(1) },
    { name: 'Car Loan', value: carLoanData[selectedYearIndex] || 0, color: DEBT_COLORS.carLoan,
      percent: ((carLoanData[selectedYearIndex] || 0) / debtTotal[selectedYearIndex] * 100).toFixed(1) },
    { name: 'Personal Loans', value: personalLoansData[selectedYearIndex] || 0, color: DEBT_COLORS.personalLoans,
      percent: ((personalLoansData[selectedYearIndex] || 0) / debtTotal[selectedYearIndex] * 100).toFixed(1) }
  ].filter((item) => item.value > 0) : [];

  // Create data for the table view
  const tableData = ages.map((age: number, index: number) => ({
    age,
    mortgage: mortgageData[index] || 0,
    studentLoan: studentLoanData[index] || 0,
    carLoan: carLoanData[index] || 0,
    personalLoans: personalLoansData[index] || 0,
    total: debtTotal[index] || 0
  })).filter((data: { total: number }) => data.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Breakdown</CardTitle>
        <CardDescription>Analyzing your debt by loan type and payment components</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="by-type" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="by-type">By Loan Type</TabsTrigger>
            <TabsTrigger value="by-component">Principal vs Interest</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="by-type" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredChartDataByType}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    onClick={handleYearSelect}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
                    <YAxis 
                      label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                      tickFormatter={(value) => `$${value.toLocaleString()}`} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Mortgage" stackId="a" fill={DEBT_COLORS.mortgage} />
                    <Bar dataKey="Student Loan" stackId="a" fill={DEBT_COLORS.studentLoan} />
                    <Bar dataKey="Car Loan" stackId="a" fill={DEBT_COLORS.carLoan} />
                    <Bar dataKey="Personal Loans" stackId="a" fill={DEBT_COLORS.personalLoans} />
                    <Bar dataKey="Other" stackId="a" fill={DEBT_COLORS.other} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-80">
                <div className="text-center mb-2 text-sm text-gray-600">
                  {selectedYearIndex >= 0 && (
                    <p>Debt composition at age {ages[selectedYearIndex]} (click chart years to update)</p>
                  )}
                </div>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This breakdown shows how your debt is distributed across different loan types over time. 
              Mortgage and student loans are typically long-term debts with lower interest rates, while 
              personal loans and credit card debt usually have higher rates. Click on a year in the bar chart 
              to see a detailed breakdown for that year in the pie chart.
            </p>
          </TabsContent>
          
          <TabsContent value="by-component" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredChartDataByComponent}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
                  <YAxis 
                    label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Principal" stackId="a" fill="#8884d8" name="Principal" />
                  <Bar dataKey="Interest" stackId="a" fill="#82ca9d" name="Interest" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500">
              This chart shows how your debt payments are split between principal and interest over time.
              Interest payments represent the cost of borrowing, while principal payments reduce your debt balance.
              Early in a loan's life, payments are mostly interest; as time passes, more goes toward principal.
            </p>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mortgage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Loan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Loan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal Loans</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Debt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row: {
                    age: number;
                    mortgage: number;
                    studentLoan: number;
                    carLoan: number;
                    personalLoans: number;
                    total: number;
                  }, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.mortgage.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.studentLoan.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.carLoan.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.personalLoans.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};