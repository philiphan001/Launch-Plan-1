import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Coffee, TrendingUp, Droplet, Timer, Coins, PiggyBank, Car, RotateCw, CreditCard, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DailyCoffeeCalculator = () => {
  // State variables for the calculator
  const [coffeeCost, setCoffeeCost] = useState<number>(5);
  const [frequency, setFrequency] = useState<number>(5); // days per week
  const [yearsToRetirement, setYearsToRetirement] = useState<number>(40);
  const [annualReturn, setAnnualReturn] = useState<number>(8); // 8% default
  const [currentAge, setCurrentAge] = useState<number>(18); // Default age for high school student
  const [jeepCost, setJeepCost] = useState<number>(35000); // Cost of a new Jeep
  
  // Jeep savings goal - target age is 28
  const yearsToJeep = Math.max(1, 28 - currentAge);
  
  // Calculated results
  const [weeklySavings, setWeeklySavings] = useState<number>(0);
  const [monthlySavings, setMonthlySavings] = useState<number>(0);
  const [yearlySavings, setYearlySavings] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [investmentGrowth, setInvestmentGrowth] = useState<number>(0);
  const [retirementYearsAdvanced, setRetirementYearsAdvanced] = useState<number>(0);
  
  // Jeep savings calculations
  const [jeepSavingsTotal, setJeepSavingsTotal] = useState<number>(0);
  const [jeepPercentageReached, setJeepPercentageReached] = useState<number>(0);
  const [additionalRequired, setAdditionalRequired] = useState<number>(0);
  const [monthlyForJeep, setMonthlyForJeep] = useState<number>(0);
  
  // Credit card calculations
  const [creditCardInterestRate, setCreditCardInterestRate] = useState<number>(18); // 18% default
  const [minimumPaymentPercent, setMinimumPaymentPercent] = useState<number>(3); // 3% default
  const [creditCardYearlyCost, setCreditCardYearlyCost] = useState<number>(0);
  const [creditCardTotalInterest, setCreditCardTotalInterest] = useState<number>(0);
  const [creditCardTotalCost, setCreditCardTotalCost] = useState<number>(0);
  const [creditCardPayoffMonths, setCreditCardPayoffMonths] = useState<number>(0);
  
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
  
  // Calculate monthly amount needed to reach a specific goal
  const calculateMonthlyForGoal = (targetAmount: number, years: number, rate: number) => {
    const r = rate / 100;
    const monthlyRate = r / 12;
    const months = years * 12;
    
    // PMT formula: goal = PMT * ((1+r)^n - 1) / r
    // Solving for PMT: PMT = goal * r / ((1+r)^n - 1)
    
    const numerator = targetAmount * monthlyRate;
    const denominator = Math.pow(1 + monthlyRate, months) - 1;
    
    return numerator / denominator;
  };
  
  // Calculate credit card payments and interest
  const calculateCreditCardCost = (monthlyCharges: number, interestRate: number, minPaymentPercent: number) => {
    const annualRate = interestRate / 100;
    const monthlyRate = annualRate / 12;
    const minPaymentDecimal = minPaymentPercent / 100;
    
    // Calculate yearly charges for coffee
    const yearlyCharges = monthlyCharges * 12;
    
    let balance = yearlyCharges; // Initial balance after one year of coffee purchases
    let totalPaid = 0;
    let totalInterest = 0;
    let months = 0;
    
    // Simulate paying minimum payment until balance is paid off
    while (balance > 1) { // Using 1 as threshold to avoid floating point issues
      // Calculate minimum payment (either percentage or $25, whichever is higher)
      const minimumPayment = Math.max(balance * minPaymentDecimal, 25);
      
      // Calculate interest for this month
      const interestThisMonth = balance * monthlyRate;
      
      // Apply payment
      const principalPayment = minimumPayment - interestThisMonth;
      balance -= principalPayment;
      
      // Update totals
      totalPaid += minimumPayment;
      totalInterest += interestThisMonth;
      months++;
      
      // Safety check to prevent infinite loops
      if (months > 1000) {
        break;
      }
    }
    
    return {
      totalCost: yearlyCharges + totalInterest,
      totalInterest,
      payoffMonths: months,
      costMultiplier: (yearlyCharges + totalInterest) / yearlyCharges
    };
  };
  
  // Update calculations when inputs change
  useEffect(() => {
    // Calculate savings
    const dailySavings = coffeeCost;
    const weeklyAmount = dailySavings * frequency;
    const monthlyAmount = weeklyAmount * 4.33; // 52 weeks / 12 months = 4.33 weeks per month
    const yearlyAmount = monthlyAmount * 12;
    
    // Calculate future value for retirement
    const futureValue = calculateFutureValue(yearlyAmount, yearsToRetirement, annualReturn);
    const totalInvestedAmount = yearlyAmount * yearsToRetirement;
    const growthAmount = futureValue - totalInvestedAmount;
    
    // Calculate future value for Jeep (at age 28)
    const jeepFutureValue = calculateFutureValue(yearlyAmount, yearsToJeep, annualReturn);
    const jeepPercentage = Math.min(100, (jeepFutureValue / jeepCost) * 100);
    const jeepAdditionalNeeded = Math.max(0, jeepCost - jeepFutureValue);
    
    // Calculate what additional monthly amount would be needed to reach Jeep goal
    const additionalMonthly = jeepAdditionalNeeded > 0 
      ? calculateMonthlyForGoal(jeepAdditionalNeeded, yearsToJeep, annualReturn) 
      : 0;
    
    // Calculate credit card costs
    const creditCardResults = calculateCreditCardCost(monthlyAmount, creditCardInterestRate, minimumPaymentPercent);
    
    // Update state
    setWeeklySavings(weeklyAmount);
    setMonthlySavings(monthlyAmount);
    setYearlySavings(yearlyAmount);
    setTotalSavings(futureValue);
    setTotalInvested(totalInvestedAmount);
    setInvestmentGrowth(growthAmount);
    setRetirementYearsAdvanced(calculateRetirementYearsAdvanced(futureValue));
    
    // Update Jeep goal state
    setJeepSavingsTotal(jeepFutureValue);
    setJeepPercentageReached(jeepPercentage);
    setAdditionalRequired(jeepAdditionalNeeded);
    setMonthlyForJeep(additionalMonthly);
    
    // Update credit card state
    setCreditCardYearlyCost(yearlyAmount);
    setCreditCardTotalInterest(creditCardResults.totalInterest);
    setCreditCardTotalCost(creditCardResults.totalCost);
    setCreditCardPayoffMonths(creditCardResults.payoffMonths);
    
  }, [coffeeCost, frequency, yearsToRetirement, annualReturn, currentAge, jeepCost, yearsToJeep, creditCardInterestRate, minimumPaymentPercent]);
  
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
              See how small daily expenses add up over time and impact your financial goals
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
        
        {/* Current Age Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="current-age" className="text-base font-medium">
              Your Current Age
            </Label>
            <span className="font-semibold text-lg text-primary">
              {currentAge} years old
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">16</span>
            <Slider
              id="current-age"
              min={16}
              max={25}
              step={1}
              value={[currentAge]}
              onValueChange={(value) => setCurrentAge(value[0])}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">25</span>
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
              
              {/* Jeep Progress */}
              <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-100">
                <h4 className="text-sm font-medium text-muted-foreground">Coffee Money by Age 28</h4>
                <p className="text-xl font-bold text-primary">{formatLargeNumber(jeepSavingsTotal)}</p>
              </motion.div>
            </motion.div>
            
            {/* Scenarios Tabs */}
            <Tabs defaultValue="retirement" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="retirement" className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4" />
                  <span>Retirement Impact</span>
                </TabsTrigger>
                <TabsTrigger value="jeep" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Jeep Savings Goal</span>
                </TabsTrigger>
                <TabsTrigger value="credit" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Credit Card Cost</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Retirement Scenario */}
              <TabsContent value="retirement" className="mt-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-2"
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
                        <h4 className="text-lg font-semibold text-amber-600">The Retirement Impact</h4>
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
              </TabsContent>
              
              {/* Jeep Savings Goal Scenario */}
              <TabsContent value="jeep" className="mt-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-2"
                >
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">New Jeep Savings Goal</h3>
                        <p className="text-sm text-blue-600">
                          Target Age: 28 ({yearsToJeep} years from now) | Price: {formatCurrency(jeepCost)}
                        </p>
                      </div>
                      <Car className="h-8 w-8 text-blue-500" />
                    </div>
                    
                    {/* Goal Progress */}
                    <div className="mt-4">
                      <label className="text-xs text-blue-700 uppercase tracking-wider font-medium">
                        Coffee Savings Progress
                      </label>
                      <div className="mt-2 h-4 relative w-full bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                          style={{ width: `${jeepPercentageReached}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-blue-600">{jeepPercentageReached.toFixed(1)}%</span>
                        <span className="text-xs text-blue-600">{formatCurrency(jeepSavingsTotal)} of {formatCurrency(jeepCost)}</span>
                      </div>
                    </div>
                    
                    {/* Goal Details */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-700">Coffee Savings by Age 28</h4>
                        <p className="text-2xl font-bold text-blue-800">{formatCurrency(jeepSavingsTotal)}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          {jeepPercentageReached >= 100 
                            ? "Your coffee savings will fully cover your Jeep purchase!" 
                            : `This covers ${jeepPercentageReached.toFixed(1)}% of your Jeep's cost`}
                        </p>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-700">Additional Needed</h4>
                        <p className="text-2xl font-bold text-blue-800">
                          {additionalRequired > 0 ? formatCurrency(additionalRequired) : "None!"}
                        </p>
                        {additionalRequired > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Add {formatCurrency(monthlyForJeep)} monthly to reach your goal
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Jeep Impact Stats */}
                    <div className="mt-6 pt-6 border-t border-blue-100">
                      <div className="flex items-center">
                        <Coins className="h-6 w-6 text-indigo-500 mr-2" />
                        <h4 className="text-lg font-semibold text-indigo-600">Coffee vs. Jeep</h4>
                      </div>
                      <p className="mt-2 text-lg">
                        <span className="font-bold">By redirecting your coffee money,</span> you could:
                      </p>
                      <ul className="mt-2 space-y-2">
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-indigo-500 mr-2">•</span>
                          <span>
                            {jeepPercentageReached >= 100 
                              ? <span>Pay for your <span className="font-bold text-indigo-600">entire Jeep in cash</span> by age 28</span>
                              : <span>Cover <span className="font-bold text-indigo-600">{jeepPercentageReached.toFixed(1)}%</span> of your Jeep's cost by age 28</span>
                            }
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-indigo-500 mr-2">•</span>
                          <span>
                            {additionalRequired > 0 
                              ? <span>Need just <span className="font-bold text-indigo-600">{formatCurrency(monthlyForJeep)}</span> extra per month to fully fund your Jeep</span>
                              : <span>Have <span className="font-bold text-indigo-600">{formatCurrency(jeepSavingsTotal - jeepCost)}</span> left over for customizations or insurance</span>
                            }
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-indigo-500 mr-2">•</span>
                          <span>
                            Each <span className="font-bold text-indigo-600">{formatCurrency(coffeeCost)}</span> coffee skipped brings you <span className="font-bold text-indigo-600">{formatCurrency(jeepCost/(jeepSavingsTotal/(coffeeCost*frequency*52*yearsToJeep)))}</span> closer to your Jeep
                          </span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
              
              {/* Credit Card Cost Scenario */}
              <TabsContent value="credit" className="mt-4">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="mt-2"
                >
                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-lg border border-red-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-red-800">Credit Card Coffee</h3>
                        <p className="text-sm text-red-600">
                          See the real cost when paying with credit
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-red-500" />
                    </div>
                    
                    {/* Credit Card Settings */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-red-700 uppercase tracking-wider font-medium">
                          Credit Card Interest Rate
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            min={8}
                            max={36}
                            step={0.5}
                            value={[creditCardInterestRate]}
                            onValueChange={(value) => setCreditCardInterestRate(value[0])}
                            className="flex-1"
                          />
                          <span className="text-red-700 font-semibold w-12 text-right">{creditCardInterestRate}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-red-700 uppercase tracking-wider font-medium">
                          Minimum Payment
                        </label>
                        <div className="flex items-center gap-2 mt-2">
                          <Slider
                            min={1}
                            max={10}
                            step={0.5}
                            value={[minimumPaymentPercent]}
                            onValueChange={(value) => setMinimumPaymentPercent(value[0])}
                            className="flex-1"
                          />
                          <span className="text-red-700 font-semibold w-12 text-right">{minimumPaymentPercent}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Cost Comparison */}
                    <div className="mt-6 bg-white/60 p-4 rounded-lg border border-red-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-red-700">Annual Coffee Cost</h4>
                          <p className="text-2xl font-bold text-red-800">{formatCurrency(creditCardYearlyCost)}</p>
                          <p className="text-xs text-red-600 mt-1">If you pay as you go</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-red-700">Total Credit Card Cost</h4>
                          <p className="text-2xl font-bold text-red-800">{formatCurrency(creditCardTotalCost)}</p>
                          <p className="text-xs text-red-600 mt-1">
                            <span className="font-semibold">{formatCurrency(creditCardTotalInterest)}</span> in interest charges!
                          </p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-red-600 mb-1">
                          <span>Coffee Cost</span>
                          <span>Interest Cost</span>
                        </div>
                        <div className="h-6 rounded-lg overflow-hidden bg-red-100 relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-amber-400"
                            style={{ width: `${(creditCardYearlyCost / creditCardTotalCost) * 100}%` }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                            {((creditCardTotalCost / creditCardYearlyCost) * 100).toFixed(0)}% of original cost
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payoff Timeline */}
                    <div className="mt-6">
                      <div className="flex items-center">
                        <Timer className="h-5 w-5 text-red-500 mr-2" />
                        <h4 className="text-base font-semibold text-red-700">Payoff Timeline</h4>
                      </div>
                      <div className="mt-2 p-4 bg-white/60 rounded-lg border border-red-100">
                        <div className="flex flex-col items-center">
                          <p className="text-4xl font-bold text-red-800">
                            {creditCardPayoffMonths > 12 
                              ? `${Math.floor(creditCardPayoffMonths/12)} years ${creditCardPayoffMonths % 12} months` 
                              : `${creditCardPayoffMonths} months`}
                          </p>
                          <p className="text-sm text-red-600 mt-1">To pay off one year of coffee purchases</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* The Insidious Cost Explanation */}
                    <div className="mt-6 pt-6 border-t border-red-100">
                      <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                        <h4 className="text-lg font-semibold text-amber-600">The Insidious Cost</h4>
                      </div>
                      <p className="mt-2 text-lg">
                        <span className="font-bold">By charging your coffee,</span> you actually pay:
                      </p>
                      <ul className="mt-2 space-y-3">
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                          <span>
                            <span className="font-bold text-amber-600">{((creditCardTotalCost / creditCardYearlyCost) * 100).toFixed(0)}%</span> more than the actual cost
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                          <span>
                            An extra <span className="font-bold text-amber-600">{formatCurrency(creditCardTotalInterest)}</span> in interest payments
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="font-bold text-2xl text-amber-600 mr-2">•</span>
                          <span>
                            This means a <span className="font-bold text-amber-600">{formatCurrency(coffeeCost)}</span> coffee actually costs you <span className="font-bold text-amber-600">{formatCurrency(coffeeCost * (creditCardTotalCost/creditCardYearlyCost))}</span>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Jeep Cost Adjustment */}
        <div className="pt-4 border-t mt-6">
          <div className="flex justify-between items-center mb-3">
            <Label htmlFor="jeep-cost" className="text-base font-medium">
              New Jeep Cost
            </Label>
            <span className="font-semibold text-lg text-primary">
              {formatCurrency(jeepCost)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Car className="h-4 w-4 text-muted-foreground" />
            <Slider
              id="jeep-cost"
              min={20000}
              max={60000}
              step={1000}
              value={[jeepCost]}
              onValueChange={(value) => setJeepCost(value[0])}
              className="flex-1"
            />
            <RotateCw className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Adjust the Jeep cost to see how it affects your savings goal.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-6">
        <p className="text-sm text-muted-foreground">
          Small expenses add up. Consider how daily choices impact major financial goals.
        </p>
        <Button variant="outline" className="gap-2">
          <Coffee className="h-4 w-4" /> See More Tips
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DailyCoffeeCalculator;