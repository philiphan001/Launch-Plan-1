import React from 'react';

interface ExpenseDebugComponentProps {
  projectionData: any;
}

export const ExpenseDebugComponent: React.FC<ExpenseDebugComponentProps> = ({ projectionData }) => {
  // Extract the first year's data for each expense category
  const expenseCategories = [
    'housing', 'transportation', 'food', 'healthcare', 
    'personalInsurance', 'apparel', 'services', 'entertainment', 
    'other', 'education', 'childcare', 'debt', 'discretionary', 'taxes'
  ];

  // Build a table of expense data for each year
  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Expense Debug Data</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="px-2 py-1 text-left">Category</th>
              <th className="px-2 py-1 text-left">Data Present</th>
              <th className="px-2 py-1 text-left">First 3 Years</th>
              <th className="px-2 py-1 text-left">From Python</th>
              <th className="px-2 py-1 text-left">From 'Expenses' suffix</th>
            </tr>
          </thead>
          <tbody>
            {expenseCategories.map(category => {
              const categoryData = projectionData[category];
              const categoryExpensesData = projectionData[`${category}Expenses`];
              
              return (
                <tr key={category} className="border-b hover:bg-slate-50">
                  <td className="px-2 py-1 font-semibold">{category}</td>
                  <td className="px-2 py-1">{categoryData ? 'Yes' : 'No'}</td>
                  <td className="px-2 py-1">
                    {categoryData 
                      ? categoryData.slice(0, 3).map((v: number) => `$${v.toLocaleString()}`).join(', ')
                      : 'N/A'
                    }
                  </td>
                  <td className="px-2 py-1">{categoryData ? 'Direct' : 'No'}</td>
                  <td className="px-2 py-1">{categoryExpensesData ? 'Yes' : 'No'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <h4 className="text-md font-semibold">Raw Data Object Keys:</h4>
        <div className="bg-slate-100 p-2 rounded text-xs mt-2">
          {Object.keys(projectionData).join(', ')}
        </div>
      </div>
    </div>
  );
};