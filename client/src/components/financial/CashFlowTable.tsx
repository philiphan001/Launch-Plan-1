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
  housingExpenses?: number[] | null;
  transportationExpenses?: number[] | null;
  foodExpenses?: number[] | null;
  healthcareExpenses?: number[] | null;
  educationExpenses?: number[] | null;
  childcareExpenses?: number[] | null;
  debtExpenses?: number[] | null;
  discretionaryExpenses?: number[] | null;
  assets?: number[] | null;
  liabilities?: number[] | null;
  netWorth?: number[] | null;
  homeValue?: number[] | null;
  mortgage?: number[] | null;
  carValue?: number[] | null;
  carLoan?: number[] | null;
  studentLoan?: number[] | null;
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
  studentLoan
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
                  {ages.map((age, i) => (
                    <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell>{i}</TableCell>
                      <TableCell>{age}</TableCell>
                      <TableCell>${income[i]?.toLocaleString() || 0}</TableCell>
                      <TableCell>${spouseIncome && spouseIncome[i] ? spouseIncome[i].toLocaleString() : 0}</TableCell>
                      <TableCell>${((income[i] || 0) + (spouseIncome && spouseIncome[i] ? spouseIncome[i] : 0)).toLocaleString()}</TableCell>
                      <TableCell>${expenses && expenses[i] ? expenses[i].toLocaleString() : 0}</TableCell>
                      <TableCell>
                        ${((income[i] || 0) + (spouseIncome && spouseIncome[i] ? spouseIncome[i] : 0) - (expenses && expenses[i] ? expenses[i] : 0)).toLocaleString()}
                      </TableCell>
                      <TableCell>${netWorth && netWorth[i] ? netWorth[i].toLocaleString() : 0}</TableCell>
                      <TableCell>${assets && assets[i] ? assets[i].toLocaleString() : 0}</TableCell>
                      <TableCell>${liabilities && liabilities[i] ? liabilities[i].toLocaleString() : 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 mb-3 px-6">
              <h4 className="text-md font-medium mb-2">Expense Breakdown by Year</h4>
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
                      <TableHead className="font-semibold">Education</TableHead>
                      <TableHead className="font-semibold">Childcare</TableHead>
                      <TableHead className="font-semibold">Debt</TableHead>
                      <TableHead className="font-semibold">Discretionary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ages.map((age, i) => (
                      <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell>{i}</TableCell>
                        <TableCell>{age}</TableCell>
                        <TableCell>${housingExpenses && housingExpenses[i] ? housingExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${transportationExpenses && transportationExpenses[i] ? transportationExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${foodExpenses && foodExpenses[i] ? foodExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${healthcareExpenses && healthcareExpenses[i] ? healthcareExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${educationExpenses && educationExpenses[i] ? educationExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${childcareExpenses && childcareExpenses[i] ? childcareExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${debtExpenses && debtExpenses[i] ? debtExpenses[i].toLocaleString() : 0}</TableCell>
                        <TableCell>${discretionaryExpenses && discretionaryExpenses[i] ? discretionaryExpenses[i].toLocaleString() : 0}</TableCell>
                      </TableRow>
                    ))}
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
                      <TableHead className="font-semibold">Other Assets</TableHead>
                      <TableHead className="font-semibold">Other Liabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ages.map((age, i) => {
                      // Calculate other assets and liabilities (those not specifically tracked)
                      const homeVal = homeValue && homeValue[i] ? homeValue[i] : 0;
                      const carVal = carValue && carValue[i] ? carValue[i] : 0;
                      const totalAssets = assets && assets[i] ? assets[i] : 0;
                      const mortgageVal = mortgage && mortgage[i] ? mortgage[i] : 0;
                      const carLoanVal = carLoan && carLoan[i] ? carLoan[i] : 0;
                      const studentLoanVal = studentLoan && studentLoan[i] ? studentLoan[i] : 0;
                      const totalLiabilities = liabilities && liabilities[i] ? liabilities[i] : 0;
                      
                      const otherAssets = totalAssets - (homeVal + carVal);
                      const otherLiabilities = totalLiabilities - (mortgageVal + carLoanVal + studentLoanVal);
                      
                      return (
                        <TableRow key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <TableCell>{i}</TableCell>
                          <TableCell>{age}</TableCell>
                          <TableCell>${homeValue && homeValue[i] ? homeValue[i].toLocaleString() : 0}</TableCell>
                          <TableCell>${mortgage && mortgage[i] ? mortgage[i].toLocaleString() : 0}</TableCell>
                          <TableCell>${carValue && carValue[i] ? carValue[i].toLocaleString() : 0}</TableCell>
                          <TableCell>${carLoan && carLoan[i] ? carLoan[i].toLocaleString() : 0}</TableCell>
                          <TableCell>${studentLoan && studentLoan[i] ? studentLoan[i].toLocaleString() : 0}</TableCell>
                          <TableCell>${otherAssets.toLocaleString()}</TableCell>
                          <TableCell>${otherLiabilities.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
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