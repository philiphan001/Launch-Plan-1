import React from 'react';

interface ExpenseDebugProps {
  projectionData: any;
}

const ExpenseDebugHelper: React.FC<ExpenseDebugProps> = ({ projectionData }) => {
  // This is a more detailed debug helper that shows the raw data structure
  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-auto max-h-[500px]">
      <h3 className="text-lg font-semibold mb-4">Expense Data Structure</h3>
      
      {/* Show the property names and types */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Properties and Types</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(projectionData).map(([key, value]) => (
            <div key={key} className="border p-2 rounded">
              <span className="font-semibold">{key}</span>: {Array.isArray(value) 
                ? `Array[${(value as any[]).length}]` 
                : typeof value}
            </div>
          ))}
        </div>
      </div>
      
      {/* Show the first year values for expense categories */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">First Year Values</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(projectionData)
            .filter(([key, value]) => Array.isArray(value) && (
              key.includes('expense') || 
              ['housing', 'transportation', 'food', 'healthcare', 'personalInsurance', 
               'apparel', 'services', 'entertainment', 'other', 'education', 
               'childcare', 'debt', 'discretionary', 'taxes'].includes(key)
            ))
            .map(([key, value]) => (
              <div key={key} className="border p-2 rounded">
                <span className="font-semibold">{key}</span>: {(value as any[])[0]?.toLocaleString 
                  ? `$${(value as any[])[0]?.toLocaleString()}`
                  : (value as any[])[0]}
              </div>
            ))
          }
        </div>
      </div>
      
      {/* Raw JSON for detailed inspection */}
      <div>
        <h4 className="text-md font-medium mb-2">Raw Data (First Year Only)</h4>
        <div className="bg-gray-100 p-2 rounded-md text-xs font-mono whitespace-pre overflow-x-auto">
          {JSON.stringify(
            Object.fromEntries(
              Object.entries(projectionData)
                .filter(([key, value]) => Array.isArray(value))
                .map(([key, value]) => [key, (value as any[])[0]])
            ), 
            null, 2
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDebugHelper;