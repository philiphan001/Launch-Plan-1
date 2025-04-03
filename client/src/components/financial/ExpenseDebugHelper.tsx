import React from 'react';

interface ExpenseDebugHelperProps {
  housing: number[];
  transportation: number[];
  food: number[];
  healthcare: number[];
  discretionary: number[];
}

const ExpenseDebugHelper = ({
  housing,
  transportation,
  food,
  healthcare,
  discretionary,
}: ExpenseDebugHelperProps) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4 mb-4">
      <h3 className="text-md font-medium mb-2">Expense Debug Info</h3>
      <div className="text-sm space-y-2">
        <div>
          <strong>Housing expenses length:</strong> {housing?.length || 0}
          <br />
          <strong>Housing values:</strong>{" "}
          {housing?.map((val, i) => 
            <span key={i} className="mr-1">
              Year {i}: ${val?.toLocaleString() || 0}{i < (housing?.length || 0) - 1 ? "," : ""}
            </span>
          )}
        </div>
        <div>
          <strong>Transportation expenses length:</strong> {transportation?.length || 0}
          <br />
          <strong>First 3 values:</strong>{" "}
          {transportation?.slice(0, 3).map((val, i) => 
            <span key={i} className="mr-1">
              Year {i}: ${val?.toLocaleString() || 0}{i < Math.min(3, (transportation?.length || 0)) - 1 ? "," : ""}
            </span>
          )}
        </div>
        <div>
          <strong>Food expenses length:</strong> {food?.length || 0}
          <br />
          <strong>First 3 values:</strong>{" "}
          {food?.slice(0, 3).map((val, i) => 
            <span key={i} className="mr-1">
              Year {i}: ${val?.toLocaleString() || 0}{i < Math.min(3, (food?.length || 0)) - 1 ? "," : ""}
            </span>
          )}
        </div>
        <div>
          <strong>Healthcare expenses length:</strong> {healthcare?.length || 0}
          <br />
          <strong>First 3 values:</strong>{" "}
          {healthcare?.slice(0, 3).map((val, i) => 
            <span key={i} className="mr-1">
              Year {i}: ${val?.toLocaleString() || 0}{i < Math.min(3, (healthcare?.length || 0)) - 1 ? "," : ""}
            </span>
          )}
        </div>
        <div>
          <strong>Discretionary expenses length:</strong> {discretionary?.length || 0}
          <br />
          <strong>First 3 values:</strong>{" "}
          {discretionary?.slice(0, 3).map((val, i) => 
            <span key={i} className="mr-1">
              Year {i}: ${val?.toLocaleString() || 0}{i < Math.min(3, (discretionary?.length || 0)) - 1 ? "," : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDebugHelper;