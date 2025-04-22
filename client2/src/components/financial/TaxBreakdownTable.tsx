import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ProjectionData } from "@/lib/types";

interface TaxBreakdownTableProps {
  projectionData: ProjectionData;
  isLoading?: boolean;
}

const TaxBreakdownTable = ({ projectionData, isLoading }: TaxBreakdownTableProps) => {
  const tableData = useMemo(() => {
    if (!projectionData.ages || !projectionData.federalTax) {
      return [];
    }

    return projectionData.ages.map((age, index) => ({
      age,
      federalTax: projectionData.federalTax?.[index] || 0,
      stateTax: projectionData.stateTax?.[index] || 0,
      payrollTax: projectionData.payrollTax?.[index] || 0,
      totalTax: (
        (projectionData.federalTax?.[index] || 0) +
        (projectionData.stateTax?.[index] || 0) +
        (projectionData.payrollTax?.[index] || 0)
      ),
      effectiveTaxRate: projectionData.effectiveTaxRate?.[index] || 0,
      marginalTaxRate: projectionData.marginalTaxRate?.[index] || 0,
      income: projectionData.income?.[index] || 0
    }));
  }, [projectionData]);

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Tax Breakdown Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <p>Loading tax data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary">Tax Breakdown Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Age</TableHead>
                <TableHead>Federal Tax</TableHead>
                <TableHead>State Tax</TableHead>
                <TableHead>Payroll Tax</TableHead>
                <TableHead>Total Tax</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Effective Rate</TableHead>
                <TableHead>Marginal Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.age}>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{formatCurrency(row.federalTax)}</TableCell>
                  <TableCell>{formatCurrency(row.stateTax)}</TableCell>
                  <TableCell>{formatCurrency(row.payrollTax)}</TableCell>
                  <TableCell>{formatCurrency(row.totalTax)}</TableCell>
                  <TableCell>{formatCurrency(row.income)}</TableCell>
                  <TableCell>{(row.effectiveTaxRate * 100).toFixed(1)}%</TableCell>
                  <TableCell>{(row.marginalTaxRate * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            This table provides a detailed breakdown of your tax obligations over time. The effective tax rate represents the percentage of your total income paid in taxes, while the marginal tax rate is the percentage paid on your last dollar earned.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaxBreakdownTable;