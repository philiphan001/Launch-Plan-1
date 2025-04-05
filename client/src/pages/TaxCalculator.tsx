import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Calculator } from "lucide-react";
import { PageHeader } from "../components/ui/page-header";

// Tax calculation form schema
const taxCalculationSchema = z.object({
  income: z
    .union([z.string(), z.number()])
    .refine(val => val !== "", {
      message: "Income is required"
    })
    .transform((val) => typeof val === "string" ? parseFloat(val) : val),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
  stateCode: z.string().max(2).optional(),
});

// Paycheck calculation form schema
const paycheckCalculationSchema = z.object({
  annualIncome: z
    .union([z.string(), z.number()])
    .refine(val => val !== "", {
      message: "Annual income is required"
    })
    .transform((val) => typeof val === "string" ? parseFloat(val) : val),
  payFrequency: z.enum(["weekly", "biweekly", "semimonthly", "monthly"], {
    required_error: "Pay frequency is required",
  }),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
  stateCode: z.string().max(2).optional(),
});

// State comparison form schema
const stateComparisonSchema = z.object({
  income: z
    .union([z.string(), z.number()])
    .refine(val => val !== "", {
      message: "Income is required"
    })
    .transform((val) => typeof val === "string" ? parseFloat(val) : val),
  filingStatus: z.enum(["single", "married_joint", "married_separate", "head_of_household"], {
    required_error: "Filing status is required",
  }),
});

const filingStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married_joint", label: "Married Filing Jointly" },
  { value: "married_separate", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
];

const payFrequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "semimonthly", label: "Twice a Month" },
  { value: "monthly", label: "Monthly" },
];

const stateOptions = [
  { value: "NONE", label: "No State Tax" },
  { value: "CA", label: "California" },
  { value: "IL", label: "Illinois" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
];

// States for comparison
const comparisonStates = ["CA", "IL", "NY", "TX"];

const TaxCalculator = () => {
  const [activeTab, setActiveTab] = useState("tax-calculator");
  const [taxResult, setTaxResult] = useState<any>(null);
  const [paycheckResult, setPaycheckResult] = useState<any>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Define the forms for each tab
  const taxForm = useForm<z.infer<typeof taxCalculationSchema>>({
    resolver: zodResolver(taxCalculationSchema),
    defaultValues: {
      income: "0" as unknown as number,
      filingStatus: "single",
      stateCode: "NONE",
    },
  });

  const paycheckForm = useForm<z.infer<typeof paycheckCalculationSchema>>({
    resolver: zodResolver(paycheckCalculationSchema),
    defaultValues: {
      annualIncome: "0" as unknown as number,
      payFrequency: "biweekly",
      filingStatus: "single",
      stateCode: "NONE",
    },
  });

  const comparisonForm = useForm<z.infer<typeof stateComparisonSchema>>({
    resolver: zodResolver(stateComparisonSchema),
    defaultValues: {
      income: "0" as unknown as number,
      filingStatus: "single",
    },
  });

  // Handle tax calculation form submission
  const onTaxCalculate = async (values: z.infer<typeof taxCalculationSchema>) => {
    try {
      setError("");
      const data = {
        income: values.income,
        filingStatus: values.filingStatus,
        stateCode: values.stateCode || undefined,
      };
      
      const result = await apiRequest("/api/tax/calculate", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      setTaxResult(result);
    } catch (err) {
      console.error("Tax calculation error:", err);
      setError("Failed to calculate taxes. Please try again.");
    }
  };

  // Handle paycheck calculation form submission
  const onPaycheckCalculate = async (values: z.infer<typeof paycheckCalculationSchema>) => {
    try {
      setError("");
      const data = {
        annualIncome: values.annualIncome,
        payFrequency: values.payFrequency,
        filingStatus: values.filingStatus,
        stateCode: values.stateCode || undefined,
      };
      
      const result = await apiRequest("/api/tax/paycheck", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      setPaycheckResult(result);
    } catch (err) {
      console.error("Paycheck calculation error:", err);
      setError("Failed to calculate paycheck details. Please try again.");
    }
  };

  // Handle state comparison form submission
  const onCompareStates = async (values: z.infer<typeof stateComparisonSchema>) => {
    try {
      setError("");
      const data = {
        income: values.income,
        filingStatus: values.filingStatus,
        stateCodes: comparisonStates,
      };
      
      const result = await apiRequest("/api/tax/compare-states", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      setComparisonResult(result);
    } catch (err) {
      console.error("State comparison error:", err);
      setError("Failed to compare state tax burdens. Please try again.");
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to format percentage
  const formatPercent = (percent: number) => {
    return `${percent.toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Tax Calculator"
        description="Estimate your tax liability, calculate take-home pay, and compare tax burdens across states."
        icon={<Calculator className="h-6 w-6" />}
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="tax-calculator"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tax-calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="paycheck-calculator">Paycheck Calculator</TabsTrigger>
          <TabsTrigger value="state-comparison">State Comparison</TabsTrigger>
        </TabsList>

        {/* Tax Calculator Tab */}
        <TabsContent value="tax-calculator">
          <Card>
            <CardHeader>
              <CardTitle>Income Tax Calculator</CardTitle>
              <CardDescription>
                Calculate your federal and state income tax liability based on your income and filing status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...taxForm}>
                <form
                  onSubmit={taxForm.handleSubmit(onTaxCalculate)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={taxForm.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="60000"
                              {...field}
                              type="number"
                              min="0"
                              step="1000"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your gross annual income
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taxForm.control}
                      name="filingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filing Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Filing Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filingStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your tax filing status
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={taxForm.control}
                      name="stateCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State (Optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stateOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a state for state tax calculations (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Calculate Taxes</Button>
                </form>
              </Form>

              {taxResult && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Tax Calculation Results</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Gross Income:</span>
                            <span className="font-medium">{formatCurrency(taxResult.income)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Tax:</span>
                            <span className="font-medium">{formatCurrency(taxResult.total_tax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Take-Home Pay:</span>
                            <span className="font-medium">{formatCurrency(taxResult.take_home_pay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Effective Tax Rate:</span>
                            <span className="font-medium">{formatPercent(taxResult.effective_tax_rate)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tax Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Federal Income Tax:</span>
                            <span className="font-medium">{formatCurrency(taxResult.federal.income_tax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Social Security Tax:</span>
                            <span className="font-medium">{formatCurrency(taxResult.federal.social_security)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medicare Tax:</span>
                            <span className="font-medium">{formatCurrency(taxResult.federal.medicare)}</span>
                          </div>
                          {taxResult.state.state_code && (
                            <div className="flex justify-between">
                              <span>{taxResult.state.state_code} State Tax:</span>
                              <span className="font-medium">{formatCurrency(taxResult.state.tax)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Federal Tax Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Federal Marginal Rate:</span>
                            <span className="font-medium">{formatPercent(taxResult.federal.marginal_rate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Federal Effective Rate:</span>
                            <span className="font-medium">{formatPercent(taxResult.federal.effective_rate)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {taxResult.state.state_code && (
                      <Card>
                        <CardHeader>
                          <CardTitle>State Tax Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>State:</span>
                              <span className="font-medium">{taxResult.state.state_code}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>State Marginal Rate:</span>
                              <span className="font-medium">{formatPercent(taxResult.state.marginal_rate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>State Effective Rate:</span>
                              <span className="font-medium">{formatPercent(taxResult.state.effective_rate)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paycheck Calculator Tab */}
        <TabsContent value="paycheck-calculator">
          <Card>
            <CardHeader>
              <CardTitle>Paycheck Calculator</CardTitle>
              <CardDescription>
                Calculate your take-home pay per paycheck based on your income, filing status, and pay frequency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paycheckForm}>
                <form
                  onSubmit={paycheckForm.handleSubmit(onPaycheckCalculate)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={paycheckForm.control}
                      name="annualIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="60000"
                              {...field}
                              type="number"
                              min="0"
                              step="1000"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your gross annual income
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paycheckForm.control}
                      name="payFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pay Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Pay Frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {payFrequencyOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often do you get paid?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paycheckForm.control}
                      name="filingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filing Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Filing Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filingStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your tax filing status
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paycheckForm.control}
                      name="stateCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select State (Optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stateOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select a state for state tax calculations (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit">Calculate Paycheck</Button>
                </form>
              </Form>

              {paycheckResult && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Paycheck Results</h3>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Gross Pay:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.gross_pay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Net Pay:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.net_pay)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pay Frequency:</span>
                            <span className="font-medium capitalize">{paycheckResult.pay_frequency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Net Pay:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.annual_net_pay)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Withholdings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Federal Withholding:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.federal_withholding)}</span>
                          </div>
                          {paycheckResult.state_withholding > 0 && (
                            <div className="flex justify-between">
                              <span>State Withholding:</span>
                              <span className="font-medium">{formatCurrency(paycheckResult.state_withholding)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Social Security:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.social_security)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Medicare:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.medicare)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-medium">Total Withholdings:</span>
                            <span className="font-medium">{formatCurrency(paycheckResult.total_withholding)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* State Comparison Tab */}
        <TabsContent value="state-comparison">
          <Card>
            <CardHeader>
              <CardTitle>State Tax Comparison</CardTitle>
              <CardDescription>
                Compare tax burdens across different states to see how state income taxes affect your take-home pay.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...comparisonForm}>
                <form
                  onSubmit={comparisonForm.handleSubmit(onCompareStates)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={comparisonForm.control}
                      name="income"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="60000"
                              {...field}
                              type="number"
                              min="0"
                              step="1000"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter your gross annual income
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={comparisonForm.control}
                      name="filingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filing Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Filing Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filingStatusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your tax filing status
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      We'll compare the following states: California, Illinois, New York, and Texas
                    </p>
                    <Button type="submit">Compare States</Button>
                  </div>
                </form>
              </Form>

              {comparisonResult && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">State Comparison Results</h3>
                  <Table>
                    <TableCaption>Comparison of state tax burdens</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>State</TableHead>
                        <TableHead>State Tax</TableHead>
                        <TableHead>Total Tax</TableHead>
                        <TableHead>Take-Home Pay</TableHead>
                        <TableHead>Effective Tax Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(comparisonResult).map(([stateCode, data]: [string, any]) => (
                        <TableRow key={stateCode}>
                          <TableCell className="font-medium">{stateCode}</TableCell>
                          <TableCell>{formatCurrency(data.state_tax)}</TableCell>
                          <TableCell>{formatCurrency(data.total_tax)}</TableCell>
                          <TableCell>{formatCurrency(data.take_home_pay)}</TableCell>
                          <TableCell>{formatPercent(data.effective_tax_rate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxCalculator;