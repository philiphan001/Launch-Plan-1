import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, BarChart, PiggyBank, Calendar, DollarSign } from "lucide-react";
import { formatCurrency } from '@/lib/utils';

interface CoffeeCalculatorProps {
  initialAmount?: number;
  initialFrequency?: string;
  initialYears?: number;
  initialGrowthRate?: number;
  showTabs?: boolean;
  showAlternativeSavings?: boolean;
}

const DailyCoffeeCalculator: React.FC<CoffeeCalculatorProps> = ({
  initialAmount = 5,
  initialFrequency = "daily",
  initialYears = 10,
  initialGrowthRate = 8,
  showTabs = true,
  showAlternativeSavings = true
}) => {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [frequency, setFrequency] = useState<string>(initialFrequency);
  const [years, setYears] = useState<number>(initialYears);
  const [growthRate, setGrowthRate] = useState<number>(initialGrowthRate);
  const [alternativeSavingsGoal, setAlternativeSavingsGoal] = useState<string>("Jeep");
  const [alternativeSavingsAmount, setAlternativeSavingsAmount] = useState<number>(30000);
  const [currentAge, setCurrentAge] = useState<number>(18);
  
  // Calculate total spent on coffee
  const [coffeeResults, setCoffeeResults] = useState({
    totalSpent: 0,
    totalInvested: 0,
    daysNeeded: 0,
    percentTowardGoal: 0
  });

  // Calculate the results whenever inputs change
  useEffect(() => {
    calculateResults();
  }, [amount, frequency, years, growthRate, alternativeSavingsAmount]);

  const calculateResults = () => {
    // Convert frequency to annual multiplier
    const annualMultiplier = 
      frequency === 'daily' ? 365 : 
      frequency === 'weekday' ? 260 : 
      frequency === 'weekly' ? 52 : 
      frequency === 'monthly' ? 12 : 1;
    
    // Calculate annual spending
    const annualSpending = amount * annualMultiplier;
    
    // Calculate total spending (without investment)
    const totalSpent = annualSpending * years;
    
    // Calculate total if invested (compound interest formula)
    // FV = P * (1 + r)^t where:
    // FV = Future Value
    // P = Annual payment
    // r = Interest rate (as decimal)
    // t = Time in years
    let totalInvested = 0;
    const growthRateDecimal = growthRate / 100;
    
    // Calculate with monthly contributions for more accuracy
    const monthlyContribution = annualSpending / 12;
    const months = years * 12;
    const monthlyRate = growthRateDecimal / 12;
    
    // Formula for future value of periodic payment
    // FV = PMT × (((1 + r)^n - 1) / r)
    totalInvested = monthlyContribution * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
    
    // Days needed to save for alternative (like Jeep)
    // Days = Goal amount / daily contribution
    const dailyAmount = amount * (frequency === 'daily' ? 1 : 
                                 frequency === 'weekday' ? 5/7 : 
                                 frequency === 'weekly' ? 1/7 : 
                                 frequency === 'monthly' ? 1/30 : 0);
    
    const daysNeeded = dailyAmount > 0 ? Math.ceil(alternativeSavingsAmount / dailyAmount) : 0;
    
    // Percentage toward goal based on years provided
    const daysInPeriod = years * 365;
    const percentTowardGoal = Math.min(100, (daysInPeriod / daysNeeded) * 100);
    
    setCoffeeResults({
      totalSpent,
      totalInvested,
      daysNeeded,
      percentTowardGoal
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          <span>Daily Coffee Calculator</span>
        </CardTitle>
        <CardDescription>
          See how small daily purchases impact your long-term finances
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showTabs ? (
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="savings">Savings Goal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Cost per purchase ($)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <Input 
                      id="amount" 
                      type="number" 
                      min={1} 
                      step={0.5} 
                      value={amount} 
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="frequency">Purchase frequency</Label>
                  <select
                    id="frequency"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="daily">Every day</option>
                    <option value="weekday">Weekdays only</option>
                    <option value="weekly">Once a week</option>
                    <option value="monthly">Once a month</option>
                  </select>
                </div>
                
                <div>
                  <Label>Time period: {years} years</Label>
                  <Slider
                    value={[years]}
                    min={1}
                    max={40}
                    step={1}
                    onValueChange={(value) => setYears(value[0])}
                    className="my-4"
                  />
                </div>
                
                <div>
                  <Label>Investment growth rate: {growthRate}%</Label>
                  <Slider
                    value={[growthRate]}
                    min={1}
                    max={12}
                    step={0.5}
                    onValueChange={(value) => setGrowthRate(value[0])}
                    className="my-4"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The average historical stock market return is around 8%
                  </p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Total spent</p>
                      <p className="text-xl font-medium">{formatCurrency(coffeeResults.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">If invested</p>
                      <p className="text-xl font-medium text-green-600">
                        {formatCurrency(coffeeResults.totalInvested)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">Difference</p>
                    <p className="text-lg font-medium text-blue-600">
                      {formatCurrency(coffeeResults.totalInvested - coffeeResults.totalSpent)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      That's {Math.round((coffeeResults.totalInvested / coffeeResults.totalSpent - 1) * 100)}% more through investing!
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="savings" className="space-y-4">
              {showAlternativeSavings && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentAge">Current age</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <Input 
                        id="currentAge" 
                        type="number" 
                        min={16} 
                        max={25} 
                        value={currentAge} 
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="savingsGoal">Savings goal</Label>
                    <Input
                      id="savingsGoal"
                      value={alternativeSavingsGoal}
                      onChange={(e) => setAlternativeSavingsGoal(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="savingsAmount">{alternativeSavingsGoal} cost ($)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <Input 
                        id="savingsAmount" 
                        type="number" 
                        min={1000} 
                        step={1000} 
                        value={alternativeSavingsAmount} 
                        onChange={(e) => setAlternativeSavingsAmount(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>{alternativeSavingsGoal} cost: {formatCurrency(alternativeSavingsAmount)}</Label>
                    <Slider
                      value={[alternativeSavingsAmount]}
                      min={20000}
                      max={60000}
                      step={1000}
                      onValueChange={(value) => setAlternativeSavingsAmount(value[0])}
                      className="my-4"
                    />
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 mt-6">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Days needed to save for {alternativeSavingsGoal}</p>
                      <p className="text-xl font-medium">
                        {coffeeResults.daysNeeded.toLocaleString()} days
                        <span className="text-sm text-gray-500 ml-2">
                          ({Math.round(coffeeResults.daysNeeded / 365)} years)
                        </span>
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">
                        Progress toward {alternativeSavingsGoal} in {years} years
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-600 h-4 rounded-full" 
                          style={{ width: `${coffeeResults.percentTowardGoal}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {coffeeResults.percentTowardGoal.toFixed(1)}% complete
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-1">You could own your {alternativeSavingsGoal} by age</p>
                      <p className="text-xl font-medium">
                        {Math.round(currentAge + coffeeResults.daysNeeded / 365)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {/* Simple version without tabs - include just the calculator */}
            <div>
              <Label htmlFor="amount">Cost per purchase ($)</Label>
              <Input 
                id="amount" 
                type="number" 
                min={1} 
                step={0.5} 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="frequency">Purchase frequency</Label>
              <select
                id="frequency"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Every day</option>
                <option value="weekday">Weekdays only</option>
                <option value="weekly">Once a week</option>
                <option value="monthly">Once a month</option>
              </select>
            </div>
            
            <div>
              <Label>Time period: {years} years</Label>
              <Slider
                value={[years]}
                min={1}
                max={40}
                step={1}
                onValueChange={(value) => setYears(value[0])}
                className="my-4"
              />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total spent</p>
                  <p className="text-xl font-medium">{formatCurrency(coffeeResults.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">If invested</p>
                  <p className="text-xl font-medium text-green-600">
                    {formatCurrency(coffeeResults.totalInvested)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          <p>Demonstrates the power of compound interest</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DailyCoffeeCalculator;