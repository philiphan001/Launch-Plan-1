import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Coffee, TrendingUp, Droplet, Timer, Coins, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";

const DailyCoffeeCalculator = () => {
  // State variables for the calculator
  const [coffeeCost, setCoffeeCost] = useState<number>(5);
  const [frequency, setFrequency] = useState<number>(5); // days per week
  const [yearsToRetirement, setYearsToRetirement] = useState<number>(40);
  const [annualReturn, setAnnualReturn] = useState<number>(8); // 8% default
  
  // Calculated results
  const [weeklySavings, setWeeklySavings] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [yearlySavings, setYearlySavings] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [investmentGrowth, setInvestmentGrowth] = useState<number>(0);
  const [retirementYearsAdvanced, setRetirementYearsAdvanced] = useState<number>(0);
  
  // Calculate how many years earlier you could retire
  const calculateRetirementYearsAdvanced = (totalAmount: number) => {
    // Assuming a 4% safe withdrawal rate
    const annualWithdrawal = totalAmount * 0.04;
    
    // If you need $40,000 per year in retirement (rough estimate)
    const yearsOfExpenses = annualWithdrawal * 25;
    
    // Roughly estimate years of retirement advanced
    // This is a simplification for illustrative purposes
    return Math.round(yearsOfExpenses / 40000);
  };
  
  // Calculate the future value of the coffee savings
  const calculateFutureValue = (
    annualInvestment: number,
    years: number,
    rate: number
  ) => {
    const r = rate / 100;
    let futureValue = 0;
    
    // Calculate with compound interest, assuming monthly investments
    const monthlyInvestment = annualInvestment / 12;
    const monthlyRate = r / 12;
    const months = years * 12;
    
    for (let i = 0; i < months; i++) {
      futureValue = (futureValue + monthlyInvestment) * (1 + monthlyRate);
    }
    
    return futureValue;
  };
  
  // Update calculations when inputs change
  useEffect(() => {
    // Calculate savings
    const dailySavings = coffeeCost;
    const weeklyAmount = dailySavings * frequency;
    const monthlyAmount = weeklyAmount * 4.33; // 52 weeks / 12 months = 4.33 weeks per month
    const yearlyAmount = monthlyAmount * 12;
    
    // Calculate future value
    const futureValue = calculateFutureValue(yearlyAmount, yearsToRetirement, annualReturn);
    const totalInvestedAmount = yearlyAmount * yearsToRetirement;
    const growthAmount = futureValue - totalInvestedAmount;
    
    // Update state
    setWeeklySavings(weeklyAmount);
    setMonthlySavings(monthlyAmount);
    setYearlySavings(yearlyAmount);
    setTotalSavings(futureValue);
    setTotalInvested(totalInvestedAmount);
    setInvestmentGrowth(growthAmount);
    setRetirementYearsAdvanced(calculateRetirementYearsAdvanced(futureValue));
  }, [coffeeCost, frequency, yearsToRetirement, annualReturn]);
  
  // Animation variants for the motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  // Format large numbers for display
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)} million`;
    } else {
      return formatCurrency(Math.round(num));
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">☕ The Daily Coffee Challenge</CardTitle>
            <CardDescription>
              See how small daily expenses add up and impact your retirement goals
            </CardDescription>
          </div>
          <Coffee className="h-10 w-10 text-amber-600" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Coffee Cost Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="coffee-cost" className="text-base font-medium">
              Coffee Cost
            </Label>
            <span className="font-semibold text-lg text-primary">
              {formatCurrency(coffeeCost)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            <Slider
              id="coffee-cost"
              min={1}
              max={10}
              step={0.5}
              value={[coffeeCost]}
              onValueChange={(value) => setCoffeeCost(value[0])}
              className="flex-1"
            />
            <Droplet className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        {/* Frequency Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="frequency" className="text-base font-medium">
              Days Per Week
            </Label>
            <span className="font-semibold text-lg text-primary">
              {frequency} days
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">1</span>
            <Slider
              id="frequency"
              min={1}
              max={7}
              step={1}
              value={[frequency]}
              onValueChange={(value) => setFrequency(value[0])}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">7</span>
          </div>
        </div>
        
        {/* Years to Retirement Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="retirement-years" className="text-base font-medium">
              Years Until Retirement
            </Label>
            <span className="font-semibold text-lg text-primary">
              {yearsToRetirement} years
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <Slider
              id="retirement-years"
              min={10}
              max={50}
              step={1}
              value={[yearsToRetirement]}
              onValueChange={(value) => setYearsToRetirement(value[0])}
              className="flex-1"
            />
            <PiggyBank className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        
        <div className="pt-4">
          <div className="bg-muted p-6 rounded-lg">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Weekly Savings */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-muted-foreground">Weekly Cost</h4>
                <p className="text-xl font-bold text-primary">{formatCurrency(weeklySavings)}</p>
              </motion.div>
              
              {/* Monthly Savings */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-muted-foreground">Monthly Cost</h4>
                <p className="text-xl font-bold text-primary">{formatCurrency(monthlySavings)}</p>
              </motion.div>
              
              {/* Yearly Savings */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-muted-foreground">Yearly Cost</h4>
                <p className="text-xl font-bold text-primary">{formatCurrency(yearlySavings)}</p>
              </motion.div>
              
              {/* Total Amount Invested */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-muted-foreground">Total Amount Invested</h4>
                <p className="text-xl font-bold text-primary">{formatLargeNumber(totalInvested)}</p>
              </motion.div>
            </motion.div>
            
            {/* Big Impact Stats */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-6"
            >
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-emerald-100 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Future Value After {yearsToRetirement} Years</h3>
                    <p className="text-sm text-green-600">With {annualReturn}% annual return</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-green-700 uppercase tracking-wider font-medium">Total Future Value</p>
                      <p className="text-3xl font-bold text-green-800">{formatLargeNumber(totalSavings)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 uppercase tracking-wider font-medium">Investment Growth</p>
                      <p className="text-3xl font-bold text-green-800">{formatLargeNumber(investmentGrowth)}</p>
                      <p className="text-xs text-green-600">{(investmentGrowth/totalInvested*100).toFixed(0)}% more than invested</p>
                    </div>
                  </div>
                </div>
                
                {/* Impact on Retirement */}
                <div className="mt-6 pt-6 border-t border-green-100">
                  <div className="flex items-center">
                    <Coins className="h-6 w-6 text-amber-500 mr-2" />
                    <h4 className="text-lg font-semibold text-amber-600">The Big Impact</h4>
                  </div>
                  <p className="mt-2 text-lg">
                    <span className="font-bold">By investing your coffee money,</span> you could potentially:
                  </p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-start">
                      <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                      <span>
                        Retire up to <span className="font-bold text-amber-600">{retirementYearsAdvanced} years earlier</span> than planned
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                      <span>
                        Add <span className="font-bold text-amber-600">{formatCurrency(totalSavings * 0.04)}</span> to your annual retirement income
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                      <span>
                        Turn each <span className="font-bold text-amber-600">{formatCurrency(coffeeCost)}</span> coffee into <span className="font-bold text-amber-600">{formatCurrency(totalSavings/(frequency*52*yearsToRetirement))}</span> of future value
                      </span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Small expenses add up. Consider making your coffee at home.
        </p>
        <Button variant="outline" className="gap-2">
          <Coffee className="h-4 w-4" /> See More Tips
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyCoffeeCalculator;