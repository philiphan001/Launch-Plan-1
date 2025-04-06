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
  TooltipProps
} from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface DebtBreakdownProps {
  projectionData: any;
}

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

export const DebtBreakdownComponent: React.FC<DebtBreakdownProps> = ({ projectionData }) => {
  const [activeTab, setActiveTab] = useState('chart');

  // Extract necessary data
  const ages = projectionData.ages || [];
  const debtTotal = projectionData.debt || [];
  const debtInterest = projectionData.debtInterest || [];
  const debtPrincipal = projectionData.debtPrincipal || [];

  // Create data for the stacked bar chart
  const chartData = ages.map((age: number, index: number) => ({
    age,
    'Principal': debtPrincipal[index] || 0,
    'Interest': debtInterest[index] || 0,
    'Total': debtTotal[index] || 0
  }));

  // Filter out zero values to present cleaner data
  const filteredChartData = chartData.filter((data: { Total: number }) => data.Total > 0);
  
  // If no debt data available, show a message
  if (filteredChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Debt Breakdown</CardTitle>
          <CardDescription>Showing principal vs interest for debt payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No debt payments in your projection
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create data for the table view
  const tableData = ages.map((age: number, index: number) => ({
    age,
    principal: debtPrincipal[index] || 0,
    interest: debtInterest[index] || 0,
    total: debtTotal[index] || 0,
    interestPercent: debtTotal[index] ? ((debtInterest[index] || 0) / debtTotal[index] * 100).toFixed(1) : '0.0'
  })).filter((data: { total: number }) => data.total > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Breakdown</CardTitle>
        <CardDescription>Showing principal vs interest for debt payments</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredChartData}
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
            </p>
          </TabsContent>
          
          <TabsContent value="table">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row: {
                    age: number;
                    principal: number;
                    interest: number;
                    total: number;
                    interestPercent: string;
                  }, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.principal.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.interest.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.total.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.interestPercent}%</td>
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