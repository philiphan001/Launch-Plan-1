import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createMainProjectionChart } from "@/lib/charts";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type ProjectionType = "netWorth" | "income" | "expenses" | "assets" | "liabilities";

const FinancialProjections = () => {
  const [activeTab, setActiveTab] = useState<ProjectionType>("netWorth");
  const [timeframe, setTimeframe] = useState<string>("10 Years");
  const [age, setAge] = useState<number>(20);
  const [startingSavings, setStartingSavings] = useState<number>(5000);
  const [income, setIncome] = useState<number>(40000);
  const [expenses, setExpenses] = useState<number>(35000);
  const [incomeGrowth, setIncomeGrowth] = useState<number>(3);
  
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);
  
  // Generate projection data based on inputs
  const generateProjectionData = () => {
    let netWorth = startingSavings;
    let currentIncome = income;
    let currentExpenses = expenses;
    const netWorthData = [netWorth];
    const incomeData = [currentIncome];
    const expensesData = [currentExpenses];
    const ages = [age];
    
    const years = timeframe === "5 Years" ? 5 : timeframe === "20 Years" ? 20 : 10;
    
    for (let i = 1; i <= years; i++) {
      currentIncome = Math.round(currentIncome * (1 + incomeGrowth / 100));
      currentExpenses = Math.round(currentExpenses * 1.02); // Assume 2% expense growth
      netWorth += (currentIncome - currentExpenses);
      
      netWorthData.push(netWorth);
      incomeData.push(currentIncome);
      expensesData.push(currentExpenses);
      ages.push(age + i);
    }
    
    return {
      netWorth: netWorthData,
      income: incomeData,
      expenses: expensesData,
      assets: netWorthData.map(nw => nw > 0 ? nw : 0),
      liabilities: netWorthData.map(nw => nw < 0 ? -nw : 0),
      ages: ages
    };
  };
  
  const projectionData = generateProjectionData();

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        // Destroy previous chart instance if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        // Create new chart
        chartInstance.current = createMainProjectionChart(ctx, projectionData, activeTab);
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [projectionData, activeTab, timeframe]);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-display font-semibold text-gray-800 mb-6">Financial Projections</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Projection Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Current Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="timeframe">Timeframe</Label>
                <select 
                  id="timeframe"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option>5 Years</option>
                  <option>10 Years</option>
                  <option>20 Years</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="savings">Starting Savings ($)</Label>
                <Input 
                  id="savings" 
                  type="number" 
                  value={startingSavings} 
                  onChange={(e) => setStartingSavings(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input 
                  id="income" 
                  type="number" 
                  value={income} 
                  onChange={(e) => setIncome(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="expenses">Annual Expenses ($)</Label>
                <Input 
                  id="expenses" 
                  type="number" 
                  value={expenses} 
                  onChange={(e) => setExpenses(Number(e.target.value))} 
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Income Growth Rate: {incomeGrowth}%</Label>
                <Slider
                  value={[incomeGrowth]}
                  onValueChange={(value) => setIncomeGrowth(value[0])}
                  min={0}
                  max={10}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>
            
            <Button className="w-full mt-6">Save Projection</Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-wrap mb-4">
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'netWorth' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('netWorth')}
              >
                Net Worth
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'income' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('income')}
              >
                Income
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'expenses' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'assets' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('assets')}
              >
                Assets
              </button>
              <button 
                className={`mr-2 mb-2 px-4 py-2 ${activeTab === 'liabilities' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-full text-sm`}
                onClick={() => setActiveTab('liabilities')}
              >
                Liabilities
              </button>
            </div>
            
            <div className="h-96">
              <canvas ref={chartRef}></canvas>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Net Worth at {projectionData.ages[projectionData.ages.length - 1]}</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${projectionData.netWorth[projectionData.netWorth.length - 1].toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Total Savings</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  ${(projectionData.netWorth[projectionData.netWorth.length - 1] - startingSavings).toLocaleString()}
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-500 uppercase">Annual Savings Rate</p>
                <p className="text-2xl font-mono font-medium text-gray-800">
                  {Math.round((income - expenses) / income * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">Life Milestones</h3>
          <p className="text-gray-600 mb-4">Add major life events to see how they impact your financial projection.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <span className="material-icons text-primary text-2xl mb-2">school</span>
              <h4 className="font-medium">College Graduation</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <span className="material-icons text-primary text-2xl mb-2">work</span>
              <h4 className="font-medium">New Job</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <span className="material-icons text-primary text-2xl mb-2">home</span>
              <h4 className="font-medium">Buy a Home</h4>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-primary cursor-pointer transition-colors text-center">
              <span className="material-icons text-primary text-2xl mb-2">add_circle_outline</span>
              <h4 className="font-medium">Add Custom</h4>
            </div>
          </div>
          
          <Button variant="outline">Add Milestone</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialProjections;
