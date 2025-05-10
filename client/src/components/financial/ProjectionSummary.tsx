import React from 'react';
import { formatCurrency } from '@/lib/utils';

// Interface for projection summary data to be used throughout the app
export interface ProjectionSummaryData {
  college?: {
    id: number;
    name: string;
    type?: string;
    totalCost: number;
    studentLoanAmount: number;
    inState?: boolean;
  };
  career?: {
    id: number;
    title: string;
    entryLevelSalary: number;
    projectedSalary: number;
    education?: string;
  };
  location?: {
    zipCode: string;
    city: string;
    state: string;
    incomeAdjustmentFactor?: number;
  };
  financials: {
    startingSavings: number;
    income: number;
    expenses: number;
    studentLoanDebt: number;
    emergencyFundAmount: number;
  };
}

interface ProjectionSummaryProps {
  data: ProjectionSummaryData | null;
  isLoading: boolean;
  renderEditButtons?: (args: { section: 'education' | 'career' | 'location' }) => React.ReactNode;
}

// ProjectionSummary component
const ProjectionSummary: React.FC<ProjectionSummaryProps> = ({ data, isLoading, renderEditButtons }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <p className="text-gray-500">No projection data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Current Projection Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Education Section */}
        <div className="border-r pr-4">
          <h4 className="font-medium text-gray-600 flex items-center">
            Education Path
            {renderEditButtons && renderEditButtons({ section: 'education' })}
          </h4>
          {data.college ? (
            <div className="mt-2">
              <p className="text-sm font-medium">{data.college.name}</p>
              <p className="text-sm text-gray-500">
                Total Cost: {formatCurrency(data.college.totalCost)}
              </p>
              <p className="text-sm text-gray-500">
                Student Loans: {formatCurrency(data.college.studentLoanAmount)}
              </p>
              {data.college.type && (
                <p className="text-sm text-gray-500">
                  Type: {data.college.type}
                </p>
              )}
              {data.college.inState !== undefined && (
                <p className="text-sm text-gray-500">
                  {data.college.inState ? 'In-State' : 'Out-of-State'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No college selected</p>
          )}
        </div>

        {/* Career Section */}
        <div className="border-r px-4">
          <h4 className="font-medium text-gray-600 flex items-center">
            Career Path
            {renderEditButtons && renderEditButtons({ section: 'career' })}
          </h4>
          {data.career ? (
            <div className="mt-2">
              <p className="text-sm font-medium">{data.career.title}</p>
              <p className="text-sm text-gray-500">
                Entry Salary: {formatCurrency(data.career.entryLevelSalary)}
              </p>
              <p className="text-sm text-gray-500">
                Projected: {formatCurrency(data.career.projectedSalary)}
              </p>
              {data.career.education && (
                <p className="text-sm text-gray-500">
                  Education: {data.career.education}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No career selected</p>
          )}
        </div>

        {/* Location Section */}
        <div className="pl-4">
          <h4 className="font-medium text-gray-600 flex items-center">
            Location
            {renderEditButtons && renderEditButtons({ section: 'location' })}
          </h4>
          {data.location ? (
            <div className="mt-2">
              <p className="text-sm font-medium">
                {data.location.city}, {data.location.state}
              </p>
              {data.location.incomeAdjustmentFactor && (
                <p className="text-sm text-gray-500">
                  Cost of Living: {(data.location.incomeAdjustmentFactor * 100).toFixed(0)}% of average
                </p>
              )}
              <p className="text-sm text-gray-500">
                Zip Code: {data.location.zipCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No location selected</p>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-medium text-gray-600 mb-2">Financial Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-gray-500">Savings</p>
            <p className="font-medium">{formatCurrency(data.financials.startingSavings)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Income</p>
            <p className="font-medium">{formatCurrency(data.financials.income)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Expenses</p>
            <p className="font-medium">{formatCurrency(data.financials.expenses)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Student Debt</p>
            <p className="font-medium">{formatCurrency(data.financials.studentLoanDebt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Emergency Fund</p>
            <p className="font-medium">{formatCurrency(data.financials.emergencyFundAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectionSummary;