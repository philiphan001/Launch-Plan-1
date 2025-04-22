import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CashFlowTableProps {
  ages: number[];
  income: number[];
  spouseIncome?: number[] | null;
  expenses?: number[] | null;
  
  // Base cost of living categories (from location_cost_of_living table)
  housingExpenses?: number[] | null;
  transportationExpenses?: number[] | null;
  foodExpenses?: number[] | null;
  healthcareExpenses?: number[] | null;
  personalInsuranceExpenses?: number[] | null;
  apparelExpenses?: number[] | null;
  servicesExpenses?: number[] | null;
  entertainmentExpenses?: number[] | null;
  otherExpenses?: number[] | null;
  
  // Milestone-driven categories
  educationExpenses?: number[] | null;
  childcareExpenses?: number[] | null;
  debtExpenses?: number[] | null;
  discretionaryExpenses?: number[] | null;
  
  // Assets and liabilities
  assets?: number[] | null;
  liabilities?: number[] | null;
  netWorth?: number[] | null;
  homeValue?: number[] | null;
  mortgage?: number[] | null;
  carValue?: number[] | null;
  carLoan?: number[] | null;
  studentLoan?: number[] | null;
  educationLoans?: number[] | null; // Undergraduate education loans
  graduateSchoolLoans?: number[] | null; // Graduate school loans
  personalLoans?: number[] | null; // Added personal loans tracking
}

const CashFlowTable: React.FC<CashFlowTableProps> = ({
  ages,
  income,
  spouseIncome,
  expenses,
  housingExpenses,
  transportationExpenses,
  foodExpenses,
  healthcareExpenses,
  personalInsuranceExpenses,
  apparelExpenses,
  servicesExpenses,
  entertainmentExpenses,
  otherExpenses,
  educationExpenses,
  childcareExpenses,
  debtExpenses,
  discretionaryExpenses,
  assets,
  liabilities,
  netWorth,
  homeValue,
  mortgage,
  carValue,
  carLoan,
  studentLoan,
  educationLoans,
  graduateSchoolLoans,
  personalLoans
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Debug loan data
  React.useEffect(() => {
    console.log("CashFlowTable loan data debug:");
    console.log("- studentLoan:", studentLoan);
    console.log("- educationLoans:", educationLoans);
    console.log("- graduateSchoolLoans:", graduateSchoolLoans);
    console.log("- personalLoans:", personalLoans);
    
    console.log("- Student loan first few values:", studentLoan?.slice(0, 5));
    console.log("- Education loans first few values:", educationLoans?.slice(0, 5));
    console.log("- Graduate school loans first few values:", graduateSchoolLoans?.slice(0, 5));
  }, [studentLoan, educationLoans, graduateSchoolLoans, personalLoans]);
  
  // Helper function to safely format monetary values
  const formatCurrency = (array: number[] | null | undefined, index: number): string => {
    if (!array || index >= array.length || array[index] === undefined || array[index] === null) {
      return "$0";
    }
    // Force to a number and handle decimal values
    const value = Number(array[index]);
    if (isNaN(value)) return "$0";
    return `$${value.toLocaleString()}`;
  };
  
  // Helper function to safely get a value with a default
  const getValue = (array: number[] | null | undefined, index: number): number => {
    if (!array || index >= array.length || array[index] === undefined || array[index] === null) {
      return 0;
    }
    const value = Number(array[index]);
    return isNaN(value) ? 0 : value;
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex justify-between w-full px-6 py-4 text-left">
          <h3 className="text-lg font-medium">Detailed Cash Flow Projection</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Year</TableHead>
                    <TableHead className="font-semibold">Age</TableHead>
                    <TableHead className="font-semibold">Income</TableHead>
                    <TableHead className="font-semibold">Spouse Income</TableHead>
                    <TableHead className="font-semibold">Total Income</TableHead>
                    <TableHead className="font-semibold">Total Expenses</TableHead>
                    <TableHead className="font-semibold">Net Cash Flow</TableHead>
                    <TableHead className="font-semibold">Net Worth</TableHead>
                    <TableHead className="font-semibold">Total Assets</TableHead>
                    <TableHead className="font-semibold">Total Liabilities</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ages && ages.length > 0 ? (
                    // Only render if ages array exists and has data
                    ages.map((age, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell>{i}</TableCell>
                        <TableCell>{age}</TableCell>
                        <TableCell>{formatCurrency(income, i)}</TableCell>
                        <TableCell>{formatCurrency(spouseIncome, i)}</TableCell>
                        <TableCell>${(getValue(income, i) + getValue(spouseIncome, i)).toLocaleString()}</TableCell>
                        <TableCell>{formatCurrency(expenses, i)}</TableCell>
                        <TableCell>
                          ${(getValue(income, i) + getValue(spouseIncome, i) - getValue(expenses, i)).toLocaleString()}
                        </TableCell>
                        <TableCell>{formatCurrency(netWorth, i)}</TableCell>
                        <TableCell>{formatCurrency(assets, i)}</TableCell>
                        <TableCell>{formatCurrency(liabilities, i)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    // Render placeholder row if no data is available
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-4">No projection data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 mb-3 px-6">
              <h4 className="text-md font-medium mb-2">Base Cost of Living Expenses</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                      <TableHead className="font-semibold">Housing</TableHead>
                      <TableHead className="font-semibold">Transportation</TableHead>
                      <TableHead className="font-semibold">Food</TableHead>
                      <TableHead className="font-semibold">Healthcare</TableHead>
                      <TableHead className="font-semibold">Personal Insurance</TableHead>
                      <TableHead className="font-semibold">Apparel</TableHead>
                      <TableHead className="font-semibold">Services</TableHead>
                      <TableHead className="font-semibold">Entertainment</TableHead>
                      <TableHead className="font-semibold">Other</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ages && ages.length > 0 ? (
                      ages.map((age, i) => (
                        <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>{i}</TableCell>
                          <TableCell>{age}</TableCell>
                          <TableCell>{formatCurrency(housingExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(transportationExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(foodExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(healthcareExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(personalInsuranceExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(apparelExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(servicesExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(entertainmentExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(otherExpenses, i)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-4">No expense data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="mt-6 mb-3 px-6">
              <h4 className="text-md font-medium mb-2">Milestone-Driven Expenses</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                      <TableHead className="font-semibold">Education</TableHead>
                      <TableHead className="font-semibold">Childcare</TableHead>
                      <TableHead className="font-semibold">Debt</TableHead>
                      <TableHead className="font-semibold">Discretionary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ages && ages.length > 0 ? (
                      ages.map((age, i) => (
                        <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>{i}</TableCell>
                          <TableCell>{age}</TableCell>
                          <TableCell>{formatCurrency(educationExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(childcareExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(debtExpenses, i)}</TableCell>
                          <TableCell>{formatCurrency(discretionaryExpenses, i)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">No expense data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="mt-6 mb-3 px-6">
              <h4 className="text-md font-medium mb-2">Asset & Liability Breakdown by Year</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Year</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                      <TableHead className="font-semibold">Home Value</TableHead>
                      <TableHead className="font-semibold">Mortgage</TableHead>
                      <TableHead className="font-semibold">Car Value</TableHead>
                      <TableHead className="font-semibold">Car Loan</TableHead>
                      <TableHead className="font-semibold">Student Loan</TableHead>
                      <TableHead className="font-semibold">Education Loans</TableHead>
                      <TableHead className="font-semibold">Graduate School Loans</TableHead>
                      <TableHead className="font-semibold">Personal Loans</TableHead>
                      <TableHead className="font-semibold">Other Assets</TableHead>
                      <TableHead className="font-semibold">Other Liabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ages && ages.length > 0 ? (
                      ages.map((age, i) => {
                        // Calculate other assets and liabilities (those not specifically tracked)
                        const homeVal = getValue(homeValue, i);
                        const carVal = getValue(carValue, i);
                        const totalAssets = getValue(assets, i);
                        const mortgageVal = getValue(mortgage, i);
                        const carLoanVal = getValue(carLoan, i);
                        const studentLoanVal = getValue(studentLoan, i);
                        const educationLoanVal = getValue(educationLoans, i);
                        const graduateSchoolLoanVal = getValue(graduateSchoolLoans, i);
                        const personalLoanVal = getValue(personalLoans, i);
                        // Get the total liabilities from the API response
                        let totalLiabilities = getValue(liabilities, i);
                        
                        // Calculate the explicit sum of all known liabilities to check for discrepancies
                        const sumOfAllLiabilities = mortgageVal + carLoanVal + studentLoanVal + 
                          educationLoanVal + graduateSchoolLoanVal + personalLoanVal;
                        
                        // If sumOfAllLiabilities is greater than totalLiabilities, it means some loans 
                        // (like graduate school loans) aren't being included in the backend totals
                        if (sumOfAllLiabilities > totalLiabilities) {
                          // Update totalLiabilities to be at least the sum of all known liabilities
                          totalLiabilities = sumOfAllLiabilities;
                          console.log(`Year ${i}: Corrected liabilities value from ${getValue(liabilities, i)} to ${totalLiabilities}`);
                        }
                        
                        const otherAssets = totalAssets - (homeVal + carVal);
                        const otherLiabilities = Math.max(0, totalLiabilities - (
                          mortgageVal + carLoanVal + studentLoanVal + 
                          educationLoanVal + graduateSchoolLoanVal + personalLoanVal
                        ));
                        
                        return (
                          <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <TableCell>{i}</TableCell>
                            <TableCell>{age}</TableCell>
                            <TableCell>{formatCurrency(homeValue, i)}</TableCell>
                            <TableCell>{formatCurrency(mortgage, i)}</TableCell>
                            <TableCell>{formatCurrency(carValue, i)}</TableCell>
                            <TableCell>{formatCurrency(carLoan, i)}</TableCell>
                            <TableCell>{formatCurrency(studentLoan, i)}</TableCell>
                            <TableCell>{formatCurrency(educationLoans, i)}</TableCell>
                            <TableCell>{formatCurrency(graduateSchoolLoans, i)}</TableCell>
                            <TableCell>{formatCurrency(personalLoans, i)}</TableCell>
                            <TableCell>${Math.max(0, otherAssets).toLocaleString()}</TableCell>
                            <TableCell>${Math.max(0, otherLiabilities).toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-4">No asset and liability data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default CashFlowTable;